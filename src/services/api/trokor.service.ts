/**
 * Servicio principal para la API de Trokor
 * By Cheva
 */

import { TROKOR_CONFIG, getTrokorHeaders, buildTrokorUrl} from '../../config/trokor.config'
import { TrokorAdapter} from './trokor.adapter'
import { cacheService} from './cache.service'
import { notificationService} from '../shared/notification.service'
import type { 
  Transito, TransitoPendiente, Alerta, EstadisticasMonitoreo} from '../../types'
// Define PrecintoActivo interface
export interface PrecintoActivo {
  id: string
  codigo: string
  numeroPrecinto: number
  estado: 0 | 1 | 2 | 3 | 4
  bateria: number
  ubicacion: {
    lat: number
    lng: number
    direccion: string
    timestamp: number
  }
  asignadoTransito?: string
  ultimoReporte: string
  señal: number
  temperatura: number
  mov?: string
  viaje?: string
  movimiento: string
}

// Interface for Trokor API responses
interface TrokorApiResponse<T> {
  data: T
  total?: number
}

// Interface for Trokor Viaje data
interface TrokorViajeData {
  pvid: number
  precintoid: string
  DUA?: string
  VjeId: string
  MovId: string
  MatTra: string
  MatZrr: string
  ConNmb: string
  ContId: string
  fecha: number
  fechafin: number
  status: number
  [key: string]: unknown
}

// Interface for Trokor Precinto data
interface TrokorPrecintoData {
  precintoid: number
  nserie: string
  nqr: string
  status: number
  ultimo?: number
  [key: string]: unknown
}

// Interface for Trokor Alarma data
interface TrokorAlarmaData {
  asid: number
  alarmtype?: string
  precintoid?: number
  first?: number
  last?: number
  status?: number
  [key: string]: unknown
}

// Interface for Trokor Location data
interface TrokorLocationData {
  lat: number
  lng: number
  direccion?: string
  timestamp?: number
  [key: string]: unknown
}

// Interface for Trokor Statistics data
interface TrokorStatisticsData {
  precintos_activos?: number
  alertas_activas?: number
  transitos_en_curso?: number
  tiempo_promedio_transito?: number
  lecturas_por_hora?: number
  alertas_por_hora?: number
  precintos_bateria_baja?: number
  [key: string]: unknown
}

class TrokorService {
  private readonly isEnabled = import.meta.env.VITE_USE_REAL_API === 'true'
  private readonly apiKey = import.meta.env.VITE_API_KEY
  /**
   * Realiza una petición a la API de Trokor
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isEnabled) {
      throw new Error('Trokor API no está habilitada')
    }
    
    if (!this.apiKey) {
      // API Key de Trokor no configurada
    }
    
    const url = new URL(buildTrokorUrl(endpoint))
    // Agregar parámetros de query
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }
    
    const response = await fetch(url.toString(), {
      method,
      headers: getTrokorHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })
    if (!response.ok) {
      await response.text()
      // Trokor API error
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  }
  
  // ==================== TRÁNSITOS ====================
  
  /**
   * Obtiene tránsitos pendientes desde Trokor
   */
  async getTransitosPendientes(params?: {
    limit?: number
    offset?: number
  }): Promise<TransitoPendiente[]> {
    const cacheKey = `trokor:transitos-pendientes:${JSON.stringify(params)}`
    // Verificar caché
    const cached = cacheService.get<TransitoPendiente[]>(cacheKey)
    if (cached) return cached
    try {
      const response = await this.request<TrokorViajeData[]>(
        'GET',
        TROKOR_CONFIG.ENDPOINTS.VIAJES_PENDIENTES,
        undefined,
        params
      )
      // Transformar datos usando el adaptador
      const transitos = response.map(data => TrokorAdapter.transitoPendienteFromAux(data))
      // Cachear por 30 segundos
      cacheService.set(cacheKey, transitos, 30000)
      return transitos
    } catch (error) {
      console.error('Error getting transitos pendientes:', error)
      notificationService.error('Error al cargar tránsitos', 'No se pudo conectar con Trokor')
      return []
    }
  }
  
