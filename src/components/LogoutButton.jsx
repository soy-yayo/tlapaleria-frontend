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
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition flex items-center gap-2"
    >
      🚪 Cerrar sesión
    </button>
  );
}

export default LogoutButton;
