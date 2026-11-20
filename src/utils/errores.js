const MENSAJES = {
  0: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
  400: 'Revisa los datos ingresados.',
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  500: 'Error del servidor, intenta más tarde.'
}

// Convierte cualquier error en un texto para mostrar en pantalla.
// En un 400 se usa el mensaje del backend, porque explica qué dato falló.
export function traducirError(error) {
  const status = error?.status

  if (status === 400 && error.message) {
    return error.message
  }

  if (status in MENSAJES) {
    return MENSAJES[status]
  }

  if (status >= 500) {
    return MENSAJES[500]
  }

  return 'Ocurrió un error inesperado.'
}

// Errores por campo de un 400 de validación: { nombre: "El nombre es obligatorio" }
export function erroresDeCampos(error) {
  return error?.status === 400 && error.campos ? error.campos : {}
}
