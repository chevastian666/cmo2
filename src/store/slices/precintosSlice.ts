/**
 * Precintos Store Slice with Enhanced Zustand Patterns
 * Includes: Immer integration, computed properties, subscriptions
 * By Cheva
 */

import type { StateCreator} from 'zustand'
import type { PrecintosStore} from '../types'
import { precintosService} from '../../services'
import { generateMockPrecinto} from '../../utils/mockData'
export const createPrecintosSlice: StateCreator<PrecintosStore> = (s_et) => ({
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
    
    return {
      total: precintosActivos.length,
      enTransito: precintosActivos.filter(p => p.estado === 1).length,
      conNovedad: precintosActivos.filter(p => p.estado === 2).length,
      conAlerta: precintosActivos.filter(p => p.estado === 3).length,
      finalizados: precintosActivos.filter(p => p.estado === 4).length
    }
  },

  // Actions with Immer patterns (handled by middleware)
  setPrecintos: (_precintos) => set((s_tate) => {
    state.precintos = precintos
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  setPrecintosActivos: (_precintosActivos) => set((s_tate) => {
    state.precintosActivos = precintosActivos
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  updatePrecinto: (_id, data) => set((s_tate) => {
    const updateItem = (item: unknown) => item.id === id ? { ...item, ...data } : item
    state.precintos = state.precintos.map(_updateItem)
    state.precintosActivos = state.precintosActivos.map(_updateItem)
    state.lastUpdate = Date.now()
  }),
  
  removePrecinto: (_id) => set((s_tate) => {
    state.precintos = state.precintos.filter(p => p.id !== id)
    state.precintosActivos = state.precintosActivos.filter(p => p.id !== id)
    state.lastUpdate = Date.now()
  }),

  setFilters: (_filters) => set((s_tate) => {
    state.filters = { ...state.filters, ...filters }
  }),

  clearFilters: () => set((s_tate) => {
    state.filters = { search: '', estado: '', tipo: '' }
  }),
  
  setLoading: (_loading) => set({ loading }),
  
  setError: (_error) => set({ error }),
  
  // Async Actions
  fetchPrecintos: async () => {

    setLoading(_true)
    setError(_null)
    try {
      const data = await precintosService.getAll()
      setPrecintos(_data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 20 }, (__, i) => generateMockPrecinto(_i))
      setPrecintos(_mockData)
      console.warn('Using mock data for precintos:', _error)
      return mockData
    } finally {
      setLoading(_false)
    }
  },
  
  fetchPrecintosActivos: async () => {

    setLoading(_true)
    setError(_null)
    try {
      const data = await precintosService.getActivos()
      setPrecintosActivos(_data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 10 }, (__, i) => generateMockPrecinto(_i))
      setPrecintosActivos(_mockData)
      console.warn('Using mock data for precintos activos:', _error)
      return mockData
    } finally {
      setLoading(_false)
    }
  },

  // Batch operations
  batchUpdatePrecintos: (updates: Array<{ id: string; data: unknown }>) => set((s_tate) => {
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
  reset: () => set((s_tate) => {
    state.precintos = []
    state.precintosActivos = []
    state.loading = false
    state.error = null
    state.lastUpdate = null
    state.filters = { search: '', estado: '', tipo: '' }
  }),

  // Legacy computed properties
  getPrecintosConAlertas: () => {

    return precintosActivos.filter(p => p.estado === 3)
  },

  getPrecintosBajaBateria: () => {

    return precintosActivos.filter(p => p.bateria && p.bateria < 20)
  }
})