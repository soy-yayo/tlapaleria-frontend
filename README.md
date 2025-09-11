# POS Tlapalería — Frontend

Frontend del sistema de **Punto de Venta** para una tlapalería, construido con **React + Vite + TailwindCSS**.

## ✨ Características

- UI moderna con TailwindCSS.
- **Módulo de ventas (POS)** con búsqueda por código/descripcion y generación de tickets PDF.
- **Inventario de productos** con filtros por proveedor, ubicación y búsqueda flexible.
- Exportación de reportes a **PDF** y **Excel**.
- Manejo de roles desde frontend (`admin`, `ventas`, `inventario`).
- Consumo de API vía Axios (`src/services/api.js`).

---

## 🛠️ Requisitos

- Node.js >= 18
- NPM o Yarn

---

## ⚙️ Variables de entorno (`.env`)

```env
VITE_API_URL=/api       # en VPS con Nginx
# En local puedes usar: http://localhost:3000/api
```

## ▶️ Scripts

Instalar dependencias:

```bash
npm install
```
Correr en desarrollo:

```bash
npm run dev
```
Build producción:

```bash
npm run build
```
Sirve en /dist (ej. con Nginx):

```bash
npm run preview
```
## 📂 Estructura de carpetas

```bash
frontend/
 ├─ src/
 │   ├─ pages/          # páginas principales (Productos, NuevaVenta, Reportes, etc.)
 │   ├─ components/     # componentes compartidos
 │   ├─ services/       # api.js (Axios wrapper)
 │   ├─ utils/          # utilidades (ej: precios.js)
 │   └─ main.jsx        # punto de entrada React
 ├─ public/
 ├─ vite.config.js
 ├─ package.json
 └─ README.md
 ```
## 📌 Páginas principales

### Productos.jsx

- Lista de productos con filtros y buscador.

- Muestra precio_venta ya calculado desde backend.

- Exportación a PDF/Excel.

### NuevaVenta.jsx

- POS: búsqueda de productos, selección de cantidad, formas de pago.

- Genera venta con API y ticket PDF.

### Reportes.jsx

- Historial de ventas.

- Corte de caja con totales filtrados.

### PorcentajesDeUtilidad.jsx

- Interfaz para administrar rangos de utilidad.

- Guarda en la base vía API (/api/rangos).

## 🖨️ Tickets
Generados con jsPDF, incluyen:

- Lista de productos, cantidades y subtotales.

- Total en números y letras.

- Nombre real del vendedor (campo usuarios.nombre desde backend).

## 🌐 Despliegue

- Build: npm run build → genera /dist.

- Nginx: servir /dist como root, y proxy /api al backend.

- HTTPS: Certbot con Let’s Encrypt.

Ejemplo Nginx:

```nginx
server {
  listen 443 ssl http2;
  server_name tu-dominio.com;

  root /var/www/tlapaleria-frontend/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
  }

  location /uploads/ {
    alias /var/www/tlapaleria-backend/uploads/;
  }
}
```