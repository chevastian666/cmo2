/**
 * Auxiliary Database API Service (satoshi)
 * By Cheva
 */

import { sharedApiService } from '../shared/sharedApi.service';
import type { 
  Aduana, 
  DUA, 
  DUAAlert, 
  AduanaAlert,
  Office,
  EstadoDUA
} from '../../types/api/auxdb.types';
import type { TransitoPendiente } from '../../types';

class AuxDBService {
  private readonly API_BASE = '/api/auxdb';

  // ==================== ADUANA ====================

  async getAduanaRecords(params?: {
    viaje?: number;
    mov?: number;
    dua?: number;
    desp?: number;
    status?: number;
    fechaDesde?: number;
    fechaHasta?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Aduana[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/aduana`, null, params);
  }

  async getAduanaByViajeMov(viaje: number, mov: number): Promise<Aduana | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/aduana/${viaje}/${mov}`);
  }

  async updateAduanaStatus(alid: number, status: number): Promise<boolean> {
    return sharedApiService.request('PUT', `${this.API_BASE}/aduana/${alid}/status`, { status });
  }

  // ==================== DUA ====================

  async getDUAs(params?: {
    estado?: EstadoDUA;
    desp?: number;
    aduana?: number;
    fechaDesde?: number;
    fechaHasta?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: DUA[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/duas`, null, params);
  }

  async getDUAByNumber(aduana: number, ano: number, numero: number): Promise<DUA | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/duas/${aduana}/${ano}/${numero}`);
  }

  // ==================== ALERTAS ====================

  async getAduanaAlerts(params?: {
    debug?: string;
    whatsapp?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: AduanaAlert[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/aduana-alerts`, null, params);
  }

  async getDUAAlerts(params?: {
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: DUAAlert[]; total: number }> {
    return sharedApiService.request('GET', `${this.API_BASE}/dua-alerts`, null, params);
  }

  // ==================== OFFICES ====================

  async getOffices(params?: {
    status?: number;
  }): Promise<Office[]> {
    return sharedApiService.request('GET', `${this.API_BASE}/offices`, null, params);
  }

  async getOfficeByCode(code: string): Promise<Office | null> {
    return sharedApiService.request('GET', `${this.API_BASE}/offices/code/${code}`);
  }

  // ==================== ESTADÍSTICAS ====================

  async getAduanaStats(params?: {
    desp?: number;
    month?: number;
    year?: number;
  }): Promise<{
    totalTransitos: number;
    transitosPendientes: number;
    transitosEnProceso: number;
    transitosCompletados: number;
    alertasActivas: number;
    despachanteStats: Array<{
      desp: number;
      nombre: string;
      total: number;
      pendientes: number;
    }>;
  }> {
    return sharedApiService.request('GET', `${this.API_BASE}/stats/aduana`, null, params);
  }

  // ==================== MAPPERS ====================

  /**
   * Convierte un registro de Aduana a TransitoPendiente
   */
  mapAduanaToTransitoPendiente(aduana: Aduana): TransitoPendiente {
    return {
      id: `ADU-${aduana.alid}`,
      numeroViaje: aduana.viaje.toString(),
      mov: aduana.mov,
      dua: aduana.dua.toString(),
      tipoCarga: this.mapCargaToTipoCarga(aduana.carga),
      matricula: aduana.matricula || 'Sin matrícula',
      origen: this.getLocationName(aduana.origen),
      destino: aduana.destino || 'Por definir',
      despachante: aduana.despnombre || 'Sin asignar',
      fechaIngreso: aduana.date,
      estado: this.mapAduanaStatusToEstado(aduana.status),
      observaciones: this.buildObservaciones(aduana),
      vehiculo: {
        matricula: aduana.matricula || '',
        conductor: undefined
      }
    };
  }

  /**
   * Convierte un DUA a información adicional para Transito
   */
  mapDUAToTransitoInfo(dua: DUA): {
    estado: EstadoDUA;
    importador: string;
    agente: string;
    contenedores: number;
    urgente: boolean;
  } {
    return {
      estado: dua.ESTADO as EstadoDUA,
      importador: dua.NOMB_IMPOR || 'No especificado',
      agente: dua.NombreAgente,
      contenedores: dua.CONTENEDORES,
      urgente: dua.DESP_URGE === 1
    };
  }

  // ==================== HELPERS ====================

  private mapCargaToTipoCarga(carga: string): TransitoPendiente['tipoCarga'] {
    const upperCarga = carga.toUpperCase();
    if (upperCarga.includes('CONTENEDOR') || upperCarga.includes('CONTAINER')) return 'Contenedor';
    if (upperCarga.includes('ENLONADA') || upperCarga.includes('LONA')) return 'Enlonada';
    return carga;
  }

  private mapAduanaStatusToEstado(status?: number): TransitoPendiente['estado'] {
    switch (status) {
      case 0: return 'pendiente';
      case 1: return 'en_proceso';
      case 2: return 'precintado';
      default: return 'pendiente';
    }
  }

  private getLocationName(origen: number): string {
    // Este mapeo debería venir de la tabla office o de una configuración
    const locationMap: Record<number, string> = {
      1: 'Montevideo',
      2: 'Nueva Palmira',
      3: 'Colonia',
      4: 'Fray Bentos',
      5: 'Paysandú',
      6: 'Salto',
      7: 'Rivera',
      8: 'Chuy',
      9: 'Río Branco',
      10: 'Artigas',
      11: 'Bella Unión',
      12: 'Aceguá'
    };
    
    return locationMap[origen] || `Ubicación ${origen}`;
  }

  private buildObservaciones(aduana: Aduana): string | undefined {
    const obs: string[] = [];
    
    if (aduana.precintadora) {
      obs.push(`Precintadora: ${aduana.precintadora}`);
    }
    
    if (aduana.contenedor) {
      obs.push(`Contenedor: ${aduana.contenedor}`);
    }
    
    if (aduana.remolque) {
      obs.push(`Remolque: ${aduana.remolque}`);
    }
    
    return obs.length > 0 ? obs.join(' | ') : undefined;
  }

  // ==================== BÚSQUEDAS ESPECIALES ====================

  /**
   * Busca tránsitos pendientes de precintar en LUCIA
   */
  async getTransitosPendientesLucia(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: TransitoPendiente[]; total: number }> {
    const response = await this.getAduanaRecords({
      status: 0, // Pendientes
      page: params?.offset ? Math.floor(params.offset / (params?.limit || 25)) + 1 : 1,
      limit: params?.limit || 25
    });

    const transitos = response.data.map(aduana => this.mapAduanaToTransitoPendiente(aduana));
    
    return {
      data: transitos,
      total: response.total
    };
  }

  /**
   * Obtiene estadísticas de despachantes para el dashboard
   */
  async getDespachanteStats(month?: number, year?: number): Promise<Array<{
    id: number;
    nombre: string;
    transitosTotal: number;
    transitosPendientes: number;
    transitosCompletados: number;
    porcentajeCompletado: number;
  }>> {
    const stats = await this.getAduanaStats({ month, year });
    
    return stats.despachanteStats.map(desp => ({
      id: desp.desp,
      nombre: desp.nombre,
      transitosTotal: desp.total,
      transitosPendientes: desp.pendientes,
      transitosCompletados: desp.total - desp.pendientes,
      porcentajeCompletado: desp.total > 0 ? ((desp.total - desp.pendientes) / desp.total) * 100 : 0
    }));
  }
}

export const auxDBService = new AuxDBService();