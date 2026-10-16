import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CarruselDestacados from '../components/CarruselDestacados.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { obtenerCategorias } from '../services/categorias.js'
import { obtenerProductos } from '../services/productos.js'
import { validarStock } from '../utils/carrito.js'

const CATEGORIAS_POPULARES = [
  'notebooks',
  'consolas',
  'tarjetas-graficas',
  'perifericos'
]

export default function Inicio() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [errorCarga, setErrorCarga] = useState('')
  const { lineas, agregar } = useCarrito()

  // Función para cargar los datos de Inicio
  useEffect(() => {
    let activo = true

    Promise.all([obtenerCategorias(), obtenerProductos()])
      .then(([listaCategorias, listaProductos]) => {
        if (activo) {
          setCategorias(listaCategorias)
          setProductos(listaProductos)
        }
      })
      .catch(() => {
        if (activo) {
          setErrorCarga('No se pudo cargar el contenido de Inicio.')
        }
      })

    return () => {
      activo = false
    }
  }, [])

  // Función para elegir las cuatro categorías populares
  const categoriasPopulares = CATEGORIAS_POPULARES
    .map((id) => categorias.find((categoria) => categoria.id === id))
    .filter(Boolean)

  // Función para agregar un producto sin superar su stock
  function agregarProducto(producto) {
    const linea = lineas.find(
      (item) => item.productoId === producto.id
    )
    const cantidadActual = linea ? linea.cantidad : 0

    if (validarStock(producto, cantidadActual + 1)) {
      agregar(producto, 1)
    }
  }

  return (
    <>
      <section className="hero-inicio">
        <div className="contenedor contenido-hero-inicio">
          <p className="etiqueta-seccion">Tu espacio gamer comienza aquí</p>
          <h1>Todo lo que necesitas para jugar</h1>
          <p>
            Descubre notebooks, componentes, consolas y accesorios seleccionados
            para mejorar tu experiencia.
          </p>
          <Link to="/catalogo" className="boton-primario">
            Explorar catálogo
          </Link>
        </div>
      </section>

      {errorCarga && (
        <p className="contenedor" role="alert">{errorCarga}</p>
      )}

      <section
        className="contenedor seccion-inicio"
        aria-labelledby="titulo-categorias"
      >
        <div className="cabecera-seccion-inicio">
          <p className="etiqueta-seccion">Encuentra lo que buscas</p>
          <h2 id="titulo-categorias">Categorías</h2>
        </div>

        <div className="grid-categorias">
          {categoriasPopulares.map((categoria) => {
            const producto = productos.find(
              (item) => item.categoria === categoria.id
            )

            return (
              <article className="categoria-destacada" key={categoria.id}>
                <div className="contenido-categoria">
                  <div>
                    <h3>{categoria.nombre}</h3>
                    <p>{categoria.descripcion}</p>
                  </div>

                  <Link
                    to={`/catalogo?categoria=${categoria.id}`}
                    className="enlace-categoria"
                  >
                    Ver productos →
                  </Link>
                </div>

                <div className="imagen-categoria">
                  {producto && (
                    <img
                      src={producto.imagenes[0]}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="contenedor seccion-inicio"
        aria-labelledby="titulo-destacados"
      >
        <div className="cabecera-seccion-inicio">
          <div>
            <p className="etiqueta-seccion">Descubre más</p>
            <h2 id="titulo-destacados">Explora productos</h2>
          </div>

          <Link to="/catalogo" className="boton-secundario">
            Ver todo el catálogo
          </Link>
        </div>

        <CarruselDestacados
          productos={productos}
          lineas={lineas}
          onAgregar={agregarProducto}
        />
      </section>
    </>
  )
}
