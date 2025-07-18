import { toast } from 'react-toastify';
import API from '../services/api';

const handleEliminar = async (id, onDeleteSuccess) => {
  const confirm = window.confirm('¿Seguro que deseas eliminar este producto?');
  if (!confirm) return;

  const token = localStorage.getItem('token');
  try {
    await API.delete(`/productos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success('Producto eliminado');
    onDeleteSuccess(id); // ✅ Notifica al padre
  } catch (err) {
    toast.error('Error al eliminar producto');
  }
};

export default handleEliminar;
