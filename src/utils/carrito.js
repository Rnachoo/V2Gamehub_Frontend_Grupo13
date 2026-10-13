// Suma precio unitario por cantidad de todas las líneas
export function calcularSubtotal(carrito) {
  let subtotal = 0;
  for (let i = 0; i < carrito.length; i++) {
    subtotal += carrito[i].precioUnitario * carrito[i].cantidad;
  }
  return subtotal;
}

// Agrega un producto al carrito; si ya existe, suma la cantidad (sin duplicar la línea)
export function agregarAlCarrito(carrito, producto, cantidad) {
  const precioAplicable = producto.precioDescuento ?? producto.precio;
  const carritoActualizado = [];
  let yaExiste = false;
  for (let i = 0; i < carrito.length; i++) {
    const item = carrito[i];
    if (item.productoId === producto.id) {
      yaExiste = true;
      carritoActualizado.push({
        productoId: item.productoId,
        nombre: item.nombre,
        precioUnitario: item.precioUnitario,
        cantidad: item.cantidad + cantidad
      });
    } else {
      carritoActualizado.push(item);
    }
  }
  if (!yaExiste) {
    carritoActualizado.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: precioAplicable,
      cantidad: cantidad
    });
  }
  return carritoActualizado;
}

// La cantidad debe ser un entero positivo que no supere el stock
export function validarStock(producto, cantidadDeseada) {
  if (!Number.isInteger(cantidadDeseada) || cantidadDeseada <= 0) {
    return false;
  }
  return cantidadDeseada <= producto.stock;
}

// Descuento por porcentaje, con tope del cupón y nunca mayor al subtotal
export function aplicarCupon(subtotal, cupon) {
  let descuento = subtotal * (cupon.porcentajeDescuento / 100);
  if (descuento > cupon.tope) {
    descuento = cupon.tope;
  }
  if (descuento > subtotal) {
    descuento = subtotal;
  }
  return descuento;
}

// El cupón es válido si la fecha está dentro de su rango (por defecto, hoy)
export function cuponVigente(cupon, fecha) {
  if (fecha === undefined) {
    fecha = new Date();
  }
  const fechaInicio = new Date(cupon.fechaInicio);
  const fechaFin = new Date(cupon.fechaFin);
  return fecha >= fechaInicio && fecha <= fechaFin;
}

// Total = subtotal - descuento, sin bajar nunca de 0
export function calcularTotal(subtotal, descuento) {
  const total = subtotal - descuento;
  if (total < 0) {
    return 0;
  }
  return total;
}

export function quitarDelCarrito(carrito, productoId) {
  const carritoActualizado = [];
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].productoId !== productoId) {
      carritoActualizado.push(carrito[i]);
    }
  }
  return carritoActualizado;
}

export function actualizarCantidad(carrito, productoId, nuevaCantidad) {
  const carritoActualizado = [];
  for (let i = 0; i < carrito.length; i++) {
    const item = carrito[i];
    if (item.productoId === productoId) {
      carritoActualizado.push({
        productoId: item.productoId,
        nombre: item.nombre,
        precioUnitario: item.precioUnitario,
        cantidad: nuevaCantidad
      });
    } else {
      carritoActualizado.push(item);
    }
  }
  return carritoActualizado;
}

// Subtotal, descuento y total en un solo objeto (ignora cupones vencidos)
export function calcularTotales(carrito, cupon) {
  const subtotal = calcularSubtotal(carrito);
  let descuento = 0;
  if (cupon && cuponVigente(cupon)) {
    descuento = aplicarCupon(subtotal, cupon);
  }
  const total = calcularTotal(subtotal, descuento);
  return { subtotal: subtotal, descuento: descuento, total: total };
}

// Unidades totales (para el contador de la Cabecera)
export function contarUnidades(carrito) {
  let totalUnidades = 0;
  for (let i = 0; i < carrito.length; i++) {
    totalUnidades += carrito[i].cantidad;
  }
  return totalUnidades;
}