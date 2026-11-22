import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  EVENTO_SESION_EXPIRADA,
  login,
  renovarToken,
  obtenerPerfil,
  crearCuenta,
  crearPerfil
} from '../services/authService'
import { decodificarToken, obtenerExpiracionMs, tokenVencido } from '../utils/jwt'

const CLAVE_SESION = 'gamehub_sesion'
const MARGEN_RENOVACION_MS = 5 * 60 * 1000 
//renueva 5 min antes de expirar

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

  // La sesión se guarda en el almacenamiento local para que persista entre recargas de página. Se borra al cerrar sesión o al expirar.
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
      // Cuenta sin perfil todavía: el id queda en null
    }
    const nueva = construirSesion(respuesta.token, usuarioId)
    setMotivoCierre(null)
    setSesion(nueva)
    return nueva
  }

  const registrarse = async ({ nombreCuenta, email, password, perfil }) => {
    //Cuenta de acceso
    let duplicado = null
    try {
      await crearCuenta({ nombreCuenta, email, password })
    } catch (error) {
      error.paso = 'cuenta'
      if (error.estado !== 409) throw error
      duplicado = error
    }

    //Sesión con la cuenta
    let respuesta
    try {
      respuesta = await login(email, password)
    } catch (error) {
      throw duplicado ?? error
    }

    // Si el correo ya existía, solo se sigue cuando la cuenta quedó sin perfil
    if (duplicado) {
      let tienePerfil = true
      try {
        await obtenerPerfil(email, respuesta.token)
      } catch (error) {
        if (error.estado !== 404) throw error
        tienePerfil = false
      }
      if (tienePerfil) throw duplicado
    }

    //Perfil con teléfono y dirección
    let usuario
    try {
      usuario = await crearPerfil(perfil, respuesta.token)
    } catch (error) {
      error.paso = 'perfil'
      throw error
    }

    const nueva = construirSesion(respuesta.token, usuario.id)
    setMotivoCierre(null)
    setSesion(nueva)
    return nueva
  }

  // Renueva antes de que el token expire y cierra la sesión justo al vencer
  const token = sesion?.token
  useEffect(() => {
    if (!token) return
    const payload = decodificarToken(token)
    const duracionMs = payload?.exp && payload?.iat ? (payload.exp - payload.iat) * 1000 : 0
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
    registrarse,
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