const CLAVE_ORDENES = 'gamehub_ordenes'
const RETARDO_MS = 200

function leerOrdenes() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ORDENES)) || []
  } catch (error) {
    console.error('No se pudo leer ' + CLAVE_ORDENES + ':', error)
    return []
  }
}

// Función para obtener el historial, de la orden más reciente a la más antigua
function obtenerOrdenes() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(leerOrdenes().reverse())
    }, RETARDO_MS)
  })
}

// Función para registrar una compra a partir del carrito
function crearOrden(cliente, lineas, totales) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orden = {
        id: Math.floor(Math.random() * 90000 + 10000),
        fecha: new Date().toISOString(),
        estado: 'En camino',
        cliente: cliente,
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

      localStorage.setItem(CLAVE_ORDENES, JSON.stringify([...leerOrdenes(), orden]))
      resolve(orden)
    }, RETARDO_MS)
  })
}

// Se exportan dentro de un objeto para poder espiarlas con spyOn en las pruebas
export const servicioOrdenes = {
  obtenerOrdenes,
  crearOrden
}
