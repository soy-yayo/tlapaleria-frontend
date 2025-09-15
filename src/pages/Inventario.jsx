import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  const productosFiltrados = productos.filter((p) => {
    const coincideProveedor = proveedorFiltro === '' || p.nombre_proveedor === proveedorFiltro;
    const coincideUbicacion = ubicacionFiltro === '' || p.ubicacion === ubicacionFiltro;
    const coincideStock =
      stockFiltro === '' ||
      (stockFiltro === 'BAJO' && Number(p.cantidad_stock) > 0 && Number(p.stock_faltante) > 0) ||
      (stockFiltro === 'CERO' && Number(p.cantidad_stock) === 0);

    const textoProducto = normalizarTexto(`${p.codigo} ${p.descripcion}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    const coincideBusqueda = palabras.length === 0 || palabras.every((palabra) => textoProducto.includes(palabra));

    return coincideProveedor && coincideUbicacion && coincideStock && coincideBusqueda;
  });

  const proveedoresUnicos = [...new Set(productos.map(p => p?.nombre_proveedor).filter(Boolean))].sort((a, b) => a.localeCompare(b));
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventario de Productos</h1>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Buscar por código o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <select value={proveedorFiltro} onChange={(e) => setProveedorFiltro(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
            <option value="">Todos los proveedores</option>
            {proveedoresUnicos.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <select value={ubicacionFiltro} onChange={(e) => setUbicacionFiltro(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
            <option value="">Todas las ubicaciones</option>
            {ubicacionesUnicas.map((ubic) => (
              <option key={ubic} value={ubic}>{ubic}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <select value={stockFiltro} onChange={(e) => setStockFiltro(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
            <option value="">Todos</option>
            <option value="BAJO">Stock bajo</option>
            <option value="CERO">Stock = 0</option>
          </select>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={exportarPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">Exportar PDF</button>
        <button onClick={exportarExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Exportar Excel</button>
      </div>
      <div className="mb-4 flex gap-2">
        <table className="w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">Código</th>
              <th className="border px-4 py-2">Descripción</th>
              <th className="border px-4 py-2">Proveedor</th>
              <th className="border px-4 py-2">Ubicación</th>
              <th className="border px-4 py-2">Stock</th>
              <th className="border px-4 py-2">Stock Faltante</th>
              <th className="border px-4 py-2">Precio Compra</th>
              <th className="border px-4 py-2">Precio Venta</th>
              <th className="border px-4 py-2">Editar</th>
              <th className="border px-4 py-2">Eliminar</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-700'>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id}>
                <td className="border px-4 py-2">{producto.codigo}</td>
                <td className="border px-4 py-2">{producto.descripcion}</td>
                <td className="border px-4 py-2">{producto.nombre_proveedor}</td>
                <td className="border px-4 py-2">{producto.ubicacion}</td>
                <td className="border px-4 py-2 text-center">{producto.cantidad_stock}</td>
                <td className="border px-4 py-2 text-center">{producto.stock_faltante}</td>
                <td className="border px-4 py-2 text-right">${Number(producto.precio_compra ?? 0).toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">${Number(producto.precio_venta ?? 0).toFixed(2)}</td>
                <td className="border px-4 py-2">
                  <Link to={`/productos/editar/${producto.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Editar</Link>
                </td>
                <td className="border px-4 py-2">
                  {usuario?.rol === 'admin' && (
                    <button
                      onClick={() => handleEliminar(producto.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg shadow bg-blue-50 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800">Importe total de compra</h2>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            ${totalCompra.toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-lg shadow bg-green-50 border border-green-200">
          <h2 className="text-lg font-semibold text-green-800">Importe total de venta</h2>
          <p className="text-2xl font-bold text-green-900 mt-2">
            ${totalVenta.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Inventario;
