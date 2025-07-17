import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function EditarProducto() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchProductoYProveedores = async () => {
      try {
        const token = localStorage.getItem('token');

        const [productoRes, proveedoresRes] = await Promise.all([
          API.get(`/productos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          API.get(`/proveedores`)
        ]);

        setForm(productoRes.data);
        setProveedores(proveedoresRes.data);
      } catch (err) {
        toast.error('Error al cargar el producto');
      }
    };

    fetchProductoYProveedores();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await API.put(`/productos/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Producto actualizado');
      navigate('/productos');
    } catch (err) {
      toast.error('Error al actualizar producto');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Editar producto</h2>
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
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar cambios
        </button>

      </form>
    </div>
  );
}

export default EditarProducto;
