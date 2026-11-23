import { api, extraerLista } from './apiClient.js'

export async function obtenerDespachosPorOrden(ordenId) {
  return extraerLista(await api.get(`/despachos/orden/${ordenId}`, { protegida: true }))
}
