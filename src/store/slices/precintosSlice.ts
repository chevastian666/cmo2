/**
 * Precintos Store Slice with Enhanced Zustand Patterns
 * Includes: Immer integration, computed properties, subscriptions
 * By Cheva
 */

import type { StateCreator} from 'zustand'
import type { PrecintosStore} from '../types'
import { precintosService} from '../../services'
import { generateMockPrecinto} from '../../utils/mockData'
export const createPrecintosSlice: StateCreator<PrecintosStore> = (set, get) => ({
  // State
  precintos: [],
  precintosActivos: [],
  loading: false,
  error: null,
  lastUpdate: null,
  filters: {
    search: '',
    estado: '',
    tipo: ''
  },

  // Computed Properties (_getters)
  get filteredPrecintos() {
    const { precintos, filters } = get()
    return precintos.filter(precinto => {
      const matchesSearch = !filters.search || 
        precinto.codigo.toLowerCase().includes(filters.search.toLowerCase()) ||
        precinto.matricula?.toLowerCase().includes(filters.search.toLowerCase())
      const matchesEstado = !filters.estado || precinto.estado === filters.estado
      const matchesTipo = !filters.tipo || precinto.tipo === filters.tipo
      return matchesSearch && matchesEstado && matchesTipo
    })
  },

  get precintosStats() {
    const { precintosActivos } = get()
    return {
      total: precintosActivos.length,
      enTransito: precintosActivos.filter(p => p.estado === 1).length,
      conNovedad: precintosActivos.filter(p => p.estado === 2).length,
      conAlerta: precintosActivos.filter(p => p.estado === 3).length,
      finalizados: precintosActivos.filter(p => p.estado === 4).length
    }
  },

  // Actions with Immer patterns (handled by middleware)
  setPrecintos: (precintos) => set((state) => {
    state.precintos = precintos
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  setPrecintosActivos: (precintosActivos) => set((state) => {
    state.precintosActivos = precintosActivos
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  updatePrecinto: (id, data) => set((state) => {
    const updateItem = (item: unknown) => item.id === id ? { ...item, ...data } : item
    state.precintos = state.precintos.map(updateItem)
    state.precintosActivos = state.precintosActivos.map(updateItem)
    state.lastUpdate = Date.now()
  }),
  
  removePrecinto: (id) => set((state) => {
    state.precintos = state.precintos.filter(p => p.id !== id)
    state.precintosActivos = state.precintosActivos.filter(p => p.id !== id)
    state.lastUpdate = Date.now()
  }),

  setFilters: (filters) => set((state) => {
    state.filters = { ...state.filters, ...filters }
  }),

  clearFilters: () => set((state) => {
    state.filters = { search: '', estado: '', tipo: '' }
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  // Async Actions
  fetchPrecintos: async () => {
    const { setLoading, setError, setPrecintos } = get()
    setLoading(true)
    setError(null)
    try {
      const data = await precintosService.getAll()
      setPrecintos(data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 20 }, (_, i) => generateMockPrecinto(i))
      setPrecintos(mockData)
      console.warn('Using mock data for precintos:', error)
      return mockData
    } finally {
      setLoading(false)
    }
  },
  
  fetchPrecintosActivos: async () => {
    const { setLoading, setError, setPrecintosActivos } = get()
    setLoading(true)
    setError(null)
    try {
      const data = await precintosService.getActivos()
      setPrecintosActivos(data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 10 }, (_, i) => generateMockPrecinto(i))
      setPrecintosActivos(mockData)
      console.warn('Using mock data for precintos activos:', error)
      return mockData
    } finally {
      setLoading(false)
    }
  },

  // Batch operations
  batchUpdatePrecintos: (updates: Array<{ id: string; data: unknown }>) => set((state) => {
    updates.forEach(({ id, data }) => {
      const index = state.precintos.findIndex(p => p.id === id)
      if (index !== -1) {
        state.precintos[index] = { ...state.precintos[index], ...data }
      }
      
      const activeIndex = state.precintosActivos.findIndex(p => p.id === id)
      if (activeIndex !== -1) {
        state.precintosActivos[activeIndex] = { ...state.precintosActivos[activeIndex], ...data }
      }
    })
    state.lastUpdate = Date.now()
  }),

  // Reset store
  reset: () => set((state) => {
    state.precintos = []
    state.precintosActivos = []
    state.loading = false
    state.error = null
    state.lastUpdate = null
    state.filters = { search: '', estado: '', tipo: '' }
  }),

  // Legacy computed properties
  getPrecintosConAlertas: () => {
    const { precintosActivos } = get()
    return precintosActivos.filter(p => p.estado === 3)
  },

  getPrecintosBajaBateria: () => {
    const { precintosActivos } = get()
    return precintosActivos.filter(p => p.bateria && p.bateria < 20)
  }
})