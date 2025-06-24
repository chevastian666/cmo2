/**
 * Enhanced Zustand Store Configuration
 * Includes: Immer, DevTools, Persist, Logger middleware
 * By Cheva
 */

import { create} from 'zustand'
import { devtools, persist, subscribeWithSelector} from 'zustand/middleware'
import { immer} from 'zustand/middleware/immer'
import { 
  createPrecintosSlice, createTransitosSlice, createAlertasSlice, createSystemStatusSlice} from './slices'
import type { 
  PrecintosStore, TransitosStore, AlertasStore, SystemStatusStore} from './types'
// Custom logger middleware for development
const logger = <T>(config: (set: T, get: T, api: T) => T) => (set: T, get: T, api: T) =>
  config((...args: Parameters<T>) => {
      if (import.meta.env.DEV) {
        console.log('  applying', args)
      }
      set(...args)
      if (import.meta.env.DEV) {
        console.log('  new state', get())
      }
    },
    get,
    api
  );

// Store individual para Precintos con middleware mejorado
export const usePrecintosStore = create<PrecintosStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer(
          logger(createPrecintosSlice)
        ),
        {
          name: 'precintos-storage',
          partialize: (state) => ({ 
            precintos: state.precintos,
            precintosActivos: state.precintosActivos,
            filters: state.filters
          }),
          version: 1,
          migrate: (persistedState: unknown, version: number) => {
            if (version === 0) {
              // Migration logic if needed
            }
            return persistedState as PrecintosStore
          }
        }
      )
    ),
    { 
      name: 'PrecintosStore',
      trace: true 
    }
  )
)
// Store individual para Tránsitos
export const useTransitosStore = create<TransitosStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer(createTransitosSlice),
        {
          name: 'transitos-storage',
          partialize: (state) => ({ 
            transitos: state.transitos,
            transitosPendientes: state.transitosPendientes,
            filters: state.filters
          }),
          version: 1
        }
      )
    ),
    { 
      name: 'TransitosStore',
      trace: true 
    }
  )
)
// Store individual para Alertas
export const useAlertasStore = create<AlertasStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer(createAlertasSlice),
        {
          name: 'alertas-storage',
          partialize: (state) => ({ 
            alertas: state.alertas,
            alertasActivas: state.alertasActivas,
            filter: state.filter 
          }),
          version: 1
        }
      )
    ),
    { 
      name: 'AlertasStore',
      trace: true 
    }
  )
)
// Store individual para System Status (sin persistencia)
export const useSystemStatusStore = create<SystemStatusStore>()(
  devtools(
    subscribeWithSelector(
      immer(createSystemStatusSlice)
    ),
    { 
      name: 'SystemStatusStore',
      trace: true 
    }
  )
)
// Store selectors for optimization
export const storeSelectors = {
  // Precintos selectors
  usePrecintosActivos: () => usePrecintosStore((state) => state.precintosActivos),
  usePrecintosStats: () => usePrecintosStore((state) => state.precintosStats),
  useFilteredPrecintos: () => usePrecintosStore((state) => state.filteredPrecintos),
  
  // Transitos selectors
  useTransitosEnCurso: () => useTransitosStore((state) => state.transitosEnCurso),
  useTransitosStats: () => useTransitosStore((state) => state.transitosStats),
  useFilteredTransitos: () => useTransitosStore((state) => state.filteredTransitos),
  
  // Alertas selectors
  useAlertasCriticas: () => useAlertasStore((state) => state.alertasCriticas),
  useAlertasStats: () => useAlertasStore((state) => state.alertasStats),
  useFilteredAlertas: () => useAlertasStore((state) => state.filteredAlertas),
  
  // System selectors
  useSystemHealth: () => useSystemStatusStore((state) => state.systemHealth),
  useIsSystemOverloaded: () => useSystemStatusStore((state) => state.isSystemOverloaded),
}
// Función helper para inicializar todos los stores
export const initializeStores = async () => {
  // Fetch initial data for all stores
  await Promise.all([
    usePrecintosStore.getState().fetchPrecintosActivos(),
    useTransitosStore.getState().fetchTransitosPendientes(),
    useAlertasStore.getState().fetchAlertasActivas(),
    useSystemStatusStore.getState().fetchEstadisticas(),
  ])
}
// Setup WebSocket subscriptions for real-time updates
export const setupRealtimeUpdates = () => {
  // WebSocket connection would go here
  // For now, we'll use polling as a fallback

  const wsSupported = 'WebSocket' in window
  if (!wsSupported) {
    console.warn('WebSocket not supported, falling back to polling')
    return setupAutoRefresh()
  }
  
  // In production, establish WebSocket connection here
  // ws.on('precinto:update', (data) => usePrecintosStore.getState().updatePrecinto(data.id, data))
  // ws.on('alerta:new', (data) => useAlertasStore.getState().addAlerta(data))
  // etc.
  
  // For now, use polling
  return setupAutoRefresh()
}
// Auto-refresh functions (fallback when WebSocket is not available)
export const setupAutoRefresh = () => {
  const intervals: NodeJS.Timeout[] = []
  // Only refresh if page is visible
  const shouldRefresh = () => document.visibilityState === 'visible'
  // Refresh precintos every 10 seconds
  intervals.push(setInterval(() => {
      if (shouldRefresh()) {
        usePrecintosStore.getState().fetchPrecintosActivos()
      }
    }, 10000)
  )
  // Refresh transitos every 30 seconds
  intervals.push(setInterval(() => {
      if (shouldRefresh()) {
        useTransitosStore.getState().fetchTransitosPendientes()
      }
    }, 30000)
  )
  // Refresh alertas every 10 seconds
  intervals.push(setInterval(() => {
      if (shouldRefresh()) {
        useAlertasStore.getState().fetchAlertasActivas()
      }
    }, 10000)
  )
  // Refresh system status every 5 seconds
  intervals.push(setInterval(() => {
      if (shouldRefresh()) {
        useSystemStatusStore.getState().fetchEstadisticas()
      }
    }, 5000)
  )
  // Return cleanup function
  return () => {
    intervals.forEach(interval => clearInterval(interval))
  }
}
// Export dashboard store
export { useDashboardStore } from './dashboardStore'
// Cross-store subscriptions for reactive updates
const setupStoreSubscriptions = () => {
  // Update system status when alerts count changes
  useAlertasStore.subscribe((state) => state.alertasActivas.length,
    (count) => {
      const currentStats = useSystemStatusStore.getState().estadisticas
      if (currentStats) {
        useSystemStatusStore.getState().updateSystemStatus({
          estadisticas: {
            ...currentStats,
            alertasActivas: count,
          }
        })
      }
    }
  )
  // Update alerts when precinto status changes to critical
  usePrecintosStore.subscribe((state) => state.precintosActivos,
    (precintos) => {
      const criticosNuevos = precintos.filter(p => p.estado === 3)
      // In a real app, this would create new alerts
      console.log('Precintos críticos:', criticosNuevos.length)
    }
  )
}
// Initialize subscriptions on app start
if (typeof window !== 'undefined') {
  setupStoreSubscriptions()
}