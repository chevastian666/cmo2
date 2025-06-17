/**
 * Configuración global de polling para la aplicación
 */
export const POLLING_CONFIG = {
  // Intervalos de actualización (en milisegundos)
  intervals: {
    map: 45000,          // 45 segundos - Mapa general
    transit: 30000,      // 30 segundos - Tránsito individual
    alerts: 45000,       // 45 segundos - Panel de alertas
    dashboard: 60000,    // 60 segundos - Dashboard general
    critical: 15000      // 15 segundos - Datos críticos
  },

  // Configuración de reintentos
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  },

  // Opciones de comportamiento
  options: {
    pauseWhenHidden: true,       // Pausar cuando la pestaña no está visible
    pauseWhenOffline: true,      // Pausar cuando no hay conexión
    immediateFirstCall: true,    // Ejecutar inmediatamente al iniciar
    logErrors: true,             // Registrar errores en consola
    showNotifications: true      // Mostrar notificaciones de error
  },

  // Configuración de sonidos y alertas
  alerts: {
    soundEnabled: true,
    soundVolume: 0.5,
    visualPulseEnabled: true,
    criticalAlertSound: '/sounds/critical-alert.mp3',
    warningAlertSound: '/sounds/warning-alert.mp3',
    infoAlertSound: '/sounds/info-alert.mp3'
  },

  // URLs de los endpoints (para cuando se integre con API real)
  endpoints: {
    transitos: '/api/transitos',
    alertas: '/api/alertas',
    mapa: '/api/mapa/vehiculos',
    camiones: '/api/camiones',
    camioneros: '/api/camioneros'
  }
};

/**
 * Hook para obtener la configuración de polling según el contexto
 */
export function usePollingConfig(context: 'map' | 'transit' | 'alerts' | 'dashboard' | 'critical') {
  const interval = POLLING_CONFIG.intervals[context];
  const options = POLLING_CONFIG.options;

  return {
    interval,
    ...options,
    onError: (error: Error) => {
      if (options.logErrors) {
        console.error(`[Polling ${context}] Error:`, error);
      }
      if (options.showNotifications) {
        // Aquí se podría integrar con el servicio de notificaciones
        console.warn(`Error actualizando ${context}`);
      }
    }
  };
}