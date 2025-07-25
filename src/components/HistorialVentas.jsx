import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

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

  const verDetalle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/ventas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetalles(res.data);
      setVentaSeleccionada(id);
    } catch (err) {
      toast.error('Error al cargar detalle de la venta');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Historial de Ventas</h1>

      <table className="w-full table-auto border border-gray-300 mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Total</th>
            <th className="p-2">Pago</th>
            <th className="p-2">Vendedor</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id} className="border-t">
              <td className="p-2">{v.id}</td>
              <td className="p-2">{new Date(v.fecha).toLocaleDateString()}</td>
              <td className="p-2">${v.total}</td>
              <td className="p-2">{v.forma_pago}</td>
              <td className="p-2">{v.usuario}</td>
              <td className="p-2">
                <button
                  onClick={() => verDetalle(v.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {ventaSeleccionada && (
        <div className="bg-white border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Detalle de Venta #{ventaSeleccionada}</h2>
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Producto</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Precio Unitario</th>
                <th className="p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{item.descripcion}</td>
                  <td className="p-2">{item.cantidad}</td>
                  <td className="p-2">${item.precio_unitario}</td>
                  <td className="p-2">${item.precio_unitario * item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;
