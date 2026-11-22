const URL_BASE = import.meta.env.VITE_API_URL

export const EVENTO_SESION_EXPIRADA = 'gamehub:sesion-expirada'

// Error con el código HTTP y el código de negocio que manda el backend
export class ErrorApi extends Error {
  constructor(mensaje, estado, codigo, detalle) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.detalle = detalle
  }
}

async function llamar(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  const cabeceras = { 'Content-Type': 'application/json' }
  if (token) cabeceras.Authorization = 'Bearer ' + token

  let respuesta
  try {
    respuesta = await fetch(URL_BASE + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    })
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor', 0, 'SIN_CONEXION')
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) {
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA))
    }
    throw new ErrorApi(
      datos?.mensaje || 'Error ' + respuesta.status,
      respuesta.status,
      datos?.codigo,
      datos
    )
  }
  return datos
}

// Login: no lleva Authorization (es una ruta pública)
export function login(email, password) {
  return llamar('/auths/login', { metodo: 'POST', cuerpo: { email, password } })
}

// Renovación: recibe el token vigente y devuelve uno nuevo
export function renovarToken(token) {
  return llamar('/auths/refresh', { metodo: 'POST', token })
}

// El token no trae el id de usuario, se obtiene del perfil
export function obtenerPerfil(email, token) {
  return llamar('/users/email/' + encodeURIComponent(email), { token })
}