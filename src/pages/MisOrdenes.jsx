import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EstadoVista from '../components/estados/EstadoVista'
import FormularioResena from '../components/ordenes/FormularioResena'
import useCargaDatos from '../hooks/useCargaDatos'
import { servicioOrdenes } from '../services/ordenes'
import { obtenerResenasPorUsuario } from '../services/resenas'
import { traducirError } from '../utils/errores'
import { formatearPrecio } from '../utils/precios'

const CLASES_ESTADO = {
  'Pendiente de pago': 'estado-pendiente',
  Pagada: 'estado-pagada',
  Cancelada: 'estado-cancelada',
  Preparando: 'estado-preparando',
  'En camino': 'estado-camino',
  Entregado: 'estado-entregado',
  'Despacho cancelado': 'estado-cancelada'
}

const TEXTO_PAGO = {
  APROBADO: 'Pago aprobado',
  RECHAZADO: 'Último pago rechazado',
  ANULADO: 'Pago anulado'
}

const TEXTO_METODO = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  RECHAZO_PRUEBA: 'Tarjeta de prueba'
}

function claveResena(ordenId, productoId) {
  return ordenId + '-' + productoId
}

function TarjetaOrden({ orden, usuarioId, resenadas, onResenada, onPagada }) {
  const [resenando, setResenando] = useState(null)
  const [pagando, setPagando] = useState(false)
  const [errorPago, setErrorPago] = useState('')
  const puedeResenar = orden.estadoOrden === 'PAGADA'

  async function pagar() {
    setPagando(true)
    setErrorPago('')
    try {
      const pago = await servicioOrdenes.pagarOrden(orden, 'tarjeta')
      if (pago.estado !== 'APROBADO') {
        setErrorPago('El pago fue rechazado. Intenta nuevamente.')
      }
      onPagada()
    } catch (error) {
      setErrorPago(traducirError(error))
    } finally {
      setPagando(false)
    }
  }

  return (
    <article className="tarjeta-orden" aria-labelledby={'orden-' + orden.id}>
      <div className="cabecera-orden">
        <div className="datos-orden">
          <h2 id={'orden-' + orden.id}>Orden #{orden.id}</h2>
          <p className="fecha-orden">
            Realizada el {new Date(orden.fecha).toLocaleDateString('es-CL')}
          </p>
        </div>
        <span className={'estado-orden ' + (CLASES_ESTADO[orden.estado] || '')}>{orden.estado}</span>
      </div>

      <div className="cuerpo-orden">
        <ul className="productos-orden" aria-label={'Productos de la orden #' + orden.id}>
          {orden.productos.map((producto) => {
            const clave = claveResena(orden.id, producto.productoId)
            const yaResenada = resenadas.has(clave)
            return (
              <li key={producto.productoId}>
                <div className="fila-producto-orden">
                  <span>
                    {producto.cantidad}x {producto.nombre}
                  </span>
                  {puedeResenar && yaResenada && <span className="etiqueta-resenada">Reseñado</span>}
                  {puedeResenar && !yaResenada && resenando !== producto.productoId && (
                    <button
                      type="button"
                      className="boton-secundario boton-resenar"
                      onClick={() => setResenando(producto.productoId)}
                    >
                      Reseñar
                    </button>
                  )}
                </div>
                {resenando === producto.productoId && (
                  <FormularioResena
                    usuarioId={usuarioId}
                    ordenId={orden.id}
                    producto={producto}
                    onCancelar={() => setResenando(null)}
                    onEnviada={() => {
                      setResenando(null)
                      onResenada(clave)
                    }}
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="total-orden">
          {orden.descuento > 0 && <span>Descuento: -{formatearPrecio(orden.descuento)}</span>}
          <span>Total de la orden</span>
          <strong>{formatearPrecio(orden.total)}</strong>
        </div>
      </div>

      <div className="detalle-orden">
        {orden.pago && TEXTO_PAGO[orden.pago.estado] && (
          <p>
            {TEXTO_PAGO[orden.pago.estado]} · {TEXTO_METODO[orden.pago.metodo] ?? orden.pago.metodo}
          </p>
        )}
        {orden.despacho && (
          <p>
            Despacho con {orden.despacho.transportista} a {orden.despacho.direccion}
            {orden.despacho.tracking && <> · Seguimiento: <strong>{orden.despacho.tracking}</strong></>}
          </p>
        )}
        {orden.estadoOrden === 'PENDIENTE_PAGO' && (
          <div className="acciones-orden">
            <button type="button" className="boton-primario" onClick={pagar} disabled={pagando}>
              {pagando ? 'Procesando...' : 'Pagar ahora'}
            </button>
            {errorPago && <p className="mensaje-error" role="alert">{errorPago}</p>}
          </div>
        )}
      </div>
    </article>
  )
}

export default function MisOrdenes() {
  const { sesion } = useAuth()
  const usuarioId = sesion?.usuarioId
  const [nuevasResenas, setNuevasResenas] = useState([])

  const cargar = useCallback(async () => {
    const [ordenes, resenas] = await Promise.all([
      servicioOrdenes.obtenerOrdenes(usuarioId),
      usuarioId ? obtenerResenasPorUsuario(usuarioId) : []
    ])
    return { ordenes, resenadas: resenas.map((r) => claveResena(r.ordenId, r.productoId)) }
  }, [usuarioId])

  const { datos, cargando, error, recargar } = useCargaDatos(cargar, { ordenes: [], resenadas: [] })
  const resenadas = new Set([...datos.resenadas, ...nuevasResenas])

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Mis órdenes</span>
      </nav>

      <section className="seccion-ordenes" aria-labelledby="titulo-ordenes">
        <div className="cabecera-mis-ordenes">
          <h1 id="titulo-ordenes">Mis órdenes</h1>
          <p>Revisa el historial, el pago y el despacho de tus compras.</p>
        </div>

        <EstadoVista
          cargando={cargando}
          error={error}
          alReintentar={recargar}
          textoCarga="Cargando órdenes..."
        >
          {datos.ordenes.length === 0 ? (
            <div className="sin-ordenes">
              <p>
                Aún no has realizado ninguna compra. <Link to="/catalogo">Ir al catálogo</Link>
              </p>
            </div>
          ) : (
            <div className="lista-ordenes">
              {datos.ordenes.map((orden) => (
                <TarjetaOrden
                  key={orden.id}
                  orden={orden}
                  usuarioId={usuarioId}
                  resenadas={resenadas}
                  onResenada={(clave) => setNuevasResenas((previas) => [...previas, clave])}
                  onPagada={recargar}
                />
              ))}
            </div>
          )}
        </EstadoVista>
      </section>
    </div>
  )
}
