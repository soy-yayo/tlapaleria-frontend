import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

function normalizar(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function EntradasMercancia() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedorFiltro, setProveedorFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [entradas, setEntradas] = useState({}); // { [idProducto]: cantidadAAgregar }
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/productos', { headers: { Authorization: `Bearer ${token}` } });
        setProductos(res.data || []);
      } catch {
        toast.error('Error al cargar productos');
      }
    })();
  }, []);

  const setEntrada = (id, val) => {
    const n = Number(val);
    setEntradas(prev => ({ ...prev, [id]: Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0 }));
  };

  const limpiar = () => setEntradas({});

  const productosFiltrados = useMemo(() => {
    return (productos || []).filter(p => {
      const coincideProveedor = !proveedorFiltro || p.nombre_proveedor === proveedorFiltro;
      const coincideCategoria = !categoriaFiltro || p.nombre_categoria === categoriaFiltro;
      const coincideUbicacion = !ubicacionFiltro || p.ubicacion === ubicacionFiltro;
      const texto = normalizar(`${p.codigo} ${p.codigo_barras || ''} ${p.descripcion}`);
      const okBusqueda = !busqueda || normalizar(busqueda).split(/\s+/).filter(Boolean).every(w => texto.includes(w));
      return coincideProveedor && coincideCategoria && coincideUbicacion && okBusqueda;
    });
  }, [productos, proveedorFiltro, categoriaFiltro, ubicacionFiltro, busqueda]);

  const proveedores = useMemo(() =>
    [...new Set(productos.map(p => p?.nombre_proveedor).filter(Boolean))].sort((a,b)=>a.localeCompare(b))
  , [productos]);

  const categorias = useMemo(() =>
    [...new Set(productos.map(p => p?.nombre_categoria).filter(Boolean))].sort((a,b)=>a.localeCompare(b))
  , [productos]);

  const ubicaciones = useMemo(() =>
    [...new Set(productos.map(p => p?.ubicacion).filter(Boolean))].sort((a,b)=>a.localeCompare(b))
  , [productos]);

  const payload = useMemo(() =>
    Object.entries(entradas)
      .map(([id, cantidad]) => ({ id: Number(id), cantidad: Number(cantidad) }))
      .filter(x => x.cantidad > 0)
  , [entradas]);

  const totalItems = payload.reduce((a, b) => a + b.cantidad, 0);

  const guardarEntradas = async () => {
    if (payload.length === 0) {
      toast.info('No hay entradas para guardar');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/inventario/entradas', { entradas: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar vista local
      setProductos(prev =>
        prev.map(p => {
          const add = payload.find(x => x.id === p.id)?.cantidad || 0;
          return add ? { ...p, cantidad_stock: Number(p.cantidad_stock) + add } : p;
        })
      );
      limpiar();
      toast.success(`Entradas registradas (${res.data?.updated ?? payload.length})`);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Error al registrar entradas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page py-6">
      <h1 className="text-2xl font-bold mb-4">📥 Recepción de mercancía</h1>

      {/* Filtros */}
      <div className="bg-white border rounded-xl p-4 mb-5 flex flex-col md:flex-row gap-3 items-center shadow-sm">
        <input
          type="text"
          placeholder="🔍 Buscar por código, código de barras o descripción"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full md:flex-1 rounded-xl border px-4 py-2"
        />
        <select value={proveedorFiltro} onChange={e => setProveedorFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todos los proveedores</option>
          {proveedores.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todas las categorías</option>
          {categorias.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={ubicacionFiltro} onChange={e => setUbicacionFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Acciones */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={guardarEntradas}
          disabled={loading || payload.length === 0}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition
            ${payload.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Guardando…' : `Guardar entradas (+${totalItems})`}
        </button>
        <button
          onClick={limpiar}
          disabled={Object.keys(entradas).length === 0}
          className="px-4 py-2 rounded-xl border text-sm bg-white hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla editable */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Código</th>
              <th className="text-left">Descripción</th>
              <th className="text-left">Proveedor</th>
              <th className="text-left">Categoría</th>
              <th className="text-center">Stock actual</th>
              <th className="text-center">Entrada</th>
              <th className="text-center">Nuevo stock</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {productosFiltrados.map(p => {
              const entrada = Number(entradas[p.id] || 0);
              const nuevo = Number(p.cantidad_stock) + (Number.isFinite(entrada) ? entrada : 0);
              return (
                <tr key={p.id} className="hover:bg-slate-50 border-b last:border-0">
                  <td className="px-4 py-2">{p.codigo}</td>
                  <td className="py-2">{p.descripcion}</td>
                  <td>{p.nombre_proveedor || '-'}</td>
                  <td>{p.nombre_categoria || '-'}</td>
                  <td className="text-center">{p.cantidad_stock}</td>
                  <td className="text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEntrada(p.id, (entrada || 0) - 1)}
                        className="px-2 py-1 rounded border hover:bg-slate-100"
                        title="−1"
                      >−</button>
                      <input
                        type="number"
                        min="0" step="1"
                        value={entrada}
                        onChange={e => setEntrada(p.id, e.target.value)}
                        className="w-20 text-center rounded border px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => setEntrada(p.id, (entrada || 0) + 1)}
                        className="px-2 py-1 rounded border hover:bg-slate-100"
                        title="+1"
                      >+</button>
                    </div>
                  </td>
                  <td className="text-center font-semibold">{nuevo}</td>
                </tr>
              );
            })}
            {productosFiltrados.length === 0 && (
              <tr><td colSpan="7" className="p-4 text-center text-slate-400">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
