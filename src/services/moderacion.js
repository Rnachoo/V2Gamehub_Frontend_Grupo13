import { api, extraerLista } from './apiClient.js'

export async function obtenerResenasParaModerar(productoId) {
  const datos = await api.get(`/resenas/producto/${productoId}`)
  return extraerLista(datos).map((resena) => ({
    id: resena.id,
    autor: resena.nombreAutor ?? `Cliente #${resena.usuarioId}`,
    puntuacion: resena.puntuacion,
    comentario: resena.comentario,
    fecha: resena.fecha?.slice(0, 10) ?? '',
    visible: resena.estado === 'Active'
  }))
}

export function moderarResena(id) {
  return api.patch(`/resenas/${id}/moderar`, undefined, { protegida: true })
}
