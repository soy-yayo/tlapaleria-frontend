import API from './api';

export const obtenerCorteCaja = async (filtros) => {
  const params = new URLSearchParams(filtros).toString();
  const { data } = await API.get(`/reportes/corte-caja?${params}`);
  return data;
};
