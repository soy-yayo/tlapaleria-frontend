import { Link, useNavigate } from 'react-router-dom';
import { useUsuario } from '../hooks/useUsuario';

function Navbar() {
  const usuario = useUsuario();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="flex gap-6 items-center">
        <Link to="/productos" className="font-bold hover:underline">
          Inicio
        </Link>
        {usuario?.rol === 'admin' && (
          <Link to="/productos/nuevo" className="font-bold hover:underline">
            Agregar producto
          </Link>
        )}
        {usuario?.rol === 'admin' && (
          <>
            <Link to="/usuarios" className="font-bold hover:underline">
              Usuarios
            </Link>
            <Link to="/usuarios/nuevo" className="font-bold hover:underline">
              Registrar usuario
            </Link>
          </>
        )}
        <Link to="/ventas/nueva" className="font-bold hover:underline">
          Nueva Venta
        </Link>
        <Link to="/ventas/historial" className="font-bold hover:underline">
          Historial de Ventas
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {usuario && (
          <span className="text-sm">
            {usuario.usuario} ({usuario.rol})
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
