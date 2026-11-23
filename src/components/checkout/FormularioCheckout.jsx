import { useState } from 'react'
import { Link } from 'react-router-dom'
import { servicioOrdenes } from '../../services/ordenes'
import { METODO_RECHAZO } from '../../services/pagos'
import { REGIONES } from '../../data/regiones'
import { traducirError } from '../../utils/errores'
import { validarFormularioCheckout } from '../../utils/validaciones'
import { formatearPrecio } from '../../utils/precios'

const DATOS_VACIOS = {
  nombre: '',
  correo: '',
  telefono: '',
  region: '',
  comuna: '',
  direccion: '',
  metodoPago: 'tarjeta'
}

export default function FormularioCheckout({
  lineas,
  totales,
  onConfirmar,
  usuarioId,
  codigoCupon,
  datosIniciales
}) {
  const [datos, setDatos] = useState({ ...DATOS_VACIOS, ...datosIniciales })
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorCompra, setErrorCompra] = useState('')

  const { valido, errores } = validarFormularioCheckout(datos)
  const carritoVacio = lineas.length === 0

  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setDatos({
      ...datos,
      [name]: value
    })
  }

  function marcarTocado(evento) {
    setTocados({
      ...tocados,
      [evento.target.name]: true
    })
  }

  function errorDe(campo) {
    return tocados[campo]
      ? errores[campo] || ''
      : ''
  }

  function propiedadesCampo(campo) {
    return {
      id: campo + '-checkout',
      name: campo,
      value: datos[campo],
      onChange: cambiarCampo,
      onBlur: marcarTocado,
      'aria-describedby': 'error-' + campo + '-checkout',
      'aria-invalid': errorDe(campo) ? 'true' : undefined
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
      direccion: true
    })

    if (!valido || carritoVacio || enviando) {
      return
    }

    setEnviando(true)
    setErrorCompra('')

    try {
      const orden = await servicioOrdenes.crearOrden(
        datos,
        lineas,
        totales,
        { usuarioId, codigoCupon }
      )

      onConfirmar(orden)
    } catch (error) {
      setErrorCompra(
        (error.status !== undefined ? traducirError(error) : error.message) ||
          'No se pudo realizar la compra.'
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      className="layout-checkout"
      onSubmit={manejarEnvio}
      noValidate
    >
      <div>
        <section
          className="seccion-checkout"
          aria-labelledby="titulo-envio"
        >
          <h2 id="titulo-envio">
            1. Datos de envío
          </h2>

          <div className="grid-inputs">
            <div className="campo-formulario">
              <label htmlFor="nombre-checkout">
                Nombre completo
              </label>

              <input
                type="text"
                autoComplete="name"
                placeholder="Ej: Juan Pérez"
                {...propiedadesCampo('nombre')}
              />

              <span
                id="error-nombre-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('nombre')}
              </span>
            </div>

            <div className="campo-formulario">
              <label htmlFor="correo-checkout">
                Correo electrónico
              </label>

              <input
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                {...propiedadesCampo('correo')}
              />

              <span
                id="error-correo-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('correo')}
              </span>
            </div>

            <div className="campo-formulario">
              <label htmlFor="telefono-checkout">
                Teléfono
              </label>

              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Ej: 912345678"
                {...propiedadesCampo('telefono')}
              />

              <span
                id="error-telefono-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('telefono')}
              </span>
            </div>

            <div className="campo-formulario">
              <label htmlFor="region-checkout">
                Región
              </label>

              <select {...propiedadesCampo('region')}>
                <option value="">
                  Seleccione una región...
                </option>

                {REGIONES.map((region) => (
                  <option
                    key={region.codigo}
                    value={region.codigo}
                  >
                    {region.nombre}
                  </option>
                ))}
              </select>

              <span
                id="error-region-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('region')}
              </span>
            </div>

            <div className="campo-formulario">
              <label htmlFor="comuna-checkout">
                Comuna
              </label>

              <input
                type="text"
                autoComplete="address-level2"
                placeholder="Ej: Providencia"
                {...propiedadesCampo('comuna')}
              />

              <span
                id="error-comuna-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('comuna')}
              </span>
            </div>

            <div className="campo-formulario input-ancho-completo">
              <label htmlFor="direccion-checkout">
                Dirección exacta
              </label>

              <input
                type="text"
                autoComplete="street-address"
                placeholder="Calle, número, depto..."
                {...propiedadesCampo('direccion')}
              />

              <span
                id="error-direccion-checkout"
                className="mensaje-error"
                role="alert"
                aria-live="polite"
              >
                {errorDe('direccion')}
              </span>
            </div>
          </div>
        </section>

        <section
          className="seccion-checkout"
          aria-labelledby="titulo-pago"
        >
          <h2 id="titulo-pago">
            2. Método de pago
          </h2>

          <div className="campo-formulario">
            <label htmlFor="metodo-pago">
              Selecciona cómo deseas pagar
            </label>

            <select
              id="metodo-pago"
              name="metodoPago"
              value={datos.metodoPago}
              onChange={cambiarCampo}
            >
              <option value="tarjeta">
                Tarjeta de Crédito / Débito (Webpay)
              </option>

              <option value="transferencia">
                Transferencia Bancaria
              </option>

              <option value={METODO_RECHAZO}>
                Tarjeta de prueba (pago rechazado)
              </option>
            </select>
          </div>
        </section>
      </div>

      <aside
        className="panel-resumen-checkout"
        aria-labelledby="titulo-resumen-checkout"
      >
        <h2 id="titulo-resumen-checkout">
          Resumen de la orden
        </h2>

        {carritoVacio && (
          <p>No hay productos en el carrito.</p>
        )}

        {lineas.map((linea) => (
          <div
            key={linea.productoId}
            className="item-resumen-checkout"
          >
            <span>
              {linea.nombre} x{linea.cantidad}
            </span>

            <span>
              {formatearPrecio(
                linea.precioUnitario * linea.cantidad
              )}
            </span>
          </div>
        ))}

        <hr className="separador-resumen" />

        <dl>
          <div className="fila-total">
            <dt>Subtotal</dt>
            <dd>
              {formatearPrecio(totales.subtotal)}
            </dd>
          </div>

          <div className="fila-total">
            <dt>Descuento</dt>
            <dd>
              {totales.descuento > 0
                ? '-' + formatearPrecio(totales.descuento)
                : formatearPrecio(0)}
            </dd>
          </div>

          <div className="fila-total fila-total-final">
            <dt>Total</dt>
            <dd>
              {formatearPrecio(totales.total)}
            </dd>
          </div>
        </dl>

        {errorCompra && (
          <p className="mensaje-error" role="alert">
            {errorCompra}
          </p>
        )}

        <button
          type="submit"
          className="boton-primario"
          disabled={!valido || carritoVacio || enviando}
        >
          {enviando
            ? 'Procesando...'
            : 'Confirmar y pagar'}
        </button>

        {carritoVacio && (
          <p
            className="mensaje-exito mensaje-exito-error"
            role="alert"
          >
            Agrega productos antes de pagar.{' '}
            <Link to="/catalogo">
              Ir al catálogo
            </Link>
          </p>
        )}
      </aside>
    </form>
  )
}