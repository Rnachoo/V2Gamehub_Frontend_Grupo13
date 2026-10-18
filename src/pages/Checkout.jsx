import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import FormularioCheckout from '../components/checkout/FormularioCheckout'

const ESPERA_REDIRECCION_MS = 3000

export default function Checkout() {
  const { lineas, totales, vaciar } = useCarrito()
  const [orden, setOrden] = useState(null)
  const navegar = useNavigate()

  // Tras confirmar la compra, lleva al historial de órdenes
  useEffect(() => {
    if (!orden) {
      return
    }
    const temporizador = setTimeout(() => navegar('/mis-ordenes'), ESPERA_REDIRECCION_MS)
    return () => clearTimeout(temporizador)
  }, [orden, navegar])

  function confirmarCompra(nuevaOrden) {
    vaciar()
    setOrden(nuevaOrden)
  }

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <Link to="/carrito">Carrito</Link> &gt;{' '}
        <span aria-current="page">Checkout</span>
      </nav>

      <h1 id="titulo-checkout">Finalizar compra</h1>

      {orden ? (
        <p className="mensaje-exito mb-5" role="status">
          ¡Compra realizada con éxito! Tu número de orden es #{orden.id}. Serás redirigido al
          historial de órdenes...
        </p>
      ) : (
        <FormularioCheckout lineas={lineas} totales={totales} onConfirmar={confirmarCompra} />
      )}
    </div>
  )
}
