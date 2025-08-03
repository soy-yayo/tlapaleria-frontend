import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../services/api';

function AgregarProducto() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    ubicacion: '',
    stock_maximo: '',
    cantidad_stock: '',
    proveedor_id: '',
    precio_compra: '',
    precio_venta: '',
    imagen: ''
  });
  const [proveedores, setProveedores] = useState([]);
 
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchProveedores = async () => {
      try {
        const res = await API.get('/proveedores');
        setProveedores(res.data);
      } catch (err) {
        toast.error('Error al cargar proveedores');
      }
    };

    fetchProveedores();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await API.post('/productos', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Producto agregado correctamente');
      navigate('/productos');
    } catch (err) {
      toast.error('Error al agregar producto');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Agregar nuevo producto</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        {[
          ['codigo', 'Código'],
          ['descripcion', 'Descripción'],
          ['ubicacion', 'Ubicación'],
          ['stock_maximo', 'Stock máximo'],
          ['cantidad_stock', 'Cantidad en stock'],
          ['precio_compra', 'Precio de compra'],
          ['precio_venta', 'Precio de venta']
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}:</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Proveedor:</label>
          <select
            name="proveedor_id"
            value={form.proveedor_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagen (URL):</label>
          <input
            type="text"
            name="imagen"
            value={form.imagen}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default AgregarProducto;
