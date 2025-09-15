import { useUsuario } from '../hooks/useUsuario';

function NavBar() {
  const usuario = useUsuario();

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Marca */}
        <h1 className="text-lg sm:text-xl font-bold text-blue-600">
          🛠️ Tlapalería GAMA
        </h1>

        {/* Sesión */}
        {usuario && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sesión:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                usuario.rol === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : usuario.rol === 'ventas'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {usuario.rol}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavBar;
