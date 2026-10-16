import TarjetaProducto from './TarjetaProducto.jsx'

// Función para mostrar cuatro productos por diapositiva de Bootstrap
export default function CarruselDestacados({ productos, lineas, onAgregar }) {
  if (productos.length === 0) return null

  const cantidadPorGrupo = Math.min(4, productos.length)
  const grupos = Array.from(
    { length: Math.ceil(productos.length / cantidadPorGrupo) },
    (_, indiceGrupo) => Array.from(
      { length: cantidadPorGrupo },
      (_, desplazamiento) => productos[(indiceGrupo * cantidadPorGrupo + desplazamiento) % productos.length]
    )
  )

  return (
    <div id="carrusel-destacados" className="carousel slide carrusel-destacados" data-bs-interval="false" aria-label="Productos del catálogo">
      <div className="carousel-inner">
        {grupos.map((grupo, indiceGrupo) => (
          <div className={`carousel-item${indiceGrupo === 0 ? ' active' : ''}`} key={indiceGrupo}>
            <div className="carrusel-grupo">
              {grupo.map((producto) => {
                const linea = lineas.find((item) => item.productoId === producto.id)
                const cantidadEnCarrito = linea ? linea.cantidad : 0

                return (
                  <div className="carrusel-tarjeta" key={producto.id}>
                    <TarjetaProducto producto={producto} cantidadEnCarrito={cantidadEnCarrito} onAgregar={onAgregar} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {grupos.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#carrusel-destacados" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Productos anteriores</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carrusel-destacados" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Productos siguientes</span>
          </button>
        </>
      )}
    </div>
  )
}
