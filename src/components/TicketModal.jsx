import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function TicketModal({ venta, productos, onClose }) {
  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text(`Ticket de Venta #${venta.id}`, 10, 10);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 10, 20);
    doc.text(`Forma de Pago: ${venta.forma_pago}`, 10, 30);
    doc.text(`Vendedor: ${venta.usuario}`, 10, 40);

    const rows = productos.map(p => [
      p.descripcion,
      p.cantidad,
      `$${p.precio_unitario}`,
      `$${p.cantidad * p.precio_unitario}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Producto', 'Cant', 'P. Unitario', 'Subtotal']],
      body: rows,
    })

    doc.text(`Total: $${venta.total}`, 10, doc.lastAutoTable.finalY + 10);

    doc.save(`venta_${venta.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        <button className="absolute top-2 right-3 text-gray-600" onClick={onClose}>✖</button>
        <h2 className="text-xl font-bold mb-4">Ticket de Venta #{venta.id}</h2>
        <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
        <p><strong>Forma de pago:</strong> {venta.forma_pago}</p>
        <p><strong>Vendedor:</strong> {venta.usuario}</p>
        <hr className="my-3" />
        <ul className="text-sm">
          {productos.map((p, i) => (
            <li key={i} className="flex justify-between">
              <span>{p.descripcion} x {p.cantidad}</span>
              <span>${p.precio_unitario * p.cantidad}</span>
            </li>
          ))}
        </ul>
        <hr className="my-3" />
        <p className="font-bold text-right">Total: ${venta.total}</p>

        <div className="mt-4 flex justify-between">
          <button onClick={generarPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
            Exportar PDF
          </button>
          <button onClick={() => window.print()} className="bg-gray-500 text-white px-4 py-2 rounded">
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
