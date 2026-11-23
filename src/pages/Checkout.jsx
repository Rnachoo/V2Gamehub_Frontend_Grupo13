import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import FormularioCheckout from '../components/checkout/FormularioCheckout'
import EstadoVista from '../components/estados/EstadoVista'
import useCargaDatos from '../hooks/useCargaDatos'
import { obtenerPerfil, servicioOrdenes } from '../services/ordenes'
import { METODO_RECHAZO } from '../services/pagos'
import { REGIONES } from '../data/regiones'
import { traducirError } from '../utils/errores'
import { formatearPrecio } from '../utils/precios'

const ESPERA_REDIRECCION_MS = 3000

function baseRegion(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^region (de )?/, '')
    .trim()
}

function buscarRegion(ciudad) {
  const buscada = baseRegion(ciudad)
  if (!buscada) {
    return null
  }
  return REGIONES.find((r) => {
    const nombre = baseRegion(r.nombre)
    return nombre.startsWith(buscada) || buscada.startsWith(nombre)
  })
}

function datosDesdePerfil(perfil) {
  if (!perfil) {
    return {}
  }
  const direccion = perfil.directionsDTO?.[perfil.directionsDTO.length - 1]
  const region = buscarRegion(direccion?.ciudad)
  return {
    nombre: perfil.nombreUser ?? '',
    correo: perfil.email ?? '',
    telefono: perfil.telefono ?? '',
    region: region?.codigo ?? '',
    comuna: direccion?.comuna ?? '',
    direccion: direccion ? `${direccion.calle} ${direccion.numero === 'S/N' ? '' : direccion.numero}`.trim() : ''
  }
}

function ResultadoPago({ orden, onReintentar }) {
  const [metodo, setMetodo] = useState('tarjeta')
  const [enviando, setEnviando] = useState(false)
  const pago = orden.pago

  async function reintentar() {
    setEnviando(true)
    await onReintentar(metodo)
    setEnviando(false)
  }

  if (pago?.estado === 'APROBADO') {
    return (
      <p className="mensaje-exito mb-5" role="status">
        ¡Pago aprobado! Tu número de orden es #{orden.id} por {formatearPrecio(orden.total)}.
        Serás redirigido al historial de órdenes...
      </p>
    )
  }

  return (
    <section className="seccion-checkout resultado-pago mb-5" aria-labelledby="titulo-rechazo">
      <h2 id="titulo-rechazo">Pago no realizado</h2>
      <p className="mensaje-exito mensaje-exito-error" role="alert">
        {pago?.estado === 'RECHAZADO'
          ? 'El pago fue rechazado.'
          : traducirError(pago?.error)}{' '}
        Tu orden #{orden.id} quedó pendiente de pago por {formatearPrecio(orden.total)}.
      </p>

      <div className="campo-formulario">
        <label htmlFor="metodo-reintento">Método de pago</label>
        <select id="metodo-reintento" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
          <option value="tarjeta">Tarjeta de Crédito / Débito (Webpay)</option>
          <option value="transferencia">Transferencia Bancaria</option>
          <option value={METODO_RECHAZO}>Tarjeta de prueba (pago rechazado)</option>
        </select>
      </div>

      <div className="acciones-resultado">
        <button type="button" className="boton-primario" onClick={reintentar} disabled={enviando}>
          {enviando ? 'Procesando...' : 'Reintentar pago'}
        </button>
        <Link to="/mis-ordenes" className="boton-secundario">Ver mis órdenes</Link>
      </div>
    </section>
  )
}

export default function Checkout() {
  const { lineas, totales, cupon, vaciar } = useCarrito()
  const { sesion } = useAuth()
  const usuarioId = sesion?.usuarioId
  const [orden, setOrden] = useState(null)
  const navegar = useNavigate()

  const cargarPerfil = useCallback(
    () => (usuarioId ? obtenerPerfil(usuarioId) : Promise.resolve(null)),
    [usuarioId]
  )
  const { datos: perfil, cargando, error } = useCargaDatos(cargarPerfil, null)

  const aprobado = orden?.pago?.estado === 'APROBADO'

  useEffect(() => {
    if (!aprobado) {
      return
    }
    const temporizador = setTimeout(() => navegar('/mis-ordenes'), ESPERA_REDIRECCION_MS)
    return () => clearTimeout(temporizador)
  }, [aprobado, navegar])

  function confirmarCompra(nuevaOrden) {
    vaciar()
    setOrden(nuevaOrden)
  }

  async function reintentarPago(metodo) {
    try {
      const pago = await servicioOrdenes.pagarOrden(orden, metodo)
      setOrden({ ...orden, pago })
    } catch (errorPago) {
      setOrden({ ...orden, pago: { estado: 'ERROR', error: errorPago } })
    }
  }

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <Link to="/carrito">Carrito</Link> &gt;{' '}
        <span aria-current="page">Checkout</span>
      </nav>

      <h1 id="titulo-checkout">Finalizar compra</h1>

      {orden ? (
        <ResultadoPago orden={orden} onReintentar={reintentarPago} />
      ) : !usuarioId ? (
        <p className="mensaje-exito mensaje-exito-error mb-5" role="alert">
          Tu cuenta no tiene un perfil de cliente para comprar.
        </p>
      ) : (
        <EstadoVista cargando={cargando} error={error} textoCarga="Cargando tus datos...">
          <FormularioCheckout
            lineas={lineas}
            totales={totales}
            onConfirmar={confirmarCompra}
            usuarioId={usuarioId}
            codigoCupon={cupon?.codigo}
            datosIniciales={datosDesdePerfil(perfil)}
          />
        </EstadoVista>
      )}
    </div>
  )
}
