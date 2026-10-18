// El campo no puede quedar vacío ni con solo espacios
export function validarCampoObligatorio(valor) {
  if (!valor || valor.trim() === '') {
    return { valido: false, mensaje: 'Este campo es obligatorio' };
  }
  return { valido: true, mensaje: '' };
}

export function validarFormatoCorreo(correo) {
  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patronCorreo.test(correo)) {
    return { valido: false, mensaje: 'Ingresa un correo con formato válido' };
  }
  return { valido: true, mensaje: '' };
}

// Teléfono solo numérico y con el largo definido (por defecto, 9 dígitos)
export function validarTelefono(telefono, largoEsperado = 9) {
  const soloNumeros = /^[0-9]+$/;
  if (!soloNumeros.test(telefono) || telefono.length !== largoEsperado) {
    return { valido: false, mensaje: 'El teléfono debe tener ' + largoEsperado + ' dígitos numéricos' };
  }
  return { valido: true, mensaje: '' };
}

export function validarLongitudContrasena(contrasena, minimo = 8) {
  if (contrasena.length < minimo) {
    return { valido: false, mensaje: 'La contraseña debe tener al menos ' + minimo + ' caracteres' };
  }
  return { valido: true, mensaje: '' };
}

export function validarCoincidenciaContrasenas(contrasena, confirmacion) {
  if (contrasena !== confirmacion) {
    return { valido: false, mensaje: 'Las contraseñas no coinciden' };
  }
  return { valido: true, mensaje: '' };
}

function validarCorreo(correo) {
  const obligatorio = validarCampoObligatorio(correo);
  return obligatorio.valido ? validarFormatoCorreo(correo) : obligatorio;
}

// Devuelve { valido, errores } con un mensaje por cada campo que falla
export function validarFormularioCheckout(datos) {
  const errores = {};

  const resultados = {
    nombre: validarCampoObligatorio(datos.nombre),
    correo: validarCorreo(datos.correo),
    telefono: validarCampoObligatorio(datos.telefono),
    region: validarCampoObligatorio(datos.region),
    comuna: validarCampoObligatorio(datos.comuna),
    direccion: validarCampoObligatorio(datos.direccion)
  };

  if (resultados.telefono.valido) {
    resultados.telefono = validarTelefono(datos.telefono);
  }

  for (const campo in resultados) {
    if (!resultados[campo].valido) {
      errores[campo] = resultados[campo].mensaje;
    }
  }

  return { valido: Object.keys(errores).length === 0, errores: errores };
}

export function validarFormularioCrearCuenta(datos) {
  const errores = {};

  const resultados = {
    nombre: validarCampoObligatorio(datos.nombre),
    correo: validarCorreo(datos.correo),
    contrasena: validarCampoObligatorio(datos.contrasena),
    confirmarContrasena: validarCoincidenciaContrasenas(datos.contrasena, datos.confirmarContrasena)
  };

  if (resultados.contrasena.valido) {
    resultados.contrasena = validarLongitudContrasena(datos.contrasena);
  }

  for (const campo in resultados) {
    if (!resultados[campo].valido) {
      errores[campo] = resultados[campo].mensaje;
    }
  }

  return { valido: Object.keys(errores).length === 0, errores: errores };
}
