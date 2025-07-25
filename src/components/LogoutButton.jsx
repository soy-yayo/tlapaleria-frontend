import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('usuario'); 
    toast.success('Sesión cerrada correctamente');
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
