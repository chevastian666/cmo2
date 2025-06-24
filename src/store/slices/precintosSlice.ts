/**
 * Precintos Store Slice with Enhanced Zustand Patterns
 * Includes: Immer integration, computed properties, subscriptions
 * By Cheva
 */

import type { StateCreator} from 'zustand'
import type { PrecintosStore} from '../types'
import type { Precinto } from '../../types/monitoring'
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
        precinto.codigo.toLowerCase().includes(filters.search.toLowerCase())
      const matchesEstado = !filters.estado || precinto.estado === filters.estado
      const matchesTipo = !filters.tipo || precinto.tipo === filters.tipo
      return matchesSearch && matchesEstado && matchesTipo
    })
  },

  get precintosStats() {
    const { precintosActivos } = get()
    return {
      total: precintosActivos.length,
      enTransito: precintosActivos.filter(p => p.estado === 'SAL').length,
      conNovedad: precintosActivos.filter(p => p.estado === 'LLE').length,
      conAlerta: precintosActivos.filter(p => p.estado === 'FMF').length,
      finalizados: precintosActivos.filter(p => p.estado === 'CFM' || p.estado === 'CNP').length
    }
  },

  // Actions with Immer patterns (handled by middleware)
  setPrecintos: (precintos) => set({ precintos, lastUpdate: Date.now(), error: null }),
  
  setPrecintosActivos: (precintosActivos) => set({ precintosActivos, lastUpdate: Date.now(), error: null }),
  
  updatePrecinto: (id, data) => set((state) => ({
    precintos: state.precintos.map(item => item.id === id ? { ...item, ...data } : item),
    precintosActivos: state.precintosActivos.map(item => item.id === id ? { ...item, ...data } : item),
    lastUpdate: Date.now()
  })),
  
  removePrecinto: (id) => set((state) => ({
    precintos: state.precintos.filter(p => p.id !== id),
    precintosActivos: state.precintosActivos.filter(p => p.id !== id),
    lastUpdate: Date.now()
  })),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  clearFilters: () => set({ filters: { search: '', estado: '', tipo: '' } }),
  
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
    } catch (error) {
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
    } catch (error) {
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
  batchUpdatePrecintos: (updates: Array<{ id: string; data: Partial<Precinto> }>) => set((state) => {
    const precintos = [...state.precintos]
    const precintosActivos = [...state.precintosActivos]
    
    updates.forEach(({ id, data }) => {
      const index = precintos.findIndex(p => p.id === id)
      if (index !== -1) {
        precintos[index] = { ...precintos[index], ...data }
      }
      
      const activeIndex = precintosActivos.findIndex(p => p.id === id)
      if (activeIndex !== -1) {
        precintosActivos[activeIndex] = { ...precintosActivos[activeIndex], ...data }
      }
    })
    
    return { precintos, precintosActivos, lastUpdate: Date.now() }
  }),

  // Reset store
  reset: () => set(() => ({
    precintos: [],
    precintosActivos: [],
    loading: false,
    error: null,
    lastUpdate: null,
    filters: { search: '', estado: '', tipo: '' }
  })),

  // Legacy computed properties
  getPrecintosConAlertas: () => {
    const { precintosActivos } = get()
    return precintosActivos.filter(p => p.estado === 'FMF')
  },

  getPrecintosBajaBateria: () => {
    const { precintosActivos } = get()
    return precintosActivos.filter(p => p.bateria && p.bateria < 20)
  }
})