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
    { to: '/entradas', label: 'Entradas de Mercancía', admin: true },
    { to: '/usuarios', label: 'Usuarios', admin: true },
    { to: '/usuarios/nuevo', label: 'Registrar usuario', admin: true },
    { to: '/ventas/nueva', label: 'Nueva Venta', newTab: true },
    { to: '/ventas/historial', label: 'Historial de Ventas' },
    { to: '/proveedores', label: 'Proveedores', admin: true },
    { to: '/categorias', label: 'Categorías', admin: true },
    { to: '/corte-caja', label: 'Corte de Caja', admin: true },
    { to: '/porcentajes-de-utilidad', label: 'Calculadora de Utilidad', admin: true },
    { to: '/cotizaciones', label: 'Cotizaciones', admin: false },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-lg font-bold text-blue-600">🛒 Tlapalería</span>
          </div>

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
                  className={`text-sm font-medium transition ${
                    location.pathname === link.to
                      ? 'text-green-600 font-semibold'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition ${
                    location.pathname === link.to
                      ? 'text-green-600 font-semibold'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Usuario + logout */}
          <div className="hidden md:flex items-center gap-4">
            {usuario && (
              <span className="text-sm text-slate-600">
                {usuario.usuario} ({usuario.rol})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-sm hover:bg-rose-600 transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded hover:bg-slate-100">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-slate-50 border-t shadow-inner px-4 py-3 space-y-2">
          {navLinks.map(
            (link) =>
              (!link.admin || usuario?.rol === 'admin') && (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 rounded ${
                    location.pathname === link.to
                      ? 'text-green-600 font-semibold'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              )
          )}

          {usuario && (
            <p className="mt-3 text-sm text-slate-600">
              {usuario.usuario} ({usuario.rol})
            </p>
          )}

          <button
            onClick={handleLogout}
            className="mt-3 w-full px-3 py-2 rounded-xl bg-rose-500 text-white text-sm hover:bg-rose-600 transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
