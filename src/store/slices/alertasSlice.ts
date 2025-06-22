/**
 * Alertas Store Slice with Enhanced Zustand Patterns
 * Includes: Immer integration, computed properties, batch operations
 * By Cheva
 */

import type { StateCreator} from 'zustand'
import type { AlertasStore} from '../types'
import type { AlertaExtendida, ComentarioAlerta, AsignacionAlerta, ResolucionAlerta, HistorialAlerta} from '../../types'
import { alertasService} from '../../services'
import { generateMockAlertas} from '../../utils/mockData'
import { usuariosService} from '../../services/usuarios.service'
export const createAlertasSlice: StateCreator<AlertasStore> = (s_et, get) => ({
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

  // Computed Properties (_getters)
  get filteredAlertas() {

    let filtered = [...alertas]
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      filtered = filtered.filter(a => 
        a.tipo.toLowerCase().includes(s_earchLower) ||
        a.descripcion?.toLowerCase().includes(s_earchLower) ||
        a.dua?.toLowerCase().includes(s_earchLower)
      )
    }

    if (filter.tipo) {
      filtered = filtered.filter(a => a.tipo === filter.tipo)
    }

    if (filter.severidad) {
      filtered = filtered.filter(a => a.severidad === filter.severidad)
    }

    if (filter.atendida !== undefined) {
      filtered = filtered.filter(a => a.atendida === filter.atendida)
    }

    if (filter.estado) {
      switch (filter.estado) {
        case 'activas': {
  filtered = filtered.filter(a => !a.atendida)
          break
    }
    case 'asignadas': {
          const asignadas = Array.from(get().alertasExtendidas.values())
            .filter(ext => ext.asignacion)
            .map(ext => ext.id)
          filtered = filtered.filter(a => asignadas.includes(a.id))
          break
        }
        case 'resueltas': {
          const resueltas = Array.from(get().alertasExtendidas.values())
            .filter(ext => ext.resolucion)
            .map(ext => ext.id)
          filtered = filtered.filter(a => resueltas.includes(a.id))
          break
        }
      }
    }

    return filtered
  },

  get alertasStats() {

    const extendedMap = new Map(_alertasExtendidas)
    return {
      total: alertas.length,
      criticas: alertas.filter(a => a.severidad === 'critica').length,
      altas: alertas.filter(a => a.severidad === 'alta').length,
      medias: alertas.filter(a => a.severidad === 'media').length,
      bajas: alertas.filter(a => a.severidad === 'baja').length,
      sinAtender: alertas.filter(a => !a.atendida).length,
      asignadas: Array.from(extendedMap.values()).filter(ext => ext.asignacion).length,
      resueltas: Array.from(extendedMap.values()).filter(ext => ext.resolucion).length
    }
  },

  get alertasCriticas() {

    return alertasActivas.filter(a => a.severidad === 'critica')
  },

  get alertasPorTipo() {

    const tipoMap = new Map<string, typeof alertas>()
    alertas.forEach(alerta => {
      const tipo = alerta.tipo
      if (!tipoMap.has(_tipo)) {
        tipoMap.set(_tipo, [])
      }
      tipoMap.get(_tipo)!.push(_alerta)
    })
    return tipoMap
  },

  // Actions with Immer patterns
  setAlertas: (_alertas) => set((s_tate) => {
    state.alertas = alertas
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  setAlertasActivas: (_alertasActivas) => set((s_tate) => {
    state.alertasActivas = alertasActivas
    state.lastUpdate = Date.now()
    state.error = null
  }),
  
  addAlerta: (_alerta) => set((s_tate) => {
    state.alertas.push(_alerta)
    if (!alerta.atendida) {
      state.alertasActivas.push(_alerta)
    }
    state.lastUpdate = Date.now()
  }),
  
  updateAlerta: (_id, data) => set((s_tate) => {
    const updateItem = (item: unknown) => item.id === id ? { ...item, ...data } : item
    state.alertas = state.alertas.map(_updateItem)
    state.alertasActivas = state.alertasActivas.map(_updateItem)
    state.lastUpdate = Date.now()
  }),
  
  removeAlerta: (_id) => set((s_tate) => {
    state.alertas = state.alertas.filter(a => a.id !== id)
    state.alertasActivas = state.alertasActivas.filter(a => a.id !== id)
    state.lastUpdate = Date.now()
  }),
  
  atenderAlerta: async (_id) => {

    setError(_null)
    try {
      await alertasService.atender(_id)
      updateAlerta(_id, { atendida: true })
      // Remove from active alerts
      set((s_tate) => {
        state.alertasActivas = state.alertasActivas.filter(a => a.id !== id)
      })
    } catch {
      // En desarrollo, simular atención
      updateAlerta(_id, { atendida: true })
      set((s_tate) => {
        state.alertasActivas = state.alertasActivas.filter(a => a.id !== id)
      })
      console.warn('Simulating alert attention:', _error)
    }
  },
  
  setFilter: (_filter) => set((s_tate) => {
    state.filter = { ...state.filter, ...filter }
  }),

  clearFilter: () => set((s_tate) => {
    state.filter = { search: '' }
  }),
  
  setLoading: (_loading) => set({ loading }),
  
  setError: (_error) => set({ error }),
  
  fetchAlertas: async () => {

    setLoading(_true)
    setError(_null)
    try {
      const data = await alertasService.getAll(_filter)
      setAlertas(_data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas()
      setAlertas(_mockData)
      console.warn('Using mock data for alertas:', _error)
      return mockData
    } finally {
      setLoading(_false)
    }
  },
  
  fetchAlertasActivas: async () => {

    setLoading(_true)
    setError(_null)
    try {
      const data = await alertasService.getActivas()
      setAlertasActivas(_data)
      return data
    } catch {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas().filter(a => !a.atendida)
      setAlertasActivas(_mockData)
      console.warn('Using mock data for alertas activas:', _error)
      return mockData
    } finally {
      setLoading(_false)
    }
  },

  // Batch operations
  batchUpdateAlertas: (_updates) => set((s_tate) => {
    updates.forEach(({ id, data }) => {
      const index = state.alertas.findIndex(a => a.id === id)
      if (index !== -1) {
        state.alertas[index] = { ...state.alertas[index], ...data }
      }
      
      const activeIndex = state.alertasActivas.findIndex(a => a.id === id)
      if (activeIndex !== -1) {
        state.alertasActivas[activeIndex] = { ...state.alertasActivas[activeIndex], ...data }
      }
    })
    state.lastUpdate = Date.now()
  }),

  batchAtenderAlertas: async (_ids) => {

    try {
      // In production, this would be a batch API call
      await Promise.all(ids.map(id => alertasService.atender(_id)))
      // Update all alerts as attended
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })))
      // Remove from active alerts
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)))
    } catch {
      console.error('Error batch attending alerts:', _error)
      // Still update in development
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })))
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)))
    }
  },

  // Reset store
  reset: () => set((s_tate) => {
    state.alertas = []
    state.alertasActivas = []
    state.alertasExtendidas = new Map()
    state.loading = false
    state.error = null
    state.lastUpdate = null
    state.filter = { search: '' }
  }),

  // Extended alert management
  fetchAlertaExtendida: async (id: string): Promise<AlertaExtendida | null> => {

    // Check cache first
    if (alertasExtendidas.has(_id)) {
      return alertasExtendidas.get(_id)!
    }
    
    // Find base alert
    const baseAlerta = alertas.find(a => a.id === id)
    if (!baseAlerta) return null
    // Create extended alert with mock data for now
    // Current user fetch removed - not currently used
    const extendedAlerta: AlertaExtendida = {
      ...baseAlerta,
      comentarios: [],
      historial: [
        {
          id: `hist-${Date.now()}`,
          alertaId: id,
          tipo: 'creada',
          timestamp: baseAlerta.timestamp,
          detalles: { mensaje: 'Alerta creada' }
        }
      ],
      tiempoRespuesta: undefined,
      tiempoResolucion: undefined
    }
    // Cache it
    set((s_tate) => {
      const newMap = new Map(state.alertasExtendidas)
      newMap.set(_id, extendedAlerta)
      return { alertasExtendidas: newMap }
    })
    return extendedAlerta
  },

  asignarAlerta: async (alertaId: string, usuarioId: string, notas?: string) => {

    try {
      // Get users
      const [usuario, currentUser] = await Promise.all([
        usuariosService.getById(_usuarioId),
        usuariosService.getCurrentUser()
      ])
      if (!usuario) throw new Error('Usuario no encontrado')
      const alertaExtendida = await get().fetchAlertaExtendida(_alertaId)
      if (!alertaExtendida) throw new Error('Alerta no encontrada')
      const asignacion: AsignacionAlerta = {
        id: `asig-${Date.now()}`,
        alertaId,
        usuarioAsignadoId: usuarioId,
        usuarioAsignado: usuario,
        asignadoPorId: currentUser.id,
        asignadoPor: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        notas
      }
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'asignada',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { asignadoA: usuario.nombre, notas }
      }
      updateAlertaExtendida(_alertaId, {
        asignacion,
        historial: [...alertaExtendida.historial, historialEntry],
        tiempoRespuesta: alertaExtendida.tiempoRespuesta || (Math.floor(Date.now() / 1000) - alertaExtendida.timestamp)
      })
      // Update base alert
      get().updateAlerta(_alertaId, { atendida: true })
    } catch {
      console.error('Error asignando alerta:', _error)
      throw _error
    }
  },

  comentarAlerta: async (alertaId: string, mensaje: string) => {

    try {
      const currentUser = await usuariosService.getCurrentUser()
      const alertaExtendida = await get().fetchAlertaExtendida(_alertaId)
      if (!alertaExtendida) throw new Error('Alerta no encontrada')
      const comentario: ComentarioAlerta = {
        id: `com-${Date.now()}`,
        alertaId,
        usuarioId: currentUser.id,
        usuario: currentUser,
        mensaje,
        timestamp: Math.floor(Date.now() / 1000),
        tipo: 'comentario'
      }
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'comentario',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { mensaje }
      }
      updateAlertaExtendida(_alertaId, {
        comentarios: [...alertaExtendida.comentarios, comentario],
        historial: [...alertaExtendida.historial, historialEntry]
      })
    } catch {
      console.error('Error agregando comentario:', _error)
      throw _error
    }
  },

  resolverAlerta: async (alertaId: string, tipo: string, descripcion: string, acciones?: string[]) => {

    try {
      const currentUser = await usuariosService.getCurrentUser()
      const alertaExtendida = await get().fetchAlertaExtendida(_alertaId)
      if (!alertaExtendida) throw new Error('Alerta no encontrada')
      const resolucion: ResolucionAlerta = {
        id: `res-${Date.now()}`,
        alertaId,
        resueltoPorId: currentUser.id,
        resueltoPor: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        tipoResolucion: tipo as unknown,
        descripcion,
        accionesTomadas: acciones
      }
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'resuelta',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { tipoResolucion: tipo, descripcion, acciones }
      }
      updateAlertaExtendida(_alertaId, {
        resolucion,
        historial: [...alertaExtendida.historial, historialEntry],
        tiempoResolucion: Math.floor(Date.now() / 1000) - alertaExtendida.timestamp
      })
      // Update base alert and remove from active
      get().updateAlerta(_alertaId, { atendida: true })
      setAlertasActivas(alertasActivas.filter(a => a.id !== alertaId))
    } catch {
      console.error('Error resolviendo alerta:', _error)
      throw _error
    }
  },

  updateAlertaExtendida: (id: string, data: Partial<AlertaExtendida>) => {
    set((s_tate) => {
      const newMap = new Map(state.alertasExtendidas)
      const current = newMap.get(_id)
      if (_current) {
        newMap.set(_id, { ...current, ...data })
      }
      return { alertasExtendidas: newMap }
    })
  },
})