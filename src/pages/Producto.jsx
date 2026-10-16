import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PRODUCTOS } from '../data/datos-productos'
import { obtenerResenasPorProducto } from '../services/resenas'
import { useCarrito } from '../context/CarritoContext'
import { validarStock } from '../utils/carrito'
import ListaResenas from '../components/producto/ListaResenas'
import '../styles/producto.css'

const formatoPeso = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export default function Producto() {
  const id = Number(useParams().id)
  const producto = PRODUCTOS.find((p) => p.id === id)
  const { lineas, agregar } = useCarrito()
  const [resenas, setResenas] = useState([])
  const [cantidad, setCantidad] = useState('1')
  const [error, setError] = useState('')
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    let activo = true
    obtenerResenasPorProducto(id).then((lista) => {
      if (activo) setResenas(lista)
    })
    return () => {
      activo = false
    }
  }, [id])

  if (!producto) {
    return (
      <div className="contenedor">
        <p className="mt-4">
          No encontramos ese producto. Vuelve al <Link to="/catalogo">catálogo</Link>.
        </p>
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
      setError('Ingresa una cantidad válida (un número entero mayor a 0).')
      return
    }

    const linea = lineas.find((l) => l.productoId === producto.id)
    const enCarrito = linea ? linea.cantidad : 0

    if (!validarStock(producto, unidades + enCarrito)) {
      setError('Solo quedan ' + (producto.stock - enCarrito) + ' unidades disponibles.')
      return
    }

    setError('')
    agregar(producto, unidades)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  return (
    <div className="contenedor">
      <nav aria-label="Ruta de navegación" className="ruta-navegacion">
        <Link to="/">Inicio</Link> &gt; <Link to="/catalogo">Catálogo</Link> &gt;{' '}
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
              <span className="precio-tachado">{formatoPeso.format(producto.precio)}</span>
            )}
            <span className={tieneDescuento ? 'precio-descuento' : undefined}>
              {formatoPeso.format(tieneDescuento ? producto.precioDescuento : producto.precio)}
            </span>
          </p>

          <ul className="caracteristicas" aria-label="Características del producto">
            {producto.especificaciones.map((caracteristica) => (
              <li key={caracteristica}>{caracteristica}</li>
            ))}
          </ul>

          <p>
            Disponibilidad: {producto.stock > 0 ? producto.stock + ' disponibles' : 'Agotado'}
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
                aria-invalid={error ? 'true' : undefined}
              />
              <span id="error-cantidad" className="mensaje-error" role="alert" aria-live="polite">
                {error}
              </span>
            </div>

            <button type="submit" className="boton-primario" disabled={sinStock}>
              {sinStock ? 'Sin stock' : agregado ? '¡Agregado!' : 'Agregar al carrito'}
            </button>
          </form>
        </div>
      </article>

      <ListaResenas resenas={resenas} />
    </div>
  )
}