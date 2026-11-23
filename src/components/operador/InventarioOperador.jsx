import { useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from '../admin/MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { obtenerTodosLosProductos } from '../../services/productos.js'
import { ajustarStock } from '../../services/inventario.js'
import { traducirError } from '../../utils/errores.js'

const TEXTO_MOVIMIENTO = {
  AJUSTE_ENTRADA: 'entrada',
  AJUSTE_SALIDA: 'salida'
}

export default function InventarioOperador() {
  const { datos: productos, cargando, error, recargar } = useCargaDatos(obtenerTodosLosProductos)
  const [nuevos, setNuevos] = useState({})
  const [mensaje, setMensaje] = useState(null)

  async function ajustar(producto) {
    const valor = nuevos[producto.id]
    const cantidad = Number(valor)
    if (valor === undefined || valor === '' || !Number.isInteger(cantidad) || cantidad < 0) {
      setMensaje({ tipo: 'error', texto: 'El stock debe ser un número entero mayor o igual a 0.' })
      return
    }
    try {
      const inventario = await ajustarStock(producto.inventarioId, cantidad)
      const movimiento = inventario.movimientosDTO?.[inventario.movimientosDTO.length - 1]
      setMensaje({
        tipo: 'exito',
        texto: movimiento && cantidad !== producto.stock
          ? `${producto.nombre}: ${TEXTO_MOVIMIENTO[movimiento.tipo] ?? movimiento.tipo} de ${movimiento.cantidad} unidades registrada.`
          : `${producto.nombre}: el stock no cambió.`
      })
      setNuevos({ ...nuevos, [producto.id]: '' })
      recargar()
    } catch (errorAjuste) {
      setMensaje({ tipo: 'error', texto: traducirError(errorAjuste) })
    }
  }

  return (
    <section aria-labelledby="titulo-inventario-operador">
      <h2 id="titulo-inventario-operador">Ajuste de stock</h2>
      <MensajeAccion mensaje={mensaje} />

      <EstadoVista cargando={cargando} error={error} vacio={productos.length === 0} textoVacio="No hay productos." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin tabla-operador align-middle">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Stock actual</th>
                <th scope="col">Nuevo stock</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <strong>{producto.nombre}</strong>
                    <small className="d-block">{producto.marca}</small>
                  </td>
                  <td data-label="Stock actual">{producto.stock}</td>
                  <td data-label="Nuevo stock">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-control input-stock"
                      aria-label={`Nuevo stock de ${producto.nombre}`}
                      value={nuevos[producto.id] ?? ''}
                      onChange={(evento) => setNuevos({ ...nuevos, [producto.id]: evento.target.value })}
                      disabled={!producto.inventarioId}
                    />
                  </td>
                  <td className="acciones-tabla" data-label="Acciones">
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={() => ajustar(producto)}
                      disabled={!producto.inventarioId}
                    >
                      Ajustar
                    </button>
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
