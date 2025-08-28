import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import TicketModal from '../components/TicketModal';
import { useNavigate } from 'react-router-dom';

function NuevaVenta() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ticket, setTicket] = useState([]);
  const [formaPago, setFormaPago] = useState('Efectivo');

  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ventaFinalizada, setVentaFinalizada] = useState(null);
  const [productosVendidos, setProductosVendidos] = useState([]);

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await API.get('/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(res.data);
      } catch (error) {
        toast.error('Error al cargar productos');
      }
    };

    cargarProductos();
  }, []);

  function normalizarTexto(texto = '') {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  const productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.codigo).includes(normalizarTexto(busqueda)) ||
    normalizarTexto(p.descripcion).includes(normalizarTexto(busqueda))
  );

  const agregarAlTicket = (producto) => {
    const existe = ticket.find(p => p.id === producto.id);
    if (existe) {
      toast.info('Este producto ya está en el ticket');
      return;
    }

    setTicket([...ticket, { ...producto, cantidad: 1 }]);
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    setTicket(ticket.map(p =>
      p.id === id ? { ...p, cantidad: parseInt(nuevaCantidad) || 1 } : p
    ));
  };

  const eliminarDelTicket = (id) => {
    setTicket(ticket.filter(p => p.id !== id));
  };

  const total = ticket.reduce(
    (acc, item) => acc + item.cantidad * item.precio_venta,
    0
  );

  const confirmarVenta = async () => {
    if (ticket.length === 0) return;

    const sinStock = ticket.find(p => p.cantidad > p.cantidad_stock);
    if (sinStock) {
      return toast.error(`No hay suficiente stock de "${sinStock.descripcion}"`);
    }

    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    try {
      const res = await API.post('/ventas', {
        forma_pago: formaPago,
        productos: ticket,
        usuario_id: usuario.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ventaId = res.data.ventaId;

      const detalles = await API.get(`/ventas/${ventaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVentaFinalizada({
        id: ventaId,
        fecha: new Date(),
        forma_pago: formaPago,
        total: total.toFixed(2),
        usuario: usuario.nombre
      });

      setProductosVendidos(detalles.data);
      setMostrarTicket(true);
      toast.success(`Venta registrada con ID ${ventaId}`);
      setTicket([]);
      setBusqueda('');
      navigate('/productos');
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar la venta');
    }
  };



  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Nueva Venta</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-full"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Ticket de venta</h2>
      <div className="overflow-auto mb-4">
        <table className="min-w-full text-left border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Producto</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Subtotal</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {ticket.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.descripcion}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.cantidad}
                    min="1"
                    onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                    className="w-16 border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2">${item.precio_venta}</td>
                <td className="p-2">${item.precio_venta * item.cantidad}</td>
                <td className="p-2">
                  <button
                    onClick={() => eliminarDelTicket(item.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            {ticket.length === 0 && (
              <tr>
                <td colSpan="5" className="p-2 text-center text-gray-500">
                  No hay productos en el ticket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <label className="block text-sm font-medium">Forma de pago:</label>
          <select
            value={formaPago}
            onChange={(e) => setFormaPago(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Credito">Crédito</option>
            <option value="Debito">Débito</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
      </div>
      <div className='mb-4'>
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-bold"
        onClick={confirmarVenta}
        disabled={ticket.length === 0}
      >
        Confirmar Venta
      </button>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {productosFiltrados.slice(0, 9).map((producto) => (
          <div
            key={producto.id}
            className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer flex flex-col items-center text-center"
            onClick={() => agregarAlTicket(producto)}
          >
            {/* Imagen del producto */}
            {producto.imagen && ( 
              <img
                src={producto.imagen}
                alt={producto.descripcion}
                className="w-32 h-32 object-cover mb-2 rounded"
              />
            )}

            <h3 className="font-bold">{producto.descripcion}</h3>
            <p className="text-sm">Código: {producto.codigo}</p>
            <p className="text-sm text-gray-600">${producto.precio_venta}</p>
            <p className="text-sm text-gray-600">Stock: {producto.cantidad_stock}</p>
          </div>
        ))}
      </div>

      {mostrarTicket && ventaFinalizada && (
        <TicketModal
          venta={ventaFinalizada}
          productos={productosVendidos}
          onClose={() => setMostrarTicket(false)}
        />
      )}


    </div>
  );
}

export default NuevaVenta;
