import { useState, useEffect, useRef } from 'react';
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
    stock_minimo: '',
    categoria_id: ''          // <-- NUEVO
  });
  const [imagen, setImagen] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const loadedRef = useRef(false);

  useEffect(() => {
    // Guardas de rol
    if (!usuario) { navigate('/login'); return; }
    if (usuario.rol !== 'admin') { navigate('/denegado'); return; }

    // Evitar doble carga en StrictMode
    if (loadedRef.current) return;
    loadedRef.current = true;

    const ctrl = new AbortController();
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal };

        const [resProv, resProd, resCat] = await Promise.all([
          API.get('/proveedores', config),
          API.get('/productos',   config),
          API.get('/categorias',  config),
        ]);

        setProveedores(resProv.data || []);
        setProductos(resProd.data || []);
        setCategorias(resCat.data || []);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error(err);
          toast.error('Error al cargar datos iniciales');
        }
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const token = localStorage.getItem('token');

    // Normalizadores
    const toInt = (v, d = 0) => {
      const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : d;
    };
    const toNum = (v, d = 0) => {
      const n = Number(v); return Number.isFinite(n) ? n : d;
    };

    const payload = {
      codigo: String(form.codigo || '').trim(),
      descripcion: String(form.descripcion || '').trim(),
      ubicacion: String(form.ubicacion || '').trim(),
      stock_maximo: toInt(form.stock_maximo, 0),
      cantidad_stock: toInt(form.cantidad_stock, 0),
      proveedor_id: toInt(form.proveedor_id, 0),
      precio_compra: toNum(form.precio_compra, 0),
      precio_venta: toNum(form.precio_venta, 0),
      clave_sat: String(form.clave_sat || '').trim(),
      stock_minimo: toInt(form.stock_minimo, 0),
      categoria_id: toInt(form.categoria_id, 0)   // <-- NUEVO
    };

    // Validaciones mínimas
    if (!payload.codigo)         { toast.error('El código es obligatorio'); setSubmitting(false); return; }
    if (!payload.descripcion)    { toast.error('La descripción es obligatoria'); setSubmitting(false); return; }
    if (!payload.proveedor_id)   { toast.error('Selecciona proveedor'); setSubmitting(false); return; }
    if (!payload.categoria_id)   { toast.error('Selecciona categoría'); setSubmitting(false); return; }
    if (payload.stock_minimo < 0){ toast.error('El stock mínimo no puede ser negativo'); setSubmitting(false); return; }
    if (payload.cantidad_stock<0){ toast.error('La cantidad en stock no puede ser negativa'); setSubmitting(false); return; }
    if (payload.precio_compra < 0|| payload.precio_venta < 0) {
      toast.error('Precios no pueden ser negativos'); setSubmitting(false); return;
    }

    // Duplicado local (backend también valida)
    const existe = productos.some(p => String(p.codigo).trim() === payload.codigo);
    if (existe) { toast.error(`El código "${payload.codigo}" ya está registrado`); setSubmitting(false); return; }

    // FormData para multipart (imagen opcional)
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => formData.append(k, String(v)));
    if (imagen) formData.append('imagen', imagen);

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
      const msg = err?.response?.data?.error || err.message || 'Error al agregar producto';
      console.error(err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">➕ Agregar producto</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Texto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
          <input
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* Números */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock máximo</label>
          <input
            type="number" min="0" step="1"
            name="stock_maximo"
            value={form.stock_maximo}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad en stock</label>
          <input
            type="number" min="0" step="1"
            name="cantidad_stock"
            value={form.cantidad_stock}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock mínimo</label>
          <input
            type="number" min="0" step="1"
            name="stock_minimo"
            value={form.stock_minimo}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio de compra</label>
          <input
            type="number" min="0" step="0.01"
            name="precio_compra"
            value={form.precio_compra}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio de venta</label>
          <input
            type="number" min="0" step="0.01"
            name="precio_venta"
            value={form.precio_venta}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Clave SAT */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Clave SAT</label>
          <input
            type="text"
            name="clave_sat"
            value={form.clave_sat}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

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
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : 'Guardar producto'}
        </button>
      </form>
    </div>
  );
}

export default AgregarProducto;
