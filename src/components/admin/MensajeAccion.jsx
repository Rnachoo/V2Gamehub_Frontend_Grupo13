// Aviso de éxito o error después de guardar algo en el panel.
export default function MensajeAccion({ mensaje }) {
  if (!mensaje) return null

  return (
    <p
      className={`mensaje-accion ${mensaje.tipo === 'error' ? 'mensaje-accion-error' : 'mensaje-accion-exito'}`}
      role={mensaje.tipo === 'error' ? 'alert' : 'status'}
    >
      {mensaje.texto}
    </p>
  )
}
