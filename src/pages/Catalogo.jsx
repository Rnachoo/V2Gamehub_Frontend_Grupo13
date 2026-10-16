import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FiltroCatalogo from '../components/FiltroCatalogo.jsx'
import ListaProductos from '../components/ListaProductos.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { obtenerCategorias } from '../services/categorias.js'
import { obtenerProductos } from '../services/productos.js'
import { validarStock } from '../utils/carrito.js'
import { obtenerPrecioActual } from '../utils/precios.js'

const PRODUCTOS_POR_CARGA = 6

const FILTROS_VACIOS = {
  busqueda: '',
  categoria: '',
  marca: '',
  precioMinimo: '',
  precioMaximo: '',
  soloConStock: false
}

export default function Catalogo() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorPrecios, setErrorPrecios] = useState('')
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VACIOS)
  const [cantidadVisible, setCantidadVisible] = useState(PRODUCTOS_POR_CARGA)
  const [orden, setOrden] = useState('destacados')
  const { lineas, agregar } = useCarrito()

  // Función para cargar productos y categorías al abrir el catálogo
  useEffect(() => {
    let activo = true

    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([listaProductos, listaCategorias]) => {
        if (activo) {
          setProductos(listaProductos)
          setCategorias(listaCategorias)
          setCargando(false)
        }
      })
      .catch(() => {
        if (activo) {
          setErrorCarga('No se pudo cargar el catálogo.')
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [])

  // Función para comprobar el rango antes de aplicar los filtros
  function aplicarFiltros() {
    const minimo = filtros.precioMinimo === ''
      ? 0
      : Number(filtros.precioMinimo)
    const maximo = filtros.precioMaximo === ''
      ? Infinity
      : Number(filtros.precioMaximo)

    if (minimo > maximo) {
      setErrorPrecios('El precio mínimo no puede superar al máximo.')
      return
    }

    setErrorPrecios('')
    setFiltrosAplicados({ ...filtros })
    setCantidadVisible(PRODUCTOS_POR_CARGA)
  }

  // Función para volver a mostrar todos los productos
  function limpiarFiltros() {
    setFiltros({ ...FILTROS_VACIOS })
    setFiltrosAplicados({ ...FILTROS_VACIOS })
    setErrorPrecios('')
    setCantidadVisible(PRODUCTOS_POR_CARGA)
    setOrden('destacados')
  }

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

  // Función para obtener las marcas disponibles sin repetirlas
  const marcas = [...new Set(productos.map(
    (producto) => producto.marca
  ))].sort((marcaA, marcaB) => marcaA.localeCompare(marcaB, 'es'))

  // Función para mostrar únicamente los productos que cumplen los filtros
  const productosFiltrados = productos.filter((producto) => {
    const textoBuscado = filtrosAplicados.busqueda.trim().toLowerCase()
    const nombreYMarca = `${producto.nombre} ${producto.marca}`.toLowerCase()
    const minimo = filtrosAplicados.precioMinimo === ''
      ? 0
      : Number(filtrosAplicados.precioMinimo)
    const maximo = filtrosAplicados.precioMaximo === ''
      ? Infinity
      : Number(filtrosAplicados.precioMaximo)
    const precio = obtenerPrecioActual(producto)

    return (
      nombreYMarca.includes(textoBuscado) &&
      (filtrosAplicados.categoria === '' ||
        producto.categoria === filtrosAplicados.categoria) &&
      (filtrosAplicados.marca === '' ||
        producto.marca === filtrosAplicados.marca) &&
      precio >= minimo &&
      precio <= maximo &&
      (!filtrosAplicados.soloConStock || producto.stock > 0)
    )
  })

  // Función para ordenar los productos filtrados
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === 'precio-ascendente') {
      return obtenerPrecioActual(a) - obtenerPrecioActual(b)
    }

    if (orden === 'precio-descendente') {
      return obtenerPrecioActual(b) - obtenerPrecioActual(a)
    }

    if (orden === 'nombre-ascendente') {
      return a.nombre.localeCompare(b.nombre, 'es')
    }

    if (orden === 'nombre-descendente') {
      return b.nombre.localeCompare(a.nombre, 'es')
    }

    return Number(b.destacado) - Number(a.destacado)
  })

  // Función para mostrar los productos por tandas de seis
  const productosVisibles = productosOrdenados.slice(0, cantidadVisible)

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Catálogo</span>
      </nav>

      <section className="cabecera-catalogo">
        <p className="etiqueta-seccion">Todos los productos</p>
        <h1>Encuentra tu próximo producto</h1>
        <p>
          Explora notebooks, componentes, consolas, periféricos y accesorios
          para tu espacio gamer.
        </p>
      </section>

      <div className="distribucion-catalogo">
        <FiltroCatalogo
          filtros={filtros}
          categorias={categorias}
          marcas={marcas}
          errorPrecios={errorPrecios}
          alCambiar={setFiltros}
          alAplicar={aplicarFiltros}
          alLimpiar={limpiarFiltros}
        />

        <section className="resultados-catalogo" aria-labelledby="titulo-productos">
          <div className="barra-resultados">
            <h2 id="titulo-productos">Productos</h2>

            {!cargando && !errorCarga && (
              <p>{productosFiltrados.length} productos encontrados</p>
            )}

            <div className="control-orden">
              <label htmlFor="orden-productos">Ordenar por</label>
              <select
                id="orden-productos"
                value={orden}
                onChange={(evento) => {
                  setOrden(evento.target.value)
                  setCantidadVisible(PRODUCTOS_POR_CARGA)
                }}
              >
                <option value="destacados">Productos destacados</option>
                <option value="precio-ascendente">Precio: menor a mayor</option>
                <option value="precio-descendente">Precio: mayor a menor</option>
                <option value="nombre-ascendente">Nombre: A a Z</option>
                <option value="nombre-descendente">Nombre: Z a A</option>
              </select>
            </div>
          </div>

          {cargando && <p>Cargando productos...</p>}
          {errorCarga && <p role="alert">{errorCarga}</p>}

          {!cargando && !errorCarga && (
            <>
              {productosFiltrados.length > 0 ? (
                <>
                  <ListaProductos
                    productos={productosVisibles}
                    lineas={lineas}
                    onAgregar={agregarProducto}
                  />

                  {cantidadVisible < productosFiltrados.length && (
                    <button
                      type="button"
                      className="boton-secundario boton-cargar-mas"
                      onClick={() => setCantidadVisible(
                        cantidadVisible + PRODUCTOS_POR_CARGA
                      )}
                    >
                      Cargar más productos
                    </button>
                  )}
                </>
              ) : (
                <div className="estado-vacio">
                  <p>No encontramos productos con esos filtros.</p>
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}