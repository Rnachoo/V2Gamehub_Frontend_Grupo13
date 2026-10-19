import { leerProductosActualizados } from './productos.js'

const CLAVE_ORDENES = 'gamehub_ordenes'
const RETARDO_MS = 200

function leerOrdenes() {
  return JSON.parse(
    localStorage.getItem(CLAVE_ORDENES) || '[]'
  )
}

function obtenerOrdenes() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(leerOrdenes().reverse())
      } catch (error) {
        reject(error)
      }
    }, RETARDO_MS)
  })
}

// Registrar esta orden representa confirmar el pago simulado.
function crearOrden(cliente, lineas, totales) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (lineas.length === 0) {
          throw new Error('El carrito está vacío.')
        }

        const productos = leerProductosActualizados()
        const cantidades = new Map()

        // Validar y agrupar las cantidades por producto.
        for (const linea of lineas) {
          if (
            !Number.isInteger(linea.cantidad) ||
            linea.cantidad <= 0
          ) {
            throw new Error(
              'Hay una cantidad inválida en el carrito.'
            )
          }

          cantidades.set(
            linea.productoId,
            (cantidades.get(linea.productoId) || 0) +
              linea.cantidad
          )
        }

        // Revisar toda la compra antes de guardar.
        for (const [productoId, cantidad] of cantidades) {
          const producto = productos.find(
            (item) => item.id === productoId
          )

          if (!producto) {
            throw new Error(
              'Uno de los productos ya no existe.'
            )
          }

          if (cantidad > producto.stock) {
            throw new Error(
              `${producto.nombre}: quedan ${producto.stock} unidades disponibles.`
            )
          }
        }

        const orden = {
          id: Math.floor(Math.random() * 90000 + 10000),
          fecha: new Date().toISOString(),
          estado: 'En camino',
          cliente,
          productos: lineas.map((linea) => ({
            productoId: linea.productoId,
            nombre: linea.nombre,
            precioUnitario: linea.precioUnitario,
            cantidad: linea.cantidad
          })),
          subtotal: totales.subtotal,
          descuento: totales.descuento,
          total: totales.total
        }

        // Al guardar la orden, sus unidades pasan a descontarse
        // cuando se consulta el inventario.
        localStorage.setItem(
          CLAVE_ORDENES,
          JSON.stringify([...leerOrdenes(), orden])
        )

        resolve(orden)
      } catch (error) {
        reject(error)
      }
    }, RETARDO_MS)
  })
}

export const servicioOrdenes = {
  obtenerOrdenes,
  crearOrden
}