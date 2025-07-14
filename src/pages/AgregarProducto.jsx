import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AgregarProducto() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    ubicacion: '',
    stock_maximo: '',
    cantidad_stock: '',
    proveedor: '',
    precio_compra: '',
    precio_venta: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:3000/api/productos', form, {
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
          ['proveedor', 'Proveedor'],
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
