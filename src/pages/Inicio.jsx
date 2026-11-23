import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CarruselDestacados from '../components/CarruselDestacados.jsx'
import EstadoVista from '../components/estados/EstadoVista.jsx'
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
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0)
  const { lineas, agregar } = useCarrito()

  function reintentar() {
    setCargando(true)
    setErrorCarga(null)
    setIntento(intento + 1)
  }

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
      .catch((error) => {
        if (activo) setErrorCarga(error)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  // Función para elegir las cuatro categorías populares
  const categoriasPopulares = CATEGORIAS_POPULARES
    .map((id) => categorias.find((categoria) => categoria.id === id))
    .filter(Boolean)

  const destacados = productos.filter((producto) => producto.destacado)

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

      <section
        className="contenedor seccion-inicio"
        aria-labelledby="titulo-categorias"
      >
        <div className="cabecera-seccion-inicio">
          <p className="etiqueta-seccion">Encuentra lo que buscas</p>
          <h2 id="titulo-categorias">Categorías</h2>
        </div>

        <EstadoVista
          cargando={cargando}
          error={errorCarga}
          textoCarga="Cargando categorías..."
          alReintentar={reintentar}
        >
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
        </EstadoVista>
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

        {!cargando && !errorCarga && (
          <EstadoVista vacio={destacados.length === 0} textoVacio="Pronto tendremos productos destacados.">
            <CarruselDestacados
              productos={destacados}
              lineas={lineas}
              onAgregar={agregarProducto}
            />
          </EstadoVista>
        )}
      </section>

      <section
        className="contenedor seccion-inicio seccion-video"
        aria-labelledby="titulo-video"
      >
        <div className="contenido-video-inicio">
          <p className="etiqueta-seccion">Vive la experiencia</p>
          <h2 id="titulo-video">El juego comienza en GameHub</h2>
          <p>
            Conoce nuevas formas de jugar y prepara tu espacio con la
            tecnología que necesitas.
          </p>
        </div>

        <div className="video-inicio">
          <iframe
            src="https://www.youtube.com/embed/rz1B4B2yBZY"
            title="Tráiler de Grand Theft Auto VI"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>
    </>
  )
}