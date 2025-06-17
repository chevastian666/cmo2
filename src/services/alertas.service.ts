import type { Alerta } from '../types/monitoring';
import { unifiedAPIService } from './api/unified.service';
import { generateMockAlerta } from '../utils/mockData';

export interface AlertaFilters {
  activa?: boolean;
  tipo?: string;
  severidad?: string;
  atendida?: boolean;
  precintoId?: string;
  desde?: number;
  hasta?: number;
}

export const alertasService = {
  getAll: async (filters?: AlertaFilters): Promise<Alerta[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 20 }, (_, i) => generateMockAlerta(i));
      }
      
      const response = await unifiedAPIService.getAlertasActivas({
        page: 1,
        limit: 100
      });
      
      // Apply client-side filters
      let filtered = response.data;
      if (filters?.activa !== undefined && !filters.activa) {
        filtered = filtered.filter(a => a.atendida);
      }
      if (filters?.tipo) {
        filtered = filtered.filter(a => a.tipo === filters.tipo);
      }
      if (filters?.severidad) {
        filtered = filtered.filter(a => a.severidad === filters.severidad);
      }
      if (filters?.atendida !== undefined) {
        filtered = filtered.filter(a => a.atendida === filters.atendida);
      }
      if (filters?.precintoId) {
        filtered = filtered.filter(a => a.precintoId === filters.precintoId);
      }
      
      return filtered;
    } catch (error) {
      console.error('Error fetching alertas:', error);
      return Array.from({ length: 20 }, (_, i) => generateMockAlerta(i));
    }
  },

  getActivas: async (): Promise<Alerta[]> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return Array.from({ length: 5 }, (_, i) => generateMockAlerta(i));
      }
      
      const response = await unifiedAPIService.getAlertasActivas({
        page: 1,
        limit: 10
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alertas activas:', error);
      return Array.from({ length: 5 }, (_, i) => generateMockAlerta(i));
    }
  },

  getById: async (id: string): Promise<Alerta> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return generateMockAlerta(parseInt(id) || 1);
      }
      
      // For now, get all and find by id
      const all = await alertasService.getAll();
      const alerta = all.find(a => a.id === id);
      if (!alerta) throw new Error('Alerta not found');
      return alerta;
    } catch (error) {
      console.error('Error fetching alerta:', error);
      return generateMockAlerta(parseInt(id) || 1);
    }
  },

  atender: async (id: string, observaciones?: string): Promise<void> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        console.log('Mock: Atendiendo alerta', id, observaciones);
        return;
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error atendiendo alerta:', error);
    }
  },

  crear: async (alerta: Omit<Alerta, 'id' | 'timestamp'>): Promise<Alerta> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return {
          ...alerta,
          id: `ALR-${Date.now()}`,
          timestamp: Date.now() / 1000
        } as Alerta;
      }
      
      // TODO: Implement real API call
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error creating alerta:', error);
      throw error;
    }
  },

  getEstadisticas: async (horas = 24): Promise<Array<{ timestamp: number; cantidad: number; tipo: string }>> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock statistics
        const now = Date.now() / 1000;
        const interval = 3600; // 1 hour
        const stats = [];
        
        for (let i = 0; i < horas; i++) {
          stats.push({
            timestamp: now - (i * interval),
            cantidad: Math.floor(Math.random() * 10),
            tipo: ['violacion', 'bateria_baja', 'fuera_de_ruta'][Math.floor(Math.random() * 3)]
          });
        }
        
        return stats;
      }
      
      // TODO: Implement real API call
      return [];
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      return [];
    }
  },
};