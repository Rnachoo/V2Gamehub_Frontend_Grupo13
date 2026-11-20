import { useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from './MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { moderarResena, obtenerResenasParaModerar } from '../../services/moderacion.js'
import { obtenerTodosLosProductos } from '../../services/productos.js'
import { traducirError } from '../../utils/errores.js'

export default function ResenasAdmin() {
  const productos = useCargaDatos(obtenerTodosLosProductos)
  const [productoId, setProductoId] = useState('')
  const [resenas, setResenas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  async function cargarResenas(id) {
    setCargando(true)
    setError(null)
    try {
      setResenas(await obtenerResenasParaModerar(id))
    } catch (errorCarga) {
      setError(errorCarga)
    } finally {
      setCargando(false)
    }
  }

  function elegirProducto(id) {
    setProductoId(id)
    if (id) cargarResenas(id)
  }

  async function moderar(resena) {
    if (!window.confirm('¿Ocultar esta reseña del sitio?')) return
    try {
      await moderarResena(resena.id)
      setMensaje({ tipo: 'exito', texto: 'Reseña moderada.' })
      cargarResenas(productoId)
    } catch (errorModerar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorModerar) })
    }
  }

  return (
    <section aria-labelledby="titulo-resenas-admin">
      <h2 id="titulo-resenas-admin">Moderación de reseñas</h2>
      <MensajeAccion mensaje={mensaje} />

      <EstadoVista cargando={productos.cargando} error={productos.error} alReintentar={productos.recargar}>
        <div className="campo-admin selector-producto-admin">
          <label htmlFor="resenas-producto">Primero elige un producto</label>
          <select id="resenas-producto" className="form-select" value={productoId} onChange={(evento) => elegirProducto(evento.target.value)}>
            <option value="">Selecciona un producto</option>
            {productos.datos.map((producto) => (
              <option key={producto.id} value={producto.id}>{producto.nombre}</option>
            ))}
          </select>
        </div>
      </EstadoVista>

      {productoId && (
        <EstadoVista cargando={cargando} error={error} vacio={resenas.length === 0} textoVacio="Este producto no tiene reseñas." alReintentar={() => cargarResenas(productoId)}>
          <ul className="lista-resenas-admin">
            {resenas.map((resena) => (
              <li key={resena.id} className={resena.visible ? '' : 'resena-oculta'}>
                <div>
                  <strong>{resena.autor}</strong> · {'★'.repeat(resena.puntuacion)} · <small>{resena.fecha}</small>
                  <p>{resena.comentario}</p>
                </div>
                {resena.visible
                  ? <button type="button" className="boton-peligro" onClick={() => moderar(resena)}>Ocultar</button>
                  : <span className="etiqueta-estado estado-inactivo">Moderada</span>}
              </li>
            ))}
          </ul>
        </EstadoVista>
      )}
    </section>
  )
}
