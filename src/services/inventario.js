import { api, extraerLista } from './apiClient.js'

function aInventario(registro) {
  return {
    id: registro.id,
    productoId: registro.productId,
    stock: registro.stockDisponible,
    stockMinimo: registro.stockMinimo,
    ubicacion: registro.ubicacion
  }
}

// Devuelve un Map productoId -> inventario, para cruzarlo con el catálogo
export async function obtenerInventario() {
  const datos = await api.get('/inventories')
  const inventario = extraerLista(datos).map(aInventario)
  return new Map(inventario.map((registro) => [registro.productoId, registro]))
}

export async function obtenerInventarioPorProducto(productoId) {
  const datos = await api.get(`/inventories/producto/${productoId}`)
  const [registro] = extraerLista(datos)
  return registro ? aInventario(registro) : null
}

export function crearInventario(productoId, stock) {
  return api.post('/inventories', {
    productId: productoId,
    stockDisponible: stock,
    stockReservado: 0,
    stockMinimo: 2,
    ubicacion: 'Bodega Santiago'
  }, { protegida: true })
}

export function ajustarStock(id, stockDisponible) {
  return api.patch(`/inventories/${id}/cantidad`, { stockDisponible }, { protegida: true })
}
