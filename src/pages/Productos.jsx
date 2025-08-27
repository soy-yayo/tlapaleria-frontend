import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
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
  const [proveedorFiltro, setProveedorFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState(null); // 'admin' | 'user' | null

  // Lee el usuario/rol desde localStorage de forma segura
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuario');
      const parsed = raw ? JSON.parse(raw) : null;
      const r = parsed?.rol ? String(parsed.rol).toLowerCase() : null;
      setRol(r);
    } catch {
      setRol(null);
    }
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        alert('Debes iniciar sesión');
      }
    };
    fetchProductos();
  }, []);

  const proveedoresUnicos = [...new Set(productos.map(p => p.nombre_proveedor))];
  const ubicacionesUnicas = [...new Set(productos.map(p => p.ubicacion))];

  const productosFiltrados = productos.filter(p =>
    (proveedorFiltro === '' || p.nombre_proveedor === proveedorFiltro) &&
    (ubicacionFiltro === '' || p.ubicacion === ubicacionFiltro) &&
    (
      (p.codigo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    try {
      await API.delete(`/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar el producto');
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventario de productos", 14, 10);
    const tabla = productosFiltrados.map(p => [
      p.codigo,
      p.descripcion,
      p.ubicacion,
      p.cantidad_stock,
      `$${p.precio_venta}`,
      p.nombre_proveedor
    ]);
    autoTable(doc, {
      head: [['Código', 'Descripción', 'Ubicación', 'Stock', 'Precio Venta', 'Proveedor']],
      body: tabla,
      startY: 20,
      styles: { fontSize: 10 },
    });
    doc.save("inventario.pdf");
  };

  const exportarExcel = () => {
    const worksheetData = productosFiltrados.map(p => ({
      Código: p.codigo,
      Descripción: p.descripcion,
      Ubicación: p.ubicacion,
      Stock: p.cantidad_stock,
      'Precio Venta': p.precio_venta,
      Proveedor: p.nombre_proveedor
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'inventario.xlsx');
  };

  const Filtros = () => (
    <>
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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
    </>
  );

  const TarjetaProducto = ({ p, esAdmin, mostrarAcciones }) => (
    <div
      className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-md transition"
      onClick={() => setProductoSeleccionado(p)}
    >
      {p.imagen && (
        <img
          src={p.imagen}
          alt={p.descripcion}
          className="w-full h-40 object-cover mb-2 rounded"
        />
      )}
      <h3>{p.descripcion}</h3>
      <p className="text-sm text-gray-600">Código: {p.codigo}</p>
      <p className="text-sm text-gray-600">Stock: {p.cantidad_stock}</p>
      <p className="text-sm text-gray-600 font-bold">Precio venta: ${p.precio_venta}</p>

      {esAdmin && (
        <>
          <p className="text-sm text-gray-600">Proveedor: {p.nombre_proveedor}</p>
          <p className="text-sm text-gray-600 font-bold">Precio compra: ${p.precio_compra}</p>
        </>
      )}

      {mostrarAcciones && (
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
      )}
    </div>
  );

  const GridProductos = ({ esAdmin, mostrarAcciones }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {productosFiltrados.map(p => (
        <TarjetaProducto key={p.id} p={p} esAdmin={esAdmin} mostrarAcciones={mostrarAcciones} />
      ))}
    </div>
  );

  // Vista ADMIN
  const AdminView = () => (
    <>
      <Filtros />
      <div className='container mx-auto p-4 bg-white shadow-md rounded-lg'>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Productos (Admin)</h1>
            <p className="text-sm text-gray-600">Gestión completa del inventario.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportarPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Exportar a PDF
            </button>
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Exportar a Excel
            </button>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500">No se encontraron productos.</p>
        ) : (
          <GridProductos mostrarAcciones esAdmin />
        )}
      </div>

      {productoSeleccionado && (
        <ModalProducto
          p={productoSeleccionado}
          esAdmin
          onClose={() => setProductoSeleccionado(null)}
          onEliminar={() => handleEliminar(productoSeleccionado.id)}
        />
      )}
    </>
  );

  // Vista USUARIO (solo lectura)
  const UserView = () => (
    <>
      <Filtros />
      <div className='container mx-auto p-4 bg-white shadow-md rounded-lg'>
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Productos</h1>
          <p className="text-sm text-gray-600">Catálogo de productos (solo lectura).</p>
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500">No se encontraron productos.</p>
        ) : (
          <GridProductos mostrarAcciones={false} esAdmin={false} />
        )}
      </div>

      {productoSeleccionado && (
        <ModalProducto
          p={productoSeleccionado}
          esAdmin={false}
          onClose={() => setProductoSeleccionado(null)}
        />
      )}
    </>
  );

  return rol === 'admin' ? <AdminView /> : <UserView />;
}

function ModalProducto({ p, esAdmin = false, onClose, onEliminar }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>
          &times;
        </button>

        {p.imagen && (
          <img
            src={p.imagen}
            alt="producto"
            className="w-full h-52 object-cover rounded mb-4"
          />
        )}

        <h2 className="text-xl font-bold mb-2">{p.descripcion}</h2>

        <div className="space-y-1">
          <p><strong>Código:</strong> {p.codigo}</p>
          <p><strong>Ubicación:</strong> {p.ubicacion}</p>
          <p><strong>Stock:</strong> {p.cantidad_stock}</p>
          <p><strong>Precio venta:</strong> ${p.precio_venta}</p>

          {esAdmin && (
            <>
              <p><strong>Proveedor:</strong> {p.nombre_proveedor}</p>
              <p><strong>Precio compra:</strong> ${p.precio_compra}</p>
            </>
          )}
        </div>

        {esAdmin && (
          <div className="mt-4 flex gap-2">
            <Link
              to={`/productos/editar/${p.id}`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Editar
            </Link>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEliminar?.();
                onClose();
              }}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Productos;
