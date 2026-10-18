import TarjetaProducto from './TarjetaProducto.jsx'

// Función para mostrar una tarjeta por cada producto
export default function ListaProductos({
  productos,
  lineas,
  onAgregar
}) {
  return (
    <div className="grid-productos">
      {productos.map((producto) => {
        const linea = lineas.find(
          (item) => item.productoId === producto.id
        )

        const cantidadEnCarrito = linea ? linea.cantidad : 0

        return (
          <TarjetaProducto
            key={producto.id}
            producto={producto}
            cantidadEnCarrito={cantidadEnCarrito}
            onAgregar={onAgregar}
          />
        )
      })}
    </div>
  )
}