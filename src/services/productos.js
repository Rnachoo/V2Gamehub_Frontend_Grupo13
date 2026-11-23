import { api, ErrorApi, extraerLista } from './apiClient.js'
import { obtenerTodasLasCategorias } from './categorias.js'
import {
  crearInventario,
  obtenerInventario,
  obtenerInventarioPorProducto
} from './inventario.js'

let ultimosProductos = []

function aProducto(producto, categoriasPorId, inventario) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    categoria: categoriasPorId.get(producto.categoriaId)?.id ?? '',
    categoriaIdBackend: producto.categoriaId,
    marca: producto.marca,
    modelo: producto.modelo ?? '',
    precio: producto.precio,
    precioDescuento: producto.precioDescuento ?? null,
    stock: inventario?.stock ?? 0,
    inventarioId: inventario?.id ?? null,
    destacado: Boolean(producto.destacado),
    imagenes: producto.imagenes?.length ? producto.imagenes : ['/favicon.png'],
    especificaciones: producto.especificaciones ?? [],
    activo: producto.estado === 'Activo'
  }
}

async function categoriasPorIdBackend() {
  const categorias = await obtenerTodasLasCategorias()
  return new Map(categorias.map((categoria) => [categoria.idBackend, categoria]))
}

// El panel de administración también necesita los productos desactivados.
export async function obtenerTodosLosProductos() {
  const [datos, categorias, inventario] = await Promise.all([
    api.get('/productos'),
    categoriasPorIdBackend(),
    obtenerInventario()
  ])

  return extraerLista(datos).map((producto) =>
    aProducto(producto, categorias, inventario.get(producto.id))
  )
}

export async function obtenerProductos() {
  const productos = await obtenerTodosLosProductos()
  ultimosProductos = productos.filter((producto) => producto.activo)
  return ultimosProductos
}

export async function obtenerProductoPorId(id) {
  const productoId = Number(id)
  let producto

  try {
    producto = await api.get(`/productos/${productoId}`)
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 404) return null
    throw error
  }

  if (producto.estado !== 'Activo') return null

  const [categorias, inventario] = await Promise.all([
    categoriasPorIdBackend(),
    obtenerInventarioPorProducto(productoId)
  ])

  return aProducto(producto, categorias, inventario)
}

// Compatibilidad con el servicio de órdenes.
export function leerProductosActualizados() {
  return ultimosProductos
}

function aCuerpo(datos) {
  return {
    nombre: datos.nombre.trim(),
    marca: datos.marca.trim(),
    modelo: datos.modelo?.trim() || null,
    precio: Number(datos.precio),
    precioDescuento: datos.precioDescuento === '' || datos.precioDescuento == null
      ? null
      : Number(datos.precioDescuento),
    destacado: Boolean(datos.destacado),
    categoriaId: Number(datos.categoriaIdBackend),
    descripcion: datos.descripcion?.trim() ?? '',
    imagenes: datos.imagenes,
    especificaciones: datos.especificaciones
  }
}

export async function crearProducto(datos) {
  const creado = await api.post('/productos', aCuerpo(datos), { protegida: true })
  await crearInventario(creado.id, Number(datos.stock || 0))
  return creado
}

export function actualizarProducto(id, datos) {
  return api.patch(`/productos/${id}/update`, aCuerpo(datos), { protegida: true })
}

export function desactivarProducto(id) {
  return api.patch(`/productos/${id}`, undefined, { protegida: true })
}