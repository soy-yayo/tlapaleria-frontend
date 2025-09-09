import jsPDF from 'jspdf';

function  TicketModal({ venta, productos, onClose }) {
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
  const doc = new jsPDF({ unit: "mm", format: [58, 200] });

  // Layout base (reemplaza estas líneas al inicio del generarPDF)
const pageW = doc.internal.pageSize.getWidth();

// La mayoría de 58mm imprimen ~48mm útiles
const PRINTABLE = 48;                 // si tu impresora deja márgenes, bájalo a 47 o 46
const M = (pageW - PRINTABLE) / 2;    // ≈ 5 mm por lado
const W = PRINTABLE;
const Xc = pageW / 2;
let y = M;
                         // cursor vertical

  // Helpers
  const money = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(n || 0));

  const hr = (gap = 2) => {
    doc.setLineWidth(0.2);
    doc.line(M, y, pageW - M, y);
    y += gap;
  };

  const textC = (t, size = 8, style = "normal", lineGap = 3.6) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(t, W);
    doc.text(lines, Xc, y, { align: "center" });
    y += lines.length * lineGap;
  };

  const textL = (t, size = 8, style = "normal", lineGap = 3.6, x = M) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = Array.isArray(t) ? t : doc.splitTextToSize(t, W);
    doc.text(lines, x, y);
    y += lines.length * lineGap;
  };

  const textR = (t, size = 8, style = "normal", x = pageW - M) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.text(String(t), x, y, { align: "right" });
  };

  // ---- ENCABEZADO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CLIMAS GAMA", Xc, y, { align: "center" });
  y += 5;

  textC(
    [
      "Prol. Av. Juárez #435, Tinajas",
      "Cuajimalpa de Morelos",
      "05360 Ciudad de México, CDMX",
    ],
    8,
    "normal",
    3.4
  );
  hr(2);

  // ---- DATOS DE VENTA
  y += 1.5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, M, y);
  textR(`V_ID: ${venta.id}`, 8, "normal");
  y += 4;
  doc.text("Cliente: Público en General", M, y);
  y += 3.5;
  doc.text(`Vendedor: ${venta.usuario}`, M, y);

  y += 3.5;
  hr(2);

  // ---- LISTA DE PRODUCTOS (sin solapes)
y += 1.5;
doc.setFontSize(8);

const PT2MM = 0.352777778; // 1pt a mm
const lh8  = doc.getLineHeightFactor() * 8 * PT2MM;   // altura línea para 8pt
const lh75 = doc.getLineHeightFactor() * 7.5 * PT2MM; // altura línea para 7.5pt

// anclas de columnas (si no las tienes ya)
const xQty  = M;
const xUnitR = M + W - 22;
const xSubR  = M + W;

productos.forEach((p, idx) => {
  // Descripción (con sangría en segundas líneas)
  const lines = doc.splitTextToSize(String(p.descripcion || ""), W);

  doc.setFont("helvetica", "bold");  doc.setFontSize(8);
  doc.text(lines[0] || "", M, y);
  y += lh8;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  for (const l of lines.slice(1)) {
    doc.text("  " + l, M, y);  // sangría
    y += lh8;
  }

  // Fila numérica (cantidades/precios alineados a la derecha)
  doc.setFont("courier", "normal"); doc.setFontSize(7.5);
  doc.text(`Cant: ${p.cantidad}`, xQty - 3, y);
  doc.text(`P.Unit:`, xUnitR - 5.5, y, { align: "right" });
  doc.text(money(p.precio_unitario), xUnitR + 5.5, y, { align: "right" });
  doc.text(`Subt:`, xSubR - 8, y, { align: "right" });
  doc.text(
    money(Number(p.cantidad) * Number(p.precio_unitario)),
    xSubR + 3, y, { align: "right" }
  );

  y += lh75 + 1; // +1mm de respiro entre productos

  if (idx !== productos.length - 1) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(M, y, M + W, y);
    doc.setDrawColor(0);
    y += 1.2;
  }
});


  // ---- TOTAL
  y += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL:", M + 18, y);
  textR(money(venta.total), 11, "bold");
  y += 5;

  // ---- TOTAL EN LETRAS
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  const parteEntera = Math.floor(venta.total || 0);
  const centavos = Math.round((Number(venta.total || 0) - parteEntera) * 100);
  const enLetras = `${totalEnLetras(parteEntera).toUpperCase()} PESOS ${String(
    centavos
  ).padStart(2, "0")}/100 M.N.`;
  textC(enLetras, 7.2, "normal", 3.2);

  // ---- PIE
  y += 2;
  hr(2);
  y += 1.5;
  textC("NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES", 6.2, "bold", 3);

  y += 2;
  textC("¡Gracias por su compra!", 8, "bold", 3.6);

  y += 2;
  textC(["Si requiere factura, enviar ticket", "y CSF al WhatsApp:", "5569700587"], 6.2);

  // Ajusta el alto de la página al contenido (evita mucho espacio en blanco o cortes)
  const minHeight = 200;
  const needed = y + M + 2;
  if (needed > minHeight) {
    doc.internal.pageSize.setHeight(needed);
  }

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
