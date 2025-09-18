import jsPDF from "jspdf";

function QuoteModal({ cotizacion, productos, onClose }) {
  const totalEnLetras = (num) => {
    const unidades = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
    const decenas = ['diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve'];
    const decenasCompuestas = ['veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
    const centenas = ['cien','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
    if (num === 0) return 'cero';
    if (num < 10) return unidades[num];
    if (num < 20) return decenas[num - 10];
    if (num < 100) {
      const unidad = num % 10;
      const decena = Math.floor(num / 10);
      return decena === 2 && unidad > 0
        ? `veinti${unidades[unidad]}`
        : `${decenasCompuestas[decena - 2]}${unidad > 0 ? ' y ' + unidades[unidad] : ''}`;
    }
    if (num < 1000) {
      const centena = Math.floor(num / 100);
      const resto = num % 100;
      return `${centenas[centena - 1]}${resto > 0 ? ' ' + totalEnLetras(resto) : ''}`;
    }
    if (num < 10000) {
      const millar = Math.floor(num / 1000);
      const resto = num % 1000;
      return `${millar === 1 ? 'mil' : unidades[millar] + ' mil'}${resto > 0 ? ' ' + totalEnLetras(resto) : ''}`;
    }
    return num.toString();
  };

  const generarPDF = () => {
    // Formato A4 vertical (tamaño carta)
    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    const money = (n) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }).format(Number(n || 0));

    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("COTIZACIÓN", pageW / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`ID: ${cotizacion.id}`, 14, y);
    y += 6;
    doc.text(`Cliente: ${cotizacion.cliente || "—"}`, 14, y);
    y += 6;
    doc.text(`Fecha: ${new Date(cotizacion.fecha).toLocaleDateString()}`, 14, y);
    y += 6;
    doc.text(`Forma de pago: ${cotizacion.forma_pago}`, 14, y);
    y += 6;
    doc.text(`Vendedor: ${cotizacion.vendedor}`, 14, y);
    y += 10;

    // Tabla de productos
    doc.setFont("helvetica", "bold");
    doc.text("Productos:", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    productos.forEach((p) => {
      doc.text(p.descripcion, 14, y);
      y += 5;
      doc.text(`Cant: ${p.cantidad}`, 20, y);
      doc.text(`P.Unit: ${money(p.precio_unitario)}`, 80, y);
      doc.text(
        `Subtotal: ${money(p.subtotal || p.cantidad * p.precio_unitario)}`,
        140,
        y
      );
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Total
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: ${money(cotizacion.total)}`, 140, y);
    y += 10;

    // Total en letras
    const parteEntera = Math.floor(cotizacion.total || 0);
    const centavos = Math.round((Number(cotizacion.total || 0) - parteEntera) * 100);
    const enLetras = `${totalEnLetras(parteEntera).toUpperCase()} PESOS ${String(
      centavos
    ).padStart(2, "0")}/100 M.N.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(enLetras, 14, y);

    doc.save(`cotizacion_${cotizacion.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white border rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-4 text-slate-500 hover:text-black text-lg"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          📄 Cotización #{cotizacion.id}
        </h2>

        {/* Info básica */}
        <div className="text-sm space-y-1 mb-4">
          <p><strong>Fecha:</strong> {new Date(cotizacion.fecha).toLocaleDateString()}</p>
          <p><strong>Forma de pago:</strong> {cotizacion.forma_pago}</p>
          <p><strong>Cliente:</strong> {cotizacion.cliente || "—"}</p>
          <p><strong>Vendedor:</strong> {cotizacion.vendedor}</p>
        </div>

        <hr className="my-3" />

        {/* Lista productos */}
        <ul className="text-sm divide-y">
          {productos.map((p, i) => (
            <li key={i} className="py-2">
              <div className="font-medium">{p.descripcion}</div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Cant: {p.cantidad}</span>
                <span>P.Unit: ${p.precio_unitario}</span>
                <span>Subt: ${(p.subtotal || p.cantidad * p.precio_unitario)}</span>
              </div>
            </li>
          ))}
        </ul>

        <hr className="my-3" />

        {/* Total */}
        <p className="font-bold text-right text-lg text-blue-700">
          Total: ${cotizacion.total}
        </p>

        {/* Acciones */}
        <div className="mt-5 flex justify-between">
          <button
            onClick={generarPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 transition"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuoteModal;
