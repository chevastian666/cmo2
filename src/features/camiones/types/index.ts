// Tipo de estado para camiones
export type EstadoCamion = 'normal' | 'sospechoso' | 'frecuente' | 'restringido';

// Interfaz para Camión
export interface Camion {
  id: string;
  matricula: string; // Campo único y obligatorio
  foto?: string; // URL de la foto del camión
  observaciones?: string; // Texto libre editable
  estado: EstadoCamion;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  creadoPor: {
    id: string;
    nombre: string;
  };
}

// Interfaz para historial de tránsitos del camión
export interface TransitoCamion {
  id: string;
  fecha: Date;
  origen: string;
  destino: string;
  estado: string;
  precinto: string;
  camionero?: {
    id: string;
    nombre: string;
    documento: string;
  };
}

// Interfaz para estadísticas del camión
export interface EstadisticasCamion {
  totalTransitos: number;
  transitosUltimos30Dias: number;
  camioneroFrecuente?: {
    id: string;
    nombre: string;
    cantidadViajes: number;
  };
  rutasFrecuentes: Array<{
    origen: string;
    destino: string;
    cantidad: number;
  }>;
}

// Configuración de estados
export const ESTADOS_CAMION = {
  normal: {
    label: 'Normal',
    color: 'gray',
    icon: '🚛'
  },
  sospechoso: {
    label: 'Sospechoso',
    color: 'yellow',
    icon: '⚠️'
  },
  frecuente: {
    label: 'Frecuente',
    color: 'blue',
    icon: '🔄'
  },
  restringido: {
    label: 'Restringido',
    color: 'red',
    icon: '🚫'
  }
} as const;

// Filtros para búsqueda
export interface FiltrosCamion {
  busqueda: string;
  estado: EstadoCamion | '';
  conTransitosRecientes: boolean;
}

export const FILTROS_CAMION_DEFAULT: FiltrosCamion = {
  busqueda: '',
  estado: '',
  conTransitosRecientes: false
};