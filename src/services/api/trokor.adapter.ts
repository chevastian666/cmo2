/**
 * Adaptador para transformar datos de la API de Trokor al formato CMO
 * By Cheva
 */

import { TROKOR_CONFIG} from '../../config/trokor.config'
import type { AlarmSystem as TrokorAlarma, } from '../../types/api/maindb.types'
import type { 
  Transito, TransitoPendiente, Alerta} from '../../types'
// Import PrecintoActivo from trokor.service.ts
import type { PrecintoActivo} from './trokor.service'
// Interface for location data
interface LocationData {
  lat: number
  lng: number
  direccion?: string
  timestamp?: number
}

// Interface for auxiliary database transit data
interface AuxTransitData {
  id?: string | number
  numero_viaje?: string
  pvid?: string
  mov?: number
  dua?: string
  tipo_carga?: string
  matricula?: string
  camion?: string
  origen?: string
  destino?: string
  despachante?: string
  empresa?: string
  fecha_ingreso?: number
  observaciones?: string
}

export class TrokorAdapter {
  
  /**
   * Convierte un viaje de Trokor a un tránsito CMO
   */
  static viajeToTransito(viaje: TrokorViaje, precinto?: TrokorPrecinto): Transito {
    const estado = this.mapEstadoViaje(viaje.status)
    return {
      id: viaje.pvid.toString(),
      dua: viaje.DUA || `DUA-${viaje.pvid}`,
      precinto: precinto?.nqr || viaje.precintoid,
      origen: 'Por definir', // No disponible en TrokorViaje
      destino: 'Por definir', // No disponible en TrokorViaje
      empresa: 'Sin asignar', // Se debe resolver con empresaid
      fechaSalida: new Date(viaje.fecha * 1000).toISOString(),
      fechaLlegada: viaje.fechafin 
        ? new Date(viaje.fechafin * 1000).toISOString() 
        : undefined,
      eta: viaje.fechafin 
        ? new Date(viaje.fechafin * 1000).toISOString()
        : undefined,
      estado,
      progreso: this.calculateProgress(viaje),
      conductor: viaje.ConNmb || 'Sin asignar',
      matricula: viaje.MatTra || viaje.MatZrr || 'Sin datos',
      contenedor: viaje.ContId || '',
      tipo: 'IMPORT',
      tipoMercaderia: 'General',
      alertas: 0, // Se actualiza después
      notas: ''
    }
  }

  /**
   * Convierte un precinto de Trokor a PrecintoActivo CMO
   */
  static precintoToPrecintoActivo(
    precinto: TrokorPrecinto, 
    viaje?: TrokorViaje,
    ubicacion?: LocationData
  ): PrecintoActivo {
    return {
      id: precinto.precintoid.toString(),
      codigo: precinto.nserie,
      numeroPrecinto: parseInt(precinto.nqr) || 0,
      estado: this.mapEstadoPrecinto(precinto.status),
      bateria: this.calculateBatteryLevel(precinto),
      ubicacion: ubicacion || {
        lat: -34.8581,
        lng: -56.1708,
        direccion: 'Montevideo, Uruguay',
        timestamp: Date.now()
      },
      asignadoTransito: viaje?.pvid.toString(),
      ultimoReporte: precinto.ultimo 
        ? new Date(precinto.ultimo * 1000).toISOString()
        : new Date().toISOString(),
      señal: this.calculateSignalStrength(precinto),
      temperatura: 22, // Por defecto si no hay datos
      mov: viaje?.MovId,
      viaje: viaje ? `${viaje.VjeId}` : undefined,
      movimiento: 'Tránsito'
    }
  }

  /**
   * Convierte una alarma de Trokor a Alerta CMO
   */
  static alarmaToAlerta(
    alarma: TrokorAlarma, 
    precinto?: TrokorPrecinto,
    viaje?: TrokorViaje
  ): Alerta {
    const alarmCode = alarma.alarmtype || 'UNK'
    const tipoMapeado = TROKOR_CONFIG.TIPO_ALARMA_MAPPING[alarmCode] || alarmCode
    return {
      id: alarma.asid.toString(),
      tipo: tipoMapeado,
      severidad: this.mapSeveridadAlarma(alarmCode),
      timestamp: alarma.first || alarma.last || Math.floor(Date.now() / 1000),
      fecha: new Date((alarma.first || alarma.last || Math.floor(Date.now() / 1000)) * 1000),
      codigoPrecinto: precinto?.nqr || `P${alarma.precintoid}`,
      mensaje: this.getAlarmMessage(alarmCode),
      ubicacion: undefined, // No disponible en AlarmSystem
      atendida: (alarma.status || 0) > 0,
      viaje: viaje ? `${viaje.VjeId}` : undefined,
      dua: viaje?.DUA,
      empresa: 'Sin datos', // Se debe resolver con empresaid
      acciones: []
    }
  }

