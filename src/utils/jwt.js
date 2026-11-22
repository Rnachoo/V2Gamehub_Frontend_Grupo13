export function decodificarToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function obtenerRoles(token) {
  const payload = decodificarToken(token)
  return Array.isArray(payload?.roles) ? payload.roles : []
}

// la expiraciión viene en segundos; se devuelve en milisegundos (0 si el token es inválido)
export function obtenerExpiracionMs(token) {
  const payload = decodificarToken(token)
  return payload?.exp ? payload.exp * 1000 : 0
}

export function tokenVencido(token) {
  return obtenerExpiracionMs(token) <= Date.now()
}