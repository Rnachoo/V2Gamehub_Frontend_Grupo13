import { Link, useLocation } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import logo from '../assets/logo.png'

const ENLACES = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/catalogo', texto: 'Catálogo' },
  { ruta: '/carrito', texto: 'Carrito' },
  { ruta: '/mis-ordenes', texto: 'Mis órdenes' },
  { ruta: '/crear-cuenta', texto: 'Crear cuenta' }
]

export default function Cabecera() {
  const { unidades } = useCarrito()
  const { pathname } = useLocation()

  const rutaActual = pathname.length > 1 ? pathname.replace(/\/$/, '').toLowerCase() : pathname

  // El menú no muestra el enlace de la vista en la que ya estás
  const enlaces = ENLACES.filter((enlace) => enlace.ruta !== rutaActual)

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
          <ul className="flex-wrap justify-content-center row-gap-2">
            {enlaces.map((enlace) => (
              <li key={enlace.ruta}>
                <Link to={enlace.ruta}>
                  {enlace.ruta === '/carrito' ? 'Carrito(' + unidades + ')' : enlace.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}