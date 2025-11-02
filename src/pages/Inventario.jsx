import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileText, Download, Edit, Trash2 } from 'lucide-react';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedorFiltro, setProveedorFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [stockFiltro, setStockFiltro] = useState('');

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(res.data || []);
      } catch (err) {
        toast.error('Debes iniciar sesión');
      }
    };
    fetchProductos();
  }, []);

  function normalizarTexto(texto = '') {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  const esProveedorOculto = (nombre = '') =>
  normalizarTexto(nombre).trim() === 'a granel';

  const productosFiltrados = productos.filter((p) => {
    if(esProveedorOculto(p?.nombre_proveedor)) return false;

    const coincideProveedor = proveedorFiltro === '' || p.nombre_proveedor === proveedorFiltro;
    const coincideUbicacion = ubicacionFiltro === '' || p.ubicacion === ubicacionFiltro;
    const coincideStock =
      stockFiltro === '' ||
      (stockFiltro === 'BAJO' && Number(p.cantidad_stock) < Number(p.stock_minimo)) ||
      (stockFiltro === 'CERO' && Number(p.cantidad_stock) === 0);

    const textoProducto = normalizarTexto(`${p.codigo} ${p.descripcion}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    const coincideBusqueda = palabras.length === 0 || palabras.every((palabra) => textoProducto.includes(palabra));

    return coincideProveedor && coincideUbicacion && coincideStock && coincideBusqueda;
  });

  const proveedoresUnicos = [...new Set(productos.map(p => p?.nombre_proveedor).filter(Boolean).filter(n => !esProveedorOculto(n)))].sort((a, b) => a.localeCompare(b));
  const ubicacionesUnicas = [...new Set(productos.map(p => p?.ubicacion).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const totalCompra = productosFiltrados.reduce((acc, p) => acc + (Number(p.precio_compra ?? 0) * Number(p.stock_faltante ?? 0)), 0);
  const totalVenta = productosFiltrados.reduce((acc, p) => acc + (Number(p.precio_venta ?? 0) * Number(p.cantidad_stock ?? 0)), 0);

  const exportarPDF = () => {
    if (productosFiltrados.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }
    const doc = new jsPDF();
    doc.text('Inventario de productos', 14, 10);
    const tabla = productosFiltrados.map(p => [
      p.codigo,
      p.descripcion,
      p.nombre_proveedor,
      p.ubicacion,
      p.cantidad_stock,
      p.stock_faltante,
      `${Number(p.precio_compra ?? 0).toFixed(2)}`,
      `$${Number(p.precio_venta ?? 0).toFixed(2)}`,
    ]);
    autoTable(doc, {
      head: [['Código', 'Descripción', 'Proveedor', 'Ubicación', 'Stock', 'Stock Faltante', 'Precio Compra', 'Precio Venta']],
      body: tabla,
      startY: 20,
      styles: { fontSize: 10 }
    });
    const date = new Date();
    doc.save(`inventario_${date.toISOString().slice(0, 10)}.pdf`);
  };

  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }
    const worksheetData = productosFiltrados.map(p => ({
      Código: p.codigo,
      Descripción: p.descripcion,
      Proveedor: p.nombre_proveedor,
      Ubicación: p.ubicacion,
      Stock: p.cantidad_stock,
      'Stock Faltante': p.stock_faltante,
      'Precio Compra': Number(p.precio_compra ?? 0),
      'Precio Venta': Number(p.precio_venta ?? 0),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const date = new Date();
    saveAs(file, `inventario_${date.toISOString().slice(0, 10)}.xlsx`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;
    const token = localStorage.getItem('token');
    try {
      await API.delete(`/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el producto');
    }
  };

  return (
    <div className="page py-6">
      <h1 className="text-2xl font-bold mb-6">📦 Inventario de Productos</h1>

      {/* Barra de filtros */}
      <div className="bg-white border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <input
          type="text"
          placeholder="🔍 Buscar por código o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:flex-1 rounded-xl border border-slate-300 px-4 py-2"
        />
        <select value={proveedorFiltro} onChange={(e) => setProveedorFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todos los proveedores</option>
          {proveedoresUnicos.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
        </select>
        <select value={ubicacionFiltro} onChange={(e) => setUbicacionFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todas las ubicaciones</option>
          {ubicacionesUnicas.map((ubic) => <option key={ubic} value={ubic}>{ubic}</option>)}
        </select>
        <select value={stockFiltro} onChange={(e) => setStockFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todos</option>
          <option value="BAJO">Stock bajo</option>
          <option value="CERO">Stock = 0</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-white text-slate-700 hover:bg-slate-100"
          >
            <FileText size={16} /> PDF
          </button>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-white text-slate-700 hover:bg-slate-100"
          >
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Código</th>
              <th className="text-left">Descripción</th>
              <th>Proveedor</th>
              <th>Ubicación</th>
              <th>Stock</th>
              <th>Faltante</th>
              <th>Compra</th>
              <th>Venta</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {productosFiltrados.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 border-b last:border-0">
                <td className="px-4 py-2">{p.codigo}</td>
                <td>{p.descripcion}</td>
                <td>{p.nombre_proveedor}</td>
                <td>{p.ubicacion}</td>
                <td className="text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium
    ${Number(p.cantidad_stock) === 0
                        ? 'bg-rose-100 text-rose-700'
                        : Number(p.cantidad_stock) < Number(p.stock_minimo)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'}`}
                  >
                    {p.cantidad_stock}
                  </span>
                </td>
                <td className="text-center">{p.stock_faltante}</td>
                <td className="text-right">${Number(p.precio_compra ?? 0).toFixed(2)}</td>
                <td className="text-right font-semibold">${Number(p.precio_venta ?? 0).toFixed(2)}</td>
                <td className="flex gap-1 justify-end pr-4">
                  <Link
                    to={`/productos/editar/${p.id}`}
                    className="p-1 rounded hover:bg-amber-100 text-amber-600"
                  >
                    <Edit size={16} />
                  </Link>
                  {usuario?.rol === 'admin' && (
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="p-1 rounded hover:bg-rose-100 text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-blue-700">Importe total de compra</h2>
          <p className="text-2xl font-bold text-blue-900 mt-2">${totalCompra.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-green-700">Importe total de venta</h2>
          <p className="text-2xl font-bold text-green-900 mt-2">${totalVenta.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Inventario;
