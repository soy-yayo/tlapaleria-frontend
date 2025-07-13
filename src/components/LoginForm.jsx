import { useState } from 'react';
import API from '../services/api';

import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recargar la página

    try {
      const res = await API.post('/login', {
        usuario,
        contraseña
      });

      localStorage.setItem('token', res.data.token); // guarda token
      navigate('/productos'); // redirige a página de productos
    } catch (err) {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
      <label>
        Usuario:
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
      </label>

      <label>
        Contraseña:
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
        />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
      >
        Entrar
      </button>
    </form>
  );

}

export default LoginForm;
