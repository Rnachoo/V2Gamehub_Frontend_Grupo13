import { api } from './apiClient.js'

export async function buscarCupon(codigo) {
  const codigoNormalizado = codigo.trim().toUpperCase()
  if (!codigoNormalizado) return null

  try {
    return await api.get(`/promociones/codigo/${encodeURIComponent(codigoNormalizado)}`)
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}