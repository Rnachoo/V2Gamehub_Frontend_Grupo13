import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function PieDePagina() {
  return (
    <footer className="footer">
      <div className="contenedor">
        <p>GameHub Store - Proyecto Academico, Desarrollo Fullstack II</p>
        <p>© 2026 GameHub Store. Todos los derechos reservados.</p>
        <Link to="/">Inicio</Link>
        <img src={logo} alt="Logo de GameHub Store" className="logo-footer" />
      </div>
    </footer>
  )
}