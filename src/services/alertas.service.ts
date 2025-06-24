import type { Alerta} from '../types/monitoring'
import { unifiedAPIService} from './api/unified.service'
import { trokorService} from './api/trokor.service'
import { generateMockAlerta} from '../utils/mockData'
export interface AlertaFilters {
  activa?: boolean
  tipo?: string
  severidad?: string
  atendida?: boolean
  precintoId?: string
  desde?: number
  hasta?: number
}

export const alertasService = {
  getAll: async (filters?: AlertaFilters): Promise<Alerta[]> => {
    try {
      // En desarrollo, usar datos mock a menos que se habilite explícitamente la API real
      if (import.meta.env.DEV && import.meta.env.VITE_USE_REAL_API !== 'true') {
        // Using mock data for alertas in development mode
        return Array.from({ length: 15 }, (_, i) => generateMockAlerta(i)).filter(alerta => {
          if (filters?.activa !== undefined && filters.activa !== !alerta.atendida) return false
          if (filters?.tipo && alerta.tipo !== filters.tipo) return false
          if (filters?.severidad && alerta.severidad !== filters.severidad) return false
          if (filters?.atendida !== undefined && alerta.atendida !== filters.atendida) return false
          if (filters?.precintoId && alerta.precintoId !== filters.precintoId) return false
          return true
        })
      }

      // Primero intentar con Trokor API si está habilitada
      if (import.meta.env.VITE_USE_REAL_API === 'true') {
        try {
          const alertas = await trokorService.getAlertasActivas({ limit: 100 })
          // Apply client-side filters
          let filtered = alertas
          if (filters?.activa !== undefined && !filters.activa) {
            filtered = filtered.filter(a => a.atendida)
          }
          if (filters?.tipo) {
            filtered = filtered.filter(a => a.tipo === filters.tipo)
          }
          if (filters?.severidad) {
            filtered = filtered.filter(a => a.severidad === filters.severidad)
          }
          if (filters?.atendida !== undefined) {
            filtered = filtered.filter(a => a.atendida === filters.atendida)
          }
          if (filters?.precintoId) {
            filtered = filtered.filter(a => a.precintoId === filters.precintoId)
          }
          
          return filtered
        } catch (error) {
          // Error con Trokor API, intentando con unified API
          console.error('Trokor API error:', error)
        }
      }
      
      // Si no está habilitada Trokor o falló, usar unified API
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 20 }, (_, i) => generateMockAlerta(i))
      }
      
      const response = await unifiedAPIService.getAlertasActivas({
        page: 1,
        limit: 100
      })
      // Apply client-side filters
      let filtered = response.data
      if (filters?.activa !== undefined && !filters.activa) {
        filtered = filtered.filter(a => a.atendida)
      }
      if (filters?.tipo) {
        filtered = filtered.filter(a => a.tipo === filters.tipo)
      }
      if (filters?.severidad) {
        filtered = filtered.filter(a => a.severidad === filters.severidad)
      }
      if (filters?.atendida !== undefined) {
        filtered = filtered.filter(a => a.atendida === filters.atendida)
      }
      if (filters?.precintoId) {
        filtered = filtered.filter(a => a.precintoId === filters.precintoId)
      }
      
      return filtered
    } catch (error) {
      // Error fetching alertas - fallback to mock
      console.error('Error fetching alertas:', error)
      return Array.from({ length: 20 }, (_, i) => generateMockAlerta(i))
    }
  },

  getActivas: async (): Promise<Alerta[]> => {
    try {
      // Primero intentar con Trokor API si está habilitada
      if (import.meta.env.VITE_USE_REAL_API === 'true') {
        try {
          return await trokorService.getAlertasActivas({ limit: 10 })
        } catch (error) {
          // Error con Trokor API, intentando con unified API
          console.error('Trokor API error:', error)
        }
      }
      
      // Si no está habilitada Trokor o falló, usar unified API
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 5 }, (_, i) => generateMockAlerta(i))
      }
      
      const response = await unifiedAPIService.getAlertasActivas({
        page: 1,
        limit: 10
      })
      return response.data
    } catch (error) {
      // Error fetching alertas activas - fallback to mock
      console.error('Error fetching alertas activas:', error)
      return Array.from({ length: 5 }, (_, i) => generateMockAlerta(i))
    }
  },

  getById: async (id: string): Promise<Alerta> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return generateMockAlerta(parseInt(id) || 1)
      }
      
      // For now, get all and find by id
      const all = await alertasService.getAll()
      const alerta = all.find(a => a.id === id)
      if (!alerta) throw new Error('Alerta not found')
      return alerta
    } catch (error) {
      // Error fetching alerta
      console.error('Error fetching alerta:', error)
      return generateMockAlerta(parseInt(id) || 1)
    }
  },

  atender: async (_id: string, _observaciones?: string): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Mock: Atendiendo alerta
        return
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch (error) {
      // Error atendiendo alerta
      console.error('Error atendiendo alerta:', error)
    }
  },

  verificar: async (id: string, datos: {
    opcionRespuesta: number
    comandos: string[]
    observaciones: string
    verificadoPor: string
  }): Promise<void> => {
    // Primero intentar con Trokor API si está habilitada
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      await trokorService.verificarAlerta(id, datos)
      return
    }
    
    // Si no está habilitada Trokor, simular
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      // Mock: Verificando alerta
      return
    }
    
    // TODO: Implement unified API call if needed
    throw new Error('Not implemented')
  },

  crear: async (alerta: Omit<Alerta, 'id' | 'timestamp'>): Promise<Alerta> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return {
          ...alerta,
          id: `ALR-${Date.now()}`,
          timestamp: Date.now() / 1000
        } as Alerta
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch (error) {
      // Error creating alerta
      console.error('Error creating alerta:', error)
      throw error
    }
  },

  getEstadisticas: async (_horas = 24): Promise<Array<{ timestamp: number; cantidad: number; tipo: string }>> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock statistics
        const now = Date.now() / 1000
        const interval = 3600; // 1 hour
        const stats = []
        for (let i = 0; i < _horas; i++) {
          stats.push({
            timestamp: now - (i * interval),
            cantidad: Math.floor(Math.random() * 10),
            tipo: ['violacion', 'bateria_baja', 'fuera_de_ruta'][Math.floor(Math.random() * 3)]
          })
        }
        
        return stats
      }
      
      // TODO: Implement real API call
      return []
    } catch (error) {
      // Error fetching estadisticas
      console.error('Error fetching estadisticas:', error)
      return []
    }
  },
}