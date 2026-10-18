import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validarFormularioCrearCuenta } from '../utils/validaciones'

const ESPERA_REDIRECCION_MS = 3000

const DATOS_VACIOS = {
  nombre: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: ''
}

export default function CrearCuenta() {
  const [datos, setDatos] = useState(DATOS_VACIOS)
  const [tocados, setTocados] = useState({})
  const [cuentaCreada, setCuentaCreada] = useState(false)
  const navegar = useNavigate()

  const { valido, errores } = validarFormularioCrearCuenta(datos)

  // Sin backend en EP2: solo se confirma y se vuelve al inicio
  useEffect(() => {
    if (!cuentaCreada) {
      return
    }
    const temporizador = setTimeout(() => navegar('/'), ESPERA_REDIRECCION_MS)
    return () => clearTimeout(temporizador)
  }, [cuentaCreada, navegar])

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

  function manejarEnvio(evento) {
    evento.preventDefault()
    setTocados({ nombre: true, correo: true, contrasena: true, confirmarContrasena: true })

    if (!valido) {
      return
    }

    setDatos(DATOS_VACIOS)
    setTocados({})
    setCuentaCreada(true)
  }

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Crear cuenta</span>
      </nav>

      <section className="seccion-crear-cuenta" aria-labelledby="titulo-crear-cuenta">
        <h1 id="titulo-crear-cuenta">Crea tu cuenta</h1>
        <p>Regístrate para guardar tus datos de despacho y hacer seguimiento a tus compras.</p>

        <form onSubmit={manejarEnvio} aria-labelledby="titulo-crear-cuenta" noValidate>
          <div className="campo-formulario">
            <label htmlFor="nombre-cuenta">Nombre completo</label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ej: Juan Pérez"
              aria-describedby="error-nombre-cuenta"
              {...propiedadesCampo('nombre', 'nombre-cuenta')}
            />
            <span id="error-nombre-cuenta" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('nombre')}
            </span>
          </div>

          <div className="campo-formulario">
            <label htmlFor="correo-cuenta">Correo electrónico</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              aria-describedby="error-correo-cuenta"
              {...propiedadesCampo('correo', 'correo-cuenta')}
            />
            <span id="error-correo-cuenta" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('correo')}
            </span>
          </div>

          <div className="campo-formulario">
            <label htmlFor="contrasena-cuenta">Contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              aria-describedby="ayuda-contrasena error-contrasena-cuenta"
              {...propiedadesCampo('contrasena', 'contrasena-cuenta')}
            />
            <span id="ayuda-contrasena" className="d-block">Debe tener al menos 8 caracteres.</span>
            <span id="error-contrasena-cuenta" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('contrasena')}
            </span>
          </div>

          <div className="campo-formulario">
            <label htmlFor="confirmar-contrasena-cuenta">Confirmar contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              aria-describedby="error-confirmar-contrasena-cuenta"
              {...propiedadesCampo('confirmarContrasena', 'confirmar-contrasena-cuenta')}
            />
            <span id="error-confirmar-contrasena-cuenta" className="mensaje-error" role="alert" aria-live="polite">
              {errorDe('confirmarContrasena')}
            </span>
          </div>

          <button type="submit" className="boton-primario" disabled={cuentaCreada}>
            Crear cuenta
          </button>

          {cuentaCreada && (
            <p className="mensaje-exito" role="status">
              Cuenta creada correctamente. Redirigiendo al inicio...
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
