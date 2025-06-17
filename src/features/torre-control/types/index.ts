export type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';

export interface TransitoTorreControl {
  id: string;
  pvid: string;
  matricula: string;
  chofer: string;
  choferCI: string;
  origen: string;
  destino: string;
  fechaSalida: Date;
  eta: Date;
  estado: number;
  semaforo: EstadoSemaforo;
  precinto: string;
  eslinga_larga: boolean;
  eslinga_corta: boolean;
  observaciones: string;
  alertas?: string[];
  ubicacionActual?: {
    lat: number;
    lng: number;
  };
  progreso: number;
  dua?: string;
  numeroViaje?: string;
  numeroMovimiento?: string;
  fotoPrecintado?: string;
}

export interface TorreControlFilters {
  origen: string;
  destino: string;
  estado: EstadoSemaforo | '';
}