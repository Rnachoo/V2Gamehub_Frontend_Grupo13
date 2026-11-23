import { useEffect, useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { buscarCupon } from '../services/cupones'
import { obtenerProductos } from '../services/productos.js'
import { cuponVigente } from '../utils/carrito'
import LineaCarrito from '../components/carrito/LineaCarrito'
import ResumenCarrito from '../components/carrito/ResumenCarrito'
import { traducirError } from '../utils/errores.js'
import '../styles/carrito.css'

export default function Carrito() {
  const {
    lineas,
    cupon,
    totales,
    cambiarCantidad,
    quitar,
    vaciar,
    guardarCupon
  } = useCarrito()

  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState('')

  useEffect(() => {
    let activo = true

    obtenerProductos()
      .then((lista) => {
        if (activo) setProductos(lista)
      })
      .catch(() => {
        if (activo) {
          setErrorProductos('No se pudo cargar el inventario.')
        }
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
    if (!window.confirm('¿Vaciar todo el carrito?')) {
      return false
    }

    vaciar()
    return true
  }

  if (cargandoProductos) {
    return (
      <p className="contenedor">
        Cargando carrito...
      </p>
    )
  }

  if (errorProductos) {
    return (
      <p className="contenedor" role="alert">
        {errorProductos}
      </p>
    )
  }

  return (
    <div className="contenedor">
      <h1 className="visually-hidden">
        Tu Carrito
      </h1>

      {lineas.length > 0 && (
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
                  producto={productos.find(
                    (producto) =>
                      producto.id === linea.productoId
                  )}
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