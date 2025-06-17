import type { EstadisticasMonitoreo } from '../types/monitoring';
import { unifiedAPIService } from './api/unified.service';

export interface EstadisticasFilters {
  desde?: number;
  hasta?: number;
  intervalo?: 'hora' | 'dia' | 'semana' | 'mes';
}

export const estadisticasService = {
  getGenerales: async (): Promise<EstadisticasMonitoreo> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock data
        return {
          precintosActivos: 156,
          precintosEnTransito: 89,
          precintosViolados: 3,
          alertasActivas: 7,
          lecturasPorHora: 4320,
          tiempoPromedioTransito: 48,
          tasaExito: 98.5,
          precintosConBateriaBaja: 12,
          smsPendientes: 45,
          dbStats: {
            memoriaUsada: 72,
            discoUsado: 58
          },
          apiStats: {
            memoriaUsada: 45,
            discoUsado: 30
          },
          reportesPendientes: 3
        };
      }
      
      return await unifiedAPIService.getEstadisticas();
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      // Return default values
      return {
        precintosActivos: 0,
        precintosEnTransito: 0,
        precintosViolados: 0,
        alertasActivas: 0,
        lecturasPorHora: 0,
        tiempoPromedioTransito: 0,
        tasaExito: 0,
        precintosConBateriaBaja: 0,
        smsPendientes: 0,
        dbStats: {
          memoriaUsada: 0,
          discoUsado: 0
        },
        apiStats: {
          memoriaUsada: 0,
          discoUsado: 0
        },
        reportesPendientes: 0
      };
    }
  },

  getHistoricoLecturas: async (horas = 24): Promise<Array<{ timestamp: number; cantidad: number }>> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Generate mock data
        const now = Date.now() / 1000;
        const data = [];
        for (let i = 0; i < horas; i++) {
          data.push({
            timestamp: now - (i * 3600),
            cantidad: 4000 + Math.floor(Math.random() * 1000)
          });
        }
        return data.reverse();
      }
      
      // TODO: Implement real API call
      return [];
    } catch (error) {
      console.error('Error fetching historico lecturas:', error);
      return [];
    }
  },

  getHistoricoAlertas: async (horas = 24): Promise<Array<{ timestamp: number; cantidad: number; tipo: string }>> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Generate mock data
        const now = Date.now() / 1000;
        const tipos = ['violacion', 'bateria_baja', 'fuera_de_ruta', 'temperatura', 'sin_signal'];
        const data = [];
        
        for (let i = 0; i < horas; i++) {
          data.push({
            timestamp: now - (i * 3600),
            cantidad: Math.floor(Math.random() * 10),
            tipo: tipos[Math.floor(Math.random() * tipos.length)]
          });
        }
        return data.reverse();
      }
      
      // TODO: Implement real API call
      return [];
    } catch (error) {
      console.error('Error fetching historico alertas:', error);
      return [];
    }
  },

  getRendimiento: async (filters?: EstadisticasFilters): Promise<{
    tasaExito: number;
    tiempoPromedioTransito: number;
    lecturasPromedioPorHora: number;
    alertasPromedioPorDia: number;
  }> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return {
          tasaExito: 98.5,
          tiempoPromedioTransito: 48,
          lecturasPromedioPorHora: 4320,
          alertasPromedioPorDia: 12
        };
      }
      
      const stats = await unifiedAPIService.getEstadisticas();
      return {
        tasaExito: stats.tasaExito,
        tiempoPromedioTransito: stats.tiempoPromedioTransito,
        lecturasPromedioPorHora: stats.lecturasPorHora,
        alertasPromedioPorDia: Math.round(stats.alertasActivas * 24 / 7) // Rough estimate
      };
    } catch (error) {
      console.error('Error fetching rendimiento:', error);
      return {
        tasaExito: 0,
        tiempoPromedioTransito: 0,
        lecturasPromedioPorHora: 0,
        alertasPromedioPorDia: 0
      };
    }
  },

  getEstadoSistema: async (): Promise<{
    smsPendientes: number;
    dbStats: {
      memoriaUsada: number;
      discoUsado: number;
      conexionesActivas: number;
    };
    apiStats: {
      memoriaUsada: number;
      discoUsado: number;
      solicitudesPorMinuto: number;
    };
    reportesPendientes: number;
  }> => {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        return {
          smsPendientes: 45,
          dbStats: {
            memoriaUsada: 72,
            discoUsado: 58,
            conexionesActivas: 15
          },
          apiStats: {
            memoriaUsada: 45,
            discoUsado: 30,
            solicitudesPorMinuto: 120
          },
          reportesPendientes: 3
        };
      }
      
      const stats = await unifiedAPIService.getEstadisticas();
      return {
        smsPendientes: stats.smsPendientes,
        dbStats: {
          ...stats.dbStats,
          conexionesActivas: 15 // Mock value
        },
        apiStats: {
          ...stats.apiStats,
          solicitudesPorMinuto: 120 // Mock value
        },
        reportesPendientes: stats.reportesPendientes
      };
    } catch (error) {
      console.error('Error fetching estado sistema:', error);
      return {
        smsPendientes: 0,
        dbStats: {
          memoriaUsada: 0,
          discoUsado: 0,
          conexionesActivas: 0
        },
        apiStats: {
          memoriaUsada: 0,
          discoUsado: 0,
          solicitudesPorMinuto: 0
        },
        reportesPendientes: 0
      };
    }
  },
};