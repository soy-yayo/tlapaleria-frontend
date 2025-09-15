import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUsuario } from '../hooks/useUsuario';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const navLinks = [
    { to: '/productos', label: 'Inicio' },
    { to: '/productos/nuevo', label: 'Agregar producto', admin: true },
    { to: '/inventario', label: 'Inventario', admin: true },
    { to: '/usuarios', label: 'Usuarios', admin: true },
    { to: '/usuarios/nuevo', label: 'Registrar usuario', admin: true },
    { to: '/ventas/nueva', label: 'Nueva Venta', newTab: true },
    { to: '/ventas/historial', label: 'Historial de Ventas' },
    { to: '/proveedores', label: 'Proveedores', admin: true },
    { to: '/corte-caja', label: 'Corte de Caja', admin: true },
    { to: '/porcentajes-de-utilidad', label: 'Calculadora de Utilidad', admin : true },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">  
          {/* Logo o nombre */}
          <div className="flex items-center">
            <span className="text-xl font-bold">🛒 Tlapalería</span>
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex gap-6">
            {/* Menú desktop */}
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) =>
                (!link.admin || usuario?.rol === 'admin') &&
                (link.newTab ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium hover:underline ${location.pathname === link.to ? 'text-yellow-400' : ''
                      }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-medium hover:underline ${location.pathname === link.to ? 'text-yellow-400' : ''
                      }`}
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </div>

          </div>

          {/* Usuario + logout */}
          <div className="hidden md:flex items-center gap-4">
            {usuario && (
              <span className="text-sm">
                {usuario.usuario} ({usuario.rol})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-gray-700 px-4 py-3 space-y-2">
          {navLinks.map(
            (link) =>
              (!link.admin || usuario?.rol === 'admin') && (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block hover:underline ${location.pathname === link.to ? 'text-yellow-400' : ''
                    }`}
                >
                  {link.label}
                </Link>
              )
          )}

          {usuario && (
            <p className="mt-2 text-sm">
              {usuario.usuario} ({usuario.rol})
            </p>
          )}

          <button
            onClick={handleLogout}
            className="mt-2 w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
