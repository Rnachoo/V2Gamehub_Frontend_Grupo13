import { RESENAS } from '../data/datos-resenas'

const RETARDO_MS = 200

export function obtenerResenasPorProducto(idProducto) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(RESENAS.filter((r) => r.idProducto === idProducto))
    }, RETARDO_MS)
  })
}