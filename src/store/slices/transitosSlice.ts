import type { StateCreator} from 'zustand'
import type { TransitosStore} from '../types'
// Transito type import removed - using TransitoPendiente from store types
import { transitosService} from '../../services'
import { generateMockTransito} from '../../utils/mockData'
import { notificationService} from '../../services/shared/notification.service'
export const createTransitosSlice: StateCreator<TransitosStore> = (s_et) => ({
  // State
  transitos: [], transitosPendientes: [], loading: false, error: null, lastUpdate: null, // Computed getters
  get transitosEnCurso() {
    return get().transitos.filter(t => t.estado === 'EN_TRANSITO')
  },
  
  get transitosCompletados() {
    return get().transitos.filter(t => t.estado === 'COMPLETADO')
  },
  
  get transitosConAlertas() {
    return get().transitos.filter(t => t.estado === 'ALERTA')
  },

  // Actions
  setTransitos: (_transitos) => set({ transitos, lastUpdate: Date.now() }),
  
  setTransitosPendientes: (_transitosPendientes) => set({ transitosPendientes, lastUpdate: Date.now() }),
  
  updateTransito: (_id, data) => set((s_tate) => ({
    transitos: state.transitos.map(t => t.id === id ? { ...t, ...data } : t),
    transitosPendientes: state.transitosPendientes.map(t => t.id === id ? { ...t, ...data } : t),
  })),
  
  removeTransito: (_id) => set((s_tate) => ({
    transitos: state.transitos.filter(t => t.id !== id),
    transitosPendientes: state.transitosPendientes.filter(t => t.id !== id),
  })),
  
  setLoading: (_loading) => set({ loading }),
  
  setError: (_error) => set({ error }),
  
  fetchTransitos: async () => {

    setLoading(_true)
    setError(_null)
    try {

      setTransitos(__data)
    } catch {
      // En desarrollo, usar datos mock con estados variados
      const mockData = Array.from({ length: 20 }, (__, i) => {
        const transito = generateMockTransito(_i)
        // Asignar diferentes estados para mejor testing
        if (i < 8) transito.estado = 'EN_TRANSITO'
        else if (i < 14) transito.estado = 'COMPLETADO'
        else if (i < 18) transito.estado = 'PENDIENTE'
        else transito.estado = 'ALERTA'
        // Agregar progreso para tránsitos en curso
        if (transito.estado === 'EN_TRANSITO') {
          transito.progreso = Math.floor(Math.random() * 100)
        }
        
        return transito
      })
      setTransitos(_mockData)
      console.warn('Using mock data for transitos:', _error)
    } finally {
      setLoading(_false)
    }
  },
  
  fetchTransitosPendientes: async () => {

    setLoading(_true)
    setError(_null)
    try {

      setTransitosPendientes(__data)
    } catch {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 12 }, (__, i) => {
        const transito = generateMockTransito(_i)
        transito.estado = 'PENDIENTE'
        return transito
      })
      setTransitosPendientes(_mockData)
      console.warn('Using mock data for transitos pendientes:', _error)
    } finally {
      setLoading(_false)
    }
  },
  
  precintarTransito: async (_transitoId, precintoId) => {

    setError(_null)
    try {
      await transitosService.precintar(_transitoId, precintoId)
      updateTransito(_transitoId, { estado: 'EN_TRANSITO' })
      notificationService.success('Tránsito Precintado', 'El tránsito ha sido precintado exitosamente')
    } catch {
      setError(_error instanceof Error ? _error.message : 'Error al precintar tránsito')
      notificationService.error('Error', 'No se pudo precintar el tránsito')
      throw _error
    }
  },
  
  markDesprecintado: async (_transitoId) => {

    setError(_null)
    try {
      await transitosService.markDesprecintado(_transitoId)
      updateTransito(_transitoId, { estado: 'COMPLETADO', fechaLlegada: new Date().toISOString() })
      notificationService.success('Tránsito Completado', 'El tránsito ha sido marcado como desprecintado')
    } catch {
      setError(_error instanceof Error ? _error.message : 'Error al marcar como desprecintado')
      notificationService.error('Error', 'No se pudo actualizar el estado del tránsito')
      throw _error
    }
  },
})