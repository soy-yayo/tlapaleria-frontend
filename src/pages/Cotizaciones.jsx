import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, Pencil, Plus, FileText } from 'lucide-react';

function normalizarTexto(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function Cotizaciones() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const token = localStorage.getItem('token');

  async function cargar() {
    try {
      const res = await API.get('/cotizaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch {
      toast.error('Error al cargar cotizaciones');
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = items.filter((c) => {
    const t = normalizarTexto(`${c.id} ${c.cliente || ''} ${c.vendedor || ''}`);
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
    return palabras.length === 0 || palabras.every((p) => t.includes(p));
  });

  async function eliminar(id) {
    if (!confirm(`¿Eliminar cotización #${id}?`)) return;
    try {
      await API.delete(`/cotizaciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cotización eliminada');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <div className="page py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📄 Cotizaciones</h1>
        <Link to="/cotizaciones/nueva" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus size={18} /> Nueva cotización
        </Link>
      </div>

      <div className="mb-3">
        <input
          className="w-full rounded-xl border px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="🔍 Buscar por #, cliente, vendedor"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Vendedor</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{new Date(c.fecha).toLocaleString()}</td>
                <td className="p-2">{c.cliente || '—'}</td>
                <td className="p-2">{c.vendedor}</td>
                <td className="p-2 text-right">${Number(c.total).toFixed(2)}</td>
                <td className="p-2">{c.estado}</td>
                <td className="p-2">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/cotizaciones/editar/${c.id}`}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      className="p-2 rounded hover:bg-rose-50 text-rose-600"
                      onClick={() => eliminar(c.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td className="p-4 text-center text-slate-400" colSpan="7">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}