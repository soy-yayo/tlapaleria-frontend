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
    <div className="max-w-md mx-auto p-6 bg-white shadow-md mt-10 rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Editar usuario</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">

        {[
          ['nombre', 'Nombre completo'],
          ['usuario', 'Usuario'],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}:</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Rol:</label>
          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="admin">Administrador</option>
            <option value="ventas">Ventas</option>
            <option value="inventario">Inventario</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

export default EditarUsuario;
