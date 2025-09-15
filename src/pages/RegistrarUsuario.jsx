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
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">👤 Registrar nuevo usuario</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Campos de texto */}
        {[
          ['nombre', 'Nombre completo'],
          ['usuario', 'Usuario'],
          ['contraseña', 'Contraseña'],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type={name === 'contraseña' ? 'password' : 'text'}
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
          Registrar
        </button>
      </form>
    </div>
  );
}

export default RegistrarUsuario;
