import { useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from './MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { actualizarCategoria, crearCategoria, desactivarCategoria, obtenerTodasLasCategorias } from '../../services/categorias.js'
import { traducirError } from '../../utils/errores.js'

const VACIO = { nombre: '', descripcion: '' }

export default function CategoriasAdmin() {
  const { datos: categorias, cargando, error, recargar } = useCargaDatos(obtenerTodasLasCategorias)
  const [valores, setValores] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [errorNombre, setErrorNombre] = useState('')
  const [mensaje, setMensaje] = useState(null)

  function editar(categoria) {
    setEditandoId(categoria.idBackend)
    setValores({ nombre: categoria.nombre, descripcion: categoria.descripcion })
    setErrorNombre('')
  }

  function cancelar() {
    setEditandoId(null)
    setValores(VACIO)
    setErrorNombre('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (!valores.nombre.trim()) {
      setErrorNombre('El nombre es obligatorio.')
      return
    }
    try {
      if (editandoId) {
        await actualizarCategoria(editandoId, valores)
      } else {
        await crearCategoria(valores)
      }
      setMensaje({ tipo: 'exito', texto: 'Categoría guardada correctamente.' })
      cancelar()
      recargar()
    } catch (errorGuardar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorGuardar) })
    }
  }

  async function desactivar(categoria) {
    if (!window.confirm(`¿Desactivar la categoría "${categoria.nombre}"?`)) return
    try {
      await desactivarCategoria(categoria.idBackend)
      setMensaje({ tipo: 'exito', texto: 'Categoría desactivada.' })
      recargar()
    } catch (errorDesactivar) {
      setMensaje({ tipo: 'error', texto: traducirError(errorDesactivar) })
    }
  }

  return (
    <section aria-labelledby="titulo-categorias-admin">
      <h2 id="titulo-categorias-admin">Categorías</h2>
      <MensajeAccion mensaje={mensaje} />

      <form className="formulario-admin formulario-en-linea" onSubmit={guardar} noValidate>
        <div className="campo-admin">
          <label htmlFor="categoria-nombre">Nombre</label>
          <input
            id="categoria-nombre"
            className="form-control"
            value={valores.nombre}
            onChange={(evento) => setValores({ ...valores, nombre: evento.target.value })}
            aria-invalid={Boolean(errorNombre)}
          />
          {errorNombre && <span className="mensaje-error">{errorNombre}</span>}
        </div>
        <div className="campo-admin">
          <label htmlFor="categoria-descripcion">Descripción</label>
          <input
            id="categoria-descripcion"
            className="form-control"
            value={valores.descripcion}
            onChange={(evento) => setValores({ ...valores, descripcion: evento.target.value })}
          />
        </div>
        <div className="acciones-admin">
          <button type="submit" className="boton-primario">{editandoId ? 'Guardar cambios' : 'Crear categoría'}</button>
          {editandoId && <button type="button" className="boton-secundario" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <EstadoVista cargando={cargando} error={error} vacio={categorias.length === 0} textoVacio="Aún no hay categorías." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Estado</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.idBackend}>
                  <td>{categoria.icono} {categoria.nombre}</td>
                  <td>{categoria.descripcion}</td>
                  <td>
                    <span className={`etiqueta-estado ${categoria.activa ? 'estado-activo' : 'estado-inactivo'}`}>
                      {categoria.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="acciones-tabla">
                    <button type="button" className="boton-secundario" onClick={() => editar(categoria)}>Editar</button>
                    {categoria.activa && (
                      <button type="button" className="boton-peligro" onClick={() => desactivar(categoria)}>Desactivar</button>
                    )}
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
