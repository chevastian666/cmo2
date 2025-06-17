import { useState, useCallback } from 'react';
import { usePolling, usePollingWithDiff, useAutoReconnect } from '../../../hooks/usePolling';
import type { MapMarker, MapRoute } from '../../../components/ui/MapModule';
import type { TransitInfo } from '../../../components/ui/TransitCard';
import type { Alert } from '../../../components/ui/AlertsPanel';

// Mock service imports - reemplazar con servicios reales
const transitosService = {
  getTransitos: async () => {
    // Simular llamada API
    return [];
  }
};

const alertasService = {
  getActivas: async () => {
    // Simular llamada API
    return [];
  }
};

/**
 * Hook para integrar polling con el MapModule
 */
export function useMapPolling(
  initialMarkers: MapMarker[] = [],
  initialRoutes: MapRoute[] = []
) {
  const [markers, setMarkers] = useState<MapMarker[]>(initialMarkers);
  const [routes, setRoutes] = useState<MapRoute[]>(initialRoutes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMapData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Obtener tránsitos activos
      const transitos = await transitosService.getTransitos();
      
      // Convertir tránsitos a markers
      const newMarkers: MapMarker[] = transitos.map((transito: any) => ({
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
      }));

      // Actualizar solo si hay cambios
      if (JSON.stringify(newMarkers) !== JSON.stringify(markers)) {
        setMarkers(newMarkers);
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching map data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [markers]);

  // Configurar polling
  const { startPolling, stopPolling, executeNow } = usePolling(fetchMapData, {
    interval: 45000,
    enabled: true,
    immediateFirstCall: true,
    onError: (err) => setError(err)
  });

  // Auto-reconexión
  useAutoReconnect(() => {
    console.log('Reconectando polling del mapa...');
    executeNow();
  });

  return {
    markers,
    routes,
    isLoading,
    error,
    refresh: executeNow,
    startPolling,
    stopPolling
  };
}

/**
 * Hook para integrar polling con TransitCard
 */
export function useTransitPolling(transitId: string) {
  const [transit, setTransit] = useState<TransitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransitData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const transitos = await transitosService.getTransitos();
      const foundTransit = transitos.find((t: any) => t.id === transitId);
      
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
        };

        setTransit(transitInfo);
      }
      
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching transit data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [transitId]);

  // Polling con intervalo más corto para datos específicos
  usePolling(fetchTransitData, {
    interval: 30000, // 30 segundos para actualizaciones más frecuentes
    enabled: true,
    immediateFirstCall: true,
    onError: (err) => setError(err)
  });

  return {
    transit,
    isLoading,
    error
  };
}

/**
 * Hook para integrar polling con AlertsPanel
 */
export function useAlertsPolling() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNewCriticalAlert, setHasNewCriticalAlert] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertasService.getActivas();
      return data.map((alert: any) => ({
        id: alert.id,
        title: alert.titulo,
        description: alert.descripcion,
        severity: alert.severidad,
        timestamp: alert.fecha,
        source: alert.fuente,
        status: alert.estado || 'active',
        metadata: alert.metadata
      }));
    } catch (err) {
      throw err;
    }
  }, []);

  const handleAlertsChange = useCallback((newAlerts: Alert[]) => {
    // Detectar si hay nuevas alertas críticas
    const oldCriticalIds = new Set(
      alerts
        .filter(a => a.severity === 'critical' || a.severity === 'high')
        .map(a => a.id)
    );
    
    const hasCritical = newAlerts.some(
      alert => 
        (alert.severity === 'critical' || alert.severity === 'high') &&
        !oldCriticalIds.has(alert.id)
    );

    if (hasCritical) {
      setHasNewCriticalAlert(true);
      setTimeout(() => setHasNewCriticalAlert(false), 5000);
    }

    setAlerts(newAlerts);
  }, [alerts]);

  // Polling con detección de cambios
  const { startPolling, stopPolling, executeNow } = usePollingWithDiff(
    fetchAlerts,
    alerts,
    handleAlertsChange,
    {
      interval: 45000,
      enabled: true,
      immediateFirstCall: true,
      onError: (err) => {
        setError(err);
        console.error('Error fetching alerts:', err);
      }
    }
  );

  // Auto-reconexión
  useAutoReconnect(() => {
    console.log('Reconectando polling de alertas...');
    executeNow();
  });

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Llamar API para marcar como atendida
      // await alertasService.acknowledge(alertId);
      
      // Actualizar estado local inmediatamente
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      ));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  }, []);

  return {
    alerts,
    isLoading,
    error,
    hasNewCriticalAlert,
    acknowledgeAlert,
    refresh: executeNow,
    startPolling,
    stopPolling
  };
}

/**
 * Hook global para manejar todo el polling de la aplicación
 */
export function useGlobalPolling() {
  const [isPollingActive, setIsPollingActive] = useState(true);
  
  // Pausar polling cuando la pestaña no está visible
  useCallback(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden, pausing polling...');
        setIsPollingActive(false);
      } else {
        console.log('Tab visible, resuming polling...');
        setIsPollingActive(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    isPollingActive
  };
}