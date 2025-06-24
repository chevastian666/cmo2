import axios from 'axios'
import type { Precinto, EventoPrecinto, EstadisticasMonitoreo, Alerta, PuntoControl, TransitoPendiente} from '../types/monitoring'
import { API_CONFIG} from '../config'
const API_BASE_URL = API_CONFIG.BASE_URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})
export const monitoringApi = {
  // Precintos
  getPrecintos: async (_filtros?: { estado?: string; tipo?: string }): Promise<Precinto[]> => {
    // TODO: Implement
    const data: Precinto[] = []
    return data
  },

  getPrecinto: async (_id: string): Promise<Precinto> => {
    // TODO: Implement
    const data = {} as Precinto
    return data
  },

  // Eventos
  getEventos: async (_precintoId?: string, _limit = 50): Promise<EventoPrecinto[]> => {
    // TODO: Implement
    const data: EventoPrecinto[] = []

    return data
  },

  // Estadísticas
  getEstadisticas: async (): Promise<EstadisticasMonitoreo> => {
    // TODO: Implement
    const data = {} as EstadisticasMonitoreo
    return data
  },

  // Alertas
  getAlertas: async (_activas = true): Promise<Alerta[]> => {
    // TODO: Implement
    const data: Alerta[] = []

    return data
  },

  atenderAlerta: async (id: string): Promise<void> => {
    await api.patch(`/alertas/${id}/atender`)
  },

  // Puntos de Control
  getPuntosControl: async (): Promise<PuntoControl[]> => {
    // TODO: Implement
    const data: PuntoControl[] = []
    return data
  },

  // Históricos
  getHistoricoLecturas: async (_horas = 24): Promise<Array<{ timestamp: number; cantidad: number }>> => {
    // TODO: Implement
    const data: Array<{ timestamp: number; cantidad: number }> = []
    
    return data
  },

  getHistoricoAlertas: async (_horas = 24): Promise<Array<{ timestamp: number; cantidad: number; tipo: string }>> => {
    // TODO: Implement
    const data: Array<{ timestamp: number; cantidad: number; tipo: string }> = []
    
    return data
  },

  // Tránsitos
  getTransitosPendientes: async (): Promise<TransitoPendiente[]> => {
    // TODO: Implement
    const data: TransitoPendiente[] = []
    return data
  },
}