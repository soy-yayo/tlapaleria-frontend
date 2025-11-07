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
  // Tamaño típico para 58 mm
  const WIDTH = 58;   // mm
  const HEIGHT = 200; // mm por página
  const ML = 2;       // margen izq/der
  const MT = 2;       // margen superior
  const W = WIDTH - ML * 2;
  const RIGHT = ML + W;

  const doc = new jsPDF({ unit: 'mm', format: [WIDTH, HEIGHT] });
  let y = MT;

  // Altura de línea consistente (apretadito sin cortar)
  const LH = 3.4;

  const money = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })
      .format(Number(n || 0));

  const bottom = HEIGHT - MT;

  const newPage = (cont = true) => {
    doc.addPage([WIDTH, HEIGHT]);
    y = MT;
    // Si quieres encabezado en páginas siguientes, descomenta:
    // textC(cont ? 'CLIMAS GAMA (cont.)' : 'CLIMAS GAMA', 10, 'bold');
    // hr(2);
  };

  const needBlock = (h) => { if (y + h > bottom) newPage(true); };

  const hr = (gap = 2) => {
    doc.setLineWidth(0.2);
    doc.line(ML, y, RIGHT, y);
    y += gap;
  };

  const textC = (t, size = 8, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(String(t), W);
    needBlock(lines.length * LH);
    doc.text(lines, ML + W / 2, y, { align: 'center' });
    y += lines.length * LH;
  };

  const textL = (t, size = 8, style = 'normal', x = ML) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(String(t), W);
    needBlock(lines.length * LH);
    doc.text(lines, x, y);
    y += lines.length * LH;
  };

  const textR = (t, size = 8, style = 'normal', x = RIGHT - 0.5) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    needBlock(LH);
    doc.text(String(t), x, y, { align: 'right' });
  };

  // ===== Encabezado (1a página) =====
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  textC('CLIMAS GAMA', 12, 'bold');

  textC(
    ['Prol. Av. Juárez #435, Tinajas',
     'Cuajimalpa de Morelos',
     '05360 Ciudad de México, CDMX'],
    8, 'normal'
  );
  hr(2);
  y += 1;

  doc.setFontSize(8);
  textL(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 8);
  textR(`V_ID: ${venta.id}`, 8);
  y += 1;

  textL('Cliente: Público en General', 8);
  textL(`Vendedor: ${venta.nombre_vendedor}`, 8);
  hr(2);
  y += 1;

  // ===== Productos =====
  const xQty   = ML;          // Cantidad (izq)
  const xUnitR = RIGHT - 22;  // Etiqueta P.Unit (derecha)
  const xUnitV = RIGHT - 10;  // Valor P.Unit (derecha)
  const xSubR  = RIGHT - 11;  // Etiqueta Subt (derecha)
  const xSubV  = RIGHT - 0.5; // Valor Subt (derecha absoluta)

  productos.forEach((p, idx) => {
    const descLines = doc.splitTextToSize(String(p.descripcion || ''), W);
    const descH = descLines.length * LH;
    const metaH = LH;                     // línea "Cant/P.Unit/Subt"
    const sepH  = idx !== productos.length - 1 ? 1.2 : 0; // separador entre ítems
    const blockH = descH + metaH + sepH;

    // Paginado por bloque (evita cortes y huecos)
    needBlock(blockH);

    // Descripción
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    descLines.forEach((ln, i) => {
      doc.text(i ? ('  ' + ln) : ln, ML, y);
      y += LH;
    });

    // Línea de totales (monoespaciada)
    doc.setFont('courier', 'normal'); doc.setFontSize(7.5);
    doc.text(`Cant:${p.cantidad}`, xQty, y);
    doc.text('P.Unit:', xUnitR - 10, y, { align: 'right' });
    doc.text(money(p.precio_unitario), xUnitV - 10, y, { align: 'right' });
    doc.text('Subt:', xSubR, y, { align: 'right' });
    doc.text(money(Number(p.cantidad) * Number(p.precio_unitario)), xSubV, y, { align: 'right' });
    y += LH;

    // Separador
    if (sepH) {
      doc.setDrawColor(200); doc.setLineWidth(0.2);
      doc.line(ML, y, RIGHT, y);
      doc.setDrawColor(0);
      y += sepH + 1.3;
    }
  });

  
  // ===== Totales =====
  hr(2);
  y += 2;
  needBlock(2 * LH);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('TOTAL:', ML + 15, y);
  textR(money(venta.total), 8, 'bold', RIGHT- 5);
  y += LH + 1;

  const entero   = Math.floor(venta.total || 0);
  const centavos = Math.round((Number(venta.total || 0) - entero) * 100);
  const enLetras = `${totalEnLetras(entero).toUpperCase()} PESOS ${String(centavos).padStart(2, '0')}/100 M.N.`;
  textC(enLetras, 7.2, 'normal');

  hr(2);
  y += 1;
  textC('NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES', 6.2, 'bold');
  textC('¡Gracias por su compra!', 8, 'bold');
  textC(['Si requiere factura, enviar ticket', 'y CSF al WhatsApp:', '5569700587'], 6.2);

  doc.save(`venta_${venta.id}.pdf`);
};



    return (
    // Backdrop con scroll si el contenido crece
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto">
      {/* Contenedor del modal: columna, con header y footer 'sticky' */}
      <div className="relative w-full max-w-md my-6 bg-white border rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🧾 Ticket de Venta #{venta.id}</h2>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              ✖
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-700">
            <span><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</span>
            <span><strong>Forma de pago:</strong> {venta.forma_pago}</span>
            <span><strong>Vendedor:</strong> {venta.nombre_vendedor}</span>
          </div>
        </div>

        {/* Cuerpo scrollable */}
        <div className="px-6 py-3 overflow-y-auto">
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

          <div className="border-t mt-3 pt-3 text-right">
            <p className="font-bold text-lg text-blue-700">Total: ${venta.total}</p>
          </div>
        </div>

        {/* Footer fijo con botones */}
        <div className="sticky bottom-0 z-10 bg-white border-t px-6 py-3 flex items-center justify-between">
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
