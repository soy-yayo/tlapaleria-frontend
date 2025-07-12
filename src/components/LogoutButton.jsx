import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // elimina el token
    navigate('/'); // redirige al login
  };

  return (
    <button onClick={handleLogout} style={{ float: 'right', margin: '10px' }}>
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;
