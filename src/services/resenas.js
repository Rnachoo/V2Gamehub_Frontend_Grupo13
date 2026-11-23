import { api, extraerLista } from './apiClient.js'

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
