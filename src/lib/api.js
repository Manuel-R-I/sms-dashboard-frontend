import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

const withToken = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const solicitarOtp = (telefono) => api.post('/auth/solicitar-otp', { telefono }).then(r => r.data);
export const verificarOtp = (telefono, codigo) => api.post('/auth/verificar-otp', { telefono, codigo }).then(r => r.data);

export const obtenerReportes = (token) => api.get('/reportes', withToken(token)).then(r => r.data);
export const actualizarReporte = (id, cambios, token) => api.patch(`/reportes/${id}`, cambios, withToken(token)).then(r => r.data);
export const eliminarReporte = (id, token) => api.delete(`/reportes/${id}`, withToken(token)).then(r => r.data);

export const obtenerUsuarios = (token) => api.get('/usuarios', withToken(token)).then(r => r.data);
export const actualizarUsuario = (id, cambios, token) => api.patch(`/usuarios/${id}`, cambios, withToken(token)).then(r => r.data);
export const eliminarUsuario = (id, token) => api.delete(`/usuarios/${id}`, withToken(token)).then(r => r.data);