import { useCallback, useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from '../admin/MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { anularPago, confirmarPago, obtenerPagosPorEstado } from '../../services/pagos.js'
import { formatearPrecio } from '../../utils/precios.js'
import { traducirError } from '../../utils/errores.js'

const ESTADOS = [
  { valor: 'APROBADO', texto: 'Aprobados' },
  { valor: 'RECHAZADO', texto: 'Rechazados' },
  { valor: 'ANULADO', texto: 'Anulados' }
]

const TEXTO_METODO = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  RECHAZO_PRUEBA: 'Tarjeta de prueba'
}

export default function PagosOperador() {
  const [estado, setEstado] = useState('APROBADO')
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(() => obtenerPagosPorEstado(estado), [estado])
  const { datos: pagos, cargando, error, recargar } = useCargaDatos(cargar)

  async function ejecutar(accion, pago, pregunta, texto) {
    if (!window.confirm(pregunta)) return
    try {
      await accion(pago.id)
      setMensaje({ tipo: 'exito', texto })
      recargar()
    } catch (errorAccion) {
      setMensaje({ tipo: 'error', texto: traducirError(errorAccion) })
    }
  }

  return (
    <section aria-labelledby="titulo-pagos-operador">
      <div className="cabecera-panel-admin">
        <h2 id="titulo-pagos-operador">Pagos</h2>
        <div className="campo-admin">
          <label htmlFor="estado-pagos-operador">Estado</label>
          <select id="estado-pagos-operador" className="form-select" value={estado} onChange={(evento) => setEstado(evento.target.value)}>
            {ESTADOS.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>)}
          </select>
        </div>
      </div>

      <MensajeAccion mensaje={mensaje} />

      <EstadoVista cargando={cargando} error={error} vacio={pagos.length === 0} textoVacio="No hay pagos en este estado." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Pago</th>
                <th scope="col">Orden</th>
                <th scope="col">Monto</th>
                <th scope="col">Método</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id}>
                  <td>
                    <strong>#{pago.id}</strong>
                    <small className="d-block">{new Date(pago.fecha).toLocaleString('es-CL')}</small>
                  </td>
                  <td>#{pago.ordenId}</td>
                  <td>{formatearPrecio(pago.monto)}</td>
                  <td>{TEXTO_METODO[pago.metodo] ?? pago.metodo}</td>
                  <td className="acciones-tabla">
                    {pago.estado === 'RECHAZADO' && (
                      <button
                        type="button"
                        className="boton-primario"
                        onClick={() => ejecutar(confirmarPago, pago, `¿Confirmar el pago #${pago.id}? La orden quedará pagada.`, `Pago #${pago.id} confirmado.`)}
                      >
                        Confirmar
                      </button>
                    )}
                    {pago.estado === 'APROBADO' && (
                      <button
                        type="button"
                        className="boton-peligro"
                        onClick={() => ejecutar(anularPago, pago, `¿Anular el pago #${pago.id}? La orden se cancelará.`, `Pago #${pago.id} anulado.`)}
                      >
                        Anular
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
