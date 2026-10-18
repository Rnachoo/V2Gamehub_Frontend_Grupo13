import { aplicarCupon, cuponVigente, calcularTotal } from './carrito.js'

describe('aplicarCupon', () => {
  it('calcula el descuento por porcentaje y respeta el tope definido', () => {
    const cupon = { porcentajeDescuento: 10, tope: 15000 }

    expect(aplicarCupon(100000, cupon)).toBe(10000)
    expect(aplicarCupon(200000, cupon)).toBe(15000)
    expect(aplicarCupon(150000, cupon)).toBe(15000)
  })
})

describe('cuponVigente', () => {
  const cupon = { fechaInicio: '2026-01-01', fechaFin: '2026-12-31' }

  beforeEach(() => {
    jasmine.clock().install()
  })

  afterEach(() => {
    jasmine.clock().uninstall()
  })

  it('rechaza un cupón fuera de su rango de fechas', () => {
    jasmine.clock().mockDate(new Date('2025-12-31T12:00:00Z'))
    expect(cuponVigente(cupon)).toBeFalse()

    jasmine.clock().mockDate(new Date('2026-06-15T12:00:00Z'))
    expect(cuponVigente(cupon)).toBeTrue()

    jasmine.clock().mockDate(new Date('2027-01-02T12:00:00Z'))
    expect(cuponVigente(cupon)).toBeFalse()
  })
})

describe('calcularTotal', () => {
  it('resta el descuento al subtotal y nunca retorna un total negativo', () => {
    expect(calcularTotal(100000, 15000)).toBe(85000)
    expect(calcularTotal(100000, 100000)).toBe(0)
    // Descuento mayor al subtotal: el total se queda en 0, no baja de ahí
    expect(calcularTotal(50000, 80000)).toBe(0)
  })
})