import { api, extraerLista } from './apiClient.js'
import { RESENAS } from '../data/datos-resenas.jsx'

const RETARDO_MS = 200

export function obtenerResenasPorProducto(idProducto) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(RESENAS.filter((r) => r.idProducto === idProducto))
    }, RETARDO_MS)
  })
}
export function crearResena({ usuarioId, productoId, ordenId, puntuacion, comentario }) {
  return api.post(
    '/resenas',
    { usuarioId, productoId, ordenId, puntuacion, comentario },
    { protegida: true }
  )
}

export async function obtenerResenasPorUsuario(usuarioId) {
  return extraerLista(await api.get(`/resenas/usuario/${usuarioId}`, { protegida: true }))
}
