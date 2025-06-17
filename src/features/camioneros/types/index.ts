// Tipo de nacionalidad
export type Nacionalidad = 'Uruguay' | 'Argentina' | 'Brasil' | 'Paraguay' | 'Chile' | 'Bolivia' | 'Otro';

// Interfaz para Camionero
export interface Camionero {
  id: string;
  nombre: string;
  apellido: string;
  documento: string; // C.I., pasaporte o cédula extranjera
  tipoDocumento: 'CI' | 'Pasaporte' | 'Otro';
  nacionalidad: Nacionalidad;
  paisOrigen: string; // Para especificar si nacionalidad es "Otro"
  telefonoUruguayo?: string;
  telefonoPais?: string;
  comentario?: string; // Texto libre editable
  fechaRegistro: Date;
  fechaActualizacion: Date;
  creadoPor: {
    id: string;
    nombre: string;
  };
}

// Interfaz para matrícula frecuente
export interface MatriculaFrecuente {
  matricula: string;
  cantidadViajes: number;
  ultimoViaje: Date;
  camion?: {
    id: string;
    estado: string;
    foto?: string;
  };
}

// Interfaz para historial de tránsitos del camionero
export interface TransitoCamionero {
  id: string;
  fecha: Date;
  matricula: string;
  origen: string;
  destino: string;
  estado: string;
  precinto: string;
}

// Interfaz para estadísticas del camionero
export interface EstadisticasCamionero {
  totalTransitos: number;
  transitosUltimos30Dias: number;
  matriculasFrecuentes: MatriculaFrecuente[];
  rutasFrecuentes: Array<{
    origen: string;
    destino: string;
    cantidad: number;
  }>;
}

// Nacionalidades disponibles
export const NACIONALIDADES: Record<Nacionalidad, string> = {
  'Uruguay': '🇺🇾 Uruguay',
  'Argentina': '🇦🇷 Argentina',
  'Brasil': '🇧🇷 Brasil',
  'Paraguay': '🇵🇾 Paraguay',
  'Chile': '🇨🇱 Chile',
  'Bolivia': '🇧🇴 Bolivia',
  'Otro': '🌍 Otro'
};

// Tipos de documento
export const TIPOS_DOCUMENTO = {
  'CI': 'Cédula de Identidad',
  'Pasaporte': 'Pasaporte',
  'Otro': 'Otro documento'
} as const;

// Filtros para búsqueda
export interface FiltrosCamionero {
  busqueda: string; // Por nombre, apellido o documento
  nacionalidad: Nacionalidad | '';
  conTransitosRecientes: boolean;
}

export const FILTROS_CAMIONERO_DEFAULT: FiltrosCamionero = {
  busqueda: '',
  nacionalidad: '',
  conTransitosRecientes: false
};