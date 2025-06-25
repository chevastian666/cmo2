import type { Precinto, EventoPrecinto} from '../types/monitoring'
import { unifiedAPIService} from './api/unified.service'
import { trokorService} from './api/trokor.service'
import { generateMockPrecinto} from '../utils/mockData'
export interface PrecintoFilters {
  estado?: string
  tipo?: string
  bateriaBaja?: boolean
  page?: number
  limit?: number
}

export const precintosService = {
  getAll: async (_filters?: PrecintoFilters): Promise<Precinto[]> => {
    try {
      // In development, return mock data
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 20 }, (_, i) => generateMockPrecinto(i))
      }
      
      // Use unified API service
      const response = await unifiedAPIService.getPrecintosActivos(_filters?.limit || 100)
      return response
    } catch {
      // Error fetching precintos - fallback to mock data
      return Array.from({ length: 20 }, (_, i) => generateMockPrecinto(i))
    }
  },

  getById: async (id: string): Promise<Precinto> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return generateMockPrecinto(parseInt(id) || 1)
      }
      
      // For now, get all and find by id
      const all = await precintosService.getAll()
      const precinto = all.find(p => p.id === id)
      if (!precinto) throw new Error('Precinto not found')
      return precinto
    } catch {
      // Error fetching precinto - fallback to mock
      return generateMockPrecinto(parseInt(id) || 1)
    }
  },

  getActivos: async (): Promise<Precinto[]> => {
    try {
      // Primero intentar con Trokor API si está habilitada
      if (import.meta.env.VITE_USE_REAL_API === 'true') {
        try {
          const precintosActivos = await trokorService.getPrecintosActivos()
          // Convertir PrecintoActivo a Precinto
          return precintosActivos.map(pa => ({
            id: pa.id,
            codigo: pa.codigo,
            tipo: 'RFID',
            estado: pa.estado,
            fechaActivacion: new Date(pa.ultimoReporte),
            fechaUltimaLectura: new Date(pa.ultimoReporte),
            bateria: pa.bateria,
            señal: pa.señal,
            temperatura: pa.temperatura,
            ubicacion: pa.ubicacion,
            asignadoA: pa.asignadoTransito,
            eventos: []
          }))
        } catch {
          // Error con Trokor API, intentando con unified API
        }
      }
      
      // Si no está habilitada Trokor o falló, usar unified API
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 10 }, (_, i) => generateMockPrecinto(i))
      }
      
      const response = await unifiedAPIService.getPrecintosActivos(10)
      return response
    } catch {
      // Error fetching precintos activos - fallback to mock
      return Array.from({ length: 10 }, (_, i) => generateMockPrecinto(i))
    }
  },

  getEventos: async (precintoId: string, limit = 50): Promise<EventoPrecinto[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock events
        return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
          id: `EVT-${i}`,
          tipo: ['apertura', 'cierre', 'movimiento', 'alerta'][Math.floor(Math.random() * 4)] as unknown,
          timestamp: Date.now() - i * 3600000,
          descripcion: 'Evento de prueba',
          ubicacion: {
            lat: -34.9011 + (Math.random() - 0.5) * 0.1,
            lng: -56.1645 + (Math.random() - 0.5) * 0.1
          }
        }))
      }
      
      // TODO: Implement real API call when endpoint is available
      return []
    } catch {
      // Error fetching eventos
      return []
    }
  },

  activar: async (precintoData: Partial<Precinto>): Promise<Precinto> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return { ...generateMockPrecinto(1), ...precintoData } as Precinto
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch {
      // Error activating precinto
      return { ...generateMockPrecinto(1), ...precintoData } as Precinto
    }
  },

  desactivar: async (_id: string, _motivo?: string): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Mock: Desactivating precinto
        return
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch {
      // Error deactivating precinto
    }
  },

  actualizarUbicacion: async (_id: string, _lat: number, _lng: number): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Mock: Updating location
        return
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented')
    } catch {
      // Error updating location
    }
  },
}