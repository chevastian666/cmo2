import axios from 'axios';
import type { Precinto, EventoPrecinto, EstadisticasMonitoreo, Alerta, PuntoControl, TransitoPendiente } from '../types/monitoring';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const monitoringApi = {
  // Precintos
  getPrecintos: async (filtros?: { estado?: string; tipo?: string }): Promise<Precinto[]> => {
    const { data } = await api.get('/precintos', { params: filtros });
    return data;
  },

  getPrecinto: async (id: string): Promise<Precinto> => {
    const { data } = await api.get(`/precintos/${id}`);
    return data;
  },

  // Eventos
  getEventos: async (precintoId?: string, limit = 50): Promise<EventoPrecinto[]> => {
    const { data } = await api.get('/eventos', { 
      params: { precintoId, limit } 
    });
    return data;
  },

  // Estadísticas
  getEstadisticas: async (): Promise<EstadisticasMonitoreo> => {
    const { data } = await api.get('/estadisticas');
    return data;
  },

  // Alertas
  getAlertas: async (activas = true): Promise<Alerta[]> => {
    const { data } = await api.get('/alertas', { 
      params: { activas } 
    });
    return data;
  },

  atenderAlerta: async (id: string): Promise<void> => {
    await api.patch(`/alertas/${id}/atender`);
  },

  // Puntos de Control
  getPuntosControl: async (): Promise<PuntoControl[]> => {
    const { data } = await api.get('/puntos-control');
    return data;
  },

  // Históricos
  getHistoricoLecturas: async (horas = 24): Promise<Array<{ timestamp: number; cantidad: number }>> => {
    const { data } = await api.get(`/estadisticas/lecturas?horas=${horas}`);
    return data;
  },

  getHistoricoAlertas: async (horas = 24): Promise<Array<{ timestamp: number; cantidad: number; tipo: string }>> => {
    const { data } = await api.get(`/estadisticas/alertas?horas=${horas}`);
    return data;
  },

  // Tránsitos
  getTransitosPendientes: async (): Promise<TransitoPendiente[]> => {
    const { data } = await api.get('/transitos/pendientes');
    return data;
  },
};