import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const res = await API.get('/usuarios', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(res.data);
      } catch (err) {
        toast.error('Error al cargar usuarios');
      }
    };

    fetchUsuarios();
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmar) return;

    try {
      await API.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el usuario');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow p-6 rounded">
      <h1 className="text-xl font-bold mb-4">Gestión de Usuarios</h1>

      <table className="min-w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Usuario</th>
            <th className="p-2 text-left">Rol</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.usuario}</td>
              <td className="p-2 capitalize">{u.rol}</td>
              <td className='flex mt-2 gap-2'>
                <button
                  onClick={() => handleEliminar(u.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Eliminar
                </button>
                <button className='bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm'>
                  <Link
                    to={`/usuarios/editar/${u.id}`}
                  >
                    Editar
                  </Link>
                  </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="4" className="p-2 text-center text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Usuarios;
