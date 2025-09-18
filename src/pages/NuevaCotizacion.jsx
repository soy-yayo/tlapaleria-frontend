import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import QuoteModal from '../components/QuoteModal'; // ⬅️ Modal que adapta tu TicketModal

export default function NuevaCotizacion() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [lineas, setLineas] = useState([]);
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [cliente, setCliente] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [cotizacionFinalizada, setCotizacionFinalizada] = useState(null);

  const { id } = useParams();
  const token = localStorage.getItem('token');

  function normalizarTexto(texto = '') {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/productos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductos(res.data);
      } catch {
        toast.error('Error al cargar productos');
      }
    })();
  }, []);

  // Si hay id → cargar cotización existente
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await API.get(`/cotizaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCliente(res.data.cliente || '');
        setFormaPago(res.data.forma_pago || 'Efectivo');
        setLineas(
          res.data.productos.map((p) => ({
            id: p.id,
            descripcion: p.descripcion,
            precio_venta: p.precio_unitario,
            cantidad: p.cantidad,
            cantidad_stock: p.cantidad_stock,
            subtotal: p.subtotal,
          }))
        );
      } catch {
        toast.error('No se pudo cargar la cotización');
      }
    })();
  }, [id]);

  const productosFiltrados = productos.filter((p) => {
    const textoProducto = normalizarTexto(`${p.codigo} ${p.descripcion}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    return (
      palabras.length === 0 ||
      palabras.every((palabra) => textoProducto.includes(palabra))
    );
  });

  const agregar = (producto) => {
    const existe = lineas.find((p) => p.id === producto.id);
    if (existe) {
      actualizarCantidad(producto.id, existe.cantidad + 1);
      toast.info('Cantidad actualizada');
      return;
    }
    setLineas([...lineas, { ...producto, cantidad: 1 }]);
  };

  const actualizarCantidad = (pid, nueva) => {
    setLineas(
      lineas.map((p) =>
        p.id === pid
          ? { ...p, cantidad: Math.max(1, parseInt(nueva || 1)) }
          : p
      )
    );
  };

  const eliminar = (pid) => setLineas(lineas.filter((p) => p.id !== pid));

  const total = lineas.reduce(
    (acc, it) => acc + it.cantidad * it.precio_venta,
    0
  );

  async function guardar() {
    if (lineas.length === 0) return;

    const payload = {
      cliente: cliente || null,
      forma_pago: formaPago,
      productos: lineas.map((l) => ({ id: l.id, cantidad: l.cantidad })),
    };

    try {
      if (id) {
        await API.put(`/cotizaciones/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Cotización #${id} actualizada`);
        // Recargar detalle
        const detalle = await API.get(`/cotizaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCotizacionFinalizada(detalle.data);
        setMostrarModal(true);
      } else {
        const res = await API.post('/cotizaciones', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Cotización creada (#${res.data.cotizacion_id})`);

        // Traer detalle recién creada
        const detalle = await API.get(
          `/cotizaciones/${res.data.cotizacion_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCotizacionFinalizada(detalle.data);
        setMostrarModal(true);
      }
    } catch {
      toast.error('Error al guardar cotización');
    }
  }

  return (
    <div className="page py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Columna izquierda: catálogo */}
      <div className="md:col-span-2">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="👤 Cliente (opcional)"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="rounded-xl border px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            className="rounded-xl border px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={formaPago}
            onChange={(e) => setFormaPago(e.target.value)}
          >
            {['Efectivo', 'Crédito', 'Débito', 'Transferencia'].map((fp) => (
              <option key={fp} value={fp}>
                {fp}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="🔍 Buscar producto por código o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const productoEncontrado = productos.find(
                  (p) => normalizarTexto(p.codigo) === normalizarTexto(busqueda)
                );
                if (productoEncontrado) agregar(productoEncontrado);
                else toast.error('Producto no encontrado');
                setBusqueda('');
              }
            }}
            className="rounded-xl border px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="bg-white border rounded-xl p-3 shadow hover:shadow-md cursor-pointer transition"
              onClick={() => agregar(producto)}
            >
              {producto.imagen && (
                <img
                  src={producto.imagen}
                  alt={producto.descripcion}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-sm">{producto.descripcion}</h3>
              <p className="text-xs text-slate-500">
                Código: {producto.codigo}
              </p>
              <p className="text-sm font-bold text-blue-600">
                ${producto.precio_venta}
              </p>
              <p className="text-xs text-slate-500">
                Stock: {producto.cantidad_stock}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha: editor */}
      <aside className="bg-white border rounded-xl p-4 shadow h-fit md:sticky md:top-6">
        <h2 className="text-lg font-bold mb-3">
          📄 {id ? `Editar cotización #${id}` : 'Nueva cotización'}
        </h2>

        <div className="overflow-auto max-h-64 mb-3">
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Cant.</th>
                <th className="p-2 text-right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-2">{item.descripcion}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={item.cantidad}
                      min="1"
                      onChange={(e) =>
                        actualizarCantidad(item.id, e.target.value)
                      }
                      className="w-14 rounded border text-center"
                    />
                  </td>
                  <td className="p-2 text-right">
                    ${(item.precio_venta * item.cantidad).toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => eliminar(item.id)}
                      className="p-1 rounded hover:bg-rose-100 text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {lineas.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-slate-400">
                    Sin productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-lg font-bold flex justify-between mb-3">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          className="w-full px-4 py-2 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={guardar}
          disabled={lineas.length === 0}
        >
          {id ? 'Guardar cambios' : 'Guardar cotización'}
        </button>
      </aside>

      {/* Modal de cotización */}
      {mostrarModal && cotizacionFinalizada && (
        <QuoteModal
          cotizacion={cotizacionFinalizada}
          productos={cotizacionFinalizada.productos}
          onClose={() => {
            setMostrarModal(false);
            setCotizacionFinalizada(null);
            setLineas([]);
            setCliente('');
          }}
        />
      )}
    </div>
  );
}
