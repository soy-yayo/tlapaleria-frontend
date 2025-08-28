// src/pages/Productos.jsx
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

  // === Normalización igual que en NuevaVenta.jsx ===
  function normalizarTexto(texto = '') {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // === Filtros + búsqueda normalizada por código o descripción ===
  const productosFiltrados = productos.filter((p) =>
    (proveedorFiltro === '' || p.nombre_proveedor === proveedorFiltro) &&
    (ubicacionFiltro === '' || p.ubicacion === ubicacionFiltro) &&
    (
      normalizarTexto(p.codigo).includes(normalizarTexto(busqueda)) ||
      normalizarTexto(p.descripcion).includes(normalizarTexto(busqueda))
    )
  );

  // Valores únicos para selects
  const proveedoresUnicos = [...new Set(productos.map(p => p?.nombre_proveedor).filter(Boolean))];
  const ubicacionesUnicas = [...new Set(productos.map(p => p?.ubicacion).filter(Boolean))];

  // === Exportar PDF (usa lista filtrada) ===
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
      p.cantidad_stock,
      `$${Number(p.precio_venta ?? 0).toFixed(2)}`,
      p.nombre_proveedor
    ]);

    autoTable(doc, {
      head: [['Código', 'Descripción', 'Ubicación', 'Stock', 'Precio Venta', 'Proveedor']],
      body: tabla,
      startY: 20,
      styles: { fontSize: 10 }
    });

    doc.save('inventario.pdf');
  };

  // === Exportar Excel (usa lista filtrada) ===
  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }

    const worksheetData = productosFiltrados.map(p => ({
      Código: p.codigo,
      Descripción: p.descripcion,
      Ubicación: p.ubicacion,
      Stock: p.cantidad_stock,
      'Precio Venta': Number(p.precio_venta ?? 0),
      Proveedor: p.nombre_proveedor
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'inventario.xlsx');
  };

  // === Eliminar producto ===
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
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Productos</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={proveedorFiltro}
          onChange={(e) => setProveedorFiltro(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/2"
        >
          <option value="">Todos los proveedores</option>
          {proveedoresUnicos.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>

        <select
          value={ubicacionFiltro}
          onChange={(e) => setUbicacionFiltro(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/2"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicacionesUnicas.map((ubi) => (
            <option key={ubi} value={ubi}>{ubi}</option>
          ))}
        </select>
      </div>

      {/* Buscador normalizado (igual a NuevaVenta) */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Acciones de exportación */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={exportarPDF}
          disabled={productosFiltrados.length === 0}
          className={`px-4 py-2 rounded text-white ${productosFiltrados.length === 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Exportar a PDF
        </button>
        <button
          onClick={exportarExcel}
          disabled={productosFiltrados.length === 0}
          className={`px-4 py-2 rounded text-white ${productosFiltrados.length === 0 ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          Exportar a Excel
        </button>
      </div>

      {/* Listado / vacío */}
      {productosFiltrados.length === 0 ? (
        <p className="text-gray-600">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map(p => (
            <div
              key={p.id}
              className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => setProductoSeleccionado(p)}
            >
              <img
                src={p.imagen}
                alt={p.descripcion}
                className="w-full h-40 object-cover mb-2 rounded"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+imagen'; }}
              />
              <h3 className="font-bold">{p.descripcion}</h3>
              <p className="text-sm text-gray-600">Código: {p.codigo}</p>
              <p className="text-sm text-gray-600">Stock: {p.cantidad_stock}</p>
              <p className="text-sm text-gray-600 font-bold">Precio: ${Number(p.precio_venta ?? 0).toFixed(2)}</p>

              <div className="flex mt-2 gap-2">
                <Link
                  to={`/productos/editar/${p.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Editar
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(p.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-xl"
              onClick={() => setProductoSeleccionado(null)}
            >
              &times;
            </button>
            <img
              src={productoSeleccionado.imagen}
              alt="producto"
              className="w-full h-52 object-cover rounded mb-4"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+imagen'; }}
            />
            <h2 className="text-xl font-bold mb-2">{productoSeleccionado.descripcion}</h2>
            <p><strong>Código:</strong> {productoSeleccionado.codigo}</p>
            <p><strong>Ubicación:</strong> {productoSeleccionado.ubicacion}</p>
            <p><strong>Stock:</strong> {productoSeleccionado.cantidad_stock}</p>
            <p><strong>Proveedor:</strong> {productoSeleccionado.nombre_proveedor}</p>
            <p><strong>Precio:</strong> ${Number(productoSeleccionado.precio_venta ?? 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
