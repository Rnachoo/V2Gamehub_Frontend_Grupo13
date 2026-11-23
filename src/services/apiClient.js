const URL_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1'
const CLAVE_TOKEN = 'gamehub_token'

let obtenerTokenSesion = () => localStorage.getItem(CLAVE_TOKEN)
let alSesionInvalida = () => {}

// AuthContext registra aquí cómo leer el token y qué hacer ante un 401.
export function configurarSesion({ obtenerToken, alNoAutorizado }) {
  if (obtenerToken) obtenerTokenSesion = obtenerToken
  if (alNoAutorizado) alSesionInvalida = alNoAutorizado
}

export class ErrorApi extends Error {
  constructor(status, mensaje, campos = null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.campos = campos
  }
}

function leerMensaje(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') {
    return { mensaje: typeof cuerpo === 'string' ? cuerpo : '', campos: null }
  }

  const mensaje = cuerpo.error || cuerpo.mensaje || cuerpo.message
  if (typeof mensaje === 'string') {
    return { mensaje, campos: null }
  }

  // Errores de validación: el backend responde { campo: "mensaje" }
  const campos = Object.fromEntries(
    Object.entries(cuerpo).filter(([, valor]) => typeof valor === 'string')
  )
  return {
    mensaje: Object.values(campos)[0] || '',
    campos: Object.keys(campos).length > 0 ? campos : null
  }
}

async function leerCuerpo(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return null

  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

async function solicitar(metodo, ruta, { cuerpo, protegida = false } = {}) {
  const cabeceras = {}

  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json'
  }

  if (protegida) {
    const token = obtenerTokenSesion()
    if (token) cabeceras.Authorization = `Bearer ${token}`
  }

  let respuesta
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor.')
  }

  const datos = await leerCuerpo(respuesta)

  if (!respuesta.ok) {
    const { mensaje, campos } = leerMensaje(datos)
    if (respuesta.status === 401 && protegida) {
      alSesionInvalida()
    }
    throw new ErrorApi(respuesta.status, mensaje, campos)
  }

  return datos
}

// El backend usa HATEOAS: las listas llegan dentro de _embedded.
export function extraerLista(datos) {
  if (Array.isArray(datos)) return datos
  const embebido = datos?._embedded
  if (!embebido) return []
  return Object.values(embebido).find(Array.isArray) ?? []
}

export const api = {
  get: (ruta, opciones) => solicitar('GET', ruta, opciones),
  post: (ruta, cuerpo, opciones) => solicitar('POST', ruta, { ...opciones, cuerpo }),
  put: (ruta, cuerpo, opciones) => solicitar('PUT', ruta, { ...opciones, cuerpo }),
  patch: (ruta, cuerpo, opciones) => solicitar('PATCH', ruta, { ...opciones, cuerpo }),
  delete: (ruta, opciones) => solicitar('DELETE', ruta, opciones)
}
