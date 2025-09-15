import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import TicketModal from './TicketModal';

function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [filtroPago, setFiltroPago] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [ventaActual, setVentaActual] = useState(null);
  const [productosVenta, setProductosVenta] = useState([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/ventas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVentas(res.data);
      } catch (err) {
        toast.error('Error al cargar ventas');
      }
    };
    fetchVentas();
  }, []);

  const verTicket = async (venta) => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/ventas/${venta.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVentaActual(venta);
      setProductosVenta(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error('Error al cargar detalles del ticket');
    }
  };

  const ventasFiltradas = ventas.filter((v) => {
    const fechaVenta = new Date(v.fecha);
    const coincidePago = filtroPago ? v.forma_pago === filtroPago : true;
    const despuesDeDesde = fechaDesde ? fechaVenta >= new Date(fechaDesde) : true;
    const antesDeHasta = fechaHasta ? fechaVenta <= new Date(fechaHasta) : true;
    return coincidePago && despuesDeDesde && antesDeHasta;
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">🧾 Historial de Ventas</h1>

      {/* Filtros */}
      <div className="mb-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Forma de pago</label>
          <select
            value={filtroPago}
            onChange={(e) => setFiltroPago(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todas</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Credito">Crédito</option>
            <option value="Debito">Débito</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Pago</th>
              <th className="p-3 text-left">Vendedor</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ventasFiltradas.map((v) => (
              <tr key={v.id} className="odd:bg-slate-50 hover:bg-slate-100">
                <td className="p-3">{v.id}</td>
                <td className="p-3">{new Date(v.fecha).toLocaleDateString()}</td>
                <td className="p-3 text-right font-semibold">${v.total}</td>
                <td className="p-3">{v.forma_pago}</td>
                <td className="p-3">{v.nombre_vendedor}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => verTicket(v)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                  >
                    Ver ticket
                  </button>
                </td>
              </tr>
            ))}
            {ventasFiltradas.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-400">
                  No se encontraron ventas en este rango.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ticket */}
      {showModal && ventaActual && (
        <TicketModal
          venta={ventaActual}
          productos={productosVenta}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default HistorialVentas;
