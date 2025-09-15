import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post('/login', { usuario, contraseña });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      toast.success('Inicio de sesión exitoso');
      navigate('/productos');
    } catch (err) {
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white border rounded-xl shadow p-6 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-center mb-2">🔑 Iniciar Sesión</h2>

      {/* Usuario */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Usuario
        </label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition"
      >
        Entrar
      </button>
    </form>
  );
}

export default LoginForm;
