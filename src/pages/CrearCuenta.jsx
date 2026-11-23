import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { REGIONES } from '../data/regiones'
import { armarDireccion } from '../utils/direccion'
import { validarFormularioCrearCuenta } from '../utils/validaciones'

const ESPERA_REDIRECCION_MS = 3000

const DATOS_VACIOS = {
  nombre: '',
  correo: '',
  telefono: '',
  region: '',
  comuna: '',
  direccion: '',
  contrasena: '',
  confirmarContrasena: ''
}

const CAMPOS_BACKEND = {
  nombreCuenta: 'nombre',
  nombreUser: 'nombre',
  email: 'correo',
  telefono: 'telefono',
  password: 'contrasena'
}

function interpretarError(error) {
  if (error.estado === 409) {
    return error.paso === 'perfil'
      ? { campos: { telefono: 'Ese teléfono ya está asociado a otra cuenta.' }, general: '' }
      : { campos: { correo: 'Ese correo ya está registrado. Puedes iniciar sesión.' }, general: '' }
  }

  if (error.estado === 400 && error.detalle && !error.detalle.mensaje) {
    const campos = {}
    for (const [campoServidor, mensaje] of Object.entries(error.detalle)) {
      if (CAMPOS_BACKEND[campoServidor]) {
        campos[CAMPOS_BACKEND[campoServidor]] = mensaje
      }
    }
    if (Object.keys(campos).length > 0) {
      return { campos, general: '' }
    }
  }

  if (error.estado === 0) {
    return { campos: {}, general: 'No se pudo conectar con el servidor. Intenta más tarde.' }
  }
  if (error.estado >= 500) {
    return { campos: {}, general: 'Error del servidor, intenta más tarde.' }
  }
  return { campos: {}, general: error.message || 'No se pudo crear la cuenta.' }
}

function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className="campo-formulario">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && (
        <span id={'ayuda-' + id} className="d-block">
          {ayuda}
        </span>
      )}
      <span id={'error-' + id} className="mensaje-error" role="alert" aria-live="polite">
        {error}
      </span>
    </div>
  )
}

export default function CrearCuenta() {
  const [datos, setDatos] = useState(DATOS_VACIOS)
  const [tocados, setTocados] = useState({})
  const [erroresServidor, setErroresServidor] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cuentaCreada, setCuentaCreada] = useState(false)
  const { estaAutenticado, registrarse } = useAuth()
  const navegar = useNavigate()

  const { valido, errores } = validarFormularioCrearCuenta(datos)

  // Con la cuenta creada y la sesión iniciada, se vuelve al inicio
  useEffect(() => {
    if (!cuentaCreada) {
      return
    }
    const temporizador = setTimeout(() => navegar('/'), ESPERA_REDIRECCION_MS)
    return () => clearTimeout(temporizador)
  }, [cuentaCreada, navegar])

  if (estaAutenticado && !enviando && !cuentaCreada) {
    return <Navigate to="/" replace />
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setDatos({ ...datos, [name]: value })
    if (erroresServidor[name]) {
      setErroresServidor({ ...erroresServidor, [name]: '' })
    }
  }

  function marcarTocado(evento) {
    setTocados({ ...tocados, [evento.target.name]: true })
  }

  function errorDe(campo) {
    return (tocados[campo] ? errores[campo] || '' : '') || erroresServidor[campo] || ''
  }

  function propiedadesCampo(campo, idCampo, conAyuda = false) {
    return {
      id: idCampo,
      name: campo,
      value: datos[campo],
      onChange: cambiarCampo,
      onBlur: marcarTocado,
      'aria-invalid': errorDe(campo) ? 'true' : undefined,
      'aria-describedby': (conAyuda ? 'ayuda-' + idCampo + ' ' : '') + 'error-' + idCampo
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setTocados({
      nombre: true,
      correo: true,
      telefono: true,
      region: true,
      comuna: true,
      direccion: true,
      contrasena: true,
      confirmarContrasena: true
    })
    setErroresServidor({})
    setErrorGeneral('')

    if (!valido) {
      return
    }

    setEnviando(true)
    const nombre = datos.nombre.trim()
    const correo = datos.correo.trim()

    try {
      await registrarse({
        nombreCuenta: nombre,
        email: correo,
        password: datos.contrasena,
        perfil: {
          nombreUser: nombre,
          email: correo,
          telefono: datos.telefono.trim(),
          directionsDTO: [armarDireccion(datos)]
        }
      })
      setDatos(DATOS_VACIOS)
      setTocados({})
      setCuentaCreada(true)
    } catch (error) {
      const { campos, general } = interpretarError(error)
      setErroresServidor(campos)
      setErrorGeneral(general)
      setEnviando(false)
    }
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
          <Campo id="nombre-cuenta" etiqueta="Nombre completo" error={errorDe('nombre')}>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ej: Juan Pérez"
              {...propiedadesCampo('nombre', 'nombre-cuenta')}
            />
          </Campo>

          <Campo id="correo-cuenta" etiqueta="Correo electrónico" error={errorDe('correo')}>
            <input
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              {...propiedadesCampo('correo', 'correo-cuenta')}
            />
          </Campo>

          <Campo id="telefono-cuenta" etiqueta="Teléfono" error={errorDe('telefono')}>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Ej: 912345678"
              {...propiedadesCampo('telefono', 'telefono-cuenta')}
            />
          </Campo>

          <Campo id="region-cuenta" etiqueta="Región" error={errorDe('region')}>
            <select autoComplete="address-level1" {...propiedadesCampo('region', 'region-cuenta')}>
              <option value="">Selecciona una región</option>
              {REGIONES.map((region) => (
                <option key={region.codigo} value={region.codigo}>
                  {region.nombre}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="comuna-cuenta" etiqueta="Comuna" error={errorDe('comuna')}>
            <input
              type="text"
              autoComplete="address-level2"
              placeholder="Ej: Providencia"
              {...propiedadesCampo('comuna', 'comuna-cuenta')}
            />
          </Campo>

          <Campo
            id="direccion-cuenta"
            etiqueta="Dirección de despacho"
            ayuda="Calle y número, por ejemplo: Av. Providencia 1234."
            error={errorDe('direccion')}
          >
            <input
              type="text"
              autoComplete="street-address"
              placeholder="Calle y número"
              {...propiedadesCampo('direccion', 'direccion-cuenta', true)}
            />
          </Campo>

          <Campo
            id="contrasena-cuenta"
            etiqueta="Contraseña"
            ayuda="Debe tener al menos 8 caracteres."
            error={errorDe('contrasena')}
          >
            <input
              type="password"
              autoComplete="new-password"
              {...propiedadesCampo('contrasena', 'contrasena-cuenta', true)}
            />
          </Campo>

          <Campo
            id="confirmar-contrasena-cuenta"
            etiqueta="Confirmar contraseña"
            error={errorDe('confirmarContrasena')}
          >
            <input
              type="password"
              autoComplete="new-password"
              {...propiedadesCampo('confirmarContrasena', 'confirmar-contrasena-cuenta')}
            />
          </Campo>

          {errorGeneral && (
            <p className="mensaje-error" role="alert">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="boton-primario" disabled={enviando}>
            {enviando && !cuentaCreada ? 'Creando cuenta...' : 'Crear cuenta'}
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