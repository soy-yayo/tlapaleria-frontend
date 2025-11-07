import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    ubicacion: '',
    stock_maximo: '',
    cantidad_stock: '',
    proveedor_id: '',
    precio_compra: '',
    precio_venta: '',
    imagen: '',          // URL/Path actual
    clave_sat: '',
    stock_minimo: '',
    categoria_id: ''     // <-- NUEVO
  });

  const [imagen, setImagen] = useState(null); // archivo nuevo
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    // Guardas
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
        const headers = { Authorization: `Bearer ${token}` };

        const [productoRes, proveedoresRes, productosRes, categoriasRes] = await Promise.all([
          API.get(`/productos/${id}`, { headers }),
          API.get('/proveedores', { headers }),
          API.get('/productos', { headers }),
          API.get('/categorias', { headers })
        ]);

        // Producto a editar
        const p = productoRes.data || {};
        setForm(prev => ({
          ...prev,
          ...p,
          categoria_id: p.categoria_id ?? '' // asegurar que tenga valor
        }));

        setProveedores(proveedoresRes.data || []);
        setProductos(productosRes.data || []);
        setCategorias(categoriasRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar el producto');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };

    // Validar código duplicado en otro producto
    const codigoExistente = productos.find(
      (p) => p.codigo === form.codigo && String(p.id) !== String(id)
    );
    if (codigoExistente) {
      toast.error(`El código "${form.codigo}" ya está registrado en otro producto`);
      return;
    }

    try {
      const formData = new FormData();
      // Pasar todos los campos del form
      Object.entries(form).forEach(([k, v]) => {
        // Evita mandar "imagen" si es la URL actual, backend la mantiene con COALESCE
        if (k === 'imagen') return;
        formData.append(k, v ?? '');
      });
      if (imagen) formData.append('imagen', imagen);

      await API.put(`/productos/${id}`, formData, { headers });
      toast.success('Producto actualizado correctamente');
      navigate('/productos');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar producto');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">✏️ Editar producto</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
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
              value={form[name] ?? ''}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ))}

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            name="categoria_id"
            value={form.categoria_id ?? ''}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
          <select
            name="proveedor_id"
            value={form.proveedor_id ?? ''}
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

        {/* Imagen actual */}
        {form.imagen && (
          <div>
            <p className="text-sm text-slate-600 mb-1">Imagen actual:</p>
            <img
              src={form.imagen}
              alt="producto"
              className="w-full h-40 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Nueva Imagen */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Imagen (opcional)</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

export default EditarProducto;
