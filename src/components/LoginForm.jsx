import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
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
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario)); // guarda usuario
      toast.success('Inicio de sesión exitoso');
      navigate('/productos'); // redirige a página de productos
    } catch (err) {
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className='border border-gray-300 rounded p-4 mx-auto mt-10 max-w-md bg-white shadow-lg flex flex-col gap-2'
    >
      <h2 className='text-2xl font-bold text-center mb-4'>
        Iniciar Sesión
      </h2>
      <label className='flex flex-col mb-2'>
        Usuario:
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className='border border-gray-300 rounded mr-0.5'
        />
      </label>

      <label className='flex flex-col mb-2'>
        Contraseña:
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
          className='border border-gray-300 rounded'
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
