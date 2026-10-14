const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

// Función para obtener el precio que pagará el cliente
export function obtenerPrecioActual(producto) {
  if (producto.precioDescuento != null) {
    return producto.precioDescuento
  }

  return producto.precio
}

// Función para calcular el porcentaje de descuento
export function calcularPorcentajeDescuento(producto) {
  if (producto.precioDescuento == null) {
    return 0
  }

  const diferencia = producto.precio - producto.precioDescuento
  return Math.round((diferencia / producto.precio) * 100)
}

// Función para mostrar un número como precio chileno
export function formatearPrecio(precio) {
  return formatoCLP.format(precio)
}