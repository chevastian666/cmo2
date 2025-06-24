/**
 * Hook para manejar actualizaciones suaves de datos
 * By Cheva
 */

import { useCallback, useRef } from 'react'
interface UseSmootherRefreshOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
  minimumDelay?: number
}

export const useSmootherRefresh = (refreshFunctions: Array<(() => Promise<unknown>) | undefined>,
  _options: UseSmootherRefreshOptions = {}
) => {
  const { onSuccess, onError, minimumDelay = 300 } = _options

  const isRefreshing = useRef(false)
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
        await new Promise(resolve => setTimeout(resolve, minimumDelay - elapsedTime))
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Error en actualización suave:', error)
      onError?.(error)
    } finally {
      isRefreshing.current = false
    }
  }, [refreshFunctions, onSuccess, onError, minimumDelay])
  return { refresh, isRefreshing: isRefreshing.current }
}