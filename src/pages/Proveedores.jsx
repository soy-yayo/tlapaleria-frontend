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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Proveedores</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">{p.nombre}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleEliminarProveedor(p.id)}
    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow transition duration-200"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Agregar proveedor</h3>
        <form onSubmit={handleAgregarProveedor} className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del proveedor"
            className="border border-gray-300 p-2 rounded"
            value={nuevoProveedor}
            onChange={(e) => setNuevoProveedor(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Proveedores;
