import { useCallback, useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import FormularioProducto from './FormularioProducto.jsx'
import MensajeAccion from './MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { obtenerTodasLasCategorias } from '../../services/categorias.js'
import { actualizarProducto, crearProducto, desactivarProducto, obtenerTodosLosProductos } from '../../services/productos.js'
import { erroresDeCampos, traducirError } from '../../utils/errores.js'
import { formatearPrecio } from '../../utils/precios.js'

export default function ProductosAdmin() {
  const cargar = useCallback(
    () => Promise.all([obtenerTodosLosProductos(), obtenerTodasLasCategorias()]),
    []
  )
  const { datos: [productos, categorias] = [[], []], cargando, error, recargar } = useCargaDatos(cargar, [[], []])
  const [edicion, setEdicion] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [erroresServidor, setErroresServidor] = useState({})
  const [mensaje, setMensaje] = useState(null)

  function abrir(producto) {
    setErroresServidor({})
    setMensaje(null)
    setEdicion({ producto })
  }

  async function guardar(valores) {
    setGuardando(true)
    try {
      if (edicion.producto) {
        await actualizarProducto(edicion.producto.id, valores)
      } else {
        await crearProducto(valores)
      }
      setMensaje({ tipo: 'exito', texto: 'Producto guardado correctamente.' })
      setEdicion(null)
      recargar()
    } catch (errorGuardar) {
      setErroresServidor(erroresDeCampos(errorGuardar))
      setMensaje({ tipo: 'error', texto: traducirError(errorGuardar) })
    } finally {
      setGuardando(false)
    }
  }

  async function desactivar(producto) {
    if (!window.confirm(`¿Desactivar "${producto.nombre}"? Dejará de verse en el catálogo.`)) return
    try {
      await desactivarProducto(producto.id)
      setMensaje({ tipo: 'exito', texto: 'Producto desactivado.' })
      recargar()
    } catch (errorDesactivar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorDesactivar) })
    }
  }

  return (
    <section aria-labelledby="titulo-productos-admin">
      <div className="cabecera-panel-admin">
        <h2 id="titulo-productos-admin">Productos</h2>
        {!edicion && (
          <button type="button" className="boton-primario" onClick={() => abrir(null)}>
            Nuevo producto
          </button>
        )}
      </div>

      <MensajeAccion mensaje={mensaje} />

      {edicion && (
        <FormularioProducto
          key={edicion.producto?.id ?? 'nuevo'}
          producto={edicion.producto}
          categorias={categorias}
          erroresServidor={erroresServidor}
          guardando={guardando}
          alGuardar={guardar}
          alCancelar={() => setEdicion(null)}
        />
      )}

      <EstadoVista cargando={cargando} error={error} vacio={productos.length === 0} textoVacio="Aún no hay productos." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Stock</th>
                <th scope="col">Estado</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <strong>{producto.nombre}</strong>
                    <small className="d-block">{producto.marca}{producto.destacado ? ' · Destacado' : ''}</small>
                  </td>
                  <td>{categorias.find((categoria) => categoria.idBackend === producto.categoriaIdBackend)?.nombre ?? '—'}</td>
                  <td>
                    {formatearPrecio(producto.precioDescuento ?? producto.precio)}
                    {producto.precioDescuento != null && <small className="d-block precio-anterior">{formatearPrecio(producto.precio)}</small>}
                  </td>
                  <td>{producto.stock}</td>
                  <td>
                    <span className={`etiqueta-estado ${producto.activo ? 'estado-activo' : 'estado-inactivo'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="acciones-tabla">
                    <button type="button" className="boton-secundario" onClick={() => abrir(producto)}>Editar</button>
                    {producto.activo && (
                      <button type="button" className="boton-peligro" onClick={() => desactivar(producto)}>Desactivar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EstadoVista>
    </section>
  )
}
