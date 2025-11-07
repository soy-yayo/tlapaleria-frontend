import { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Productos() {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedorFiltro, setProveedorFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [categoriasFiltro, setCategoriasFiltro] = useState('');

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
        console.error('Error al cargar productos:', err);
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

  const productosFiltrados = productos.filter((p) => {
    // const coincideProveedor = proveedorFiltro === '' || p.nombre_proveedor === proveedorFiltro;
    const coincideUbicacion = ubicacionFiltro === '' || p.ubicacion === ubicacionFiltro;
    const coincideCategoria = categoriasFiltro === '' || p.nombre_categoria === categoriasFiltro;
    const textoProducto = normalizarTexto(`${p.codigo} ${p.descripcion}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    const coincideBusqueda = palabras.length === 0 || palabras.every((palabra) => textoProducto.includes(palabra));
    return coincideUbicacion && coincideCategoria && coincideBusqueda;
  });

  // const proveedoresUnicos = [...new Set(productos.map(p => p?.nombre_proveedor).filter(Boolean))].sort();
  const ubicacionesUnicas = [...new Set(productos.map(p => p?.ubicacion).filter(Boolean))].sort();
  const categoriasUnicas = [...new Set(productos.map(p => p?.nombre_categoria).filter(Boolean))].sort();

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
      p.ubicacion,
      p.categoria,
      p.cantidad_stock,
      `$${Number(p.precio_venta ?? 0).toFixed(2)}`,
      p.nombre_proveedor,
      p.clave_sat || ''
    ]);
    autoTable(doc, {
      head: [['Código', 'Descripción', 'Ubicación', 'Stock', 'Precio Venta', 'Proveedor', 'Clave SAT']],
      body: tabla,
      startY: 20,
      styles: { fontSize: 10 }
    });
    doc.save('inventario.pdf');
  };

  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }
    const worksheetData = productosFiltrados.map(p => ({
      Código: p.codigo,
      Descripción: p.descripcion,
      Ubicación: p.ubicacion,
      Categoría: p.categoria,
      Stock: p.cantidad_stock,
      'Precio Venta': Number(p.precio_venta ?? 0),
      Proveedor: p.nombre_proveedor,
      'Clave SAT': p.clave_sat || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'inventario.xlsx');
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
      console.error(err);
      toast.error('No se pudo eliminar el producto');
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 bg-white border rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📦 Productos</h1>

      {/* Barra de filtros */}
      <div className="bg-slate-50 border rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* <select
          value={proveedorFiltro}
          onChange={(e) => setProveedorFiltro(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos los proveedores</option>
          {proveedoresUnicos.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select> */}
        <select value={categoriasFiltro} onChange={(e) => setCategoriasFiltro(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Todas las categorías</option>
          {categoriasUnicas.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={ubicacionFiltro}
          onChange={(e) => setUbicacionFiltro(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicacionesUnicas.map((ubi) => (
            <option key={ubi} value={ubi}>{ubi}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="🔍 Buscar por código o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Acciones */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={exportarPDF}
          disabled={productosFiltrados.length === 0}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition ${
            productosFiltrados.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Exportar PDF
        </button>
        <button
          onClick={exportarExcel}
          disabled={productosFiltrados.length === 0}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition ${
            productosFiltrados.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Exportar Excel
        </button>
      </div>

      {/* Grid de productos */}
      {productosFiltrados.length === 0 ? (
        <p className="text-slate-500">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {productosFiltrados.map((p) => (
            <div
              key={p.id}
              className="bg-white border rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => setProductoSeleccionado(p)}
            >
              <img
                src={p.imagen}
                alt={p.descripcion}
                className="w-full h-40 object-cover mb-3 rounded-lg"
              />
              <h3 className="font-semibold text-sm mb-1">{p.descripcion}</h3>
              <p className="text-xs text-slate-500">Código: {p.codigo}</p>
              <p className="text-xs text-slate-500">Stock: {p.cantidad_stock}</p>
              <p className="text-xs text-slate-500">Ubicación: {p.ubicacion}</p>
              <p className="text-sm font-bold text-blue-600">Precio: ${Number(p.precio_venta ?? 0).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Clave SAT: {p.clave_sat || '-'}</p>

              {usuario?.rol === 'admin' && (
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/productos/editar/${p.id}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminar(p.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border rounded-xl shadow-lg p-6 w-full max-w-4xl relative">
            <button
              className="absolute top-3 right-4 text-xl text-slate-500 hover:text-black"
              onClick={() => setProductoSeleccionado(null)}
            >
              &times;
            </button>

            <img
              src={productoSeleccionado.imagen}
              alt={productoSeleccionado.descripcion}
              className="w-full h-80 object-fit rounded mb-4"
            />

            <h2 className="text-xl font-bold mb-2">{productoSeleccionado.descripcion}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p><strong>Código:</strong> {productoSeleccionado.codigo}</p>
              <p><strong>Stock:</strong> {productoSeleccionado.cantidad_stock}</p>
              <p><strong>Ubicación:</strong> {productoSeleccionado.ubicacion}</p>
              <p><strong>Precio venta:</strong> ${Number(productoSeleccionado.precio_venta ?? 0).toFixed(2)}</p>
              <p><strong>Clave SAT:</strong> {productoSeleccionado.clave_sat || '-'}</p>

              {usuario?.rol === 'admin' && (
                <>
                  <p><strong>Precio compra:</strong> ${Number(productoSeleccionado.precio_compra ?? 0).toFixed(2)}</p>
                  <p><strong>Proveedor:</strong> {productoSeleccionado.nombre_proveedor}</p>
                  <p><strong>Stock máximo:</strong> {productoSeleccionado.stock_maximo}</p>
                </>
              )}
            </div>

            {usuario?.rol === 'admin' && (
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/productos/editar/${productoSeleccionado.id}`}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  Editar
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(productoSeleccionado.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
