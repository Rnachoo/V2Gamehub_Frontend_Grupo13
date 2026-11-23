import { useEffect, useState } from 'react'
import { crearDespacho } from '../../services/despachos.js'
import { obtenerPerfil } from '../../services/ordenes.js'
import { traducirError } from '../../utils/errores.js'

const TRANSPORTISTAS = ['Starken', 'Chilexpress', 'Correos de Chile', 'Blue Express']

function textoDireccion(direccion) {
  if (!direccion) return ''
  const numero = direccion.numero === 'S/N' ? '' : ' ' + direccion.numero
  return `${direccion.calle}${numero}, ${direccion.comuna}, ${direccion.ciudad}`
}

export default function FormularioDespacho({ orden, alCrear, alCancelar }) {
  const [direcciones, setDirecciones] = useState([])
  const [datos, setDatos] = useState({ direccion: '', transportista: TRANSPORTISTAS[0], tracking: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    obtenerPerfil(orden.usuarioId)
      .then((perfil) => {
        if (!activo) return
        const lista = (perfil.directionsDTO ?? []).map(textoDireccion)
        setDirecciones(lista)
        setDatos((previos) => ({ ...previos, direccion: lista[lista.length - 1] ?? '' }))
      })
      .catch((errorPerfil) => activo && setError(traducirError(errorPerfil)))
    return () => {
      activo = false
    }
  }, [orden.usuarioId])

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (!datos.direccion.trim()) {
      setError('La dirección es obligatoria.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      alCrear(
        await crearDespacho({
          ordenId: orden.id,
          usuarioId: orden.usuarioId,
          direccion: datos.direccion.trim(),
          transportista: datos.transportista,
          tracking: datos.tracking.trim()
        })
      )
    } catch (errorCrear) {
      setError(traducirError(errorCrear))
      setGuardando(false)
    }
  }

  return (
    <form className="formulario-admin" onSubmit={enviar} aria-labelledby="titulo-nuevo-despacho">
      <h3 id="titulo-nuevo-despacho">Despacho de la orden #{orden.id}</h3>
      <div className="grid-formulario-admin">
        <div className="campo-admin">
          <label htmlFor="despacho-direccion">Dirección</label>
          <input
            id="despacho-direccion"
            name="direccion"
            className="form-control"
            list="despacho-direcciones"
            value={datos.direccion}
            onChange={cambiar}
          />
          <datalist id="despacho-direcciones">
            {direcciones.map((direccion) => <option key={direccion} value={direccion} />)}
          </datalist>
        </div>
        <div className="campo-admin">
          <label htmlFor="despacho-transportista">Transportista</label>
          <select id="despacho-transportista" name="transportista" className="form-select" value={datos.transportista} onChange={cambiar}>
            {TRANSPORTISTAS.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </select>
        </div>
        <div className="campo-admin">
          <label htmlFor="despacho-tracking">Número de seguimiento (opcional)</label>
          <input id="despacho-tracking" name="tracking" className="form-control" value={datos.tracking} onChange={cambiar} />
        </div>
      </div>

      {error && <p className="mensaje-accion mensaje-accion-error" role="alert">{error}</p>}

      <div className="acciones-admin">
        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Generar despacho'}
        </button>
        <button type="button" className="boton-secundario" onClick={alCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
