import jsPDF from 'jspdf';

function TicketModal({ venta, productos, onClose }) {
  const totalEnLetras = (num) => {
    const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenasCompuestas = ['veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    if (num === 0) return 'cero';
    if (num < 10) return unidades[num];
    if (num < 20) return decenas[num - 10];
    if (num < 100) {
      const unidad = num % 10;
      const decena = Math.floor(num / 10);
      return decena === 2 && unidad > 0 ? `veinti${unidades[unidad]}` : `${decenasCompuestas[decena - 2]}${unidad > 0 ? ' y ' + unidades[unidad] : ''}`;
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
  // Tamaño típico para impresora térmica 58mm
  const WIDTH = 58;         // mm
  const HEIGHT = 200;       // mm (alto fijo por página)
  const ML = 2;             // margen izq/der
  const MT = 2;             // margen superior
  const W = WIDTH - ML * 2; // ancho imprimible

  const doc = new jsPDF({ unit: 'mm', format: [WIDTH, HEIGHT] });
  const pageH = doc.internal.pageSize.getHeight();
  const Xc = ML + W / 2;
  let y = MT;

  // Helpers
  const money = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })
      .format(Number(n || 0));

  const LH = 4; // line height (mm) consistente
  const bottom = () => pageH - MT;

  const newPage = () => {
    doc.addPage([WIDTH, HEIGHT]);
    y = MT;
  };

  // Si no cabe 'h' mm, abre nueva página
  const need = (h = LH) => {
    if (y + h > bottom()) newPage();
  };

  const hr = (gap = 2) => {
    need(1);
    doc.setLineWidth(0.2);
    doc.line(ML, y, ML + W, y);
    y += gap;
  };

  const textC = (t, size = 8, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(String(t), W);
    need(lines.length * LH);
    doc.text(lines, Xc, y, { align: 'center' });
    y += lines.length * LH;
  };

  const textL = (t, size = 8, style = 'normal', x = ML) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(String(t), W);
    need(lines.length * LH);
    doc.text(lines, x, y);
    y += lines.length * LH;
  };

  const textR = (t, size = 8, style = 'normal', x = ML + W) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    need(LH);
    doc.text(String(t), x, y, { align: 'right' });
  };

  // ===== ENCABEZADO (solo en la 1a página) =====
  y = MT + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  textC('CLIMAS GAMA', 12, 'bold');

  textC(['Prol. Av. Juárez #435, Tinajas',
         'Cuajimalpa de Morelos',
         '05360 Ciudad de México, CDMX'], 8, 'normal');

  doc.setFontSize(8);
  textL(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 8);
  textR(`V_ID: ${venta.id}`, 8);
  need();

  textL('Cliente: Público en General', 8);
  textL(`Vendedor: ${venta.nombre_vendedor}`, 8);

  hr(2);
  // ===== PRODUCTOS =====
  const xQty = ML;
  const xUnitR = ML + W - 22; // columna precio unitario (derecha)
  const xSubR = ML + W;       // columna subtotal (derecha)

  productos.forEach((p, idx) => {
    y += 1; need();
    const descLines = doc.splitTextToSize(String(p.descripcion || ''), W);

    // Calcular altura necesaria de este bloque
    const blockH = (descLines.length * LH) + LH + 1.2 + 1; // desc + línea de totales + separador
    need(blockH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(descLines, ML, y);
    y += descLines.length * LH;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    // fila de cantidades / precios
    doc.text(`Cant:${p.cantidad}`, xQty - 1, y);
    doc.text(`P.Unit:`, xUnitR - 10, y, { align: 'right' });
    doc.text(money(p.precio_unitario), xUnitR + 1, y, { align: 'right' });
    doc.text(`Subt:`, xSubR - 12, y, { align: 'right' });
    doc.text(money(Number(p.cantidad) * Number(p.precio_unitario)), xSubR , y, { align: 'right' });

    y += LH; // salto tras la fila de totales

    if (idx !== productos.length - 1) {
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(ML, y, ML + W, y);
      doc.setDrawColor(0);
      y += 1.5;
    }
  });


  // ===== TOTALES =====
  hr(2);
  y += 2; need(2 * LH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', ML + 23, y);
  textR(money(venta.total), 8, 'bold');
  y += LH ;

  // Total en letras
  const parteEntera = Math.floor(venta.total || 0);
  const centavos = Math.round((Number(venta.total || 0) - parteEntera) * 100);
  const enLetras = `${totalEnLetras(parteEntera).toUpperCase()} PESOS ${String(centavos).padStart(2, '0')}/100 M.N.`;
  textC(enLetras, 7.2, 'normal');

  hr(2);
  y += 1;
  textC('NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES', 6.2, 'bold');
  textC('¡Gracias por su compra!', 8, 'bold');
  textC(['Si requiere factura, enviar ticket', 'y CSF al WhatsApp:', '5569700587'], 6.2);

  doc.save(`venta_${venta.id}.pdf`);
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

        {/* Encabezado */}
        <h2 className="text-xl font-bold mb-4 text-center">
          🧾 Ticket de Venta #{venta.id}
        </h2>

        {/* Info básica */}
        <div className="text-sm space-y-1 mb-4">
          <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
          <p><strong>Forma de pago:</strong> {venta.forma_pago}</p>
          <p><strong>Vendedor:</strong> {venta.nombre_vendedor}</p>
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
                <span>Subt: ${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>

        <hr className="my-3" />

        {/* Total */}
        <p className="font-bold text-right text-lg text-blue-700">
          Total: ${venta.total}
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

export default TicketModal;
