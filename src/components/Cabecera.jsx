import { startTransition } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { PANELES_LISTOS } from '../utils/rutas'
import logo from '../assets/logo.png'

function enlacesSegunSesion({ estaAutenticado, tieneRol }) {
  const enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/catalogo', texto: 'Catálogo' },
    { ruta: '/carrito', texto: 'Carrito' }
  ]

  if (!estaAutenticado) {
    enlaces.push(
      { ruta: '/login', texto: 'Iniciar sesión' },
      { ruta: '/crear-cuenta', texto: 'Crear cuenta' }
    )
    return enlaces
  }

  if (tieneRol('ROLE_USER')) {
    enlaces.push({ ruta: '/mis-ordenes', texto: 'Mis órdenes' })
  }
  if (PANELES_LISTOS && tieneRol('ROLE_OPERADOR', 'ROLE_ADMIN')) {
    enlaces.push({ ruta: '/panel-operador', texto: 'Panel del operador' })
  }
  if (PANELES_LISTOS && tieneRol('ROLE_ADMIN')) {
    enlaces.push({ ruta: '/panel-admin', texto: 'Administración' })
  }
  return enlaces
}

function etiquetaDeRol(tieneRol) {
  if (tieneRol('ROLE_ADMIN')) return 'Administrador'
  if (tieneRol('ROLE_OPERADOR')) return 'Operador'
  return null
}

export default function Cabecera() {
  const { unidades } = useCarrito()
  const auth = useAuth()
  const { pathname } = useLocation()
  const navegar = useNavigate()

  const rutaActual = pathname.length > 1 ? pathname.replace(/\/$/, '').toLowerCase() : pathname

  // El menú no muestra el enlace de la vista en la que ya estás
  const enlaces = enlacesSegunSesion(auth).filter((enlace) => enlace.ruta !== rutaActual)

  const nombre = auth.sesion?.nombreCuenta || auth.sesion?.email
  const rol = etiquetaDeRol(auth.tieneRol)


  function salir() {
    navegar('/')
    startTransition(() => auth.cerrarSesion())
  }

  return (
    <header className="encabezado">
      <div className="contenedor">
        <Link to="/" className="marca-grupo">
          <img
            src={logo}
            alt="GameHub Store - Ir al inicio"
            className="logo-encabezado"
          />
        </Link>

        <nav className="nav-principal" aria-label="Navegación principal">
          <ul className="flex-wrap justify-content-center align-items-center row-gap-2">
            {enlaces.map((enlace) => (
              <li key={enlace.ruta}>
                <Link to={enlace.ruta}>
                  {enlace.ruta === '/carrito' ? 'Carrito(' + unidades + ')' : enlace.texto}
                </Link>
              </li>
            ))}

            {auth.estaAutenticado && (
              <>
                <li className="usuario-sesion">
                  Hola, {nombre}
                  {rol && ' (' + rol + ')'}
                </li>
                <li>
                  <button type="button" className="boton-cerrar-sesion" onClick={salir}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}