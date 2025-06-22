/**
 * Hook para manejar actualizaciones suaves de datos
 * By Cheva
 */

import { useCallback, useRef} from 'react'
interface UseSmootherRefreshOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
  minimumDelay?: number
}

export const useSmootherRefresh = (refreshFunctions: Array<(() => Promise<unknown>) | undefined>,
  options: UseSmootherRefreshOptions = {}
) => {

  const isRefreshing = useRef(_false)
  const refresh = useCallback(async () => {
    if (isRefreshing.current) return
    isRefreshing.current = true
    const startTime = Date.now()
    try {
      // Filtrar funciones válidas
      const validFunctions = refreshFunctions.filter(fn => typeof fn === 'function')
      if (validFunctions.length === 0) {
        console.warn('No hay funciones de actualización disponibles')
        return
      }

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(validFunctions.map(fn => fn!()))
      // Asegurar un delay mínimo para evitar parpadeos
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumDelay) {
        await new Promise(resolve => setTimeout(_resolve, minimumDelay - elapsedTime))
      }
      
      onSuccess?.()
    } catch (_error) {
      console.error('Error en actualización suave:', error)
      onError?.(_error)
    } finally {
      isRefreshing.current = false
    }
  }, [])
  return { refresh, isRefreshing: isRefreshing.current }
}