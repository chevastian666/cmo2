export type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';
export type NivelCriticidad = 'bajo' | 'medio' | 'alto' | 'critico';

// Próximo arribo a mostrar en pantalla
export interface ProximoArribo {
  id: string;
  matricula: string;
  chofer?: string;
  origen: string;
  destino: string;
  puntoOperacion: string; // TCP, Montecon, etc.
  horaEstimadaArribo: Date;
  minutosRestantes: number;
  estado: EstadoSemaforo;
  distanciaKm?: number;
}

// Alerta activa para mostrar
export interface AlertaTV {
  id: string;
  hora: Date;
  tipo: 'precinto_abierto' | 'datos_incorrectos' | 'chofer_no_identificado' | 'punto_equivocado' | 'tiempo_excesivo';
  transitoAfectado: string;
  descripcion: string;
  nivel: NivelCriticidad;
}

// Tránsito crítico
export interface TransitoCritico {
  id: string;
  matricula: string;
  chofer?: string;
  origen: string;
  destino: string;
  problema: string;
  tiempoEnProblema: number; // minutos
  nivel: NivelCriticidad;
  accionRequerida?: string;
}

// Configuración del modo TV
export interface ConfiguracionTV {
  puntoOperacion?: string; // Filtrar arribos por punto específico
  mostrarTodos: boolean; // Si true, muestra todos los puntos
  sonidoAlertas: boolean;
  actualizacionSegundos: number; // Por defecto 10
  columnas: 1 | 2 | 3; // Layout de pantalla
}

// Estado general del modo TV
export interface EstadoModoTV {
  proximosArribos: ProximoArribo[];
  alertasActivas: AlertaTV[];
  transitosCriticos: TransitoCritico[];
  ultimaActualizacion: Date;
  configuracion: ConfiguracionTV;
}

// Mapeo de tipos de alerta
export const TIPOS_ALERTA_TV = {
  precinto_abierto: {
    texto: 'Precinto sin cerrar',
    icono: '🔓',
    color: 'red'
  },
  datos_incorrectos: {
    texto: 'Datos incorrectos',
    icono: '⚠️',
    color: 'yellow'
  },
  chofer_no_identificado: {
    texto: 'Chofer no identificado',
    icono: '👤',
    color: 'orange'
  },
  punto_equivocado: {
    texto: 'Camión en punto equivocado',
    icono: '📍',
    color: 'red'
  },
  tiempo_excesivo: {
    texto: 'Tiempo de viaje excesivo',
    icono: '⏱️',
    color: 'orange'
  }
} as const;

// Puntos de operación disponibles
export const PUNTOS_OPERACION_TV = [
  'TCP - Terminal Cuenca del Plata',
  'Montecon',
  'Paso de los Toros',
  'Rivera',
  'Fray Bentos',
  'Chuy',
  'Río Branco',
  'Aceguá',
  'Salto',
  'Paysandú'
] as const;