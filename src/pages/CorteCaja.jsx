import { useEffect, useState } from 'react';
import { obtenerCorteCaja } from '../services/reportes';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CorteCaja() {
  const [reporte, setReporte] = useState([]);
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    forma_pago: '',
    usuario_id: ''
  });

  const cargar = async () => {
    const data = await obtenerCorteCaja(filtros);
    setReporte(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reporte);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), 'corte_caja.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Corte de Caja', 14, 15);
    autoTable(doc, {
      head: [['Fecha', 'Forma de Pago', 'Usuario', 'Cantidad Ventas', 'Total']],
      body: reporte.map(r => [
        r.fecha,
        r.forma_pago,
        r.usuario,
        r.cantidad_ventas,
        `$${r.total_ventas}`
      ]),
      startY: 20,
      styles: { fontSize: 9 }
    });
    doc.save('corte_caja.pdf');
  };

  return (
    <div className="page py-6">
      <h2 className="text-2xl font-bold mb-6">💰 Corte de Caja</h2>

      {/* Filtros */}
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <input
          type="date"
          value={filtros.desde}
          onChange={e => setFiltros({ ...filtros, desde: e.target.value })}
          className="rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="date"
          value={filtros.hasta}
          onChange={e => setFiltros({ ...filtros, hasta: e.target.value })}
          className="rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={cargar}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3">Forma de Pago</th>
              <th className="p-3">Usuario</th>
              <th className="p-3 text-center">Cantidad Ventas</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reporte.map((r, idx) => (
              <tr key={idx} className="odd:bg-slate-50 hover:bg-slate-100">
                <td className="p-3">{r.fecha}</td>
                <td className="p-3">{r.forma_pago}</td>
                <td className="p-3">{r.usuario}</td>
                <td className="p-3 text-center">{r.cantidad_ventas}</td>
                <td className="p-3 text-right font-semibold">${r.total_ventas}</td>
              </tr>
            ))}
            {reporte.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  No hay datos para este rango de fechas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botones exportar */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={exportarExcel}
          className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          Exportar Excel
        </button>
        <button
          onClick={exportarPDF}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition"
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}

export default CorteCaja;
