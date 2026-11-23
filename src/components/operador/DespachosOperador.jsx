import { useCallback, useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from '../admin/MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { actualizarDespacho, cancelarDespacho, obtenerDespachosPorEstado } from '../../services/despachos.js'
import { ESTADOS_DESPACHO } from '../../services/ordenes.js'
import { traducirError } from '../../utils/errores.js'

const ESTADOS = ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']

const SIGUIENTE = {
  PENDIENTE: { estado: 'EN_CAMINO', texto: 'Marcar en camino' },
  EN_CAMINO: { estado: 'ENTREGADO', texto: 'Marcar entregado' }
}

export default function DespachosOperador() {
  const [estado, setEstado] = useState('PENDIENTE')
  const [trackings, setTrackings] = useState({})
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(() => obtenerDespachosPorEstado(estado), [estado])
  const { datos: despachos, cargando, error, recargar } = useCargaDatos(cargar)

  async function avanzar(despacho) {
    const siguiente = SIGUIENTE[despacho.estado]
    const tracking = (trackings[despacho.id] ?? '').trim()
    if (siguiente.estado === 'EN_CAMINO' && !despacho.tracking && !tracking) {
      setMensaje({ tipo: 'error', texto: 'Ingresa el número de seguimiento antes de enviarlo.' })
      return
    }
    try {
      await actualizarDespacho(despacho.id, siguiente.estado, despacho.tracking ? '' : tracking)
      setMensaje({ tipo: 'exito', texto: `Despacho #${despacho.id}: ${ESTADOS_DESPACHO[siguiente.estado]}.` })
      recargar()
    } catch (errorAvance) {
      setMensaje({ tipo: 'error', texto: traducirError(errorAvance) })
    }
  }

  async function cancelar(despacho) {
    if (!window.confirm(`¿Cancelar el despacho #${despacho.id}?`)) return
    try {
      await cancelarDespacho(despacho.id)
      setMensaje({ tipo: 'exito', texto: `Despacho #${despacho.id} cancelado.` })
      recargar()
    } catch (errorCancelar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorCancelar) })
    }
  }

  return (
    <section aria-labelledby="titulo-despachos-operador">
      <div className="cabecera-panel-admin">
        <h2 id="titulo-despachos-operador">Despachos</h2>
        <div className="campo-admin">
          <label htmlFor="estado-despachos-operador">Estado</label>
          <select id="estado-despachos-operador" className="form-select" value={estado} onChange={(evento) => setEstado(evento.target.value)}>
            {ESTADOS.map((valor) => <option key={valor} value={valor}>{ESTADOS_DESPACHO[valor]}</option>)}
          </select>
        </div>
      </div>

      <MensajeAccion mensaje={mensaje} />

      <EstadoVista cargando={cargando} error={error} vacio={despachos.length === 0} textoVacio="No hay despachos en este estado." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin tabla-operador align-middle">
            <thead>
              <tr>
                <th scope="col">Despacho</th>
                <th scope="col">Dirección</th>
                <th scope="col">Seguimiento</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {despachos.map((despacho) => (
                <tr key={despacho.id}>
                  <td>
                    <strong>#{despacho.id}</strong>
                    <small className="d-block">Orden #{despacho.ordenId} · {despacho.transportista}</small>
                  </td>
                  <td data-label="Dirección">{despacho.direccion}</td>
                  <td data-label="Seguimiento">
                    {despacho.tracking || (despacho.estado === 'PENDIENTE' && (
                      <input
                        className="form-control"
                        aria-label={`Número de seguimiento del despacho #${despacho.id}`}
                        placeholder="Ej: STK-12345"
                        value={trackings[despacho.id] ?? ''}
                        onChange={(evento) => setTrackings({ ...trackings, [despacho.id]: evento.target.value })}
                      />
                    )) || '—'}
                  </td>
                  <td className="acciones-tabla" data-label="Acciones">
                    {SIGUIENTE[despacho.estado] && (
                      <button type="button" className="boton-primario" onClick={() => avanzar(despacho)}>
                        {SIGUIENTE[despacho.estado].texto}
                      </button>
                    )}
                    {SIGUIENTE[despacho.estado] && (
                      <button type="button" className="boton-peligro" onClick={() => cancelar(despacho)}>
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
