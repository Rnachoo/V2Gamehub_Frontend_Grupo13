import { api, extraerLista } from './apiClient.js'

function aPromocion(promocion) {
  return {
    id: promocion.id,
    codigo: promocion.codigo,
    tipo: promocion.tipo,
    valor: promocion.valor,
    tope: promocion.tope ?? null,
    montoMinimo: promocion.montoMinimo,
    usosRestantes: promocion.usosMaximos,
    fechaInicio: promocion.fechaInicio?.slice(0, 10) ?? '',
    fechaFin: promocion.fechaFin?.slice(0, 10) ?? '',
    activa: promocion.estado === 'Active'
  }
}

export async function obtenerPromociones() {
  const datos = await api.get('/promociones', { protegida: true })
  return extraerLista(datos).map(aPromocion)
}

export function crearPromocion(datos) {
  return api.post('/promociones', {
    codigo: datos.codigo.trim().toUpperCase(),
    tipo: datos.tipo,
    valor: Number(datos.valor),
    tope: datos.tope === '' ? null : Number(datos.tope),
    montoMinimo: Number(datos.montoMinimo || 0),
    usosMaximos: Number(datos.usosMaximos),
    fechaInicio: `${datos.fechaInicio}T00:00:00`,
    fechaFin: `${datos.fechaFin}T23:59:59`
  }, { protegida: true })
}

export function actualizarVigencia(id, fechaInicio, fechaFin) {
  return api.patch(`/promociones/${id}/date`, {
    fechaInicio: `${fechaInicio}T00:00:00`,
    fechaFin: `${fechaFin}T23:59:59`
  }, { protegida: true })
}

export function desactivarPromocion(id) {
  return api.patch(`/promociones/${id}`, undefined, { protegida: true })
}
