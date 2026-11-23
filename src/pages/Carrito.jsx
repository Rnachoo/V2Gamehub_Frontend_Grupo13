import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { buscarCupon } from '../services/cupones.js'
import { obtenerProductos } from '../services/productos.js'
import { cuponVigente } from '../utils/carrito.js'
import { traducirError } from '../utils/errores.js'
import { cuponVigente, validarStock } from '../utils/carrito.js'
import EstadoVista from '../components/estados/EstadoVista'
import LineaCarrito from '../components/carrito/LineaCarrito'
import ResumenCarrito from '../components/carrito/ResumenCarrito'
import '../styles/carrito.css'

export default function Carrito() {
  const carrito = useCarrito()

  return (
    <div className="contenedor">
      <h1 className="visually-hidden">Tu carrito</h1>

      {carrito.lineas.length === 0 ? (
        <>
          <EstadoVista vacio textoVacio="Tu carrito está vacío." />
          <Link to="/catalogo">Ir al catálogo</Link>
        </>
      ) : (
        <CarritoConProductos carrito={carrito} />
      )}
    </div>
  )
}

function CarritoConProductos({ carrito }) {
  const { lineas, cupon, totales, cambiarCantidad, quitar, vaciar, guardarCupon } = carrito
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState(null)

  useEffect(() => {
    let activo = true

    obtenerProductos()
      .then((lista) => {
        if (activo) setProductos(lista)
      })
      .catch((error) => {
        if (activo) setErrorProductos(error)
      })
      .finally(() => {
        if (activo) setCargandoProductos(false)
      })

    return () => {
      activo = false
    }
  }, [])

  async function aplicarCuponPorCodigo(codigo) {
    if (!codigo.trim()) return 'Ingresa un código de cupón.'

    try {
      const encontrado = await buscarCupon(codigo)

      if (!encontrado) return 'Ese cupón no existe.'
      if (encontrado.estado !== 'Active') return 'Ese cupón está desactivado.'
      if (!cuponVigente(encontrado)) return 'Ese cupón no está vigente.'
      if (!(encontrado.usosMaximos > 0)) return 'Ese cupón ya no tiene usos disponibles.'

      if (totales.subtotal < encontrado.montoMinimo) {
        return 'Tu carrito aún no alcanza el monto mínimo de ese cupón.'
      }

      guardarCupon(encontrado)
      return ''
    } catch (error) {
      return traducirError(error)
    }
  }

  function manejarVaciar() {
    if (!window.confirm('¿Vaciar todo el carrito?')) return false

    vaciar()
    return true
  }

  const productosPorId = new Map(productos.map((producto) => [producto.id, producto]))

  const hayLineasSinStockSuficiente = lineas.some((linea) => {
    const producto = productosPorId.get(linea.productoId)
    return !producto || !validarStock(producto, linea.cantidad)
  })

  return (
    <EstadoVista
      cargando={cargandoProductos}
      error={errorProductos}
      textoCarga="Cargando carrito..."
    >
      <div className="table-responsive">
        <table
          className="table tabla-carrito align-middle"
          aria-label="Productos en tu carrito"
        >
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
                producto={productosPorId.get(linea.productoId)}                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitar}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ResumenCarrito
        lineas={lineas}
        totales={totales}
        cupon={cupon}
        onAplicarCupon={aplicarCuponPorCodigo}
        onVaciar={manejarVaciar}
        bloquearPago={hayLineasSinStockSuficiente}
      />
    </EstadoVista>
  )
}