import { useState } from 'react'
import { Link } from 'react-router-dom'
import OrdenesOperador from '../components/operador/OrdenesOperador.jsx'
import PagosOperador from '../components/operador/PagosOperador.jsx'
import DespachosOperador from '../components/operador/DespachosOperador.jsx'
import InventarioOperador from '../components/operador/InventarioOperador.jsx'

const PESTANAS = [
  { id: 'ordenes', texto: 'Órdenes', Componente: OrdenesOperador },
  { id: 'pagos', texto: 'Pagos', Componente: PagosOperador },
  { id: 'despachos', texto: 'Despachos', Componente: DespachosOperador },
  { id: 'inventario', texto: 'Inventario', Componente: InventarioOperador }
]

export default function PanelOperador() {
  const [activa, setActiva] = useState(PESTANAS[0].id)
  const { Componente } = PESTANAS.find((pestana) => pestana.id === activa)

  return (
    <div className="contenedor panel-admin">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Panel del operador</span>
      </nav>

      <h1>Panel del operador</h1>

      <ul className="nav nav-tabs pestanas-admin" role="tablist">
        {PESTANAS.map((pestana) => (
          <li className="nav-item" key={pestana.id} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={activa === pestana.id}
              className={`nav-link${activa === pestana.id ? ' active' : ''}`}
              onClick={() => setActiva(pestana.id)}
            >
              {pestana.texto}
            </button>
          </li>
        ))}
      </ul>

      <div className="contenido-panel-admin" role="tabpanel">
        <Componente />
      </div>
    </div>
  )
}