  /**
   * Obtiene todos los tránsitos
   */
  async getTransitos(params?: {
    estado?: string
    page?: number
    limit?: number
  }): Promise<{ data: Transito[]; total: number }> {
    try {
      // Obtener viajes desde Trokor
      const response = await this.request<TrokorApiResponse<TrokorViajeData[]>>('GET', TROKOR_CONFIG.ENDPOINTS.VIAJES, undefined, {
        page: params?.page || 1,
        limit: params?.limit || 25,
        status: params?.estado ? this.mapEstadoToTrokor(params.estado) : undefined
      })
      // Transformar cada viaje
      const transitos = await Promise.all(response.data.map(async (viaje) => {
          // Intentar obtener el precinto asociado
          let precinto = null
          if (viaje.precintoid) {
            try {
              precinto = await this.request<TrokorPrecintoData>(
                'GET',
                TROKOR_CONFIG.ENDPOINTS.PRECINTO_BY_NQR(viaje.precintoid)
              )
            } catch {
              // No se pudo obtener precinto
            }
          }
          
          return TrokorAdapter.viajeToTransito(viaje, precinto)
        })
      )
      return {
        data: transitos,
        total: response.total
      }
    } catch (error) {
      console.error('Error getting transitos:', error)
      return { data: [], total: 0 }
    }
  }
  
  // ==================== PRECINTOS ====================
  
  /**
   * Obtiene precintos activos
   */
  async getPrecintosActivos(limit: number = 50): Promise<PrecintoActivo[]> {
    const cacheKey = `trokor:precintos-activos:${limit}`
    const cached = cacheService.get<PrecintoActivo[]>(cacheKey)
    if (cached) return cached
    try {
      // Estados 1 (en tránsito) y 3 (con alerta) se consideran activos
      const response = await this.request<TrokorApiResponse<TrokorPrecintoData[]>>('GET', TROKOR_CONFIG.ENDPOINTS.PRECINTOS_ACTIVOS, undefined, {
        limit,
        status: '1,3' // En tránsito o con alerta
      })
      // Obtener información adicional para cada precinto
      const precintosActivos = await Promise.all(response.data.map(async (precinto) => {
          // Intentar obtener el viaje asociado
          let viaje = null
          try {
            const viajesResponse = await this.request<TrokorViajeData[]>(
              'GET',
              TROKOR_CONFIG.ENDPOINTS.VIAJES,
              undefined,
              { precintoid: precinto.nqr, limit: 1 }
            )
            viaje = viajesResponse[0]
          } catch {
            // No se encontró viaje para precinto
          }
          
          // Intentar obtener ubicación
          let ubicacion = null
          try {
            ubicacion = await this.request<TrokorLocationData>(
              'GET',
              TROKOR_CONFIG.ENDPOINTS.UBICACION_BY_PRECINTO(precinto.precintoid)
            )
          } catch {
            // Sin ubicación disponible
          }

          return TrokorAdapter.precintoToPrecintoActivo(precinto, viaje, ubicacion)
        })
      )
      // Cachear por 15 segundos
      cacheService.set(cacheKey, precintosActivos, 15000)
      return precintosActivos
    } catch (error) {
      console.error('Error getting precintos activos:', error)
      notificationService.error('Error al cargar precintos', 'No se pudo conectar con Trokor')
      return []
    }
  }
  
  // ==================== ALERTAS ====================
  
