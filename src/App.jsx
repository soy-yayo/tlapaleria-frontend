import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Productos from './pages/Productos';
import PrivateRoute from './components/PrivateRoute';
import AgregarProducto from './pages/AgregarProducto';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
    <ToastContainer position="top-center" />
    </>
  );
}

export default App;
