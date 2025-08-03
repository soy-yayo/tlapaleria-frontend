import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegistrarUsuario() {

  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    contraseña: '',
    rol: 'ventas',
  });

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }
  }, [usuario, navigate]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await API.post('/usuarios', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Usuario registrado correctamente');
      navigate('/productos');
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar el usuario');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md mt-10 rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Registrar nuevo usuario</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">

        {[
          ['nombre', 'Nombre completo'],
          ['usuario', 'Usuario'],
          ['contraseña', 'Contraseña']
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}:</label>
            <input
              type={name === 'contraseña' ? 'password' : 'text'}
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
          Registrar
        </button>
      </form>
    </div>
  );
}

export default RegistrarUsuario;