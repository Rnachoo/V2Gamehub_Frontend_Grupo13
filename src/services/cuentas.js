import { api, extraerLista } from './apiClient.js'

export const ROLES = ['ROLE_USER', 'ROLE_OPERADOR', 'ROLE_ADMIN']

export async function obtenerCuentas() {
  const datos = await api.get('/auths', { protegida: true })
  return extraerLista(datos).map((cuenta) => ({
    id: cuenta.id,
    email: cuenta.email,
    rol: cuenta.rol,
    activa: cuenta.estado === 'Active'
  }))
}

export function cambiarRol(id, rol) {
  return api.patch(`/auths/${id}/rol`, { rol }, { protegida: true })
}
