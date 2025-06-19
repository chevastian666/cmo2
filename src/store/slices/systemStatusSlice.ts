import type { StateCreator } from 'zustand';
import type { SystemStatusStore } from '../types';
import { estadisticasService } from '../../services';

const mockEstadisticas = {
  precintosActivos: 1247,
  precintosEnTransito: 892,
  precintosViolados: 3,
  alertasActivas: 8,
  lecturasPorHora: 3456,
  tiempoPromedioTransito: 48.5,
  tasaExito: 99.7,
  precintosConBateriaBaja: 23,
  smsPendientes: 127,
  dbStats: {
    memoriaUsada: 73.4,
    discoUsado: 45.2
  },
  apiStats: {
    memoriaUsada: 67.8,
    discoUsado: 23.1
  },
  reportesPendientes: 15
};

export const createSystemStatusSlice: StateCreator<SystemStatusStore> = (set, get) => ({
  // State
  estadisticas: null,
  smsPendientes: 0,
  dbStats: {
    memoriaUsada: 0,
    discoUsado: 0,
  },
  apiStats: {
    memoriaUsada: 0,
    discoUsado: 0,
  },
  reportesPendientes: 0,
  loading: false,
  error: null,
  lastUpdate: null,

  // Actions
  setEstadisticas: (estadisticas) => set({ 
    estadisticas, 
    smsPendientes: estadisticas.smsPendientes,
    dbStats: estadisticas.dbStats,
    apiStats: estadisticas.apiStats,
    reportesPendientes: estadisticas.reportesPendientes,
    lastUpdate: Date.now() 
  }),
  
  updateSystemStatus: (status) => set((state) => ({
    ...state,
    ...status,
    lastUpdate: Date.now()
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchEstadisticas: async () => {
    const {setLoading, setError, setEstadisticas} = get();
    setLoading(true);
    setError(null);
    
    try {
      const _data = await estadisticasService.getGenerales();
      setEstadisticas(_data);
    } catch (_error) {
      // En desarrollo, usar datos mock
      setEstadisticas(mockEstadisticas);
      console.warn('Using mock data for estadisticas:', _error);
    } finally {
      setLoading(false);
    }
  },
  
  fetchSystemStatus: async () => {
    const {setLoading, setError, updateSystemStatus} = get();
    setLoading(true);
    setError(null);
    
    try {
      const _data = await estadisticasService.getEstadoSistema();
      updateSystemStatus(_data);
    } catch (_error) {
      // En desarrollo, usar datos mock
      updateSystemStatus({
        smsPendientes: mockEstadisticas.smsPendientes,
        dbStats: mockEstadisticas.dbStats,
        apiStats: mockEstadisticas.apiStats,
        reportesPendientes: mockEstadisticas.reportesPendientes,
      });
      console.warn('Using mock data for system status:', _error);
    } finally {
      setLoading(false);
    }
  },
});