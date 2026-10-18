import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import FormularioCheckout from './FormularioCheckout'
import { servicioOrdenes } from '../../services/ordenes'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const LINEAS = [{ productoId: 1, nombre: 'Mouse Logitech g203', precioUnitario: 39990, cantidad: 2 }]
const TOTALES = { subtotal: 79980, descuento: 0, total: 79980 }

// Cambia el valor como lo haría el usuario, para que React dispare onChange
function escribir(campo, valor) {
  const asignarValor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(campo), 'value').set
  asignarValor.call(campo, valor)
  campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
}

describe('FormularioCheckout', () => {
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

  it('mantiene deshabilitado el envío mientras falte la dirección', () => {
    const onConfirmar = jasmine.createSpy('onConfirmar')
    spyOn(servicioOrdenes, 'crearOrden')

    act(() => {
      raiz.render(
        <MemoryRouter>
          <FormularioCheckout lineas={LINEAS} totales={TOTALES} onConfirmar={onConfirmar} />
        </MemoryRouter>
      )
    })

    act(() => {
      escribir(contenedor.querySelector('#nombre-checkout'), 'Juan Pérez')
      escribir(contenedor.querySelector('#correo-checkout'), 'juan@correo.com')
      escribir(contenedor.querySelector('#telefono-checkout'), '912345678')
      escribir(contenedor.querySelector('#region-checkout'), 'RM')
      escribir(contenedor.querySelector('#comuna-checkout'), 'Providencia')
    })

    act(() => {
      contenedor.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(contenedor.querySelector('button[type="submit"]').disabled).toBeTrue()
    expect(contenedor.querySelector('#error-direccion-checkout').textContent).toBe('Este campo es obligatorio')
    expect(servicioOrdenes.crearOrden).not.toHaveBeenCalled()
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})
