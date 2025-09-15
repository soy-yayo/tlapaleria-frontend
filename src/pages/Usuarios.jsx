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
    <div className="max-w-5xl mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-6">👥 Gestión de Usuarios</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {usuarios.map((u) => (
              <tr key={u.id} className="odd:bg-slate-50 hover:bg-slate-100">
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.usuario}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${u.rol === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : u.rol === 'ventas'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'}`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <Link
                    to={`/usuarios/editar/${u.id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleEliminar(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
