import { CATEGORIAS } from '../data/datos-categorias.jsx'

const RETARDO_MS = 200

// Función para obtener todas las categorías
export function obtenerCategorias() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CATEGORIAS)
    }, RETARDO_MS)
  })
}