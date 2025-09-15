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
    const doc = new jsPDF({ unit: 'mm', format: [58, 200] });

    const pageW = doc.internal.pageSize.getWidth();
    const PRINTABLE = 46;
    const ML = 1;
    const MR = pageW - ML - PRINTABLE;
    const W = PRINTABLE;
    const Xc = ML + W / 2;
    let y = ML + 2;

    const money = (n) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(Number(n || 0));

    const hr = (gap = 2) => {
      doc.setLineWidth(0.2);
      doc.line(ML, y, pageW - MR, y);
      y += gap;
    };

    const textC = (t, size = 8, style = 'normal', lineGap = 3.6) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      const lines = Array.isArray(t) ? t : doc.splitTextToSize(t, W);
      doc.text(lines, Xc, y, { align: 'center' });
      y += lines.length * lineGap;
    };

    const textL = (t, size = 8, style = 'normal', lineGap = 3.6, x = ML) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      const lines = Array.isArray(t) ? t : doc.splitTextToSize(t, W);
      doc.text(lines, x, y);
      y += lines.length * lineGap;
    };

    const textR = (t, size = 8, style = 'normal', x = pageW - MR) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.text(String(t), x, y, { align: 'right' });
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLIMAS GAMA', Xc, y, { align: 'center' });
    y += 5;

    textC(['Prol. Av. Juárez #435, Tinajas', 'Cuajimalpa de Morelos', '05360 Ciudad de México, CDMX'], 8, 'normal', 3.4);
    hr(2);

    y += 1.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, ML, y);
    textR(`V_ID: ${venta.id}`, 8, 'normal');
    y += 4;
    doc.text('Cliente: Público en General', ML, y);
    y += 3.5;
    doc.text(`Vendedor: ${venta.nombre_vendedor}`, ML, y);

    y += 3.5;
    hr(2);

    y += 1.5;
    doc.setFontSize(8);

    const PT2MM = 0.352777778;
    const lh8 = doc.getLineHeightFactor() * 8 * PT2MM;
    const lh75 = doc.getLineHeightFactor() * 7.5 * PT2MM;

    const xQty = ML;
    const xUnitR = ML + W - 22;
    const xSubR = ML + W;

    productos.forEach((p, idx) => {
      const lines = doc.splitTextToSize(String(p.descripcion || ''), W);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(lines[0] || '', ML, y);
      y += lh8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      for (const l of lines.slice(1)) {
        doc.text('  ' + l, ML, y);
        y += lh8;
      }

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Cant:${p.cantidad}`, xQty -1, y);
      doc.text(`P.Unit:`, xUnitR -  3.5, y, { align: 'right' });
      doc.text(money(p.precio_unitario), xUnitR + 7, y, { align: 'right' });
      doc.text(`Subt:`, xSubR - 6, y, { align: 'right' });
      doc.text(money(Number(p.cantidad) * Number(p.precio_unitario)), xSubR + 5 , y, { align: 'right' });

      y += lh75 + 1;

      if (idx !== productos.length - 1) {
        doc.setDrawColor(200);
        doc.setLineWidth(0.2);
        // doc.line(ML, y, ML + W, y);
        doc.setDrawColor(0);
        y += 1.2;
      }
    });

    hr(2.2);

    y += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', ML + 18, y);
    textR(money(venta.total), 11, 'bold');
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const parteEntera = Math.floor(venta.total || 0);
    const centavos = Math.round((Number(venta.total || 0) - parteEntera) * 100);
    const enLetras = `${totalEnLetras(parteEntera).toUpperCase()} PESOS ${String(centavos).padStart(2, '0')}/100 M.N.`;
    textC(enLetras, 7.2, 'normal', 3.2);

    y += 2;
    hr(2);
    y += 1.5;
    textC('NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES', 6.2, 'bold', 3);

    y += 2;
    textC('¡Gracias por su compra!', 8, 'bold', 3.6);

    y += 2;
    textC(['Si requiere factura, enviar ticket', 'y CSF al WhatsApp:', '5569700587'], 6.2);

    const minHeight = 200;
    const needed = y + ML + 2;
    if (needed > minHeight) {
      doc.internal.pageSize.setHeight(needed);
    }

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
