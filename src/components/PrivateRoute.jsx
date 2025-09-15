import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const location = useLocation();

  // Si no hay token → login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si requiere rol específico → acceso denegado
  if (roleRequired && usuario?.rol !== roleRequired) {
    return <Navigate to="/denegado" replace />;
  }

  return children; // Autorizado
}

export default PrivateRoute;
