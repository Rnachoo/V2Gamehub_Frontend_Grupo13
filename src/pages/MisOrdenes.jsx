import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { servicioOrdenes } from '../services/ordenes'
import { formatearPrecio } from '../utils/precios'

const CLASES_ESTADO = {
  'En camino': 'estado-camino',
  Entregado: 'estado-entregado'
}

export default function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    servicioOrdenes.obtenerOrdenes().then((lista) => {
      if (activo) {
        setOrdenes(lista)
        setCargando(false)
      }
    })
    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="contenedor">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Mis órdenes</span>
      </nav>

      <section className="seccion-ordenes" aria-labelledby="titulo-ordenes">
        <div className="cabecera-mis-ordenes">
          <h1 id="titulo-ordenes">Mis órdenes</h1>
          <p>Revisa el historial y estado de tus compras.</p>
        </div>

        {cargando && <p>Cargando órdenes...</p>}

        {!cargando && ordenes.length === 0 && (
          <div className="sin-ordenes">
            <p>
              Aún no has realizado ninguna compra. <Link to="/catalogo">Ir al catálogo</Link>
            </p>
          </div>
        )}

        <div className="lista-ordenes">
          {ordenes.map((orden) => (
            <article key={orden.id} className="tarjeta-orden" aria-labelledby={'orden-' + orden.id}>
              <div className="cabecera-orden">
                <div className="datos-orden">
                  <h2 id={'orden-' + orden.id}>Orden #{orden.id}</h2>
                  <p className="fecha-orden">
                    Realizada el {new Date(orden.fecha).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span className={'estado-orden ' + (CLASES_ESTADO[orden.estado] || '')}>
                  {orden.estado}
                </span>
              </div>

              <div className="cuerpo-orden">
                <ul className="productos-orden" aria-label={'Productos de la orden #' + orden.id}>
                  {orden.productos.map((producto) => (
                    <li key={producto.productoId}>
                      {producto.cantidad}x {producto.nombre}
                    </li>
                  ))}
                </ul>

                <div className="total-orden">
                  <span>Total de la orden</span>
                  <strong>{formatearPrecio(orden.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
