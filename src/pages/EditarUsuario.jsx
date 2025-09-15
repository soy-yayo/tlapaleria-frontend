import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    rol: 'ventas',
  });

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const cargarUsuario = async () => {
      try {
        const res = await API.get(`/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (error) {
        toast.error('Error al cargar usuario');
      }
    };

    cargarUsuario();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/usuarios/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Usuario actualizado');
      navigate('/usuarios');
    } catch (error) {
      toast.error('Error al actualizar usuario');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">👤 Editar usuario</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Campos de texto */}
        {[
          ['nombre', 'Nombre completo'],
          ['usuario', 'Usuario'],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ))}

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="admin">Administrador</option>
            <option value="ventas">Ventas</option>
            <option value="inventario">Inventario</option>
          </select>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

export default EditarUsuario;
