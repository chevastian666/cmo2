// @ts-nocheck
import { useState, useCallback, useEffect } from 'react'
import { usePolling, useAutoReconnect } from '../../../hooks/usePolling'
import type { MapMarker, MapRoute } from '../../../components/ui/MapModule'
import type { TransitInfo } from '../../../components/ui/TransitCard'
import type { Alert } from '../../../components/ui/AlertsPanel'

// Transit data type
interface Transito {
  id: string
  currentLocation?: {
    lat: number
    lng: number
  }
  vehiculo?: {
    matricula: string
  }
  estado?: 'demorado' | 'detenido' | 'activo'
  despachante?: string
  conductor?: string
  destino?: string
}

// Mock service imports - reemplazar con servicios reales
const transitosService = {
  getTransitos: async (): Promise<Transito[]> => {
    // Simular llamada API
    return []
  }
}

// Alert data type from service
interface AlertaData {
  id: string
  titulo: string
  descripcion: string
  severidad: 'low' | 'medium' | 'high' | 'critical'
  fecha: string
  tipo?: string
  ubicacion?: string
}

const alertasService = {
  getActivas: async (): Promise<AlertaData[]> => {
    // Simular llamada API
    return []
  }
}

/**
 * Hook para integrar polling con el MapModule
 */
export function useMapPolling(initialMarkers: MapMarker[] = [], initialRoutes: MapRoute[] = []) {
  const [markers, setMarkers] = useState<MapMarker[]>(initialMarkers)
  const [routes] = useState<MapRoute[]>(initialRoutes)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchMapData = useCallback(async () => {
    try {
      setIsLoading(true)
      // Obtener tránsitos activos
      const transitos = await transitosService.getTransitos()
      
      // Convertir tránsitos a markers
      const newMarkers: MapMarker[] = transitos.map((transito: Transito) => ({
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
      if (JSON.stringify(newMarkers) !== JSON.stringify(markers)) {
        setMarkers(newMarkers)
      }

      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching map data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [markers])
  
  // Configurar polling
  const { executeNow, startPolling, stopPolling } = usePolling(fetchMapData, {
    interval: 60000,
    enabled: true
  })

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
  const [transit, setTransit] = useState<TransitInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchTransitData = useCallback(async () => {
    try {
      setIsLoading(true)
      const transitos = await transitosService.getTransitos()
      const foundTransit = transitos.find((t: Transito) => t.id === transitId)
      
      if (foundTransit) {
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
        setTransit(transitInfo)
      }
      
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching transit data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [transitId])
  
  // Polling con intervalo más corto para datos específicos
  usePolling(fetchTransitData, {
    interval: 30000, // 30 segundos para actualizaciones más frecuentes
    enabled: true,
    immediateFirstCall: true,
    onError: (err) => setError(err)
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
  const [isLoading, _setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasNewCriticalAlert, setHasNewCriticalAlert] = useState(false)
  
  const fetchAlerts = useCallback(async () => {
    const data = await alertasService.getActivas()
    return data.map((alert: AlertaData) => ({
      id: alert.id,
      title: alert.titulo,
      description: alert.descripcion,
      severity: alert.severidad,
      timestamp: alert.fecha,
      source: alert.fuente,
      status: alert.estado || 'active',
      metadata: alert.metadata
    }))
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
    
    if (hasCritical) {
      setHasNewCriticalAlert(true)
      setTimeout(() => setHasNewCriticalAlert(false), 5000)
    }

    setAlerts(newAlerts)
  }, [alerts])
  
  // Polling con detección de cambios
  const { executeNow, startPolling, stopPolling } = usePolling(
    fetchAlerts,
    {
      interval: 45000,
      enabled: true,
      immediateFirstCall: true,
      onSuccess: handleAlertsChange,
      onError: (err) => {
        setError(err)
        console.error('Error fetching alerts:', err)
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
      // await alertasService.acknowledge(alertId)
      
      // Actualizar estado local inmediatamente
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      ))
    } catch (err) {
      console.error('Error acknowledging alert:', err)
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
  const [isPollingActive, setIsPollingActive] = useState(true)
  
  // Pausar polling cuando la pestaña no está visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden, pausing polling...')
        setIsPollingActive(false)
      } else {
        console.log('Tab visible, resuming polling...')
        setIsPollingActive(true)
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