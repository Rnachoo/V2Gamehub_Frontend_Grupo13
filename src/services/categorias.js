import { api, extraerLista } from './apiClient.js'

const ICONOS = {
  notebooks: '💻',
  'tarjetas-graficas': '🖼️',
  procesadores: '⚙️',
  perifericos: '⌨️',
  consolas: '🎮',
  monitores: '🖥️',
  accesorios: '🎧'
}

// "Tarjetas gráficas" -> "tarjetas-graficas": el front sigue usando ids de texto
export function slugCategoria(nombre = '') {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function aCategoria(categoria) {
  const id = slugCategoria(categoria.nombreCategory)

  return {
    id,
    idBackend: categoria.id,
    nombre: categoria.nombreCategory,
    descripcion: categoria.descripcion ?? '',
    icono: ICONOS[id] ?? '🎮',
    activa: categoria.estado === 'Active'
  }
}

export async function obtenerTodasLasCategorias() {
  const datos = await api.get('/categories')
  return extraerLista(datos).map(aCategoria)
}

export async function obtenerCategorias() {
  const categorias = await obtenerTodasLasCategorias()
  return categorias.filter((categoria) => categoria.activa)
}

export function crearCategoria({ nombre, descripcion }) {
  return api.post('/categories', { nombreCategory: nombre, descripcion }, { protegida: true })
}

export async function actualizarCategoria(idBackend, { nombre, descripcion }) {
  await api.patch(`/categories/${idBackend}/nombreCategory`, { nombreCategory: nombre }, { protegida: true })
  await api.patch(`/categories/${idBackend}/descripcion`, { descripcion }, { protegida: true })
}

export function desactivarCategoria(idBackend) {
  return api.patch(`/categories/${idBackend}`, undefined, { protegida: true })
}
