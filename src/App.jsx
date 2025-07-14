import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Productos from './pages/Productos';
import PrivateRoute from './components/PrivateRoute';
import AgregarProducto from './pages/AgregarProducto';
import Proveedores from './pages/Proveedores';
import NavBar from './pages/NavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <Productos />
              </PrivateRoute>
            }
          />
          <Route
            path="/productos/nuevo"
            element={
              <PrivateRoute>
                <AgregarProducto />
              </PrivateRoute>
            }
          />
          <Route
            path="/proveedores"
            element={
              <PrivateRoute>
                <Proveedores />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
