/**
 * Unified API Service - Combines MainDB and AuxDB
 * By Cheva
 */

import { mainDBService } from './maindb.service';
import { auxDBService } from './auxdb.service';
import { cacheService } from './cache.service';
import type { Transito } from '../../features/transitos/types';
import type { TransitoPendiente, Alerta, EstadisticasMonitoreo } from '../../types';
import type { PrecintoActivo } from '../../types/monitoring';

class UnifiedAPIService {
  
  // ==================== TRÁNSITOS ====================
  
  /**
   * Obtiene todos los tránsitos combinando información de ambas bases de datos
   */
  async getTransitos(params?: {
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    empresa?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Transito[]; total: number }> {
    // Generate cache key
    const cacheKey = `transitos:${JSON.stringify(params || {})}`;
    
    // Check cache first
    const cachedData = cacheService.get<{ data: Transito[]; total: number }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Use request deduplication
    return cacheService.deduplicateRequest(cacheKey, async () => {
      // Convertir fechas string a timestamps
      const fechaDesdeTimestamp = params?.fechaDesde ? 
        Math.floor(new Date(params.fechaDesde).getTime() / 1000) : undefined;
      const fechaHastaTimestamp = params?.fechaHasta ? 
        Math.floor(new Date(params.fechaHasta).getTime() / 1000) : undefined;

      // Obtener viajes de la base principal
      const viajesResponse = await mainDBService.getViajes({
        fechaDesde: fechaDesdeTimestamp,
        fechaHasta: fechaHastaTimestamp,
        empresaid: params?.empresa ? parseInt(params.empresa) : undefined,
        page: params?.page,
        limit: params?.limit
      });

    // Obtener precintos asociados
    const precintoIds = [...new Set(viajesResponse.data.map(v => v.precintoid))];
    const precintos = await Promise.all(
      precintoIds.map(id => mainDBService.getPrecintoByNQR(id))
    );
    const precintoMap = new Map(
      precintos.filter(p => p).map(p => [p!.nqr, p!])
    );

    // Mapear viajes a tránsitos
    const transitos = viajesResponse.data.map(viaje => 
      mainDBService.mapViajeToTransito(viaje, precintoMap.get(viaje.precintoid))
    );

    // Filtrar por estado si es necesario
    const filteredTransitos = params?.estado ? 
      transitos.filter(t => t.estado === params.estado) : transitos;

      const result = {
        data: filteredTransitos,
        total: viajesResponse.total
      };
      
      // Cache the result
      cacheService.set(cacheKey, result, 30000); // 30 seconds TTL
      
      return result;
    });
  }

  /**
   * Obtiene tránsitos pendientes en LUCIA
   */
  async getTransitosPendientesLucia(limit: number = 25): Promise<TransitoPendiente[]> {
    const response = await auxDBService.getTransitosPendientesLucia({ limit });
    return response.data;
  }

  // ==================== PRECINTOS ====================

  /**
   * Obtiene precintos activos (estado armado o alarma)
   */
  async getPrecintosActivos(limit: number = 10): Promise<PrecintoActivo[]> {
    const cacheKey = `precintos-activos:${limit}`;
    
    // Check cache
    const cached = cacheService.get<PrecintoActivo[]>(cacheKey);
    if (cached) {
      return cached;
    }

    return cacheService.deduplicateRequest(cacheKey, async () => {
      const response = await mainDBService.getPrecintos({
        status: 2, // Armado
        limit
      });

      const precintos = response.data.map((precinto, index) => ({
        id: precinto.precintoid.toString(),
        nserie: precinto.nserie,
        nqr: precinto.nqr,
        estado: precinto.status === 3 ? 'alarma' as const : 'armado' as const,
        bateria: this.calculateBatteryLevel(precinto.ultimo),
        destino: 'Por determinar', // Esto debe venir del viaje
        viaje: `VIAJE-${index + 1}`,
        movimiento: 'Tránsito',
        ultimoReporte: this.formatLastReport(precinto.ultimo),
        transitoId: `TR-${precinto.precintoid}`
      }));

      // Cache for 15 seconds (shorter TTL for active data)
      cacheService.set(cacheKey, precintos, 15000);
      return precintos;
    });
  }

  // ==================== ALERTAS ====================

  /**
   * Obtiene todas las alertas activas
   */
  async getAlertasActivas(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Alerta[]; total: number }> {
    const alarmasResponse = await mainDBService.getAlarmas({
      status: 0, // No atendidas
      page: params?.page,
      limit: params?.limit
    });

    // Obtener precintos asociados para más información
    const precintoIds = [...new Set(alarmasResponse.data
      .filter(a => a.precintoid)
      .map(a => a.precintoid!))];
    
    const precintos = await Promise.all(
      precintoIds.map(id => mainDBService.getPrecintoByNQR(id.toString()))
    );
    const precintoMap = new Map(
      precintos.filter(p => p).map(p => [p!.precintoid, p!])
    );

    const alertas = alarmasResponse.data.map(alarma => 
      mainDBService.mapAlarmaToAlerta(
        alarma, 
        alarma.precintoid ? precintoMap.get(alarma.precintoid) : undefined
      )
    );

    return {
      data: alertas,
      total: alarmasResponse.total
    };
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getEstadisticas(): Promise<EstadisticasMonitoreo> {
    // Obtener datos de múltiples fuentes
    const [precintosResponse, alertasResponse, aduanaStats] = await Promise.all([
      mainDBService.getPrecintos({ limit: 1000 }),
      mainDBService.getAlarmas({ status: 0, limit: 100 }),
      auxDBService.getAduanaStats()
    ]);

    const precintos = precintosResponse.data;
    const alertas = alertasResponse.data;

    return {
      precintosActivos: precintos.filter(p => p.status === 2).length,
      precintosEnTransito: precintos.filter(p => p.status === 2).length,
      precintosViolados: precintos.filter(p => p.status === 3).length,
      alertasActivas: alertas.length,
      lecturasPorHora: this.calculateReadingsPerHour(precintos),
      tiempoPromedioTransito: 48, // Horas - calcular basado en datos reales
      tasaExito: 98.5, // Porcentaje - calcular basado en datos reales
      precintosConBateriaBaja: precintos.filter(p => 
        this.calculateBatteryLevel(p.ultimo) < 20
      ).length,
      smsPendientes: 0, // Implementar cuando esté disponible
      dbStats: {
        memoriaUsada: 75, // Implementar monitoreo real
        discoUsado: 60
      },
      apiStats: {
        memoriaUsada: 45, // Implementar monitoreo real
        discoUsado: 30
      },
      reportesPendientes: 0 // Implementar cuando esté disponible
    };
  }

  // ==================== HELPERS ====================

  private calculateBatteryLevel(ultimoReporte: number): number {
    // Simular nivel de batería basado en tiempo desde último reporte
    const now = Date.now() / 1000;
    const timeSinceReport = now - ultimoReporte;
    const hourssSinceReport = timeSinceReport / 3600;
    
    // Asumir que la batería dura ~72 horas
    const batteryLife = 72;
    const batteryUsed = (hourssSinceReport / batteryLife) * 100;
    
    return Math.max(0, Math.min(100, 100 - batteryUsed));
  }

  private formatLastReport(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Hace menos de 1 minuto';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} horas`;
    return `${Math.floor(diff / 86400)} días`;
  }

  private calculateReadingsPerHour(precintos: any[]): number {
    // Calcular basado en la frecuencia de muestreo promedio
    const avgSamplingRate = precintos.reduce((acc, p) => acc + p.lmuestreo, 0) / precintos.length;
    return Math.round((60 / avgSamplingRate) * precintos.length);
  }

  // ==================== DATA SYNC ====================

  /**
   * Sincroniza datos entre las dos bases de datos
   */
  async syncDatabases(): Promise<{
    synced: number;
    errors: number;
    message: string;
  }> {
    try {
      // Obtener registros pendientes de sincronización
      const pendingAduana = await auxDBService.getAduanaRecords({ status: 0 });
      let synced = 0;
      let errors = 0;

      for (const aduana of pendingAduana.data) {
        try {
          // Buscar si existe un viaje correspondiente
          const viaje = await mainDBService.getViajes({
            limit: 1
          }).then(response => 
            response.data.find(v => 
              v.VjeId === aduana.viaje.toString() && 
              v.MovId === aduana.mov.toString()
            )
          );

          if (!viaje) {
            // Crear nuevo viaje en mainDB
            await mainDBService.createViaje({
              VjeId: aduana.viaje.toString(),
              MovId: aduana.mov.toString(),
              DUA: aduana.dua.toString(),
              MatTra: aduana.matricula || '',
              fecha: aduana.date,
              fechafin: aduana.date + 86400, // +24 horas por defecto
              empresaid: 1, // Default empresa
              ConNmb: 'Por asignar',
              ConTDoc: '1',
              ConNDoc: '00000000',
              ConTel: '',
              track: '',
              precintoid: '',
              MatZrr: aduana.remolque || '',
              MatRemo: '',
              PrcAdic: '',
              ContId: aduana.contenedor || '',
              status: 1
            });
            
            synced++;
          }
        } catch (error) {
          console.error('Error syncing record:', error);
          errors++;
        }
      }

      return {
        synced,
        errors,
        message: `Sincronización completada: ${synced} registros sincronizados, ${errors} errores`
      };
    } catch (error) {
      console.error('Database sync error:', error);
      return {
        synced: 0,
        errors: 1,
        message: 'Error en la sincronización de bases de datos'
      };
    }
  }
}

export const unifiedAPIService = new UnifiedAPIService();