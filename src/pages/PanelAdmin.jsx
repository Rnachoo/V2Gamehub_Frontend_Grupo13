import { useState } from 'react'
import { Link } from 'react-router-dom'
import CategoriasAdmin from '../components/admin/CategoriasAdmin.jsx'
import CuentasAdmin from '../components/admin/CuentasAdmin.jsx'
import ProductosAdmin from '../components/admin/ProductosAdmin.jsx'
import PromocionesAdmin from '../components/admin/PromocionesAdmin.jsx'
import ResenasAdmin from '../components/admin/ResenasAdmin.jsx'

const PESTANAS = [
  { id: 'productos', texto: 'Productos', Componente: ProductosAdmin },
  { id: 'categorias', texto: 'Categorías', Componente: CategoriasAdmin },
  { id: 'promociones', texto: 'Promociones', Componente: PromocionesAdmin },
  { id: 'resenas', texto: 'Reseñas', Componente: ResenasAdmin },
  { id: 'cuentas', texto: 'Cuentas', Componente: CuentasAdmin }
]

export default function PanelAdmin() {
  const [activa, setActiva] = useState(PESTANAS[0].id)
  const { Componente } = PESTANAS.find((pestana) => pestana.id === activa)

  return (
    <div className="contenedor panel-admin">
      <nav className="ruta-navegacion" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> &gt; <span aria-current="page">Panel de administración</span>
      </nav>

      <h1>Panel de administración</h1>

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
