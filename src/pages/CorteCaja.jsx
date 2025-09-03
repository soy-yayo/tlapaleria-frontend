import { useEffect, useState } from 'react';
import { obtenerCorteCaja } from '../services/reportes';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    doc.autoTable({
      head: [['Fecha', 'Forma de Pago', 'Usuario', 'Cantidad Ventas', 'Total']],
      body: reporte.map(r => [
        r.fecha,
        r.forma_pago,
        r.usuario,
        r.cantidad_ventas,
        `$${r.total_ventas}`
      ])
    });
    doc.save('corte_caja.pdf');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Corte de Caja</h2>

      <div className="flex gap-2 mb-4">
        <input type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} />
        <input type="date" value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} />
        <button onClick={cargar} className="px-3 py-1 bg-blue-500 text-white rounded">Filtrar</button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Forma de Pago</th>
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Cantidad Ventas</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {reporte.map((r, idx) => (
            <tr key={idx}>
              <td className="border p-2">{r.fecha}</td>
              <td className="border p-2">{r.forma_pago}</td>
              <td className="border p-2">{r.usuario}</td>
              <td className="border p-2">{r.cantidad_ventas}</td>
              <td className="border p-2 font-bold">${r.total_ventas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mt-4">
        <button onClick={exportarExcel} className="px-3 py-1 bg-green-500 text-white rounded">Exportar Excel</button>
        <button onClick={exportarPDF} className="px-3 py-1 bg-red-500 text-white rounded">Exportar PDF</button>
      </div>
    </div>
  );
}

export default CorteCaja;
