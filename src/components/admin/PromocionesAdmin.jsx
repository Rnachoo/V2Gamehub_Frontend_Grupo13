import { useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from './MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { actualizarVigencia, crearPromocion, desactivarPromocion, obtenerPromociones } from '../../services/promociones.js'
import { erroresDeCampos, traducirError } from '../../utils/errores.js'
import { formatearPrecio } from '../../utils/precios.js'

const hoy = () => new Date().toISOString().slice(0, 10)

const VACIO = {
  codigo: '',
  tipo: 'PORCENTAJE',
  valor: '',
  tope: '',
  montoMinimo: '0',
  usosMaximos: '100',
  fechaInicio: hoy(),
  fechaFin: ''
}

function validar(valores) {
  const errores = {}
  const valor = Number(valores.valor)

  if (!/^[A-Za-z0-9]{3,20}$/.test(valores.codigo.trim())) {
    errores.codigo = 'Usa entre 3 y 20 letras o números, sin espacios.'
  }
  if (!(valor > 0)) errores.valor = 'El valor debe ser mayor que cero.'
  if (valores.tipo === 'PORCENTAJE' && valor > 100) errores.valor = 'Un porcentaje no puede superar 100.'
  if (valores.tope !== '' && !(Number(valores.tope) > 0)) errores.tope = 'El tope debe ser mayor que cero.'
  if (!Number.isInteger(Number(valores.usosMaximos)) || Number(valores.usosMaximos) < 1) {
    errores.usosMaximos = 'Debe permitir al menos un uso.'
  }
  if (!valores.fechaInicio) errores.fechaInicio = 'Indica la fecha de inicio.'
  if (!valores.fechaFin) {
    errores.fechaFin = 'Indica la fecha de término.'
  } else if (valores.fechaFin < valores.fechaInicio) {
    errores.fechaFin = 'La fecha de término no puede ser anterior a la de inicio.'
  }
  return errores
}

function describirDescuento(promocion) {
  const descuento = promocion.tipo === 'PORCENTAJE' ? `${promocion.valor} %` : formatearPrecio(promocion.valor)
  return promocion.tope ? `${descuento} (tope ${formatearPrecio(promocion.tope)})` : descuento
}

export default function PromocionesAdmin() {
  const { datos: promociones, cargando, error, recargar } = useCargaDatos(obtenerPromociones)
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [vigencia, setVigencia] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  function cambiar(evento) {
    setValores({ ...valores, [evento.target.name]: evento.target.value })
  }

  async function crear(evento) {
    evento.preventDefault()
    const nuevosErrores = validar(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    try {
      await crearPromocion(valores)
      setMensaje({ tipo: 'exito', texto: `Cupón ${valores.codigo.toUpperCase()} creado.` })
      setValores(VACIO)
      recargar()
    } catch (errorCrear) {
      setErrores(erroresDeCampos(errorCrear))
      setMensaje({ tipo: 'error', texto: traducirError(errorCrear) })
    }
  }

  async function guardarVigencia(evento) {
    evento.preventDefault()
    if (vigencia.fechaFin < vigencia.fechaInicio) {
      setMensaje({ tipo: 'error', texto: 'La fecha de término no puede ser anterior a la de inicio.' })
      return
    }
    try {
      await actualizarVigencia(vigencia.id, vigencia.fechaInicio, vigencia.fechaFin)
      setMensaje({ tipo: 'exito', texto: 'Vigencia actualizada.' })
      setVigencia(null)
      recargar()
    } catch (errorVigencia) {
      setMensaje({ tipo: 'error', texto: traducirError(errorVigencia) })
    }
  }

  async function desactivar(promocion) {
    if (!window.confirm(`¿Desactivar el cupón ${promocion.codigo}?`)) return
    try {
      await desactivarPromocion(promocion.id)
      setMensaje({ tipo: 'exito', texto: 'Cupón desactivado.' })
      recargar()
    } catch (errorDesactivar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorDesactivar) })
    }
  }

  function campo(nombre, etiqueta, props = {}) {
    return (
      <div className="campo-admin">
        <label htmlFor={`promocion-${nombre}`}>{etiqueta}</label>
        <input id={`promocion-${nombre}`} name={nombre} className="form-control" value={valores[nombre]} onChange={cambiar} aria-invalid={Boolean(errores[nombre])} {...props} />
        {errores[nombre] && <span className="mensaje-error">{errores[nombre]}</span>}
      </div>
    )
  }

  return (
    <section aria-labelledby="titulo-promociones-admin">
      <h2 id="titulo-promociones-admin">Promociones y cupones</h2>
      <MensajeAccion mensaje={mensaje} />

      <form className="formulario-admin" onSubmit={crear} noValidate>
        <h3>Nuevo cupón</h3>
        <div className="grid-formulario-admin">
          {campo('codigo', 'Código')}
          <div className="campo-admin">
            <label htmlFor="promocion-tipo">Tipo</label>
            <select id="promocion-tipo" name="tipo" className="form-select" value={valores.tipo} onChange={cambiar}>
              <option value="PORCENTAJE">Porcentaje</option>
              <option value="FIJO">Monto fijo</option>
            </select>
          </div>
          {campo('valor', valores.tipo === 'PORCENTAJE' ? 'Descuento (%)' : 'Descuento (CLP)', { type: 'number', min: 1 })}
          {campo('tope', 'Tope de descuento en CLP (opcional)', { type: 'number', min: 1 })}
          {campo('montoMinimo', 'Compra mínima (CLP)', { type: 'number', min: 0 })}
          {campo('usosMaximos', 'Tope de usos', { type: 'number', min: 1, step: 1 })}
          {campo('fechaInicio', 'Inicio', { type: 'date' })}
          {campo('fechaFin', 'Término', { type: 'date', min: valores.fechaInicio })}
        </div>
        <div className="acciones-admin">
          <button type="submit" className="boton-primario">Crear cupón</button>
        </div>
      </form>

      {vigencia && (
        <form className="formulario-admin formulario-en-linea" onSubmit={guardarVigencia}>
          <h3>Vigencia de {vigencia.codigo}</h3>
          <div className="campo-admin">
            <label htmlFor="vigencia-inicio">Inicio</label>
            <input id="vigencia-inicio" type="date" className="form-control" value={vigencia.fechaInicio} onChange={(evento) => setVigencia({ ...vigencia, fechaInicio: evento.target.value })} required />
          </div>
          <div className="campo-admin">
            <label htmlFor="vigencia-fin">Término</label>
            <input id="vigencia-fin" type="date" className="form-control" min={vigencia.fechaInicio} value={vigencia.fechaFin} onChange={(evento) => setVigencia({ ...vigencia, fechaFin: evento.target.value })} required />
          </div>
          <div className="acciones-admin">
            <button type="submit" className="boton-primario">Guardar vigencia</button>
            <button type="button" className="boton-secundario" onClick={() => setVigencia(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <EstadoVista cargando={cargando} error={error} vacio={promociones.length === 0} textoVacio="Aún no hay cupones." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Descuento</th>
                <th scope="col">Vigencia</th>
                <th scope="col">Usos restantes</th>
                <th scope="col">Estado</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {promociones.map((promocion) => (
                <tr key={promocion.id}>
                  <td><strong>{promocion.codigo}</strong></td>
                  <td>{describirDescuento(promocion)}</td>
                  <td>{promocion.fechaInicio} al {promocion.fechaFin}</td>
                  <td>{promocion.usosRestantes}</td>
                  <td>
                    <span className={`etiqueta-estado ${promocion.activa ? 'estado-activo' : 'estado-inactivo'}`}>
                      {promocion.activa ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="acciones-tabla">
                    <button type="button" className="boton-secundario" onClick={() => setVigencia(promocion)}>Vigencia</button>
                    {promocion.activa && (
                      <button type="button" className="boton-peligro" onClick={() => desactivar(promocion)}>Desactivar</button>
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
