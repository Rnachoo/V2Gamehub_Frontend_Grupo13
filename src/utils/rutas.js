export const PANELES_LISTOS = false

// A dónde lleva cada rol después de iniciar sesión
export function inicioSegunRoles(roles) {
  if (PANELES_LISTOS && roles.includes('ROLE_ADMIN')) return '/panel-admin'
  if (PANELES_LISTOS && roles.includes('ROLE_OPERADOR')) return '/panel-operador'
  return '/'
}

// Rutas exclusivas de ciertos roles (adfmin y operador). Si el usuario no tiene el rol, se le redirige al inicio de su rol.
const RUTAS_POR_ROL = [
  { prefijo: '/panel-admin', roles: ['ROLE_ADMIN'] },
  { prefijo: '/panel-operador', roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] }
]

// Si venía de una ruta protegida y su rol puede abrirla, vuelve ahí; si no, va al inicio de su rol
export function rutaDespuesDeIngresar(roles, desde) {
  const inicio = inicioSegunRoles(roles)
  if (!desde || desde === '/login') return inicio
  const regla = RUTAS_POR_ROL.find((r) => desde.startsWith(r.prefijo))
  return !regla || regla.roles.some((rol) => roles.includes(rol)) ? desde : inicio
}