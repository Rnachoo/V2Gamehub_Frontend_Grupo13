import { api, extraerLista } from './apiClient.js'
import { registrarPago, obtenerPagosPorOrden } from './pagos.js'
import { obtenerDespachosPorOrden } from './despachos.js'
import { armarDireccion } from '../utils/direccion.js'

export const ESTADOS_ORDEN = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  PAGADA: 'Pagada',
  CANCELADA: 'Cancelada'
}

export const ESTADOS_DESPACHO = {
  PENDIENTE: 'Preparando',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Despacho cancelado'
}

const nombresProducto = new Map()

export function nombreProducto(id) {
  if (!nombresProducto.has(id)) {
    nombresProducto.set(
      id,
      api.get(`/productos/${id}`).then((producto) => producto.nombre, () => 'Producto #' + id)
    )
  }
  return nombresProducto.get(id)
}

export function obtenerPerfil(usuarioId) {
  return api.get(`/users/${usuarioId}`, { protegida: true })
}

function normalizar(texto) {
  return String(texto ?? '').trim().toLowerCase()
}

function mismaDireccion(a, b) {
  return ['comuna', 'ciudad', 'calle', 'numero'].every((campo) => normalizar(a[campo]) === normalizar(b[campo]))
}

async function asegurarDireccion(usuarioId, cliente) {
  const perfil = await obtenerPerfil(usuarioId)
  const nueva = armarDireccion(cliente)
  const existe = (perfil.directionsDTO ?? []).some((direccion) => mismaDireccion(direccion, nueva))
  if (!existe) {
    await api.patch(`/users/${usuarioId}/directions`, nueva, { protegida: true })
  }
}

// despacho vigente o el ultimo
export function despachoActual(despachos) {
  const vigentes = despachos.filter((despacho) => despacho.estado !== 'CANCELADO')
  const lista = vigentes.length > 0 ? vigentes : despachos
  return lista.length > 0 ? lista[lista.length - 1] : null
}

export function estadoCombinado(estadoOrden, despacho) {
  if (estadoOrden === 'PAGADA' && despacho) {
    return ESTADOS_DESPACHO[despacho.estado] ?? ESTADOS_ORDEN.PAGADA
  }
  return ESTADOS_ORDEN[estadoOrden] ?? estadoOrden
}

async function aOrden(orden, { pagos = [], despachos = [], nombres = new Map() } = {}) {
  const despacho = despachoActual(despachos)
  const productos = await Promise.all(
    (orden.items ?? []).map(async (item) => ({
      productoId: item.productId,
      nombre: nombres.get(item.productId) ?? (await nombreProducto(item.productId)),
      precioUnitario: item.precioUnitario,
      cantidad: item.cantidad
    }))
  )

  return {
    id: orden.id,
    fecha: orden.fecha,
    estado: estadoCombinado(orden.estado, despacho),
    estadoOrden: orden.estado,
    productos,
    subtotal: orden.subtotal,
    descuento: orden.descuento,
    total: orden.total,
    pago: pagos.length > 0 ? pagos[pagos.length - 1] : null,
    despacho
  }
}

async function obtenerOrdenes(usuarioId) {
  if (!usuarioId) {
    return []
  }
  const datos = await api.get(`/ordenes/cliente/${usuarioId}`, { protegida: true })
  const ordenes = await Promise.all(
    extraerLista(datos).map(async (orden) => {
      const [pagos, despachos] = await Promise.all([
        obtenerPagosPorOrden(orden.id),
        obtenerDespachosPorOrden(orden.id)
      ])
      return aOrden(orden, { pagos, despachos })
    })
  )
  return ordenes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

// crea la orden y registra el pago
async function crearOrden(cliente, lineas, totales, { usuarioId, codigoCupon } = {}) {
  if (lineas.length === 0) {
    throw new Error('El carrito está vacío.')
  }
  if (!usuarioId) {
    throw new Error('Tu cuenta no tiene un perfil de cliente para comprar.')
  }

  await asegurarDireccion(usuarioId, cliente)

  const orden = await api.post(
    '/ordenes',
    {
      userId: usuarioId,
      codigoPromocion: codigoCupon || null,
      items: lineas.map((linea) => ({ productId: linea.productoId, cantidad: linea.cantidad }))
    },
    { protegida: true }
  )

  let pago
  try {
    pago = await registrarPago(orden.id, orden.total, cliente.metodoPago)
  } catch (error) {
    pago = { estado: 'ERROR', error }
  }

  const nombres = new Map(lineas.map((linea) => [linea.productoId, linea.nombre]))
  const estado = pago.estado === 'APROBADO' ? 'PAGADA' : orden.estado
  return aOrden({ ...orden, estado }, { pagos: [pago], nombres })
}

export async function obtenerOrdenesPorEstado(estado) {
  const datos = await api.get(`/ordenes/estado/${estado}`, { protegida: true })
  const ordenes = await Promise.all(
    extraerLista(datos).map(async (orden) => {
      const [pagos, despachos] = await Promise.all([
        obtenerPagosPorOrden(orden.id),
        obtenerDespachosPorOrden(orden.id)
      ])
      return { ...(await aOrden(orden, { pagos, despachos })), usuarioId: orden.userId }
    })
  )
  return ordenes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

export function cambiarEstadoOrden(id, estado) {
  return api.put(`/ordenes/${id}/estado`, { estado }, { protegida: true })
}

// reintento sobre una orden pendiente
async function pagarOrden(orden, metodo) {
  return registrarPago(orden.id, orden.total, metodo)
}

export const servicioOrdenes = {
  obtenerOrdenes,
  crearOrden,
  pagarOrden
}
