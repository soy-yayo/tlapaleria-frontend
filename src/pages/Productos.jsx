import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import API from '../services/api';
import { Link } from 'react-router-dom';
import handleEliminar from '../components/HandleEliminar';

function Productos() {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
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

  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = productos.filter(p =>
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );
  if (productosFiltrados.length === 0) {
    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <p>No se encontraron productos.</p>
      </>
    )
  }



  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th>ID</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Precio Venta</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody> */}
          {productosFiltrados.map(p => (
            <div
              key={p.id}
              className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => setProductoSeleccionado(p)}
            >
              <img
                src={p.imagen || 'https://via.placeholder.com/150'}
                alt={p.descripcion}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h3>{p.descripcion}</h3>
              <p className="text-sm text-gray-600">Código: {p.codigo}</p>
              <p className="text-sm text-gray-600">Stock: {p.cantidad_stock}</p>
              <p className="text-sm text-gray-600">Proveedor: {p.nombre_proveedor}</p>
              <p className="text-sm text-gray-600 font-bold">Precio: ${p.precio_venta}</p>
              {p.cantidad_stock === 0 && (
              <div className="flex mt-2 gap-2">
                <Link
                  to={`/productos/editar/${p.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Editar
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(p.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
              )}
            </div>
          ))}
        </div>

        {productoSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-2 right-3 text-xl"
                onClick={() => setProductoSeleccionado(null)}
              >
                &times;
              </button>
              <img
                src={productoSeleccionado.imagen || 'https://via.placeholder.com/300'}
                alt="producto"
                className="w-full h-52 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{productoSeleccionado.descripcion}</h2>
              <p><strong>Código:</strong> {productoSeleccionado.codigo}</p>
              <p><strong>Ubicación:</strong> {productoSeleccionado.ubicacion}</p>
              <p><strong>Stock:</strong> {productoSeleccionado.cantidad_stock}</p>
              <p><strong>Proveedor:</strong> {productoSeleccionado.nombre_proveedor}</p>
              <p><strong>Precio venta:</strong> ${productoSeleccionado.precio_venta}</p>
              <p><strong>Precio compra:</strong> ${productoSeleccionado.precio_compra}</p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default Productos;
