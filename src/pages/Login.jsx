import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rutaDespuesDeIngresar } from '../utils/rutas'
import { validarFormularioLogin } from '../utils/validaciones'

const DATOS_VACIOS = { correo: '', contrasena: '' }

// Traduce el error del backend a un mensaje que el usuario entienda
function mensajeDeError(error) {
  if (error.codigo === 'CUENTA_DESACTIVADA') {
    return 'Tu cuenta está desactivada. Contacta a la tienda.'
  }
  if (error.codigo === 'CREDENCIALES_INVALIDAS') {
    return 'Correo o contraseña incorrectos.'
  }
  if (error.estado === 0) {
    return 'No se pudo conectar con el servidor. Intenta más tarde.'
  }
  if (error.estado >= 500) {
    return 'Error del servidor, intenta más tarde.'
  }
  return error.message || 'No se pudo iniciar sesión.'
}

export default function Login() {
  const [datos, setDatos] = useState(DATOS_VACIOS)
  const [tocados, setTocados] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { estaAutenticado, roles, iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()

  const desde = ubicacion.state?.desde
  const { valido, errores } = validarFormularioLogin(datos)

  if (estaAutenticado && !enviando) {
    return <Navigate to={rutaDespuesDeIngresar(roles, desde)} replace />
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setDatos({ ...datos, [name]: value })
  }

  function marcarTocado(evento) {
    setTocados({ ...tocados, [evento.target.name]: true })
  }

  function errorDe(campo) {
    return tocados[campo] ? errores[campo] || '' : ''
  }

  function propiedadesCampo(campo, idCampo) {
    return {
      id: idCampo,
      name: campo,
      value: datos[campo],
      onChange: cambiarCampo,
      onBlur: marcarTocado,
      'aria-invalid': errorDe(campo) ? 'true' : undefined
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setTocados({ correo: true, contrasena: true })
    setErrorGeneral('')

    if (!valido) {
      return
    }

    setEnviando(true)
    try {
      const sesionNueva = await iniciarSesion(datos.correo.trim(), datos.contrasena)
      navegar(rutaDespuesDeIngresar(sesionNueva.roles, desde), { replace: true })
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Iniciar sesión</span>
      </nav>

      <section className="seccion-crear-cuenta" aria-labelledby="titulo-login">
        <h1 id="titulo-login">Inicia sesión</h1>

        <form onSubmit={manejarEnvio} aria-labelledby="titulo-login" noValidate>
          <div className="campo-formulario">
            <label htmlFor="correo-login">Correo electrónico</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              aria-describedby="error-correo-login"
              {...propiedadesCampo('correo', 'correo-login')}
            />
            <span id="error-correo-login" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('correo')}
            </span>
          </div>

          <div className="campo-formulario">
            <label htmlFor="contrasena-login">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              aria-describedby="error-contrasena-login"
              {...propiedadesCampo('contrasena', 'contrasena-login')}
            />
            <span id="error-contrasena-login" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('contrasena')}
            </span>
          </div>

          {errorGeneral && (
            <p className="mensaje-error" role="alert">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="boton-primario" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p>
          ¿No tienes cuenta? <Link to="/crear-cuenta">Crea una</Link>
        </p>
      </section>
    </div>
  )
}