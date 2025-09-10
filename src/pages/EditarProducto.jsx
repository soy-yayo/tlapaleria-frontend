import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    ubicacion: '',
    stock_maximo: '',
    cantidad_stock: '',
    proveedor_id: '',
    precio_compra: '',
    precio_venta: '',
    imagen: '',
    clave_sat: ''
  });

  const [imagen, setImagen] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [productoRes, proveedoresRes, productosRes] = await Promise.all([
          API.get(`/productos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          API.get(`/proveedores`),
          API.get(`/productos`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setForm(productoRes.data);
        setProveedores(proveedoresRes.data);
        setProductos(productosRes.data);
      } catch (err) {
        toast.error('Error al cargar el producto');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imagen) {
      formData.append('imagen', imagen);
    }

    const codigoExistente = productos.find(
      (p) => p.codigo === form.codigo && p.id !== parseInt(id)
    );

    if (codigoExistente) {
      toast.error(`El código "${form.codigo}" ya está registrado en otro producto`);
      return;
    }
    try {
      await API.put(`/productos/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Producto actualizado correctamente');
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
          ['clave_sat', 'Clave SAT']
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

        {form.imagen && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">Imagen actual:</p>
            <img
              src={form.imagen}
              alt="producto"
              className="w-full h-40 object-cover rounded"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Nueva Imagen (opcional):</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
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
