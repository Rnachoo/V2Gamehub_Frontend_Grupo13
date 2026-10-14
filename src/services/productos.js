import { PRODUCTOS } from '../data/datos-productos.jsx'

const RETARDO_MS = 200

// Función para obtener todos los productos
export function obtenerProductos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PRODUCTOS)
    }, RETARDO_MS)
  })
}

// Función para buscar un producto por su id
export function obtenerProductoPorId(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const producto = PRODUCTOS.find((item) => item.id === Number(id))
      resolve(producto ?? null)
    }, RETARDO_MS)
  })
}