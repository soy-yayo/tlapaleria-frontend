import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Productos from './pages/Productos';
import PrivateRoute from './components/PrivateRoute';
import AgregarProducto from './pages/AgregarProducto';
// import Proveedores from './pages/Proveedores';
// import NavBar from './pages/NavBar';
import Navbar from './components/NavBar';
import EditarProducto from './pages/EditarProducto';
import NuevaVenta from './pages/NuevaVenta';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HistorialVentas from './components/HistorialVentas';
import RegistroUsuario from './pages/RegistrarUsuario';

function LayoutPrivado({ children }) {
  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        {/* <NavBar /> */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <LayoutPrivado><Productos /></LayoutPrivado>
              </PrivateRoute>
            }
          />
          <Route
            path='/usuarios'
            element={
              <PrivateRoute>
                <LayoutPrivado><RegistroUsuario /></LayoutPrivado>
              </PrivateRoute>
            }
          />
          <Route
            path="/productos/nuevo"
            element={
              <PrivateRoute>
                <LayoutPrivado><AgregarProducto /></LayoutPrivado>
              </PrivateRoute>
            }
          />

          <Route
            path="/productos/editar/:id"
            element={
              <PrivateRoute>
                <LayoutPrivado><EditarProducto /></LayoutPrivado>
              </PrivateRoute>
            }
          />
          <Route path="/ventas/nueva" element={
            <PrivateRoute>
              <LayoutPrivado><NuevaVenta /></LayoutPrivado>
            </PrivateRoute>
            } />


          <Route path="/ventas/historial" element={
            <PrivateRoute>
              <LayoutPrivado><HistorialVentas /></LayoutPrivado>
            </PrivateRoute>
          } />
          
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
