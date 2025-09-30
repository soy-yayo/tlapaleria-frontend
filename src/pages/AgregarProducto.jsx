import { useState, useEffect } from 'react';
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
    clave_sat: '',
    stock_minimo: ''
  });
  const [imagen, setImagen] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [resProv, resProd] = await Promise.all([
          API.get('/proveedores', { headers: { Authorization: `Bearer ${token}` } }),
          API.get('/productos', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProveedores(resProv.data);
        setProductos(resProd.data);
      } catch (err) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    fetchData();
  }, [usuario, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const codigoExistente = productos.find(p => p.codigo === form.codigo);
    if (codigoExistente) {
      toast.error(`El código "${form.codigo}" ya está registrado en otro producto`);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      await API.post('/productos', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Producto agregado correctamente');
      navigate('/productos');
    } catch (err) {
      toast.error('Error al agregar producto');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">➕ Agregar producto</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Campos de texto */}
        {[
          ['codigo', 'Código'],
          ['descripcion', 'Descripción'],
          ['ubicacion', 'Ubicación'],
          ['stock_maximo', 'Stock máximo'],
          ['cantidad_stock', 'Cantidad en stock'],
          ['stock_minimo', 'Stock mínimo'],
          ['precio_compra', 'Precio de compra'],
          ['precio_venta', 'Precio de venta'],
          ['clave_sat', 'Clave SAT']
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ))}

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
          <select
            name="proveedor_id"
            value={form.proveedor_id}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Imagen</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          Guardar producto
        </button>
      </form>
    </div>
  );
}

export default AgregarProducto;
