import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Sesión cerrada exitosamente');
    localStorage.removeItem('token'); // elimina el token
    navigate('/'); // redirige al login
  };

  return (
    <button onClick={handleLogout} 
    className="float-right inline-block mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;
