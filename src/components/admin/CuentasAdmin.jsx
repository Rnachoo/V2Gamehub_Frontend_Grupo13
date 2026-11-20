import { useState } from 'react'
import EstadoVista from '../estados/EstadoVista.jsx'
import MensajeAccion from './MensajeAccion.jsx'
import useCargaDatos from '../../hooks/useCargaDatos.js'
import { cambiarRol, obtenerCuentas, ROLES } from '../../services/cuentas.js'
import { traducirError } from '../../utils/errores.js'

const NOMBRES_ROL = {
  ROLE_USER: 'Cliente',
  ROLE_OPERADOR: 'Operador',
  ROLE_ADMIN: 'Administrador'
}

export default function CuentasAdmin() {
  const { datos: cuentas, cargando, error, recargar } = useCargaDatos(obtenerCuentas)
  const [mensaje, setMensaje] = useState(null)

  async function actualizarRol(cuenta, rol) {
    if (!window.confirm(`¿Cambiar el rol de ${cuenta.email} a ${NOMBRES_ROL[rol]}?`)) return
    try {
      await cambiarRol(cuenta.id, rol)
      setMensaje({ tipo: 'exito', texto: 'Rol actualizado.' })
      recargar()
    } catch (errorRol) {
      setMensaje({ tipo: 'error', texto: traducirError(errorRol) })
    }
  }

  return (
    <section aria-labelledby="titulo-cuentas-admin">
      <h2 id="titulo-cuentas-admin">Cuentas y roles</h2>
      <MensajeAccion mensaje={mensaje} />

      <EstadoVista cargando={cargando} error={error} vacio={cuentas.length === 0} textoVacio="No hay cuentas registradas." alReintentar={recargar}>
        <div className="table-responsive">
          <table className="table tabla-admin align-middle">
            <thead>
              <tr>
                <th scope="col">Correo</th>
                <th scope="col">Estado</th>
                <th scope="col">Rol</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td>{cuenta.email}</td>
                  <td>{cuenta.activa ? 'Activa' : 'Desactivada'}</td>
                  <td>
                    <label htmlFor={`rol-${cuenta.id}`} className="visually-hidden">Rol de {cuenta.email}</label>
                    <select id={`rol-${cuenta.id}`} className="form-select" value={cuenta.rol} onChange={(evento) => actualizarRol(cuenta, evento.target.value)}>
                      {ROLES.map((rol) => (
                        <option key={rol} value={rol}>{NOMBRES_ROL[rol]}</option>
                      ))}
                    </select>
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
