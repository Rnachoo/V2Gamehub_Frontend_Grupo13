import { useState } from 'react'
import { validarStock } from '../../utils/carrito'

const formatoPeso = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export default function LineaCarrito({ linea, producto, onCambiarCantidad, onQuitar }) {
  const [texto, setTexto] = useState(String(linea.cantidad))
  const [error, setError] = useState('')

  function manejarCambio(evento) {
    const valor = evento.target.value
    setTexto(valor)
    const nuevaCantidad = Number(valor)

    if (!producto) {
      setError('Producto no encontrado.')
      return
    }

    if (!validarStock(producto, nuevaCantidad)) {
      setError('Cantidad inválida: máximo ' + producto.stock + ' unidades.')
      return
    }

    setError('')
    onCambiarCantidad(linea.productoId, nuevaCantidad)
  }

  return (
    <tr>
      <td>{linea.nombre}</td>
      <td>{formatoPeso.format(linea.precioUnitario)}</td>
      <td>
        <input
          type="number"
          className="input-cantidad"
          min="1"
          value={texto}
          aria-label={'Cantidad de ' + linea.nombre}
          onChange={manejarCambio}
        />
        <span className="mensaje-error" role="alert">{error}</span>
      </td>
      <td>{formatoPeso.format(linea.precioUnitario * linea.cantidad)}</td>
      <td>
        <button
          type="button"
          className="boton-secundario"
          onClick={() => onQuitar(linea.productoId)}
        >
          Quitar
        </button>
      </td>
    </tr>
  )
}   