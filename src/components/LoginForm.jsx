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
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default LoginForm;
