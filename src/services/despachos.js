import { api, extraerLista } from './apiClient.js'

export async function obtenerDespachosPorOrden(ordenId) {
  return extraerLista(await api.get(`/despachos/orden/${ordenId}`, { protegida: true }))
}

export async function obtenerDespachosPorEstado(estado) {
  return extraerLista(await api.get(`/despachos/estado/${estado}`, { protegida: true }))
}

export function crearDespacho({ ordenId, usuarioId, direccion, transportista, tracking }) {
  return api.post(
    '/despachos',
    { ordenId, usuarioId, direccion, transportista, tracking: tracking || null },
    { protegida: true }
  )
}

function fechaLocal() {
  const ahora = new Date()
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}

export function actualizarDespacho(id, estado, tracking) {
  const parametros = new URLSearchParams({ estado })
  if (tracking) parametros.set('tracking', tracking)
  if (estado === 'ENTREGADO') parametros.set('fechaEntrega', fechaLocal())
  return api.patch(`/despachos/${id}/estado?${parametros}`, undefined, { protegida: true })
}

export function cancelarDespacho(id) {
  return api.patch(`/despachos/${id}/cancelar`, undefined, { protegida: true })
}
