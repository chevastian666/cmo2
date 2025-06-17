export interface Precinto {
  id: string;
  codigo: string;
  numeroPrecinto?: number;
  viaje?: string;
  mov?: number;
  dua?: string;
  tipo: string;
  estado: 'SAL' | 'LLE' | 'FMF' | 'CFM' | 'CNP';
  fechaActivacion?: number;
  fechaUltimaLectura: number;
  ubicacion?: {
    lat: number;
    lng: number;
    direccion?: string;
    ultimaActualizacion?: number;
  };
  ubicacionActual?: {
    lat: number;
    lng: number;
    direccion?: string;
  };
  contenedor?: {
    numero: string;
    tipo: string;
    destino: string;
  };
  ruta?: {
    origen: string;
    destino: string;
    aduanaOrigen?: string;
    aduanaDestino?: string;
  };
  bateria: number;
  temperatura?: number;
  humedad?: number;
  gps: {
    estado?: string;
    precision?: number;
    satelites?: number;
    activo?: boolean;
    señal?: number;
  };
  eslinga: {
    estado: 'cerrada' | 'abierta' | 'violada';
    contador?: number;
    ultimoCambio?: number;
  };
  sensores?: {
    temperatura?: number;
    humedad?: number;
    movimiento?: boolean;
    luz?: boolean;
  };
}

export interface EventoPrecinto {
  id: string;
  precintoId: string;
  tipo: 'activacion' | 'lectura' | 'alerta' | 'desactivacion' | 'violacion';
  timestamp: number;
  ubicacion: {
    lat: number;
    lng: number;
  };
  detalles: string;
  severidad: 'info' | 'warning' | 'critical';
}

export interface EstadisticasMonitoreo {
  precintosActivos: number;
  precintosEnTransito: number;
  precintosViolados: number;
  alertasActivas: number;
  lecturasPorHora: number;
  tiempoPromedioTransito: number;
  tasaExito: number;
  precintosConBateriaBaja: number;
  smsPendientes: number;
  dbStats: {
    memoriaUsada: number;
    discoUsado: number;
  };
  apiStats: {
    memoriaUsada: number;
    discoUsado: number;
  };
  reportesPendientes: number;
}

export interface Alerta {
  id: string;
  tipo: 'AAR' | 'BBJ' | 'DEM' | 'DNR' | 'DTN' | 'NPG' | 'NPN' | 'PTN' | 'SNA';
  precintoId: string;
  codigoPrecinto: string;
  mensaje: string;
  timestamp: number;
  ubicacion?: {
    lat: number;
    lng: number;
  };
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  atendida: boolean;
}

export const TIPOS_ALERTA = {
  AAR: 'Atraso en arribo de reporte',
  BBJ: 'Batería baja',
  DEM: 'Demorado',
  DNR: 'Desvío de ruta',
  DTN: 'Detenido',
  NPG: 'Sin señal GPS',
  NPN: 'Sin reporte del precinto',
  PTN: 'Precinto abierto no autorizado',
  SNA: 'Salida no autorizada'
} as const;

export type TipoAlerta = keyof typeof TIPOS_ALERTA;

export interface PuntoControl {
  id: string;
  nombre: string;
  tipo: 'aduana' | 'puerto' | 'deposito' | 'checkpoint';
  ubicacion: {
    lat: number;
    lng: number;
  };
  precintosActivos: number;
  ultimaActividad: number;
}

export interface TransitoPendiente {
  id?: string;
  numeroViaje: string;
  mov: number;
  dua: string;
  tipoCarga: 'Contenedor' | 'Enlonada' | string;
  matricula: string;
  origen: string;
  destino: string;
  despachante: string;
  chofer?: string;
  ci?: string;
  empresa?: string;
  observaciones?: string;
  fechaIngreso?: number;
  estado?: 'pendiente' | 'en_proceso' | 'precintado';
  // Referencias a las bases de datos
  vehiculo?: {
    matricula: string;
    conductor?: {
      nombre: string;
      documento: string;
      id?: string;
    };
  };
}