import { useState } from 'react'
import { Link } from 'react-router-dom'

const formatoPeso = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export default function ResumenCarrito({ lineas, totales, cupon, onAplicarCupon, onVaciar }) {
  const [codigo, setCodigo] = useState(cupon ? cupon.codigo : '')
  const [error, setError] = useState('')

  async function manejarEnvio(evento) {
    evento.preventDefault()
    const mensaje = await onAplicarCupon(codigo)
    setError(mensaje)
  }

  // onVaciar devuelve true si el carrito se vació (el usuario pudo cancelar la confirmación)
  function manejarVaciar() {
    const seVacio = onVaciar()
    if (seVacio) {
      setCodigo('')
      setError('')
    }
  }

  if (lineas.length === 0) {
    return (
      <p className="text-center py-5">
        Tu carrito está vacío. <Link to="/catalogo">Ir al catálogo</Link>
      </p>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-end mb-4">
        <button type="button" className="boton-secundario" onClick={manejarVaciar}>
          Vaciar carrito
        </button>
      </div>

      <div className="row justify-content-end">
        <div className="col-12 col-md-6 col-lg-4">
          <section className="resumen-carrito" aria-labelledby="titulo-resumen">
            <h2 id="titulo-resumen">Resumen</h2>

            <form
              className="formulario-cupon d-flex flex-wrap align-items-end gap-2 mb-4"
              onSubmit={manejarEnvio}
              noValidate
            >
              <div className="campo-formulario">
                <label htmlFor="codigo-cupon">Código de cupón</label>
                <input
                  type="text"
                  id="codigo-cupon"
                  name="cupon"
                  autoComplete="off"
                  placeholder="Ej: GAMER10"
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value)}
                />
                <span className="mensaje-error" role="alert" aria-live="polite">
                  {error}
                </span>
              </div>
              <button type="submit" className="boton-secundario">
                Aplicar cupón
              </button>
            </form>

            <dl className="totales-carrito">
              <div className="fila-total">
                <dt>Subtotal</dt>
                <dd>{formatoPeso.format(totales.subtotal)}</dd>
              </div>
              <div className="fila-total">
                <dt>Descuento</dt>
                <dd>{formatoPeso.format(totales.descuento)}</dd>
              </div>
              <div className="fila-total fila-total-final">
                <dt>Total</dt>
                <dd>{formatoPeso.format(totales.total)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="boton-primario boton-ir-checkout">
              Ir a pagar
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}