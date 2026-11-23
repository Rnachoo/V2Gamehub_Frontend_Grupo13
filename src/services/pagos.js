import { api, extraerLista } from './apiClient.js'

export const METODO_RECHAZO = 'RECHAZO_PRUEBA'

export function registrarPago(ordenId, monto, metodo) {
  return api.post('/payments', { ordenId, monto, metodo }, { protegida: true })
}

export async function obtenerPagosPorOrden(ordenId) {
  return extraerLista(await api.get(`/payments/orden/${ordenId}`, { protegida: true }))
}

export async function obtenerPagosPorEstado(estado) {
  return extraerLista(await api.get(`/payments/estado/${estado}`, { protegida: true }))
}

export function confirmarPago(id) {
  return api.patch(`/payments/${id}/estado`, { estado: 'APROBADO' }, { protegida: true })
}

export function anularPago(id) {
  return api.patch(`/payments/${id}/anular`, undefined, { protegida: true })
}
