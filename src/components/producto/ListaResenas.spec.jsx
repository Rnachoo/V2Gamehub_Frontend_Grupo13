import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ListaResenas from './ListaResenas'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const RESENAS = [
  { id: 1, idProducto: 1, autor: 'Camila', calificacion: 5, comentario: 'Excelente', fecha: '2024-11-03' },
  { id: 2, idProducto: 1, autor: 'Matías', calificacion: 3, comentario: 'Cumple', fecha: '2025-02-14' },
  { id: 3, idProducto: 1, autor: 'Valentina', calificacion: 4, comentario: 'Muy bueno', fecha: '2024-12-20' }
]

describe('ListaResenas', () => {
  let contenedor
  let raiz

  beforeEach(() => {
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    raiz = createRoot(contenedor)
  })

  afterEach(() => {
    act(() => raiz.unmount())
    contenedor.remove()
  })

  it('ordena por fecha descendente y calcula el promedio', () => {
    act(() => {
      raiz.render(<ListaResenas resenas={RESENAS} />)
    })

    const autores = [...contenedor.querySelectorAll('.resena-autor')].map(
      (parrafo) => parrafo.textContent.split(' — ')[0]
    )

    expect(autores).toEqual(['Matías', 'Valentina', 'Camila'])
    expect(contenedor.textContent).toContain('Promedio : 4.0 / 5 (3 reseñas)')
  })
})
