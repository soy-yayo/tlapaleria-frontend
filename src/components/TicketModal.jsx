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
    const doc = new jsPDF({
      unit: 'mm',
      format: [58, 200], // ancho 58mm, alto flexible
    });

    let y = 6;

    // --- ENCABEZADO ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('Climas GAMA', 26, y, { align: 'center' });
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const direccion = doc.splitTextToSize([
      'Prol. Av. Juárez #435, Tinajas',
      'Cuajimalpa de Morelos',
      '05360 Ciudad de México, CDMX'
    ], 54);
    doc.text(direccion, 26, y, { align: 'center' });
    y += direccion.length * 3.5;
    doc.line(2, y, 48, y);

    // --- DATOS VENTA ---
    y += 6;
    doc.setFontSize(8);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 1, y, { align: 'left' });
    doc.text(`V_ID: ${venta.id}`, 46, y, { align: 'right' });

    y += 5;
    doc.setFontSize(8);
    doc.text('Cliente: Público en General', 1, y, { align: 'left' });
    y += 4;
    doc.text(`Vendedor: ${venta.usuario}`, 1, y, { align: 'left' });

    y += 3;
    doc.line(2, y + 2, 48, y + 2);

    // --- LISTA DE PRODUCTOS ---
    y += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    productos.forEach((p) => {
      // Descripción (ajustada si es muy larga)
      const descripcion = doc.splitTextToSize(p.descripcion, 54);
      doc.text(descripcion, 2, y);
      y += descripcion.length * 4;

      // Cantidad | Precio Unitario | Subtotal
      doc.text(`Cant: ${p.cantidad}`, 0, y);
      doc.text(`P.Unit: $${p.precio_unitario}`, 10, y);
      doc.text(`Subt: $${(p.cantidad * p.precio_unitario).toFixed(2)}`, 47, y, { align: 'right' });

      y += 6; // espacio entre productos
    });

    doc.line(2, y, 48, y);

    // --- TOTALES ---
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${venta.total}`, 47, y, { align: 'right' });

    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const parteEntera = Math.floor(venta.total);
    const centavos = Math.round((venta.total - parteEntera) * 100);
    const enLetras = `(${totalEnLetras(parteEntera)} pesos${centavos > 0 ? ` con ${centavos}/100` : ''} 00/100 M.N.)`.toUpperCase();

    const textoLetras = doc.splitTextToSize(enLetras, 54);
    doc.text(textoLetras, 24, y, { align: 'center' });
    y += textoLetras.length * 4;

    // --- PIE ---
    y += 8;
    doc.line(2, y, 50, y);
    y += 5;
    doc.setFontSize(6);
    doc.text('NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES', 22, y, { align: 'center' });

    y += 6;
    doc.setFontSize(8);
    doc.text('¡Gracias por su compra!', 22, y, { align: 'center' });

    y += 8;
    doc.setFontSize(6);
    doc.text(
      'Si requiere factura, enviar ticket \n' +
      'y CSF al WhatsApp:\n5569700587',
      22,
      y,
      { align: 'center' }
    );

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
            <li key={i} className="mb-2">
              <div>{p.descripcion}</div>
              <div className="flex justify-between text-xs">
                <span>Cant: {p.cantidad}</span>
                <span>P.Unit: ${p.precio_unitario}</span>
                <span>Subt: ${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
              </div>
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