  /**
   * Obtiene alertas activas
   */
  async getAlertasActivas(params?: {
    page?: number
    limit?: number
  }): Promise<Alerta[]> {
    const cacheKey = `trokor:alertas-activas:${JSON.stringify(params)}`
    const cached = cacheService.get<Alerta[]>(cacheKey)
    if (cached) return cached
    try {
      const response = await this.request<TrokorApiResponse<TrokorAlarmaData[]>>('GET', TROKOR_CONFIG.ENDPOINTS.ALARMAS_ACTIVAS, undefined, params)
      // Transformar cada alarma
      const alertas = await Promise.all(response.data.map(async (alarma) => {
          // Obtener información del precinto y viaje
          let precinto = null
          let viaje = null
          if (alarma.precintoid) {
            try {
              const precintoResponse = await this.request<TrokorPrecintoData[]>(
                'GET',
                TROKOR_CONFIG.ENDPOINTS.PRECINTOS,
                undefined,
                { precintoid: alarma.precintoid, limit: 1 }
              )
              precinto = precintoResponse[0]
              if (precinto) {
                // Buscar viaje asociado
                const viajeResponse = await this.request<TrokorViajeData[]>(
                  'GET',
                  TROKOR_CONFIG.ENDPOINTS.VIAJES,
                  undefined,
                  { precintoid: precinto.nqr, limit: 1 }
                )
                viaje = viajeResponse[0]
              }
            } catch {
              // Error obteniendo datos para alarma
            }
          }
          
          return TrokorAdapter.alarmaToAlerta(alarma, precinto, viaje)
        })
      )
      // Cachear por 10 segundos (las alertas son críticas)
      cacheService.set(cacheKey, alertas, 10000)
      return alertas
    } catch (error) {
      console.error('Error getting alertas activas:', error)
      notificationService.error('Error al cargar alertas', 'No se pudo conectar con Trokor')
      return []
    }
  }
  
  /**
   * Verifica una alerta
   */
  async verificarAlerta(alertaId: string, datos: {
    opcionRespuesta: number
    comandos: string[]
    observaciones: string
    verificadoPor: string
  }): Promise<void> {
    try {
      await this.request(
        'POST',
        TROKOR_CONFIG.ENDPOINTS.ALARMA_VERIFICAR(alertaId),
        datos
      )
      // Limpiar caché de alertas
      cacheService.invalidatePattern('trokor:alertas')
      notificationService.success('Alerta verificada', 'La alerta ha sido procesada correctamente')
    } catch (error) {
      console.error('Error verificando alerta:', error)
      throw new Error('No se pudo verificar la alerta')
    }
  }
  
  // ==================== ESTADÍSTICAS ====================
  
  /**
   * Obtiene estadísticas del dashboard
   */
  async getEstadisticas(): Promise<EstadisticasMonitoreo> {
    const cacheKey = 'trokor:estadisticas'
    const cached = cacheService.get<EstadisticasMonitoreo>(cacheKey)
    if (cached) return cached
    try {
      const response = await this.request<TrokorStatisticsData>(
        'GET',
        TROKOR_CONFIG.ENDPOINTS.ESTADISTICAS_DASHBOARD
      )
      const estadisticas: EstadisticasMonitoreo = {
        precintosActivos: response.precintos_activos || 0,
        alertasActivas: response.alertas_activas || 0,
        transitosEnCurso: response.transitos_en_curso || 0,
        tiempoPromedioTransito: response.tiempo_promedio_transito || 0,
        lecturasPorHora: response.lecturas_por_hora || 0,
        alertasPorHora: response.alertas_por_hora || 0,
        precintosConBateriaBaja: response.precintos_bateria_baja || 0
      }
      // Cachear por 1 minuto
      cacheService.set(cacheKey, estadisticas, 60000)
      return estadisticas
    } catch (error) {
      console.error('Error getting estadisticas:', error)
      // Devolver valores por defecto
      return {
        precintosActivos: 0,
        alertasActivas: 0,
        transitosEnCurso: 0,
        tiempoPromedioTransito: 0,
        lecturasPorHora: 0,
        alertasPorHora: 0,
        precintosConBateriaBaja: 0
      }
    }
  }
  
  // ==================== HELPERS ====================
  
  /**
   * Mapea estado CMO a estado Trokor
   */
  private mapEstadoToTrokor(estado: string): number | undefined {
    const mapping: Record<string, number> = {
      'PENDIENTE': 0,
      'EN_TRANSITO': 1,
      'COMPLETADO': 2,
      'ALERTA': 3
    }
    return mapping[estado]
  }
  
  /**
   * Verifica si la API está disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.request('GET', TROKOR_CONFIG.ENDPOINTS.SYSTEM_HEALTH)
      return true
    } catch {
      return false
    }
  }
}

// Exportar instancia singleton
export const trokorService = new TrokorService()