export interface Precinto {
  id: string
  codigo: string
  tipo: 'TRACKER' | 'SATELITAL' | 'RFID'
  estado: 'ACTIVO' | 'INACTIVO' | 'ALERTA' | 'MANTENIMIENTO'
  bateria?: number
  señal?: 'BUENA' | 'REGULAR' | 'DEBIL' | 'SIN_SEÑAL'
  ubicacion?: {
    lat: number
    lng: number
    direccion?: string
  }
  ultimaActualizacion: Date
  viaje?: {
    id: string
    numeroViaje: string
    origen: string
    destino: string
    estado: 'EN_TRANSITO' | 'DETENIDO' | 'COMPLETADO'
  } | null
  temperatura?: number
  humedad?: number
  eventos?: PrecintoEvento[]
}

export interface PrecintoEvento {
  id: string
  tipo: 'ACTIVACION' | 'DESACTIVACION' | 'ALERTA' | 'UBICACION' | 'BATERIA_BAJA'
  fecha: Date
  descripcion: string
  ubicacion?: {
    lat: number
    lng: number
  }
}