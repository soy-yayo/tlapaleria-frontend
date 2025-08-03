function AccesoDenegado() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso denegado</h1>
      <p className="text-gray-700 mb-4">
        No tienes permiso para ver esta sección del sistema.
      </p>
      <a
        href="/productos"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Volver al inicio
      </a>
    </div>
  );
}

export default AccesoDenegado;
