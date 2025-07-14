import { useUsuario } from '../hooks/useUsuario';

function NavBar() {
  const usuario = useUsuario();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tlapaleria GAMA</h2>
        {usuario && (
          <span className="text-sm text-gray-600">
            Sesión: ({usuario.rol})
          </span>
        )}
      </div>
    </div>
  );
}

export default NavBar;