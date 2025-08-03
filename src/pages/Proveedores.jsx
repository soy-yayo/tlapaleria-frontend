import { useEffect, useState } from 'react';
import API from '../services/api';

function Proveedores() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      navigate('/denegado');
      return;
    }
    const fetchProveedores = async () => {
      try {
        const res = await API.get('/proveedores');
        setProveedores(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProveedores();
  }, []);
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lista de Proveedores</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">{p.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default Proveedores;