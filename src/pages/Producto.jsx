import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerProductoPorId } from '../services/productos.js'
import { obtenerResenasPorProducto } from '../services/resenas.js'
import { useCarrito } from '../context/CarritoContext'
import { validarStock } from '../utils/carrito.js'
import EstadoVista from '../components/estados/EstadoVista'
import ListaResenas from '../components/producto/ListaResenas'
import '../styles/producto.css'

const formatoPeso = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export default function Producto() {
  const id = Number(useParams().id)

  // Al cambiar de producto se reinician la ficha, la cantidad y las reseñas.
  return <FichaProducto key={id} id={id} />
}

function FichaProducto({ id }) {
  const { lineas, agregar } = useCarrito()
  const idValido = Number.isSafeInteger(id) && id > 0

  const [producto, setProducto] = useState(null)
  const [cargandoProducto, setCargandoProducto] = useState(idValido)
  const [errorProducto, setErrorProducto] = useState(null)
  const [resultadoResenas, setResultadoResenas] = useState(null)
  const [cantidad, setCantidad] = useState('1')
  const [errorCantidad, setErrorCantidad] = useState('')
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    if (!idValido) return

    let activo = true

    obtenerProductoPorId(id)
      .then((resultado) => {
        if (activo) setProducto(resultado)
      })
      .catch((error) => {
        if (activo) setErrorProducto(error)
      })
      .finally(() => {
        if (activo) setCargandoProducto(false)
      })

    return () => {
      activo = false
    }
  }, [id, idValido])

  useEffect(() => {
    if (!producto) return

    let activo = true

    obtenerResenasPorProducto(id)
      .then((datos) => {
        if (activo) setResultadoResenas({ datos, error: null })
      })
      .catch((error) => {
        if (activo) setResultadoResenas({ datos: [], error })
      })

    return () => {
      activo = false
    }
  }, [id, producto])

  useEffect(() => {
    if (!agregado) return

    const temporizador = setTimeout(() => setAgregado(false), 1500)
    return () => clearTimeout(temporizador)
  }, [agregado])

  if (cargandoProducto || errorProducto || !producto) {
    return (
      <div className="contenedor">
        <EstadoVista
          cargando={cargandoProducto}
          error={errorProducto}
          vacio={!producto}
          textoCarga="Cargando producto..."
          textoVacio="No encontramos ese producto."
        />

        {!cargandoProducto && (
          <Link to="/catalogo">Volver al catálogo</Link>
        )}
      </div>
    )
  }

  const tieneDescuento =
    producto.precioDescuento != null && producto.precioDescuento < producto.precio
  const sinStock = producto.stock === 0

  function manejarEnvio(evento) {
    evento.preventDefault()

    const unidades = Number(cantidad)
    if (!Number.isInteger(unidades) || unidades <= 0) {
      setErrorCantidad('Ingresa un número entero mayor a 0.')
      return
    }

    const linea = lineas.find((item) => item.productoId === producto.id)
    const enCarrito = linea?.cantidad ?? 0

    if (!validarStock(producto, unidades + enCarrito)) {
      const disponiblesParaAgregar = Math.max(0, producto.stock - enCarrito)
      setErrorCantidad(`Puedes agregar ${disponiblesParaAgregar} unidades más al carrito.`)
      return
    }

    setErrorCantidad('')
    agregar(producto, unidades)
    setAgregado(true)
  }

  return (
    <div className="contenedor">
      <nav aria-label="Ruta de navegación" className="ruta-navegacion">
        <Link to="/">Inicio</Link> &gt;{' '}
        <Link to="/catalogo">Catálogo</Link> &gt;{' '}
        <span aria-current="page">Producto</span>
      </nav>

      <article className="row g-4 mb-4">
        <figure className="col-md-6">
          <img
            src={producto.imagenes[0]}
            alt={producto.nombre}
            width="400"
            height="400"
          />
        </figure>

        <div className="col-md-6">
          <h1>{producto.nombre}</h1>
          <p>{producto.descripcion}</p>

          <p className="precio">
            {tieneDescuento && (
              <span className="precio-tachado">
                {formatoPeso.format(producto.precio)}
              </span>
            )}

            <span className={tieneDescuento ? 'precio-descuento' : undefined}>
              {formatoPeso.format(
                tieneDescuento ? producto.precioDescuento : producto.precio
              )}
            </span>
          </p>

          <ul className="caracteristicas" aria-label="Características del producto">
            {producto.especificaciones.map((caracteristica) => (
              <li key={caracteristica}>{caracteristica}</li>
            ))}
          </ul>

          <p>
            Disponibilidad:{' '}
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
          </p>

          <form
            onSubmit={manejarEnvio}
            aria-label="Formulario para agregar producto al carrito"
            noValidate
          >
            <div className="campo-formulario">
              <label htmlFor="cantidad-producto">Cantidad:</label>

              <input
                type="number"
                id="cantidad-producto"
                name="cantidad"
                className="input-cantidad"
                min="1"
                max={producto.stock}
                value={cantidad}
                disabled={sinStock}
                onChange={(evento) => setCantidad(evento.target.value)}
                aria-describedby="error-cantidad"
                aria-invalid={errorCantidad ? 'true' : undefined}
              />

              <span id="error-cantidad" className="mensaje-error" role="alert">
                {errorCantidad}
              </span>
            </div>

            <button type="submit" className="boton-primario" disabled={sinStock}>
              {sinStock ? 'Sin stock' : agregado ? '¡Agregado!' : 'Agregar al carrito'}
            </button>
          </form>
        </div>
      </article>

      <EstadoVista
        cargando={!resultadoResenas}
        error={resultadoResenas?.error}
        textoCarga="Cargando reseñas..."
      >
        <ListaResenas resenas={resultadoResenas?.datos ?? []} />
      </EstadoVista>
    </div>
  )
}