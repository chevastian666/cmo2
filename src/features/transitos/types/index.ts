export interface Transito {
  id: string;
  dua: string;
  precinto: string;
  viaje?: string;
  mov?: number;
  estado: 'en_viaje' | 'desprecintado' | 'con_alerta';
  fechaSalida: string;
  eta?: string;
  tiempoRestante?: number; // en minutos
  encargado: string;
  origen: string;
  destino: string;
  empresa: string;
  matricula: string;
  chofer: string;
  telefonoConductor?: string;
  ubicacionActual?: {
    lat: number;
    lng: number;
  };
  progreso: number; // 0-100
  alertas?: string[];
  observaciones?: string;
  tipoCarga?: string;
  // Referencias a las bases de datos
  vehiculo?: {
    matricula: string;
    conductor?: {
      nombre: string;
      documento: string;
      id?: string;
    };
  };
  precintoId: string;
  fechaInicio: Date;
}