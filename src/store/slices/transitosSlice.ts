import type { StateCreator} from 'zustand'
import type { TransitosStore} from '../types'
// Transito type import removed - using TransitoPendiente from store types
import { transitosService} from '../../services'
import { generateMockTransito} from '../../utils/mockData'
import { notificationService} from '../../services/shared/notification.service'
export const createTransitosSlice: StateCreator<TransitosStore> = (set, get) => ({
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
  setTransitos: (transitos) => set({ transitos, lastUpdate: Date.now() }),
  
  setTransitosPendientes: (transitosPendientes) => set({ transitosPendientes, lastUpdate: Date.now() }),
  
  updateTransito: (id, data) => set((state) => ({
    transitos: state.transitos.map(t => t.id === id ? { ...t, ...data } : t),
    transitosPendientes: state.transitosPendientes.map(t => t.id === id ? { ...t, ...data } : t),
  })),
  
  removeTransito: (id) => set((state) => ({
    transitos: state.transitos.filter(t => t.id !== id),
    transitosPendientes: state.transitosPendientes.filter(t => t.id !== id),
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchTransitos: async () => {
    const { setLoading, setError, setTransitos } = get()
    setLoading(true)
    setError(null)
    try {

      const data = await transitosService.getTransitos()
      setTransitos(data)
    } catch (error) {
      // En desarrollo, usar datos mock con estados variados
      const mockData = Array.from({ length: 20 }, (_, i) => {
        const transito = generateMockTransito(i)
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
      setTransitos(mockData)
      console.warn('Using mock data for transitos:', error)
    } finally {
      setLoading(false)
    }
  },
  
  fetchTransitosPendientes: async () => {
    const { setLoading, setError, setTransitosPendientes } = get()
    setLoading(true)
    setError(null)
    try {

      const data = await transitosService.getTransitosPendientes()
      setTransitosPendientes(data)
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 12 }, (_, i) => {
        const transito = generateMockTransito(i)
        transito.estado = 'PENDIENTE'
        return transito
      })
      setTransitosPendientes(mockData)
      console.warn('Using mock data for transitos pendientes:', error)
    } finally {
      setLoading(false)
    }
  },
  
  precintarTransito: async (transitoId, precintoId) => {

    setError(null)
    try {
      await transitosService.precintar(transitoId, precintoId)
      updateTransito(transitoId, { estado: 'EN_TRANSITO' })
      notificationService.success('Tránsito Precintado', 'El tránsito ha sido precintado exitosamente')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al precintar tránsito')
      notificationService.error('Error', 'No se pudo precintar el tránsito')
      throw error
    }
  },
  
  markDesprecintado: async (transitoId) => {

    setError(null)
    try {
      await transitosService.markDesprecintado(transitoId)
      updateTransito(transitoId, { estado: 'COMPLETADO', fechaLlegada: new Date().toISOString() })
      notificationService.success('Tránsito Completado', 'El tránsito ha sido marcado como desprecintado')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al marcar como desprecintado')
      notificationService.error('Error', 'No se pudo actualizar el estado del tránsito')
      throw error
    }
  },
})