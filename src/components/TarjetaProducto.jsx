import { Link } from 'react-router-dom'
import {
  obtenerPrecioActual,
  calcularPorcentajeDescuento,
  formatearPrecio
} from '../utils/precios.js'

export default function TarjetaProducto({
  producto,
  onAgregar,
  cantidadEnCarrito = 0
}) {
  const precioActual = obtenerPrecioActual(producto)
  const descuento = calcularPorcentajeDescuento(producto)

  const sinStock = producto.stock === 0
  const stockMaximo = cantidadEnCarrito >= producto.stock
  const botonDeshabilitado = sinStock || stockMaximo

  // La disponibilidad no cambia al agregar al carrito.
  const textoStock = sinStock
    ? 'Producto sin stock'
    : `${producto.stock} unidades disponibles`

  let textoBoton = 'Agregar al carrito'

  if (sinStock) {
    textoBoton = 'Sin stock'
  } else if (stockMaximo) {
    textoBoton = 'Stock máximo alcanzado'
  }

  return (
    <article className="tarjeta tarjeta-producto">
      <Link
        to={`/producto/${producto.id}`}
        className="enlace-imagen-producto"
        aria-label={`Ver detalle de ${producto.nombre}`}
      >
        <img
          src={producto.imagenes[0]}
          alt={producto.nombre}
          className="imagen-tarjeta-producto"
          loading="lazy"
        />

        {descuento > 0 && (
          <span className="etiqueta-descuento">
            -{descuento}%
          </span>
        )}
      </Link>

      <div className="contenido-tarjeta-producto">
        <p className="marca-producto">
          {producto.marca}
        </p>

        <h3>
          <Link to={`/producto/${producto.id}`}>
            {producto.nombre}
          </Link>
        </h3>

        <p className="stock-producto">
          {textoStock}
        </p>

        <div className="precios-producto">
          {producto.precioDescuento != null && (
            <span className="precio-anterior">
              {formatearPrecio(producto.precio)}
            </span>
          )}

          <span className="precio-actual">
            {formatearPrecio(precioActual)}
          </span>
        </div>

        <div className="acciones-producto">
          <Link
            to={`/producto/${producto.id}`}
            className="boton-secundario"
          >
            Ver producto
          </Link>

          <button
            type="button"
            className="boton-primario boton-agregar-producto"
            disabled={botonDeshabilitado}
            onClick={() => onAgregar(producto)}
          >
            {textoBoton}
          </button>
        </div>
      </div>
    </article>
  )
}