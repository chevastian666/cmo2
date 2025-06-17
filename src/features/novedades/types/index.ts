export type TipoNovedad = 'evento' | 'reclamo' | 'tarea' | 'pendiente' | 'aviso';
export type EstadoNovedad = 'activa' | 'resuelta' | 'seguimiento';

export interface Novedad {
  id: string;
  fecha: Date;
  fechaCreacion: Date;
  puntoOperacion: string;
  tipoNovedad: TipoNovedad;
  descripcion: string;
  estado: EstadoNovedad;
  archivosAdjuntos?: {
    id: string;
    nombre: string;
    tipo: 'imagen' | 'pdf';
    url: string;
    tamanio: number;
  }[];
  creadoPor: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  editadoPor?: {
    id: string;
    nombre: string;
    fecha: Date;
  };
  resolucion?: {
    fecha: Date;
    usuario: {
      id: string;
      nombre: string;
    };
    comentario?: string;
  };
  seguimientos?: {
    id: string;
    fecha: Date;
    usuario: {
      id: string;
      nombre: string;
    };
    comentario: string;
  }[];
}

export interface FiltrosNovedades {
  fecha: Date | null;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  puntoOperacion: string;
  tipoNovedad: TipoNovedad | '';
  estado: EstadoNovedad | '';
  busqueda: string;
  soloMias: boolean;
}

export const PUNTOS_OPERACION = [
  'Montecon',
  'TCP',
  'Paso de los Toros',
  'Río Branco',
  'Rivera',
  'Chuy',
  'Montevideo',
  'Nueva Palmira',
  'Fray Bentos',
  'Paysandú',
  'Salto',
  'CMO Central'
] as const;

export const TIPOS_NOVEDAD: Record<TipoNovedad, {
  label: string;
  icon: string;
  color: string;
}> = {
  evento: {
    label: 'Evento',
    icon: '📅',
    color: 'blue'
  },
  reclamo: {
    label: 'Reclamo',
    icon: '⚠️',
    color: 'red'
  },
  tarea: {
    label: 'Tarea',
    icon: '✅',
    color: 'green'
  },
  pendiente: {
    label: 'Pendiente',
    icon: '📌',
    color: 'yellow'
  },
  aviso: {
    label: 'Aviso General',
    icon: '📢',
    color: 'purple'
  }
};

export const FILTROS_DEFAULT: FiltrosNovedades = {
  fecha: new Date(),
  fechaDesde: null,
  fechaHasta: null,
  puntoOperacion: '',
  tipoNovedad: '',
  estado: '',
  busqueda: '',
  soloMias: false
};

export interface EstadisticasNovedades {
  totalDia: number;
  porTipo: Record<TipoNovedad, number>;
  porPunto: Record<string, number>;
  pendientes: number;
  resueltas: number;
  enSeguimiento: number;
}