import { useCarrito } from '../context/CarritoContext'
import { buscarCupon } from '../services/cupones'
import { cuponVigente } from '../utils/carrito'
import { PRODUCTOS } from '../data/datos-productos'
import LineaCarrito from '../components/carrito/LineaCarrito'
import ResumenCarrito from '../components/carrito/ResumenCarrito'
import '../styles/carrito.css'

export default function Carrito() {
  const { lineas, cupon, totales, cambiarCantidad, quitar, vaciar, guardarCupon } = useCarrito()

  // Busca y valida el cupón. Devuelve el mensaje de error, o '' si se aplicó bien.
  async function aplicarCuponPorCodigo(codigo) {
    const cuponEncontrado = await buscarCupon(codigo)

    if (!cuponEncontrado) {
      return 'Ese cupón no existe.'
    }

    if (!cuponVigente(cuponEncontrado)) {
      return 'Ese cupón está vencido.'
    }

    guardarCupon(cuponEncontrado)
    return ''
  }

  function manejarVaciar() {
    if (!window.confirm('¿Vaciar todo el carrito?')) {
      return false
    }
    vaciar()
    return true
  }

  return (
    <div className="contenedor">
      {lineas.length > 0 && (
        <div className="table-responsive">
          <table className="table tabla-carrito align-middle" aria-label="Productos en tu carrito">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Precio Unitario</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((linea) => (
                <LineaCarrito
                  key={linea.productoId}
                  linea={linea}
                  producto={PRODUCTOS.find((p) => p.id === linea.productoId)}
                  onCambiarCantidad={cambiarCantidad}
                  onQuitar={quitar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ResumenCarrito
        lineas={lineas}
        totales={totales}
        cupon={cupon}
        onAplicarCupon={aplicarCuponPorCodigo}
        onVaciar={manejarVaciar}
      />
    </div>
  )
}