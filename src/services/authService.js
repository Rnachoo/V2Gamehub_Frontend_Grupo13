import { api } from './apiClient.js'

export function login(email, password) {
  return api.post('/auths/login', { email, password })
}

export function renovarToken(token) {
  return api.post('/auths/refresh', undefined, { token })
}

export function obtenerPerfil(email, token) {
  return api.get('/users/email/' + encodeURIComponent(email), { token })
}

export function crearCuenta({ nombreCuenta, email, password }) {
  return api.post('/auths', { nombreCuenta, email, password })
}

export function crearPerfil(perfil, token) {
  return api.post('/users', perfil, { token })
}