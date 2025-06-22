import type { TransitoPendiente} from '../types/monitoring'
import { unifiedAPIService} from './api/unified.service'
import { trokorService} from './api/trokor.service'
import { generateMockTransito} from '../utils/mockData'
export interface TransitoFilters {
  estado?: 'pendiente' | 'en_proceso' | 'precintado'
  despachante?: string
  origen?: string
  destino?: string
  desde?: number
  hasta?: number
}

export const transitosService = {
  getPendientes: async (filters?: TransitoFilters): Promise<TransitoPendiente[]> => {
    try {
      // En desarrollo, usar datos mock a menos que se habilite explícitamente la API real
      if (import.meta.env.DEV && import.meta.env.VITE_USE_REAL_API !== 'true') {
        console.log('Using mock data for transitos in development mode')
        return Array.from({ length: 12 }, (_, i) => generateMockTransito(i))
      }

      // Primero intentar con Trokor API si está habilitada
      if (import.meta.env.VITE_USE_REAL_API === 'true') {
        try {
          return await trokorService.getTransitosPendientes({ limit: 25 })
        } catch (trokorError) {
          console.error('Error con Trokor API, intentando con unified API:', trokorError)
        }
      }
      
      // Si no está habilitada Trokor o falló, usar unified API
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 12 }, (_, i) => generateMockTransito(i))
      }
      
      const response = await unifiedAPIService.getTransitosPendientesLucia(25)
      return response
    } catch {
      console.error('Error fetching transitos pendientes:', _error)
      return Array.from({ length: 12 }, (_, i) => generateMockTransito(i))
    }
  },

  getAll: async (filters?: TransitoFilters): Promise<TransitoPendiente[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 20 }, (_, i) => generateMockTransito(i))
      }
      
      // Map filters to API params
      const response = await unifiedAPIService.getTransitos({
        estado: filters?.estado,
        fechaDesde: filters?.desde?.toString(),
        fechaHasta: filters?.hasta?.toString(),
        empresa: filters?.despachante,
        page: 1,
        limit: 100
      })
      // Map Transito to TransitoPendiente
      return response.data.map(transito => ({
        id: transito.id,
        numeroViaje: transito.viaje,
        mov: transito.mov,
        dua: transito.dua,
        tipoCarga: 'Contenedor', // Default
        matricula: transito.matricula,
        origen: transito.origen,
        destino: transito.destino,
        despachante: transito.empresa,
        fechaIngreso: transito.fechaInicio.getTime() / 1000,
        estado: transito.estado === 'en_viaje' ? 'pendiente' : 
                transito.estado === 'desprecintado' ? 'precintado' : 'en_proceso',
        observaciones: transito.observaciones,
        vehiculo: transito.vehiculo
      }))
    } catch {
      console.error('Error fetching all transitos:', _error)
      return Array.from({ length: 20 }, (_, i) => generateMockTransito(i))
    }
  },

  getById: async (id: string): Promise<TransitoPendiente> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return generateMockTransito(parseInt(id) || 1)
      }
      
      // For now, get all and find by id
      const all = await transitosService.getAll()
      const transito = all.find(t => t.id === id)
      if (!transito) throw new Error('Transito not found')
      return transito
    } catch {
      console.error('Error fetching transito:', _error)
      return generateMockTransito(parseInt(id) || 1)
    }
  },

  actualizarEstado: async (id: string, estado: TransitoPendiente['estado']): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        console.log('Mock: Updating estado', id, estado)
        return
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch {
      console.error('Error updating estado:', _error)
    }
  },

  precintar: async (transitoId: string, precintoId: string): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        console.log('Mock: Precintando transito', transitoId, precintoId)
        return
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch {
      console.error('Error precintando:', _error)
    }
  },

  getEstadisticas: async (): Promise<{
    pendientes: number
    enProceso: number
    precintados: number
    tiempoPromedio: number
  }> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return {
          pendientes: 15,
          enProceso: 8,
          precintados: 23,
          tiempoPromedio: 48
        }
      }
      
      const stats = await unifiedAPIService.getEstadisticas()
      return {
        pendientes: stats.precintosActivos || 0,
        enProceso: stats.precintosEnTransito || 0,
        precintados: 0, // Calculate from historical data
        tiempoPromedio: stats.tiempoPromedioTransito || 48
      }
    } catch {
      console.error('Error fetching estadisticas:', _error)
      return {
        pendientes: 15,
        enProceso: 8,
        precintados: 23,
        tiempoPromedio: 48
      }
    }
  },
}