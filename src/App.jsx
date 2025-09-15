import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Productos from './pages/Productos';
import AgregarProducto from './pages/AgregarProducto';
import EditarProducto from './pages/EditarProducto';
import Inventario from './pages/Inventario';
import NuevaVenta from './pages/NuevaVenta';
import HistorialVentas from './components/HistorialVentas';
import Proveedores from './pages/Proveedores';
import CorteCaja from './pages/CorteCaja';
import PorcentajesDeUtilidad from './pages/PorcentajesDeUtilidad';
import Usuarios from './pages/Usuarios';
import EditarUsuario from './pages/EditarUsuario';
import RegistrarUsuario from './pages/RegistrarUsuario';

// Components
import NavBar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AccesoDenegado from './components/AccesoDenegado';

// Layout para rutas privadas
function LayoutPrivado() {
  return (
    <>
      <NavBar />
      <main className="p-4">
        <Routes>
          {/* Productos */}
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<AgregarProducto />} />
          <Route path="productos/editar/:id" element={<EditarProducto />} />

          {/* Inventario */}
          <Route path="inventario" element={<Inventario />} />

          {/* Ventas */}
          <Route path="ventas/nueva" element={<NuevaVenta />} />
          <Route path="ventas/historial" element={<HistorialVentas />} />

          {/* Usuarios */}
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/nuevo" element={<RegistrarUsuario />} />
          <Route path="usuarios/editar/:id" element={<EditarUsuario />} />

          {/* Otros */}
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="corte-caja" element={<CorteCaja />} />
          <Route path="porcentajes-de-utilidad" element={<PorcentajesDeUtilidad />} />

          {/* Fallback privado */}
          <Route path="*" element={<AccesoDenegado />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Login />} />
          <Route path="/denegado" element={<AccesoDenegado />} />

          {/* Privado */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <LayoutPrivado />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" autoClose={2500} />
    </>
  );
}

export default App;
