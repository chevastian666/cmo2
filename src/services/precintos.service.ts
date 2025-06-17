import type { Precinto, EventoPrecinto } from '../types/monitoring';
import { unifiedAPIService } from './api/unified.service';
import { generateMockPrecinto } from '../utils/mockData';

export interface PrecintoFilters {
  estado?: string;
  tipo?: string;
  bateriaBaja?: boolean;
  page?: number;
  limit?: number;
}

export const precintosService = {
  getAll: async (filters?: PrecintoFilters): Promise<Precinto[]> => {
    try {
      // In development, return mock data
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 20 }, (_, i) => generateMockPrecinto(i));
      }
      
      // Use unified API service
      const response = await unifiedAPIService.getPrecintosActivos(filters?.limit || 100);
      return response;
    } catch (error) {
      console.error('Error fetching precintos:', error);
      // Fallback to mock data
      return Array.from({ length: 20 }, (_, i) => generateMockPrecinto(i));
    }
  },

  getById: async (id: string): Promise<Precinto> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return generateMockPrecinto(parseInt(id) || 1);
      }
      
      // For now, get all and find by id
      const all = await precintosService.getAll();
      const precinto = all.find(p => p.id === id);
      if (!precinto) throw new Error('Precinto not found');
      return precinto;
    } catch (error) {
      console.error('Error fetching precinto:', error);
      return generateMockPrecinto(parseInt(id) || 1);
    }
  },

  getActivos: async (): Promise<Precinto[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 10 }, (_, i) => generateMockPrecinto(i));
      }
      
      const response = await unifiedAPIService.getPrecintosActivos(10);
      return response;
    } catch (error) {
      console.error('Error fetching precintos activos:', error);
      return Array.from({ length: 10 }, (_, i) => generateMockPrecinto(i));
    }
  },

  getEventos: async (precintoId: string, limit = 50): Promise<EventoPrecinto[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock events
        return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
          id: `EVT-${i}`,
          tipo: ['apertura', 'cierre', 'movimiento', 'alerta'][Math.floor(Math.random() * 4)] as any,
          timestamp: Date.now() - i * 3600000,
          descripcion: 'Evento de prueba',
          ubicacion: {
            lat: -34.9011 + (Math.random() - 0.5) * 0.1,
            lng: -56.1645 + (Math.random() - 0.5) * 0.1
          }
        }));
      }
      
      // TODO: Implement real API call when endpoint is available
      return [];
    } catch (error) {
      console.error('Error fetching eventos:', error);
      return [];
    }
  },

  activar: async (precintoData: Partial<Precinto>): Promise<Precinto> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return { ...generateMockPrecinto(1), ...precintoData } as Precinto;
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error activating precinto:', error);
      return { ...generateMockPrecinto(1), ...precintoData } as Precinto;
    }
  },

  desactivar: async (id: string, motivo?: string): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        console.log('Mock: Desactivating precinto', id, motivo);
        return;
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error deactivating precinto:', error);
    }
  },

  actualizarUbicacion: async (id: string, lat: number, lng: number): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        console.log('Mock: Updating location', id, lat, lng);
        return;
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error updating location:', error);
    }
  },
};