import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import API from '../services/api';

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
    <div style={{ padding: '20px' }}>
      <LogoutButton />
      <h2>Inventario</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
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
              <td>{p.cantidad_stock}</td>
              <td>${p.precio_venta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
