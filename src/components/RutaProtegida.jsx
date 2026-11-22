import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Sin sesión: redirige a /login y recuerda la ruta pedida para volver después.
// Con `roles`: además exige alguno de esos roles (si no, muestra 403).
// Ocultar es solo la primera barrera: el backend vuelve a validar el rol en cada llamada.
export default function RutaProtegida({ roles }) {
  const { estaAutenticado, tieneRol } = useAuth()
  const ubicacion = useLocation()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (roles && !tieneRol(...roles)) {
    return (
      <div className="contenedor">
        <h1>Acceso denegado</h1>
        <p className="mensaje-error" role="alert">
          No tienes permiso para ver esta página (403).
        </p>
        <Link to="/">Volver al inicio</Link>
      </div>
    )
  }

  return <Outlet />
}