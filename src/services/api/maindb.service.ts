/**
 * Main Database API Service (trokor)
 * By Cheva
 */

import { sharedApiService } from '../shared/sharedApi.service';
import type { 
  Precinto, 
  PrecintoViaje, 
  AlarmSystem, 
  Empresa, 
  AppUser,
  PrecintoLocation,
  PrecintoAduanaAlarma,
  PrecintoAduanaReport 
} from '../../types/api/maindb.types';
import type { Transito } from '../../features/transitos/types';
import type { Alerta } from '../../types';

class MainDBService {
  private readonly API_BASE = '/api/maindb';

  // ==================== PRECINTOS ====================
  
  async getPrecintos(params?: {
    status?: number;
    empresaid?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Precinto[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/precintos`, null, params);
  }

  async getPrecintoByNQR(nqr: string): Promise<Precinto | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/precintos/nqr/${nqr}`);
  }

  async updatePrecintoStatus(precintoid: number, status: number): Promise<boolean> {
    return sharedApiService.request('PUT', `${this.API_BASE}/precintos/${precintoid}/status`, { status });
  }

  // ==================== VIAJES ====================

  async getViajes(params?: {
    status?: number;
    empresaid?: number;
    fechaDesde?: number;
    fechaHasta?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: PrecintoViaje[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/viajes`, null, params);
  }

  async getViajeByPvid(pvid: number): Promise<PrecintoViaje | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/viajes/${pvid}`);
  }

  async createViaje(viaje: Partial<PrecintoViaje>): Promise<PrecintoViaje> {
    return sharedApiService.request('POST', `${this.API_BASE}/viajes`, viaje);
  }

  async updateViaje(pvid: number, updates: Partial<PrecintoViaje>): Promise<boolean> {
    return sharedApiService.request('PUT', `${this.API_BASE}/viajes/${pvid}`, updates);
  }

  // ==================== ALARMAS ====================

  async getAlarmas(params?: {
    precintoid?: number;
    status?: number;
    fechaDesde?: number;
    fechaHasta?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: AlarmSystem[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/alarmas`, null, params);
  }

  async getAlarmasByPrecinto(precintoid: number): Promise<AlarmSystem[]> {
    return sharedApiService.request('GET', `${this.API_BASE}/alarmas/precinto/${precintoid}`);
  }

  async updateAlarmaStatus(asid: number, status: number): Promise<boolean> {
    return sharedApiService.request('PUT', `${this.API_BASE}/alarmas/${asid}/status`, { status });
  }

  // ==================== EMPRESAS ====================

  async getEmpresas(params?: {
    tipo?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Empresa[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/empresas`, null, params);
  }

  async getEmpresaById(empresaid: number): Promise<Empresa | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/empresas/${empresaid}`);
  }

  // ==================== USUARIOS ====================

  async getUsuarios(params?: {
    empresaid?: number;
    type?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: AppUser[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/usuarios`, null, params);
  }

  // ==================== LOCATIONS ====================

  async getLocations(params?: {
    type?: number;
    status?: number;
  }): Promise<PrecintoLocation[]> {
    return sharedApiService.request('GET', `${this.API_BASE}/locations`, null, params);
  }

  async getLocationById(plid: number): Promise<PrecintoLocation | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/locations/${plid}`);
  }

  // ==================== REPORTES ADUANA ====================

  async getReportesAduana(pvid: number): Promise<PrecintoAduanaReport[]> {
    return sharedApiService.request('GET', `${this.API_BASE}/reportes-aduana/${pvid}`);
  }

  async getAlarmasAduana(pvid: number): Promise<PrecintoAduanaAlarma[]> {
    return sharedApiService.request('GET', `${this.API_BASE}/alarmas-aduana/${pvid}`);
  }

  // ==================== MAPPERS ====================

  /**
   * Convierte un PrecintoViaje a nuestro tipo Transito
   */
  mapViajeToTransito(viaje: PrecintoViaje, precinto?: Precinto): Transito {
    return {
      id: `TR-${viaje.pvid.toString().padStart(5, '0')}`,
      dua: viaje.DUA || '',
      precinto: precinto?.nqr || viaje.precintoid,
      viaje: viaje.VjeId,
      mov: parseInt(viaje.MovId) || 0,
      precintoId: viaje.precintoid,
      estado: this.mapStatusToEstado(viaje.status, precinto?.status),
      fechaSalida: new Date(viaje.fecha * 1000).toISOString(),
      fechaInicio: new Date(viaje.fecha * 1000),
      eta: viaje.fechafin ? new Date(viaje.fechafin * 1000).toISOString() : undefined,
      encargado: `Operador ${viaje.pvid}`,
      origen: viaje.plidStart?.toString() || 'Desconocido',
      destino: viaje.plidEnd?.toString() || 'Desconocido',
      empresa: viaje.empresaid.toString(),
      matricula: viaje.MatTra,
      chofer: viaje.ConNmb,
      telefonoConductor: viaje.ConTel,
      vehiculo: {
        matricula: viaje.MatTra,
        conductor: {
          nombre: viaje.ConNmb,
          documento: viaje.ConNDoc,
          id: `CAM-${viaje.pvid}`
        }
      },
      progreso: this.calculateProgress(viaje.fecha, viaje.fechafin),
      alertas: undefined,
      observaciones: viaje.HmTxt || undefined
    };
  }

  /**
   * Convierte una AlarmSystem a nuestro tipo Alerta
   */
  mapAlarmaToAlerta(alarma: AlarmSystem, precinto?: Precinto): Alerta {
    return {
      id: `ALR-${alarma.asid}`,
      tipo: this.mapAlarmType(alarma.alarmtype),
      precintoId: `PR-${alarma.precintoid}`,
      codigoPrecinto: precinto?.nqr || alarma.precintoid?.toString() || '',
      mensaje: this.getAlarmMessage(alarma.alarmtype, alarma.extradata),
      timestamp: alarma.last || alarma.first || Date.now() / 1000,
      ubicacion: this.extractLocationFromExtraData(alarma.extradata),
      severidad: this.getAlarmSeverity(alarma.alarmtype),
      atendida: alarma.status === 1
    };
  }

  // ==================== HELPERS ====================

  private mapStatusToEstado(viajeStatus: number, precintoStatus?: number): 'en_viaje' | 'desprecintado' | 'con_alerta' {
    if (viajeStatus === 0 || precintoStatus === 4) return 'desprecintado';
    if (precintoStatus === 3) return 'con_alerta';
    return 'en_viaje';
  }

  private mapAlarmType(alarmtype?: string): Alerta['tipo'] {
    switch (alarmtype?.toLowerCase()) {
      case 'door': return 'violacion';
      case 'battery': return 'bateria_baja';
      case 'route': return 'fuera_de_ruta';
      case 'temperature': return 'temperatura';
      case 'signal': return 'sin_signal';
      case 'intrusion': return 'intrusion';
      default: return 'violacion';
    }
  }

  private getAlarmMessage(alarmtype?: string, extradata?: string): string {
    const baseMessages: Record<string, string> = {
      'door': 'Apertura de puerta detectada',
      'battery': 'Nivel de batería bajo',
      'route': 'Desvío de ruta detectado',
      'temperature': 'Temperatura fuera de rango',
      'signal': 'Pérdida de señal GPS',
      'intrusion': 'Intrusión detectada'
    };
    
    const baseMessage = baseMessages[alarmtype?.toLowerCase() || ''] || 'Alerta de seguridad';
    return extradata ? `${baseMessage}: ${extradata}` : baseMessage;
  }

  private getAlarmSeverity(alarmtype?: string): Alerta['severidad'] {
    switch (alarmtype?.toLowerCase()) {
      case 'door':
      case 'intrusion': return 'critica';
      case 'route':
      case 'temperature': return 'alta';
      case 'battery': return 'media';
      case 'signal': return 'baja';
      default: return 'media';
    }
  }

  private extractLocationFromExtraData(extradata?: string): { lat: number; lng: number } | undefined {
    if (!extradata) return undefined;
    
    // Intentar parsear coordenadas del extradata
    const match = extradata.match(/lat:(-?\d+\.?\d*),lng:(-?\d+\.?\d*)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    return undefined;
  }

  private calculateProgress(fechaInicio: number, fechaFin?: number): number {
    if (!fechaFin) return 50;
    
    const now = Date.now() / 1000;
    const total = fechaFin - fechaInicio;
    const elapsed = now - fechaInicio;
    
    if (elapsed >= total) return 100;
    if (elapsed <= 0) return 0;
    
    return Math.round((elapsed / total) * 100);
  }
}

export const mainDBService = new MainDBService();