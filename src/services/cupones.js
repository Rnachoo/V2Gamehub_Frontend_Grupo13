import { CUPONES } from '../data/datos-cupones'
    
const RETARDO_MS = 200

// Busca un cupón por código (ignora mayúsculas y espacios). Resuelve null si no existe.
export function buscarCupon(codigo) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!codigo) {
        resolve(null)
        return
      }
      const codigoNormalizado = codigo.trim().toUpperCase()
      const cupon = CUPONES.find((c) => c.codigo === codigoNormalizado)
      resolve(cupon || null)
    }, RETARDO_MS)
  })
}