import { REGIONES } from '../data/regiones'

export function separarCalleYNumero(direccion) {
  const texto = direccion.trim()
  const coincidencia = texto.match(/^(.+?)[\s,#]+(\d+)$/)
  if (!coincidencia) {
    return { calle: texto, numero: 'S/N' }
  }
  return { calle: coincidencia[1].trim(), numero: coincidencia[2] }
}

// Forma que guarda msvc-user: la región va en `ciudad`
export function armarDireccion({ region, comuna, direccion }) {
  const nombreRegion = REGIONES.find((r) => r.codigo === region)?.nombre ?? region
  const { calle, numero } = separarCalleYNumero(direccion)
  return { comuna: comuna.trim(), ciudad: nombreRegion, calle, numero }
}