/**
 * Alertas Slice - Enhanced with best practices
 * By Cheva
 */

import type { StateCreator } from 'zustand'
import type { 
  AlertasState, 
  AlertasActions, 
  AlertasComputedProperties, 
  AlertasStore 
} from '../types'
import type { Alerta } from '../../types/monitoring'
import type { AlertaExtendida } from '../../types/alerts'
import { alertasService } from '../../services/alertas.service'
import { generateMockAlertas } from '../../utils/mockData'

export const createAlertasSlice: StateCreator<
  AlertasStore,
  [],
  [],
  AlertasState & AlertasActions & AlertasComputedProperties
> = (set, get) => ({
  // State
  alertas: [],
  alertasActivas: [],
  alertasExtendidas: new Map(),
  loading: false,
  error: null,
  lastUpdate: null,
  filter: {
    search: ''
  },

  // Computed properties
  get alertasCriticas() {
    return get().alertasActivas.filter(a => a.severidad === 'critica')
  },

  get alertasAltas() {
    return get().alertasActivas.filter(a => a.severidad === 'alta')
  },

  get alertasMedias() {
    return get().alertasActivas.filter(a => a.severidad === 'media')
  },

  get alertasBajas() {
    return get().alertasActivas.filter(a => a.severidad === 'baja')
  },

  get filteredAlertas() {
    const { alertas, filter } = get()
    if (!filter.search) return alertas
    
    const searchLower = filter.search.toLowerCase()
    return alertas.filter(alerta => 
      alerta.mensaje.toLowerCase().includes(searchLower) ||
      alerta.codigoPrecinto.toLowerCase().includes(searchLower) ||
      alerta.tipo.toLowerCase().includes(searchLower)
    )
  },

  get alertasStats() {
    const { alertasActivas, alertas } = get()
    return {
      total: alertasActivas.length,
      criticas: alertasActivas.filter(a => a.severidad === 'critica').length,
      altas: alertasActivas.filter(a => a.severidad === 'alta').length,
      medias: alertasActivas.filter(a => a.severidad === 'media').length,
      bajas: alertasActivas.filter(a => a.severidad === 'baja').length,
      sinAtender: alertas.filter(a => !a.atendida).length,
      asignadas: 0, // TODO: Implement when assignment feature is added
      resueltas: alertas.filter(a => a.atendida).length
    }
  },

  get alertasByPrecinto() {
    const map = new Map<string, Alerta[]>()
    get().alertas.forEach(alerta => {
      const list = map.get(alerta.precintoId) || []
      list.push(alerta)
      map.set(alerta.precintoId, list)
    })
    return map
  },

  get recentAlertas() {
    const now = Date.now()
    const hourAgo = now - 3600000 // 1 hour
    return get().alertas
      .filter(a => a.timestamp > hourAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
  },

  get alertasTrend() {
    const { alertas } = get()
    const now = Date.now()
    const dayAgo = now - 86400000 // 24 hours
    
    // Group by hour
    const hourlyData = new Map<number, number>()
    alertas.forEach(alerta => {
      if (alerta.timestamp > dayAgo) {
        const hour = new Date(alerta.timestamp).getHours()
        hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1)
      }
    })
    
    // Convert to array for chart
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyData.get(hour) || 0
    }))
  },

  // Actions
  setAlertas: (alertas) => set({ alertas, lastUpdate: Date.now() }),
  
  setAlertasActivas: (alertasActivas) => set({ alertasActivas, lastUpdate: Date.now() }),
  
  addAlerta: (alerta) => set((state) => ({
    alertas: [alerta, ...state.alertas],
    alertasActivas: alerta.atendida ? state.alertasActivas : [alerta, ...state.alertasActivas],
    lastUpdate: Date.now()
  })),
  
  updateAlerta: (id, data) => set((state) => ({
    ...state,
    alertas: state.alertas.map(item => item.id === id ? { ...item, ...data } : item),
    alertasActivas: state.alertasActivas.map(item => item.id === id ? { ...item, ...data } : item),
    lastUpdate: Date.now()
  })),
  
  removeAlerta: (id) => set((state) => ({
    ...state,
    alertas: state.alertas.filter(a => a.id !== id),
    alertasActivas: state.alertasActivas.filter(a => a.id !== id),
    lastUpdate: Date.now()
  })),
  
  atenderAlerta: async (id) => {
    const { setError, updateAlerta } = get()
    setError(null)
    try {
      await alertasService.atender(id)
      updateAlerta(id, { atendida: true })
      // Remove from active alerts
      set((state) => ({
        ...state,
        alertasActivas: state.alertasActivas.filter(a => a.id !== id)
      }))
    } catch (error) {
      // En desarrollo, simular atención
      updateAlerta(id, { atendida: true })
      set((state) => ({
        ...state,
        alertasActivas: state.alertasActivas.filter(a => a.id !== id)
      }))
      console.warn('Simulating alert attention:', error)
    }
  },
  
  setFilter: (filter) => set((state) => ({
    ...state,
    filter: { ...state.filter, ...filter }
  })),

  clearFilter: () => set((state) => ({
    ...state,
    filter: { search: '' }
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  // Async actions
  fetchAlertas: async () => {
    const { setLoading, setError, setAlertas } = get()
    setLoading(true)
    setError(null)
    try {
      const data = await alertasService.getAll()
      setAlertas(data)
      return data
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas()
      setAlertas(mockData)
      console.warn('Using mock data for alertas:', error)
      return mockData
    } finally {
      setLoading(false)
    }
  },
  
  fetchAlertasActivas: async () => {
    const { setLoading, setError, setAlertasActivas } = get()
    setLoading(true)
    setError(null)
    try {
      const data = await alertasService.getActivas()
      setAlertasActivas(data)
      return data
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas().filter(a => !a.atendida)
      setAlertasActivas(mockData)
      console.warn('Using mock data for alertas activas:', error)
      return mockData
    } finally {
      setLoading(false)
    }
  },

  // Batch operations
  batchUpdateAlertas: (updates) => set((state) => {
    const alertas = [...state.alertas]
    const alertasActivas = [...state.alertasActivas]
    
    updates.forEach(({ id, data }) => {
      const index = alertas.findIndex(a => a.id === id)
      if (index !== -1) {
        alertas[index] = { ...alertas[index], ...data }
      }
      
      const activeIndex = alertasActivas.findIndex(a => a.id === id)
      if (activeIndex !== -1) {
        alertasActivas[activeIndex] = { ...alertasActivas[activeIndex], ...data }
      }
    })
    
    return { ...state, alertas, alertasActivas, lastUpdate: Date.now() }
  }),

  batchAtenderAlertas: async (ids) => {
    const { batchUpdateAlertas, setAlertasActivas, alertasActivas } = get()
    try {
      // In production, this would be a batch API call
      await Promise.all(ids.map(id => alertasService.atender(id)))
      // Update all alerts as attended
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })))
      // Remove from active alerts
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)))
    } catch (error) {
      console.error('Error batch attending alerts:', error)
      // Still update in development
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })))
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)))
    }
  },

  // Reset store
  reset: () => set({
    alertas: [],
    alertasActivas: [],
    alertasExtendidas: new Map(),
    loading: false,
    error: null,
    lastUpdate: null,
    filter: { search: '' }
  }),

  // Extended alert management
  fetchAlertaExtendida: async (id: string): Promise<AlertaExtendida | null> => {
    const { alertasExtendidas } = get()
    
    // Check cache first
    if (alertasExtendidas.has(id)) {
      return alertasExtendidas.get(id)!
    }
    
    try {
      // Get basic alert data and extend it
      const alerta = await alertasService.getById(id)
      const extendedData: AlertaExtendida = {
        ...alerta,
        // Add extended properties with default values
        historial: [],
        precinto: null,
        ubicacionHistorica: [],
        comentarios: [],
        asignaciones: [],
        verificaciones: []
      }
      
      set((state) => {
        const newMap = new Map(state.alertasExtendidas)
        newMap.set(id, extendedData)
        return { ...state, alertasExtendidas: newMap }
      })
      return extendedData
    } catch (error) {
      console.error('Error fetching extended alert:', error)
      return null
    }
  },

  clearAlertaExtendidaCache: () => set((state) => ({
    ...state,
    alertasExtendidas: new Map()
  }))
})