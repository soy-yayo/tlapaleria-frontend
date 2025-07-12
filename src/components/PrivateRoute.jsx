import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/" />;
  }

  return children; // Si hay token, muestra el contenido protegido
}

export default PrivateRoute;
