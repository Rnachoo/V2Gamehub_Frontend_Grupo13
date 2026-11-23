import { api, extraerLista } from './apiClient.js'

export const METODO_RECHAZO = 'RECHAZO_PRUEBA'

export function registrarPago(ordenId, monto, metodo) {
  return api.post('/payments', { ordenId, monto, metodo }, { protegida: true })
}

export async function obtenerPagosPorOrden(ordenId) {
  return extraerLista(await api.get(`/payments/orden/${ordenId}`, { protegida: true }))
}
