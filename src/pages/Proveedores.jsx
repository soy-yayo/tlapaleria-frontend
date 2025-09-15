import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function Proveedores() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState('');

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchProveedores = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/proveedores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProveedores(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar proveedores');
      }
    };

    fetchProveedores();
  }, []);

  const handleAgregarProveedor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await API.post(
        '/proveedores/nuevo',
        { nombre: nuevoProveedor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProveedores([...proveedores, res.data]);
      setNuevoProveedor('');
      toast.success('Proveedor agregado exitosamente');
    } catch (err) {
      toast.error('Error al agregar proveedor');
      console.error(err);
    }
  };

  const handleEliminarProveedor = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/proveedores/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProveedores(proveedores.filter((p) => p.id !== id));
        toast.success('Proveedor eliminado exitosamente');
      } catch (err) {
        toast.error('Error al eliminar proveedor');
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">🏭 Proveedores</h2>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {proveedores.map((p) => (
              <tr key={p.id} className="odd:bg-slate-50 hover:bg-slate-100">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.nombre}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEliminarProveedor(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-400">
                  No hay proveedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario agregar */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">➕ Agregar proveedor</h3>
        <form onSubmit={handleAgregarProveedor} className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del proveedor"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={nuevoProveedor}
            onChange={(e) => setNuevoProveedor(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Proveedores;
