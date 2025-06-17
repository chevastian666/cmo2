import { useEffect } from 'react';
import { useSystemStatusStore } from '../store';

export const useSystemStatus = () => {
  const store = useSystemStatusStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (!store.estadisticas && !store.loading) {
      store.fetchEstadisticas();
    }
  }, []);

  return {
    estadisticas: store.estadisticas,
    smsPendientes: store.smsPendientes,
    dbStats: store.dbStats,
    apiStats: store.apiStats,
    reportesPendientes: store.reportesPendientes,
    loading: store.loading,
    error: store.error,
    actions: {
      updateStatus: store.updateSystemStatus,
      refresh: store.fetchEstadisticas,
    }
  };
};

export const useEstadisticas = () => {
  const estadisticas = useSystemStatusStore((state) => state.estadisticas);
  const loading = useSystemStatusStore((state) => state.loading);
  
  return {
    data: estadisticas,
    loading,
    isLoaded: !!estadisticas,
  };
};