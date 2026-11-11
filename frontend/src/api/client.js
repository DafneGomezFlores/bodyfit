import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: API_URL });

// Usuarios
export const getUsuarios = () => api.get('/usuarios').then((r) => r.data);
export const crearUsuario = (data) => api.post('/usuarios', data).then((r) => r.data);
export const actualizarUsuario = (id, data) => api.patch(`/usuarios/${id}`, data).then((r) => r.data);
export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`).then((r) => r.data);

// Tarifas
export const getTarifas = () => api.get('/tarifas').then((r) => r.data);
export const crearTarifa = (data) => api.post('/tarifas', data).then((r) => r.data);
export const actualizarTarifa = (id, data) => api.patch(`/tarifas/${id}`, data).then((r) => r.data);
export const eliminarTarifa = (id) => api.delete(`/tarifas/${id}`).then((r) => r.data);

// Membresías
export const getMembresias = () => api.get('/membresias').then((r) => r.data);
export const getResumenMembresias = () => api.get('/membresias/resumen').then((r) => r.data);
export const getPorVencer = () => api.get('/membresias/por-vencer').then((r) => r.data);
export const crearMembresia = (data) => api.post('/membresias', data).then((r) => r.data);
export const actualizarMembresia = (id, data) => api.patch(`/membresias/${id}`, data).then((r) => r.data);

// Permisos
export const getPermisos = () => api.get('/permisos').then((r) => r.data);
export const crearPermiso = (data) => api.post('/permisos', data).then((r) => r.data);
export const actualizarPermiso = (id, data) => api.patch(`/permisos/${id}`, data).then((r) => r.data);

// Pases diarios
export const getPasesDiarios = () => api.get('/pases-diarios').then((r) => r.data);
export const crearPaseDiario = (data) => api.post('/pases-diarios', data).then((r) => r.data);
export const actualizarPaseDiario = (id, data) => api.patch(`/pases-diarios/${id}`, data).then((r) => r.data);