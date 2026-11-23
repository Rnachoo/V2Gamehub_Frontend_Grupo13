import { useCallback, useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from '../admin/MensajeAccion.jsx'
import FormularioDespacho from './FormularioDespacho.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { cambiarEstadoOrden, obtenerOrdenesPorEstado } from '../../services/ordenes.js'
import { formatearPrecio } from '../../utils/precios.js'
import { traducirError } from '../../utils/errores.js'

const ESTADOS = [
  { valor: 'PAGADA', texto: 'Pagadas' },
  { valor: 'PENDIENTE_PAGO', texto: 'Pendientes de pago' },
  { valor: 'CANCELADA', texto: 'Canceladas' }
]

export default function OrdenesOperador() {
  const [estado, setEstado] = useState('PAGADA')
  const [despachando, setDespachando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(() => obtenerOrdenesPorEstado(estado), [estado])
  const { datos: ordenes, cargando, error, recargar } = useCargaDatos(cargar)

  async function cancelar(orden) {
    if (!window.confirm(`¿Cancelar la orden #${orden.id}? El stock reservado vuelve al inventario.`)) return
    try {
      await cambiarEstadoOrden(orden.id, 'CANCELADA')
      setMensaje({ tipo: 'exito', texto: `Orden #${orden.id} cancelada.` })
      recargar()
    } catch (errorCancelar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorCancelar) })
    }
  }

  function despachoCreado(despacho) {
    setDespachando(null)
    setMensaje({ tipo: 'exito', texto: `Despacho #${despacho.id} generado para la orden #${despacho.ordenId}.` })
    recargar()
  }

  return (
    <section aria-labelledby="titulo-ordenes-operador">
      <div className="cabecera-panel-admin">
        <h2 id="titulo-ordenes-operador">Bandeja de órdenes</h2>
        <div className="campo-admin">
          <label htmlFor="estado-ordenes-operador">Estado</label>
          <select
            id="estado-ordenes-operador"
            className="form-select"
            value={estado}
            onChange={(evento) => {
              setDespachando(null)
              setEstado(evento.target.value)
            }}
          >
            {ESTADOS.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>
            ))}
          </select>
        </div>
      </div>

      <MensajeAccion mensaje={mensaje} />

      {despachando && (
        <FormularioDespacho
          key={despachando.id}
          orden={despachando}
          alCrear={despachoCreado}
          alCancelar={() => setDespachando(null)}
        />
      )}

      <EstadoVista
        cargando={cargando}
        error={error}
        vacio={ordenes.length === 0}
        textoVacio="No hay órdenes en este estado."
        alReintentar={recargar}
      >
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Orden</th>
                <th scope="col">Productos</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>
                    <strong>#{orden.id}</strong>
                    <small className="d-block">
                      Cliente #{orden.usuarioId} · {new Date(orden.fecha).toLocaleDateString('es-CL')}
                    </small>
                  </td>
                  <td>
                    {orden.productos.map((producto) => (
                      <small className="d-block" key={producto.productoId}>
                        {producto.cantidad}x {producto.nombre}
                      </small>
                    ))}
                  </td>
                  <td>{formatearPrecio(orden.total)}</td>
                  <td>
                    <span className="etiqueta-estado">{orden.estado}</span>
                    {orden.despacho?.tracking && <small className="d-block">{orden.despacho.tracking}</small>}
                  </td>
                  <td className="acciones-tabla">
                    {orden.estadoOrden === 'PAGADA' && (!orden.despacho || orden.despacho.estado === 'CANCELADO') && (
                      <button type="button" className="boton-primario" onClick={() => setDespachando(orden)}>
                        Generar despacho
                      </button>
                    )}
                    {orden.estadoOrden === 'PENDIENTE_PAGO' && (
                      <button type="button" className="boton-peligro" onClick={() => cancelar(orden)}>
                        Cancelar
                      </button>
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
