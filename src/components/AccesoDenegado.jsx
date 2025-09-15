function AccesoDenegado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white border rounded-xl shadow p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600 mb-3">Acceso denegado</h1>
        <p className="text-slate-600 mb-6">
          No tienes permiso para ver esta sección del sistema.
        </p>
        <a
          href="/productos"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

export default AccesoDenegado;
