import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Aparece en cualquier vista cuando el token venció o la API respondió 401
export default function AvisoSesion() {
  const { motivoCierre, cerrarAviso } = useAuth()

  if (motivoCierre !== 'expirada') {
    return null
  }

  return (
    <div className="contenedor" role="alert">
      <p className="mensaje-error">
        Tu sesión expiró. Inicia sesión nuevamente para continuar; tu carrito sigue guardado en este navegador.{' '}
        <Link to="/login" onClick={cerrarAviso}>
          Iniciar sesión
        </Link>{' '}
        <button type="button" className="btn btn-link p-0" onClick={cerrarAviso} aria-label="Cerrar aviso">
          ×
        </button>
      </p>
    </div>
  )
}