import API from './api';

export const obtenerCorteCaja = async (filtros) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filtros).toString();
  const { data } = await API.get(`/reportes/corte-caja?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
