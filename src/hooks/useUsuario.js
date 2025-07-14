import { jwtDecode } from "jwt-decode";

export function useUsuario() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error('Token inválido');
    return null;
  }
}
