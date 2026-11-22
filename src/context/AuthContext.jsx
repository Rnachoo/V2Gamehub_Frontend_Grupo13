import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { EVENTO_SESION_EXPIRADA, login, renovarToken, obtenerPerfil } from '../services/authService'
import { decodificarToken, obtenerExpiracionMs, tokenVencido } from '../utils/jwt'

const CLAVE_SESION = 'gamehub_sesion'
const MARGEN_RENOVACION_MS = 5 * 60 * 1000 // renueva 5 min antes de expirar

function construirSesion(token, usuarioId) {
  const payload = decodificarToken(token)
  return {
    token,
    usuarioId: usuarioId ?? null,
    email: payload?.sub ?? '',
    nombreCuenta: payload?.nombreCuenta ?? '',
    roles: Array.isArray(payload?.roles) ? payload.roles : []
  }
}

function leerSesion() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_SESION))
    if (!guardada?.token || tokenVencido(guardada.token)) {
      localStorage.removeItem(CLAVE_SESION)
      return null
    }
    return construirSesion(guardada.token, guardada.usuarioId)
  } catch {
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)
  const [motivoCierre, setMotivoCierre] = useState(null)

  //La sesión se guarda aun cuando se recarga
  useEffect(() => {
    if (sesion) {
      localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify({ token: sesion.token, usuarioId: sesion.usuarioId })
      )
    } else {
      localStorage.removeItem(CLAVE_SESION)
    }
  }, [sesion])

  const cerrarSesion = useCallback(() => {
    setSesion(null)
    setMotivoCierre(null)
  }, [])

  const expirarSesion = useCallback(() => {
    setSesion(null)
    setMotivoCierre('expirada')
  }, [])

  const cerrarAviso = useCallback(() => setMotivoCierre(null), [])

  const iniciarSesion = async (email, password) => {
    const respuesta = await login(email, password)
    let usuarioId = null
    try {
      usuarioId = (await obtenerPerfil(respuesta.email, respuesta.token)).id
    } catch {
      //Si la cuenta no tiene perfil aun, el id queda null
    }
    const nueva = construirSesion(respuesta.token, usuarioId)
    setMotivoCierre(null)
    setSesion(nueva)
    return nueva
  }

  // Renuevaa antes de que el token expire y cierra la sesión justo al vencer
  const token = sesion?.token
  useEffect(() => {
    if (!token) return
    const payload = decodificarToken(token)
    const duracionMs = payload?.exp && payload?.iat ? (payload.exp - payload.iat) * 1000 : 0
    // Con tokens cortos (pruebas) el margen se reduce a la mitad de la duración
    const margen = Math.min(MARGEN_RENOVACION_MS, duracionMs / 2)
    const vencimiento = obtenerExpiracionMs(token)

    const renovar = setTimeout(async () => {
      try {
        const respuesta = await renovarToken(token)
        setSesion((actual) => (actual ? construirSesion(respuesta.token, actual.usuarioId) : actual))
      } catch {
      }
    }, Math.max(vencimiento - margen - Date.now(), 0))

    const vencer = setTimeout(expirarSesion, Math.max(vencimiento - Date.now(), 0))

    return () => {
      clearTimeout(renovar)
      clearTimeout(vencer)
    }
  }, [token, expirarSesion])

  // Un 401 en cualquier petición cierra la sesión
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, expirarSesion)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, expirarSesion)
  }, [expirarSesion])

  const roles = sesion?.roles ?? []
  const valor = {
    sesion,
    roles,
    estaAutenticado: Boolean(sesion),
    motivoCierre,
    tieneRol: (...requeridos) => requeridos.some((rol) => roles.includes(rol)),
    iniciarSesion,
    cerrarSesion,
    cerrarAviso
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}