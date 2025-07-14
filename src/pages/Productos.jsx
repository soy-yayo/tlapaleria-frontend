import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import API from '../services/api';
import { Link } from 'react-router-dom';

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
      <Link
        to="/productos/nuevo"
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Agregar producto
      </Link>
      <LogoutButton />
      <h1 className='text-grey-100'>Productos</h1>
      <p className='center'>Lista de productos disponibles:</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>ID</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Stock</th>
            <th>Precio Venta</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.codigo}</td>
              <td>{p.descripcion}</td>
              <td style={{ color: p.cantidad_stock === 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                {p.cantidad_stock}
              </td>
              <td>${p.precio_venta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
