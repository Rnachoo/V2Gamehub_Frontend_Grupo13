import { PRODUCTOS } from '../data/datos-productos.jsx'

const CLAVE_ORDENES = 'gamehub_ordenes'
const RETARDO_MS = 200

// El carrito no descuenta stock.
// Solo se descuentan las unidades de las órdenes confirmadas.
export function leerProductosActualizados() {
  const ordenes = JSON.parse(
    localStorage.getItem(CLAVE_ORDENES) || '[]'
  )

  return PRODUCTOS.map((producto) => {
    const vendidos = ordenes.reduce((total, orden) => {
      return total + orden.productos.reduce((cantidad, linea) => {
        return linea.productoId === producto.id
          ? cantidad + linea.cantidad
          : cantidad
      }, 0)
    }, 0)

    return {
      ...producto,
      stock: Math.max(0, producto.stock - vendidos)
    }
  })
}

export function obtenerProductos() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(leerProductosActualizados())
      } catch (error) {
        reject(error)
      }
    }, RETARDO_MS)
  })
}

export async function obtenerProductoPorId(id) {
  const productos = await obtenerProductos()

  return productos.find(
    (producto) => producto.id === Number(id)
  ) ?? null
}