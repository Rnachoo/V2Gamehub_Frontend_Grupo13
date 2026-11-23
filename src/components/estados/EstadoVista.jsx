import { traducirError } from '../../utils/errores.js'

// Muestra carga, error o vacío; si no hay nada de eso, muestra el contenido.
export default function EstadoVista({
  cargando,
  error,
  vacio = false,
  textoCarga = 'Cargando...',
  textoVacio = 'No hay información para mostrar.',
  alReintentar,
  children
}) {
  if (cargando) {
    return (
      <div className="estado-vista" role="status">
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        <p>{textoCarga}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="estado-vista estado-vista-error" role="alert">
        <p>{typeof error === 'string' ? error : traducirError(error)}</p>
        {alReintentar && (
          <button type="button" className="boton-secundario" onClick={alReintentar}>
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (vacio) {
    return (
      <div className="estado-vista estado-vacio">
        <p>{textoVacio}</p>
      </div>
    )
  }

  return children
}
