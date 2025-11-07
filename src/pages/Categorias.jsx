import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function Categorias() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    // Redirecciones básicas
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/categorias', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategorias(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar categorías');
      }
    };

    fetchCategorias();
  }, [usuario, navigate]);

  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    const nombre = (nuevaCategoria || '').trim();
    if (!nombre) return;

    try {
      const token = localStorage.getItem('token');
      const res = await API.post(
        '/categorias',
        { nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategorias([...categorias, res.data]);
      setNuevaCategoria('');
      toast.success('Categoría agregada exitosamente');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Error al agregar categoría';
      toast.error(msg);
    }
  };

  const handleEliminarCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/categorias/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategorias(categorias.filter((c) => c.id !== id));
      toast.success('Categoría eliminada exitosamente');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Error al eliminar categoría';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">🏷️ Categorías</h2>

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
            {categorias.map((c) => (
              <tr key={c.id} className="odd:bg-slate-50 hover:bg-slate-100">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.nombre}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEliminarCategoria(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-400">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario agregar */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">➕ Agregar categoría</h3>
        <form onSubmit={handleAgregarCategoria} className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
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

export default Categorias;
