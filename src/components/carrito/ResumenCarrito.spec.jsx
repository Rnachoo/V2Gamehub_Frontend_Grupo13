import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import ResumenCarrito from './ResumenCarrito'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const TOTALES_VACIOS = { subtotal: 0, descuento: 0, total: 0 }

describe('ResumenCarrito', () => {
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

  it('muestra el mensaje de carrito vacío cuando no hay líneas', () => {
    const onVaciar = jasmine.createSpy('onVaciar')

    act(() => {
      raiz.render(
        <MemoryRouter>
          <ResumenCarrito
            lineas={[]}
            totales={TOTALES_VACIOS}
            cupon={null}
            onAplicarCupon={jasmine.createSpy('onAplicarCupon')}
            onVaciar={onVaciar}
          />
        </MemoryRouter>
      )
    })

    expect(contenedor.textContent).toContain('Tu carrito está vacío.')
    expect(contenedor.querySelector('a').getAttribute('href')).toBe('/catalogo')
    
    expect(contenedor.textContent).not.toContain('Vaciar carrito')
    expect(contenedor.textContent).not.toContain('Ir a pagar')
    expect(onVaciar).not.toHaveBeenCalled()
  })
})