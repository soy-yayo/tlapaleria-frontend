import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

function normalizar(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export default function EntradasMercancia() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [entradas, setEntradas] = useState({});
  const [precios, setPrecios] = useState({}); // Estado para precios editados
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

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

  const setPrecio = (id, tipo, val) => {
    const n = Number(val);
    setPrecios(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [tipo]: Number.isFinite(n) ? Math.max(0, n) : 0
      }
    }));
  };

  const inc = (id) => setEntradas(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const dec = (id) => setEntradas(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  const quitar = (id) => {
    setEntradas(prev => { const c = { ...prev }; delete c[id]; return c; });
    setPrecios(prev => { const c = { ...prev }; delete c[id]; return c; });
  };
  const limpiar = () => {
    setEntradas({});
    setPrecios({});
  };

  const agregarPorBusqueda = () => {
    const q = normalizar(busqueda);
    if (!q) return;

    let prod = productos.find(p =>
      normalizar(String(p.codigo)) === q ||
      normalizar(String(p.codigo_barras || '')) === q
    );

    if (!prod) {
      const matches = productos.filter(p => {
        const texto = normalizar(`${p.codigo} ${p.codigo_barras || ''} ${p.descripcion}`);
        return texto.includes(q);
      });
      if (matches.length === 1) prod = matches[0];
      else if (matches.length > 1) {
        toast.info(`Hay ${matches.length} coincidencias, escanea/ingresa el código exacto.`);
        return;
      }
    }

    if (!prod) {
      toast.error('Producto no encontrado');
      return;
    }

    setEntradas(prev => ({ ...prev, [prod.id]: (prev[prod.id] || 0) + 1 }));
    setBusqueda('');
    inputRef.current?.focus();
  };

  const seleccion = useMemo(() => {
    const ids = Object.keys(entradas).map(n => Number(n)).filter(Boolean);
    const mapa = new Map(productos.map(p => [p.id, p]));
    return ids
      .map(id => {
        const p = mapa.get(id);
        if (!p) return null;
        const add = Number(entradas[id] || 0);
        const precioEditado = precios[id] || {};
        return {
          ...p,
          entrada: add,
          nuevo_stock: Number(p.cantidad_stock) + (Number.isFinite(add) ? add : 0),
          precio_compra: precioEditado.precio_compra !== undefined ? precioEditado.precio_compra : Number(p.precio_compra),
          precio_venta: precioEditado.precio_venta !== undefined ? precioEditado.precio_venta : Number(p.precio_venta)
        };
      })
      .filter(Boolean);
  }, [productos, entradas, precios]);

  const payload = useMemo(() =>
    seleccion
      .map(p => ({
        id: p.id,
        cantidad: p.entrada,
        precio_compra: p.precio_compra,
        precio_venta: p.precio_venta
      }))
      .filter(x => x.cantidad > 0)
    , [seleccion]);

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

      setProductos(prev =>
        prev.map(p => {
          const entrada = payload.find(x => x.id === p.id);
          if (!entrada) return p;
          return {
            ...p,
            cantidad_stock: Number(p.cantidad_stock) + entrada.cantidad,
            precio_compra: entrada.precio_compra,
            precio_venta: entrada.precio_venta
          };
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

      {/* Buscador (Enter agrega) */}
      <div className="bg-white border rounded-xl p-4 mb-4 flex gap-3 items-center shadow-sm">
        <input
          ref={inputRef}
          type="text"
          placeholder="Escanea o escribe código/código de barras y presiona Enter"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              agregarPorBusqueda();
            }
          }}
          className="w-full rounded-xl border px-4 py-2"
        />
        <button
          onClick={agregarPorBusqueda}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
        >
          Agregar
        </button>
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

      {/* SOLO los productos seleccionados */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Código</th>
              <th className="text-left">Descripción</th>
              <th className="text-left">Proveedor</th>
              <th className="text-center">Stock actual</th>
              <th className="text-center">Entrada</th>
              <th className="text-center">Nuevo stock</th>
              <th className="text-center">Precio compra</th>
              <th className="text-center">Precio venta</th>
              <th className="text-center">Quitar</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {seleccion.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 border-b last:border-0">
                <td className="px-4 py-2">{p.codigo}</td>
                <td className="py-2">{p.descripcion}</td>
                <td>{p.nombre_proveedor || '-'}</td>
                <td className="text-center">{p.cantidad_stock}</td>

                <td className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => dec(p.id)}
                      className="px-2 py-1 rounded border hover:bg-slate-100"
                      title="−1"
                    >−</button>
                    <input
                      type="number"
                      min="0" step="1"
                      value={p.entrada}
                      onChange={e => setEntrada(p.id, e.target.value)}
                      className="w-20 text-center rounded border px-2 py-1"
                    />

                    <button
                      type="button"
                      onClick={() => inc(p.id)}
                      className="px-2 py-1 rounded border hover:bg-slate-100"
                      title="+1"
                    >+</button>
                  </div>
                </td>
                <td className="text-center font-semibold">{p.nuevo_stock}</td>
                <td className="text-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.precio_compra}
                    onChange={e => setPrecio(p.id, 'precio_compra', e.target.value)}
                    className="w-24 text-center rounded border px-2 py-1"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.precio_venta}
                    onChange={e => setPrecio(p.id, 'precio_venta', e.target.value)}
                    className="w-24 text-center rounded border px-2 py-1"
                  />
                </td>
                <td className="text-center">
                  <button
                    onClick={() => quitar(p.id)}
                    className="px-2 py-1 rounded border hover:bg-rose-50 text-rose-600"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            {seleccion.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-center text-slate-400">
                  Escanea o escribe un código y presiona Enter para agregar productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
