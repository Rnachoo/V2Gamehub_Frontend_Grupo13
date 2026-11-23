import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función async al montar y entrega datos, carga, error y recargar.
export default function useCargaDatos(funcionCarga, valorInicial = []) {
  const [datos, setDatos] = useState(valorInicial)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const ejecutar = useCallback(async () => {
    try {
      setDatos(await funcionCarga())
      setError(null)
    } catch (errorCarga) {
      setError(errorCarga)
    } finally {
      setCargando(false)
    }
  }, [funcionCarga])

  useEffect(() => {
    ejecutar()
  }, [ejecutar])

  const recargar = useCallback(() => {
    setCargando(true)
    ejecutar()
  }, [ejecutar])

  return { datos, cargando, error, recargar }
}
