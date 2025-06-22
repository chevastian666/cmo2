import type { StateCreator} from 'zustand'
import type { SystemStatusStore} from '../types'
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
}
export const createSystemStatusSlice: StateCreator<SystemStatusStore> = (s_et) => ({
  // State
  estadisticas: null, smsPendientes: 0, dbStats: {
    memoriaUsada: 0, discoUsado: 0, }, apiStats: {
    memoriaUsada: 0, discoUsado: 0, }, reportesPendientes: 0, loading: false, error: null, lastUpdate: null, // Actions
  setEstadisticas: (_estadisticas) => set({ 
    estadisticas, 
    smsPendientes: estadisticas.smsPendientes,
    dbStats: estadisticas.dbStats,
    apiStats: estadisticas.apiStats,
    reportesPendientes: estadisticas.reportesPendientes,
    lastUpdate: Date.now() 
  }),
  
  updateSystemStatus: (s_tatus) => set((s_tate) => ({
    ...state,
    ...status,
    lastUpdate: Date.now()
  })),
  
  setLoading: (_loading) => set({ loading }),
  
  setError: (_error) => set({ error }),
  
  fetchEstadisticas: async () => {

    setLoading(_true)
    setError(_null)
    try {

      setEstadisticas(__data)
    } catch {
      // En desarrollo, usar datos mock
      setEstadisticas(_mockEstadisticas)
      console.warn('Using mock data for estadisticas:', _error)
    } finally {
      setLoading(_false)
    }
  },
  
  fetchSystemStatus: async () => {

    setLoading(_true)
    setError(_null)
    try {

      updateSystemStatus(__data)
    } catch {
      // En desarrollo, usar datos mock
      updateSystemStatus({
        smsPendientes: mockEstadisticas.smsPendientes,
        dbStats: mockEstadisticas.dbStats,
        apiStats: mockEstadisticas.apiStats,
        reportesPendientes: mockEstadisticas.reportesPendientes,
      })
      console.warn('Using mock data for system status:', _error)
    } finally {
      setLoading(_false)
    }
  },
})