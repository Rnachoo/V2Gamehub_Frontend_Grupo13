import { useState } from 'react'
import { crearResena } from '../../services/resenas'
import { traducirError } from '../../utils/errores'

const MAX_COMENTARIO = 500

export default function FormularioResena({ usuarioId, ordenId, producto, onEnviada, onCancelar }) {
  const [puntuacion, setPuntuacion] = useState('5')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const prefijo = `resena-${ordenId}-${producto.productoId}`

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await crearResena({
        usuarioId,
        ordenId,
        productoId: producto.productoId,
        puntuacion: Number(puntuacion),
        comentario: comentario.trim()
      })
      onEnviada()
    } catch (errorEnvio) {
      setError(traducirError(errorEnvio))
      setEnviando(false)
    }
  }

  return (
    <form className="formulario-resena" onSubmit={enviar} aria-label={'Reseña de ' + producto.nombre}>
      <div className="campo-formulario">
        <label htmlFor={prefijo + '-puntuacion'}>Puntuación</label>
        <select
          id={prefijo + '-puntuacion'}
          value={puntuacion}
          onChange={(e) => setPuntuacion(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((valor) => (
            <option key={valor} value={valor}>
              {'★'.repeat(valor)} ({valor})
            </option>
          ))}
        </select>
      </div>

      <div className="campo-formulario">
        <label htmlFor={prefijo + '-comentario'}>Comentario (opcional)</label>
        <textarea
          id={prefijo + '-comentario'}
          rows="3"
          maxLength={MAX_COMENTARIO}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <small>{comentario.length}/{MAX_COMENTARIO}</small>
      </div>

      {error && <p className="mensaje-error" role="alert">{error}</p>}

      <div className="acciones-resena">
        <button type="submit" className="boton-primario" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Publicar reseña'}
        </button>
        <button type="button" className="boton-secundario" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
