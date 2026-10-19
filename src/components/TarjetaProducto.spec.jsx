import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import TarjetaProducto from './TarjetaProducto.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('TarjetaProducto', () => {
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

  it('muestra nombre, precio y aviso cuando no hay stock', () => {
    const producto = {
      id: 1,
      nombre: 'Mouse Gamer',
      marca: 'GameHub',
      precio: 39990,
      precioDescuento: null,
      stock: 0,
      imagenes: ['mouse.jpg']
    }
    const onAgregar = jasmine.createSpy('onAgregar')

    act(() => {
      raiz.render(
        <MemoryRouter>
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </MemoryRouter>
      )
    })

    expect(contenedor.textContent).toContain('Mouse Gamer')
    expect(contenedor.textContent).toContain('$39.990')
    expect(contenedor.textContent).toContain('Producto sin stock')

    const boton = contenedor.querySelector('.boton-agregar-producto')
    expect(boton.disabled).toBeTrue()
    expect(onAgregar).not.toHaveBeenCalled()
  })
})