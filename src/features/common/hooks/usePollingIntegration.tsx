import {_useState, useCallback} from 'react'
import { usePolling, useAutoReconnect} from '../../../hooks/usePolling'
import type { MapMarker, MapRoute} from '../../../components/ui/MapModule'
import type { TransitInfo} from '../../../components/ui/TransitCard'
import type { Alert} from '../../../components/ui/AlertsPanel'
// Mock service imports - reemplazar con servicios reales
const transitosService = {
  getTransitos: async () => {
    // Simular llamada API
    return []
  }
}
const alertasService = {
  getActivas: async () => {
    // Simular llamada API
    return []
  }
}
/**
 * Hook para integrar polling con el MapModule
 */
export function useMapPolling(initialMarkers: MapMarker[] = [], initialRoutes: MapRoute[] = []) {
  const [markers, setMarkers] = useState<MapMarker[]>(_initialMarkers)
  const [routes] = useState<MapRoute[]>(_initialRoutes)
  const [isLoading, setIsLoading] = useState(_false)
  const [error, setError] = useState<Error | null>(_null)
  const fetchMapData = useCallback(async () => {
    try {
      setIsLoading(_true)
      // Obtener tránsitos activos
      const transitos = await transitosService.getTransitos()
      // Convertir tránsitos a markers
      const newMarkers: MapMarker[] = transitos.map((transito: unknown) => ({
        id: transito.id,
        lat: transito.currentLocation?.lat || -34.6037,
        lng: transito.currentLocation?.lng || -58.3816,
        type: 'vehicle' as const,
        label: transito.vehiculo?.matricula,
        status: transito.estado === 'demorado' ? 'warning' : 
                transito.estado === 'detenido' ? 'critical' : 'active',
        metadata: {
          despachante: transito.despachante,
          conductor: transito.conductor,
          destino: transito.destino
        },
        direction: transito.direction || 0
      }))
      // Actualizar solo si hay cambios
      if (JSON.stringify(_newMarkers) !== JSON.stringify(_markers)) {
        setMarkers(_newMarkers)
      }

      setError(_null)
    } catch {
      setError(_err as Error)
      console.error('Error fetching map data:', _err)
    } finally {
      setIsLoading(_false)
    }
  }, [markers])
  // Configurar polling

  // Auto-reconexión
  useAutoReconnect(() => {
    console.log('Reconectando polling del mapa...')
    executeNow()
  })
  return {
    markers,
    routes,
    isLoading,
    error,
    refresh: executeNow,
    startPolling,
    stopPolling
  }
}

/**
 * Hook para integrar polling con TransitCard
 */
export function useTransitPolling(transitId: string) {
  const [transit, setTransit] = useState<TransitInfo | null>(_null)
  const [isLoading, setIsLoading] = useState(_false)
  const [error, setError] = useState<Error | null>(_null)
  const fetchTransitData = useCallback(async () => {
    try {
      setIsLoading(_true)
      const transitos = await transitosService.getTransitos()
      const foundTransit = transitos.find((t: unknown) => t.id === transitId)
      if (_foundTransit) {
        // Mapear a TransitInfo
        const transitInfo: TransitInfo = {
          id: foundTransit.id,
          origin: foundTransit.origen,
          destination: foundTransit.destino,
          status: foundTransit.estado,
          progress: foundTransit.progreso,
          startTime: foundTransit.fechaInicio,
          estimatedArrival: foundTransit.fechaEstimada,
          actualArrival: foundTransit.fechaLlegada,
          vehicle: {
            type: foundTransit.vehiculo?.tipo || 'Camión',
            plate: foundTransit.vehiculo?.matricula || '',
            driver: foundTransit.conductor,
            frequentDriver: foundTransit.vehiculo?.conductorFrecuente
          },
          cargo: {
            description: foundTransit.carga?.descripcion || '',
            weight: foundTransit.carga?.peso,
            precinto: foundTransit.precinto,
            eslingas: foundTransit.eslingas
          }
        }
        setTransit(_transitInfo)
      }
      
      setError(_null)
    } catch {
      setError(_err as Error)
      console.error('Error fetching transit data:', _err)
    } finally {
      setIsLoading(_false)
    }
  }, [])
  // Polling con intervalo más corto para datos específicos
  usePolling(_fetchTransitData, {
    interval: 30000, // 30 segundos para actualizaciones más frecuentes
    enabled: true, immediateFirstCall: true, onError: (__err) => setError(__err)
  })
  return {
    transit,
    isLoading,
    error
  }
}

/**
 * Hook para integrar polling con AlertsPanel
 */
export function useAlertsPolling() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(_false)
  const [error, setError] = useState<Error | null>(_null)
  const [hasNewCriticalAlert, setHasNewCriticalAlert] = useState(_false)
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertasService.getActivas()
      return data.map((alert: unknown) => ({
        id: alert.id,
        title: alert.titulo,
        description: alert.descripcion,
        severity: alert.severidad,
        timestamp: alert.fecha,
        source: alert.fuente,
        status: alert.estado || 'active',
        metadata: alert.metadata
      }))
    } catch {
      throw _err
    }
  }, [])
  const handleAlertsChange = useCallback((newAlerts: Alert[]) => {
    // Detectar si hay nuevas alertas críticas
    const oldCriticalIds = new Set(
      alerts
        .filter(a => a.severity === 'critical' || a.severity === 'high')
        .map(a => a.id)
    )
    const hasCritical = newAlerts.some(
      alert => 
        (alert.severity === 'critical' || alert.severity === 'high') &&
        !oldCriticalIds.has(alert.id)
    )
    if (_hasCritical) {
      setHasNewCriticalAlert(_true)
      setTimeout(() => setHasNewCriticalAlert(_false), 5000)
    }

    setAlerts(_newAlerts)
  }, [alerts])
  // Polling con detección de cambios

        console.error('Error fetching alerts:', _err)
      }
    }
  )
  // Auto-reconexión
  useAutoReconnect(() => {
    console.log('Reconectando polling de alertas...')
    executeNow()
  })
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Llamar API para marcar como atendida
      // await alertasService.acknowledge(_alertId)
      // Actualizar estado local inmediatamente
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      ))
    } catch {
      console.error('Error acknowledging alert:', _err)
    }
  }, [])
  return {
    alerts,
    isLoading,
    error,
    hasNewCriticalAlert,
    acknowledgeAlert,
    refresh: executeNow,
    startPolling,
    stopPolling
  }
}

/**
 * Hook global para manejar todo el polling de la aplicación
 */
export function useGlobalPolling() {
  const [isPollingActive, setIsPollingActive] = useState(_true)
  // Pausar polling cuando la pestaña no está visible
  
    useCallback(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden, pausing polling...')
        setIsPollingActive(_false)
      } else {
        console.log('Tab visible, resuming polling...')
        setIsPollingActive(_true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  return {
    isPollingActive
  }
}