import { createContext, useContext, useEffect, useState } from 'react'
import {
  agregarAlCarrito,
  quitarDelCarrito,
  actualizarCantidad,
  calcularTotales,
  contarUnidades
} from '../utils/carrito'

const CLAVE_CARRITO = 'gamehub_carrito'
const CLAVE_CUPON = 'gamehub_cupon'

function leerAlmacenamiento(clave, valorPorDefecto) {
  try {
    const datos = localStorage.getItem(clave)
    return datos ? JSON.parse(datos) : valorPorDefecto
  } catch (error) {
    console.error('No se pudo leer ' + clave + ':', error)
    return valorPorDefecto
  }
}

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [lineas, setLineas] = useState(() => leerAlmacenamiento(CLAVE_CARRITO, []))
  const [cupon, setCupon] = useState(() => leerAlmacenamiento(CLAVE_CUPON, null))

  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(lineas))
  }, [lineas])

  useEffect(() => {
    if (cupon) {
      localStorage.setItem(CLAVE_CUPON, JSON.stringify(cupon))
    } else {
      localStorage.removeItem(CLAVE_CUPON)
    }
  }, [cupon])

  
  // Acciones (usan las funciones puras de utils/carrito.js)
  const agregar = (producto, cantidad) =>
    setLineas((previas) => agregarAlCarrito(previas, producto, cantidad))

  const quitar = (productoId) =>
    setLineas((previas) => quitarDelCarrito(previas, productoId))

  const cambiarCantidad = (productoId, nuevaCantidad) =>
    setLineas((previas) => actualizarCantidad(previas, productoId, nuevaCantidad))

  const vaciar = () => {
    setLineas([])
    setCupon(null)
  }

  const guardarCupon = (nuevoCupon) => setCupon(nuevoCupon)
  const quitarCupon = () => setCupon(null)

  const totales = calcularTotales(lineas, cupon)
  const unidades = contarUnidades(lineas)

  const valor = {
    lineas,
    cupon,
    totales,
    unidades,
    agregar,
    quitar,
    cambiarCantidad,
    vaciar,
    guardarCupon,
    quitarCupon
  }

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

// Hook para usar el carrito desde cualquier componente
export function useCarrito() {
  const contexto = useContext(CarritoContext)
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  }
  return contexto
}