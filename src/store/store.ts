import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  createPrecintosSlice,
  createTransitosSlice,
  createAlertasSlice,
  createSystemStatusSlice
} from './slices';
import type { 
  PrecintosStore, 
  TransitosStore, 
  AlertasStore, 
  SystemStatusStore 
} from './types';

// Store individual para Precintos
export const usePrecintosStore = create<PrecintosStore>()(
  devtools(
    persist(
      createPrecintosSlice,
      {
        name: 'precintos-storage',
        partialize: (state) => ({ 
          precintos: state.precintos,
          precintosActivos: state.precintosActivos 
        }),
      }
    ),
    { name: 'PrecintosStore' }
  )
);

// Store individual para Tránsitos
export const useTransitosStore = create<TransitosStore>()(
  devtools(
    persist(
      createTransitosSlice,
      {
        name: 'transitos-storage',
        partialize: (state) => ({ 
          transitos: state.transitos,
          transitosPendientes: state.transitosPendientes 
        }),
      }
    ),
    { name: 'TransitosStore' }
  )
);

// Store individual para Alertas
export const useAlertasStore = create<AlertasStore>()(
  devtools(
    persist(
      createAlertasSlice,
      {
        name: 'alertas-storage',
        partialize: (state) => ({ 
          alertas: state.alertas,
          alertasActivas: state.alertasActivas,
          filter: state.filter 
        }),
      }
    ),
    { name: 'AlertasStore' }
  )
);

// Store individual para System Status
export const useSystemStatusStore = create<SystemStatusStore>()(
  devtools(
    createSystemStatusSlice,
    { name: 'SystemStatusStore' }
  )
);

// Función helper para inicializar todos los stores
export const initializeStores = async () => {
  // Fetch initial data for all stores
  await Promise.all([
    usePrecintosStore.getState().fetchPrecintosActivos(),
    useTransitosStore.getState().fetchTransitosPendientes(),
    useAlertasStore.getState().fetchAlertasActivas(),
    useSystemStatusStore.getState().fetchEstadisticas(),
  ]);
};

// Auto-refresh functions (fallback when WebSocket is not available)
export const setupAutoRefresh = () => {
  // Only use polling as fallback if WebSocket connection fails
  const checkConnection = () => {
    const wsConnected = window.localStorage.getItem('ws-connected') === 'true';
    if (!wsConnected) {
      console.log('WebSocket not connected, using polling fallback');
      return true;
    }
    return false;
  };

  let intervals: NodeJS.Timeout[] = [];

  const startPolling = () => {
    if (!checkConnection()) return;

    intervals = [
      // Refresh precintos every 10 seconds
      setInterval(() => {
        if (checkConnection()) {
          usePrecintosStore.getState().fetchPrecintosActivos();
        }
      }, 10000),

      // Refresh transitos every 30 seconds
      setInterval(() => {
        if (checkConnection()) {
          useTransitosStore.getState().fetchTransitosPendientes();
        }
      }, 30000),

      // Refresh alertas every 10 seconds
      setInterval(() => {
        if (checkConnection()) {
          useAlertasStore.getState().fetchAlertasActivas();
        }
      }, 10000),

      // Refresh system status every 5 seconds
      setInterval(() => {
        if (checkConnection()) {
          useSystemStatusStore.getState().fetchEstadisticas();
        }
      }, 5000)
    ];
  };

  // Start polling initially
  startPolling();

  // Return cleanup function
  return () => {
    intervals.forEach(interval => clearInterval(interval));
  };
};

// Subscriptions for cross-store updates
useAlertasStore.subscribe((state) => {
  // Update system status when alerts count changes
  const count = state.alertasActivas.length;
  const currentStats = useSystemStatusStore.getState().estadisticas;
  if (currentStats) {
    useSystemStatusStore.getState().updateSystemStatus({
      estadisticas: {
        ...currentStats,
        alertasActivas: count,
      }
    });
  }
});