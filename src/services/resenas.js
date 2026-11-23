import { api, extraerLista } from './apiClient.js'

export async function obtenerResenasPorProducto(productoId) {
  const datos = await api.get(`/resenas/producto/${productoId}`)

  return extraerLista(datos)
    .filter((resena) => resena.estado === 'Active')
    .map((resena) => ({
      id: resena.id,
      autor: resena.nombreAutor || 'Usuario',
      calificacion: resena.puntuacion,
      comentario: resena.comentario,
      fecha: resena.fecha
    }))
}

export function crearResena({ usuarioId, productoId, ordenId, puntuacion, comentario }) {
  return api.post(
    '/resenas',
    { usuarioId, productoId, ordenId, puntuacion, comentario },
    { protegida: true }
  )
}

export async function obtenerResenasPorUsuario(usuarioId) {
  const datos = await api.get(`/resenas/usuario/${usuarioId}`, { protegida: true })
  return extraerLista(datos)
}