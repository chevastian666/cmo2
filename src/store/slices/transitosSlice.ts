/**
 * Transitos Slice - Enhanced with best practices
 * By Cheva
 */

import type { StateCreator } from 'zustand'
import type { TransitosState, TransitosActions, TransitosComputedProperties, TransitosStore } from '../types'
import type { Transito } from '../../features/transitos/types'
import type { TransitoPendiente } from '../../types/monitoring'
import { transitosService } from '../../services/transitos.service'
import { notificationService } from '../../services/shared/notification.service'
import { generateMockTransito } from '../../utils/mockData'

export const createTransitosSlice: StateCreator<
  TransitosStore,
  [],
  [],
  TransitosState & TransitosActions & TransitosComputedProperties
> = (set, get) => ({
  // State
  transitos: [],
  transitosPendientes: [],
  loading: false,
  error: null,
  lastUpdate: null,
  filters: {
    search: '',
    estado: '',
    tipo: '',
    origen: undefined,
    destino: undefined,
    fechaDesde: undefined,
    fechaHasta: undefined
  },

  // Computed
  get filteredTransitos() {
    const { transitos, filters } = get()
    return transitos.filter(transito => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          transito.dua.toLowerCase().includes(searchLower) ||
          transito.chofer.toLowerCase().includes(searchLower) ||
          transito.matricula.toLowerCase().includes(searchLower) ||
          transito.origen.toLowerCase().includes(searchLower) ||
          transito.destino.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      if (filters.estado && transito.estado !== filters.estado) return false
      if (filters.origen && transito.origen !== filters.origen) return false
      if (filters.destino && transito.destino !== filters.destino) return false
      return true
    })
  },

  get transitosStats() {
    const transitos = get().filteredTransitos
    return {
      total: transitos.length,
      enCurso: transitos.filter(t => t.estado === 'EN_TRANSITO').length,
      completados: transitos.filter(t => t.estado === 'COMPLETADO').length,
      conAlertas: transitos.filter(t => t.estado === 'ALERTA').length,
      demorados: transitos.filter(t => t.tiempoRestante && t.tiempoRestante < 0).length
    }
  },

  // Actions
  setTransitos: (transitos) => set({ transitos, lastUpdate: Date.now() }),
  
  setTransitosPendientes: (transitosPendientes) => set({ transitosPendientes, lastUpdate: Date.now() }),
  
  updateTransito: (id, data) => set((state) => ({
    transitos: state.transitos.map(t => t.id === id ? { ...t, ...data } : t),
    transitosPendientes: state.transitosPendientes.map(t => {
      if (t.id === id) {
        // Only update fields that exist in TransitoPendiente
        const validUpdate: Partial<TransitoPendiente> = {}
        if ('dua' in data) validUpdate.dua = data.dua
        if ('origen' in data) validUpdate.origen = data.origen
        if ('destino' in data) validUpdate.destino = data.destino
        if ('matricula' in data) validUpdate.matricula = data.matricula
        if ('chofer' in data) validUpdate.chofer = data.chofer
        // Map Transito estado to TransitoPendiente estado if provided
        if ('estado' in data) {
          if (data.estado === 'PENDIENTE') validUpdate.estado = 'pendiente'
          else if (data.estado === 'EN_TRANSITO') validUpdate.estado = 'en_proceso'
          else if (data.estado === 'COMPLETADO') validUpdate.estado = 'precintado'
        }
        return { ...t, ...validUpdate }
      }
      return t
    }),
  })),
  
  removeTransito: (id) => set((state) => ({
    transitos: state.transitos.filter(t => t.id !== id),
    transitosPendientes: state.transitosPendientes.filter(t => t.id !== id),
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({
    filters: {
      search: '',
      estado: '',
      tipo: '',
      origen: undefined,
      destino: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined
    }
  }),
  
  // Legacy computed properties
  get transitosEnCurso() {
    return get().transitos.filter(t => t.estado === 'EN_TRANSITO')
  },
  
  get transitosCompletados() {
    return get().transitos.filter(t => t.estado === 'COMPLETADO')
  },
  
  get transitosConAlertas() {
    return get().transitos.filter(t => t.estado === 'ALERTA' || t.estado === 'con_alerta')
  },
  
  // Async actions
  fetchTransitos: async () => {
    const { setLoading, setError, setTransitos } = get()
    setLoading(true)
    setError(null)
    try {

      const pendientes = await transitosService.getAll()
      // Convert TransitoPendiente to Transito for transitos array
      const transitos: Transito[] = pendientes.map(p => ({
        id: p.id || String(p.mov),
        dua: p.dua,
        precinto: '',
        viaje: p.numeroViaje,
        mov: p.mov,
        estado: p.estado === 'pendiente' ? 'PENDIENTE' as const : 
                p.estado === 'en_proceso' ? 'EN_TRANSITO' as const : 'COMPLETADO' as const,
        fechaSalida: new Date().toISOString(),
        encargado: p.despachante,
        origen: p.origen,
        destino: p.destino,
        empresa: p.empresa || '',
        matricula: p.matricula,
        chofer: p.chofer || '',
        precintoId: '',
        fechaInicio: new Date()
      }))
      setTransitos(transitos)
      return transitos
    } catch (error) {
      // En desarrollo, usar datos mock con estados variados
      // Generate mock Transito data, not TransitoPendiente
      const mockData: Transito[] = Array.from({ length: 20 }, (_, i) => {
        const pending = generateMockTransito(i)
        return {
          id: pending.id || String(i),
          dua: pending.dua,
          precinto: `P${i}`,
          viaje: pending.numeroViaje,
          mov: pending.mov,
          estado: i < 8 ? 'EN_TRANSITO' as const : i < 14 ? 'COMPLETADO' as const : 'PENDIENTE' as const,
          fechaSalida: new Date().toISOString(),
          encargado: pending.despachante,
          origen: pending.origen,
          destino: pending.destino,
          empresa: pending.empresa || '',
          matricula: pending.matricula,
          chofer: pending.chofer || '',
          precintoId: `P${i}`,
          fechaInicio: new Date(),
          progreso: i < 8 ? Math.floor(Math.random() * 100) : undefined
        }
      })
      setTransitos(mockData)
      setError(error instanceof Error ? error.message : 'Error fetching transitos')
      return mockData
    } finally {
      setLoading(false)
    }
  },
  
  fetchTransitosPendientes: async () => {
    const { setLoading, setError, setTransitosPendientes } = get()
    setLoading(true)
    setError(null)
    try {

      const data = await transitosService.getPendientes()
      setTransitosPendientes(data)
      return []
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 12 }, (_, i) => generateMockTransito(i))
      setTransitosPendientes(mockData)
      console.warn('Using mock data for transitos pendientes:', error)
      return []
    } finally {
      setLoading(false)
    }
  },
  
  precintarTransito: async (transitoId, precintoId) => {
    const { setError, updateTransito } = get()
    setError(null)
    try {
      await transitosService.precintar(transitoId, precintoId)
      updateTransito(transitoId, { estado: 'EN_TRANSITO' })
      notificationService.success('Tránsito precintado exitosamente')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al precintar tránsito')
      notificationService.error('No se pudo precintar el tránsito')
      throw error
    }
  },
  
  markDesprecintado: async (transitoId) => {
    const { setError, updateTransito } = get()
    setError(null)
    try {
      await transitosService.markDesprecintado(transitoId)
      updateTransito(transitoId, { estado: 'COMPLETADO' })
      notificationService.success('Tránsito Completado')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al marcar como desprecintado')
      notificationService.error('Error')
      throw error
    }
  },
  
  batchUpdateTransitos: (updates) => set((state) => {
    const transitos = [...state.transitos]
    const transitosPendientes = [...state.transitosPendientes]
    
    updates.forEach(({ id, data }) => {
      const index = transitos.findIndex(t => t.id === id)
      if (index !== -1) {
        transitos[index] = { ...transitos[index], ...data }
      }
      
      const pendingIndex = transitosPendientes.findIndex(t => t.id === id)
      if (pendingIndex !== -1) {
        // Only update fields that exist in TransitoPendiente
        const validUpdate: Partial<TransitoPendiente> = {}
        if ('dua' in data) validUpdate.dua = data.dua
        if ('origen' in data) validUpdate.origen = data.origen
        if ('destino' in data) validUpdate.destino = data.destino
        if ('matricula' in data) validUpdate.matricula = data.matricula
        if ('chofer' in data) validUpdate.chofer = data.chofer
        // Map Transito estado to TransitoPendiente estado if provided
        if ('estado' in data) {
          if (data.estado === 'PENDIENTE') validUpdate.estado = 'pendiente'
          else if (data.estado === 'EN_TRANSITO') validUpdate.estado = 'en_proceso'
          else if (data.estado === 'COMPLETADO') validUpdate.estado = 'precintado'
        }
        transitosPendientes[pendingIndex] = { ...transitosPendientes[pendingIndex], ...validUpdate }
      }
    })
    
    return { transitos, transitosPendientes, lastUpdate: Date.now() }
  }),
  
  reset: () => set({
    transitos: [],
    transitosPendientes: [],
    loading: false,
    error: null,
    lastUpdate: null,
    filters: {
      search: '',
      estado: '',
      tipo: '',
      origen: undefined,
      destino: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined
    }
  }),
})