import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import TicketModal from '../components/TicketModal';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

function NuevaVenta() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ticket, setTicket] = useState([]);
  const [formaPago, setFormaPago] = useState('Efectivo');

  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ventaFinalizada, setVentaFinalizada] = useState(null);
  const [productosVendidos, setProductosVendidos] = useState([]);

  // efectivo
  const [efectivoRecibido, setEfectivoRecibido] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await API.get('/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(res.data || []);
      } catch (error) {
        toast.error('Error al cargar productos');
      }
    };
    cargarProductos();
  }, []);

  const fmt = (n) =>
    Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function normalizarTexto(texto = '') {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  const findByCodeOrBarcode = (code) => {
    const n = normalizarTexto(code);
    return productos.find(p =>
      normalizarTexto(p.codigo) === n ||
      normalizarTexto(p.codigo_barras || '') === n
    );
  };

  const productosFiltrados = productos.filter((p) => {
    const textoProducto = normalizarTexto(`${p.codigo} ${p.codigo_barras} ${p.descripcion}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    return palabras.length === 0 || palabras.every((palabra) => textoProducto.includes(palabra));
  });

  const agregarAlTicket = (producto) => {
    const existe = ticket.find((p) => p.id === producto.id);
    if (existe) {
      const nuevaCantidad = existe.cantidad + 1;
      actualizarCantidad(producto.id, nuevaCantidad);
      toast.info('Cantidad actualizada en el ticket');
      return;
    }
    setTicket([...ticket, { ...producto, cantidad: 1 }]);
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    setTicket((t) =>
      t.map((p) => (p.id === id ? { ...p, cantidad: parseInt(nuevaCantidad) || 1 } : p))
    );
  };

  const eliminarDelTicket = (id) => {
    setTicket(ticket.filter((p) => p.id !== id));
  };

  const total = ticket.reduce(
    (acc, item) => acc + Number(item.cantidad) * Number(item.precio_venta),
    0
  );

  // Cálculo de cambio/faltante cuando es efectivo
  const recibidoNum = parseFloat(efectivoRecibido) || 0;
  const cambio = Math.max(recibidoNum - total, 0);
  const faltante = Math.max(total - recibidoNum, 0);
  const efectivoInsuficiente = formaPago === 'Efectivo' && recibidoNum < total;

  const confirmarVenta = async () => {
    if (ticket.length === 0) return;

    const sinStock = ticket.find((p) => p.cantidad > p.cantidad_stock);
    if (sinStock) return toast.error(`No hay suficiente stock de "${sinStock.descripcion}"`);

    if (formaPago === 'Efectivo' && recibidoNum < total) {
      return toast.error('El efectivo recibido es menor que el total');
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    try {
      const res = await API.post(
        '/ventas',
        {
          forma_pago: formaPago,
          productos: ticket.map((p) => ({ id: p.id, cantidad: p.cantidad }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ventaId = res.data.venta_id;
      const detalles = await API.get(`/ventas/${ventaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVentaFinalizada({
        id: ventaId,
        fecha: new Date(),
        forma_pago: formaPago,
        total: total.toFixed(2),
        cambio: cambio.toFixed(2),
        monto_recibido: recibidoNum.toFixed(2),
        nombre_vendedor: usuario.nombre
      });
      setProductosVendidos(detalles.data);
      setMostrarTicket(true);
      toast.success(
        formaPago === 'Efectivo'
          ? `Venta registrada (ID ${ventaId}). Cambio: $${fmt(cambio)}`
          : `Venta registrada (ID ${ventaId}).`
      );
      setTicket([]);
      setBusqueda('');
      setEfectivoRecibido('');
    } catch (error) {
      toast.error('Error al registrar la venta');
    }
  };

  return (
    <div className="page py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Columna izquierda: catálogo */}
      <div className="md:col-span-2">
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar producto por código o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const productoEncontrado = findByCodeOrBarcode(busqueda);
                if (productoEncontrado) {
                  agregarAlTicket(productoEncontrado);
                } else {
                  toast.error('Producto no encontrado');
                }
                setBusqueda('');
              }
            }}
            className="w-full rounded-xl border px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="bg-white border rounded-xl p-3 shadow hover:shadow-md cursor-pointer transition"
              onClick={() => agregarAlTicket(producto)}
            >
              {producto.imagen && (
                <img
                  src={producto.imagen}
                  alt={producto.descripcion}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-sm">{producto.descripcion}</h3>
              <p className="text-xs text-slate-500">Código: {producto.codigo}</p>
              <p className="text-sm font-bold text-blue-600">${fmt(producto.precio_venta)}</p>
              <p className="text-xs text-slate-500">Stock: {producto.cantidad_stock}</p>
              <p className="text-xs text-slate-500">Ubicación: {producto.ubicacion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha: ticket */}
      <aside className="bg-white border rounded-xl p-4 shadow h-fit md:sticky md:top-6">
        <h2 className="text-lg font-bold mb-3">🧾 Ticket de venta</h2>

        <div className="overflow-auto max-h-64 mb-3">
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Cant.</th>
                <th className="p-2 text-right">Subtotal</th>
                <th className="p-2 text-right">Ubicación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ticket.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-2">{item.descripcion}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={item.cantidad}
                      min="1"
                      onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                      className="w-14 rounded border text-center"
                    />
                  </td>
                  <td className="p-2 text-right">
                    ${fmt(Number(item.precio_venta) * Number(item.cantidad))}
                  </td>
                  <td className="p-2 text-right">
                    {item.ubicacion}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => eliminarDelTicket(item.id)}
                      className="p-1 rounded hover:bg-rose-100 text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {ticket.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-slate-400">
                    No hay productos en el ticket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Forma de pago */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Forma de pago:</label>
          <div className="grid grid-cols-2 gap-2">
            {['Efectivo', 'Crédito', 'Débito', 'Transferencia'].map((fp) => (
              <button
                key={fp}
                type="button"
                className={`px-3 py-2 rounded border text-sm font-medium transition
                  ${formaPago === fp
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }
                `}
                onClick={() => setFormaPago(fp)}
              >
                {fp}
              </button>
            ))}
          </div>
        </div>

        {formaPago === 'Efectivo' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Monto recibido</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={efectivoRecibido}
              onChange={(e) => setEfectivoRecibido(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !efectivoInsuficiente && ticket.length > 0) {
                  confirmarVenta();
                }
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
            <div className="mt-2 text-sm">
              {efectivoInsuficiente ? (
                <span className="text-rose-700">
                  Faltan: <b>${fmt(faltante)}</b>
                </span>
              ) : (
                <span className="text-emerald-700">
                  Cambio: <b>${fmt(cambio)}</b>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="text-lg font-bold flex justify-between mb-3">
          <span>Total:</span>
          <span>${fmt(total)}</span>
        </div>

        {/* Confirmar */}
        <button
          className="w-full px-4 py-2 rounded text-white font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
          onClick={confirmarVenta}
          disabled={ticket.length === 0 || efectivoInsuficiente}
        >
          {formaPago === 'Efectivo'
            ? efectivoInsuficiente
              ? 'Monto insuficiente'
              : 'Confirmar venta (Efectivo)'
            : 'Confirmar venta'}
        </button>
      </aside>

      {/* Modal */}
      {mostrarTicket && ventaFinalizada && (
        <TicketModal
          venta={ventaFinalizada}
          productos={productosVendidos}
          onClose={() => {
            setMostrarTicket(false);
            setVentaFinalizada(null);
            setProductosVendidos([]);
            setTicket([]);
            setBusqueda('');
            setEfectivoRecibido('');
            API.get('/productos', {
              headers: { Authorization: `Bearer ${token}` }
            }).then((res) => setProductos(res.data || []));
          }}
        />
      )}
    </div>
  );
}

export default NuevaVenta;