  /**
   * Convierte un tránsito pendiente de la base auxiliar
   */
  static transitoPendienteFromAux(data: AuxTransitData): TransitoPendiente {
    return {
      id: data.id?.toString() || Date.now().toString(),
      numeroViaje: data.numero_viaje || data.pvid || 'S/N',
      mov: data.mov || 'S/M',
      dua: data.dua || 'S/D',
      tipoCarga: data.tipo_carga || 'Contenedor',
      matricula: data.matricula || data.camion || 'S/M',
      origen: data.origen || 'Por definir',
      destino: data.destino || 'Por definir',
      despachante: data.despachante || data.empresa || 'Sin asignar',
      fechaIngreso: data.fecha_ingreso || Math.floor(Date.now() / 1000),
      observaciones: data.observaciones || ''
    }
  }

  // ========== Métodos auxiliares ==========

  private static mapEstadoViaje(status: number): Transito['estado'] {
    switch (status) {
      case 0: {
  return 'PENDIENTE'
      case 1: {
  return 'EN_TRANSITO'
      case 2: {
  return 'COMPLETADO'
      case 3: {
  return 'ALERTA'
      default: return 'PENDIENTE'
    }
  }

  private static mapEstadoPrecinto(status: number): 0 | 1 | 2 | 3 | 4 {
    // Mapeo según TROKOR_CONFIG.ESTADO_MAPPING.PRECINTO
    if (status >= 0 && status <= 4) {
      return status as 0 | 1 | 2 | 3 | 4
    }
    return 0; // Por defecto disponible
  }

  private static calculateProgress(viaje: TrokorViaje): number {
    if (!viaje.fecha) return 0
    if (viaje.fechafin) return 100
    // Calcular progreso basado en tiempo estimado
    const ahora = Date.now() / 1000
    const inicio = viaje.fecha
    const duracionEstimada = 24 * 3600; // 24 horas por defecto
    
    const progreso = ((ahora - inicio) / duracionEstimada) * 100
    return Math.min(Math.max(0, Math.round(progreso)), 99)
  }

  private static calculateBatteryLevel(precinto: TrokorPrecinto): number {
    // Simular nivel basado en última actualización
    if (!precinto.ultimo) return 85
    const horasSinReporte = (Date.now() / 1000 - precinto.ultimo) / 3600
    const bateria = 100 - (horasSinReporte * 2); // -2% por hora
    
    return Math.max(10, Math.min(100, Math.round(bateria)))
  }

  private static calculateSignalStrength(precinto: TrokorPrecinto): number {
    // Si no hay reporte reciente, señal baja
    if (!precinto.ultimo) return 50
    const minutosSinReporte = (Date.now() / 1000 - precinto.ultimo) / 60
    if (minutosSinReporte < 5) return 100
    if (minutosSinReporte < 15) return 80
    if (minutosSinReporte < 30) return 60
    if (minutosSinReporte < 60) return 40
    return 20
  }

  private static mapSeveridadAlarma(alarmCode: string): Alerta['severidad'] {
    // Alarmas críticas
    const criticas = ['PTN', 'SNA', 'DNR']
    if (criticas.includes(alarmCode)) return 'CRITICA'
    // Alarmas altas
    const altas = ['BBJ', 'NPG', 'NPN']
    if (altas.includes(alarmCode)) return 'ALTA'
    // El resto son medias
    return 'MEDIA'
  }

  private static getAlarmMessage(alarmCode: string): string {
    const messages: Record<string, string> = {
      'AAR': 'Atraso en reportes del dispositivo',
      'BBJ': 'Nivel de batería bajo',
      'DEM': 'Tránsito demorado según tiempo estimado',
      'DNR': 'Desvío de ruta detectado',
      'DTN': 'Vehículo detenido por tiempo prolongado',
      'NPG': 'Sin señal GPS',
      'NPN': 'Sin reporte del dispositivo',
      'PTN': 'Violación del precinto detectada',
      'SNA': 'Salida no autorizada del vehículo'
    }
    return messages[alarmCode] || `Alarma ${alarmCode}`
  }
}