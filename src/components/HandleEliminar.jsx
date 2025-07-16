import { toast } from 'react-toastify';
import API from '../services/api';

const handleEliminar = async (id) => {
  const confirm = window.confirm('¿Seguro que deseas eliminar este producto?');
  if (!confirm) return;

  const token = localStorage.getItem('token');
  try {
    await API.delete(`/productos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success('Producto eliminado');
    setProductos(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    toast.error('Error al eliminar producto');
  }
}; 

export default handleEliminar;
