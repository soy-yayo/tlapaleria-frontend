import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import API from '../services/api';
import { Link } from 'react-router-dom';
import handleEliminar from '../components/HandleEliminar';

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/productos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        alert('Debes iniciar sesión');
      }
    };

    fetchProductos();
  }, []);

  return (

    <div className='container mx-auto p-4 bg-white shadow-md rounded-lg'>
      {/* <Link
        to="/productos/nuevo"
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Agregar producto
      </Link>
      <LogoutButton /> */}
      <h1>Productos</h1>
      <p>Lista de productos disponibles:</p>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
            {/* <th>ID</th> */}
            <th>Código</th>
            <th>Descripción</th>
            <th>Stock</th>
            <th>Precio Venta</th>
            <th>Proveedor</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-100 text-center">
              {/* <td>{p.id}</td> */}
              <td>{p.codigo}</td>
              <td>{p.descripcion}</td>
              <td className={p.cantidad_stock === 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                {p.cantidad_stock === 0 ? (
                  <span className="flex items-center">
                    <Link 
                      to={`/productos/editar/${p.id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Editar 
                    </Link>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded ml-2"
                    >
                      Eliminar
                    </button>
                  </span>
                ) : (
                  p.cantidad_stock
                )}
              </td>
              
              <td>${p.precio_venta}</td>
              <td>{p.proveedor_id}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default Productos;
