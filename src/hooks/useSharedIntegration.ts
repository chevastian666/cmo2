import { useEffect } from 'react';
import { sharedStateService } from '../services/shared/sharedState.service';
import { authService } from '../services/shared/auth.service';
import {
  usePrecintosStore,
  useTransitosStore,
  useAlertasStore,
  useSystemStatusStore
} from '../store';

/**
 * Hook to integrate shared state with local Zustand stores
 * This provides a bridge between the shared state and the existing store architecture
 */
export function useSharedIntegration() {
  useEffect(() => {
    // Initialize shared services
    authService.initialize();
    sharedStateService.initialize();

    // Subscribe to shared state changes and update local stores
    const unsubscribers: (() => void)[] = [];

    // Sync Transitos
    unsubscribers.push(
      sharedStateService.subscribeToKey('transitosPendientes', (transitos) => {
        useTransitosStore.getState().setTransitosPendientes(transitos);
      })
    );

    // Sync Precintos
    unsubscribers.push(
      sharedStateService.subscribeToKey('precintosActivos', (precintos) => {
        usePrecintosStore.getState().setPrecintosActivos(precintos);
      })
    );

    // Sync Alertas
    unsubscribers.push(
      sharedStateService.subscribeToKey('alertasActivas', (alertas) => {
        useAlertasStore.getState().setAlertasActivas(alertas);
      })
    );

    // Sync System Status
    unsubscribers.push(
      sharedStateService.subscribeToKey('systemStatus', (status) => {
        if (status) {
          useSystemStatusStore.getState().updateSystemStatus({
            smsPendientes: status.smsPendientes || 0,
            dbStats: status.dbStats || { memoriaUsada: 0, discoUsado: 0 },
            apiStats: status.apiStats || { memoriaUsada: 0, discoUsado: 0 },
            reportesPendientes: status.reportesPendientes || 0,
            estadisticas: status.estadisticas
          });
        }
      })
    );

    // Clean up on unmount
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
}

/**
 * Hook to sync local store actions with shared state
 * This ensures that actions performed through local stores update the shared state
 */
export function useSyncStoreActions() {
  useEffect(() => {
    // Override store actions to sync with shared state
    const stores = [
      usePrecintosStore,
      useTransitosStore,
      useAlertasStore,
      useSystemStatusStore
    ];

    // Store original actions
    const originalActions = stores.map(store => ({
      store,
      actions: { ...store.getState() }
    }));

    // Override fetch methods to use shared state
    usePrecintosStore.setState({
      fetchPrecintosActivos: async () => {
        await sharedStateService.refreshPrecintos();
      }
    });

    useTransitosStore.setState({
      fetchTransitosPendientes: async () => {
        await sharedStateService.refreshTransitos();
      }
    });

    useAlertasStore.setState({
      fetchAlertasActivas: async () => {
        await sharedStateService.refreshAlertas();
      }
    });

    // Clean up is handled by Zustand itself
  }, []);
}