import type { Alerta } from './monitoring';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'supervisor' | 'operador';
  avatar?: string;
  activo: boolean;
}

export interface ComentarioAlerta {
  id: string;
  alertaId: string;
  usuarioId: string;
  usuario: Usuario;
  mensaje: string;
  timestamp: number;
  tipo: 'comentario' | 'sistema' | 'resolucion';
  archivos?: string[];
}

export interface AsignacionAlerta {
  id: string;
  alertaId: string;
  usuarioAsignadoId: string;
  usuarioAsignado: Usuario;
  asignadoPorId: string;
  asignadoPor: Usuario;
  timestamp: number;
  notas?: string;
}

export interface ResolucionAlerta {
  id: string;
  alertaId: string;
  resueltoPorId: string;
  resueltoPor: Usuario;
  timestamp: number;
  tipoResolucion: 'resuelta' | 'falsa_alarma' | 'duplicada' | 'sin_accion';
  descripcion: string;
  accionesTomadas?: string[];
}

export interface AlertaExtendida extends Alerta {
  asignacion?: AsignacionAlerta;
  comentarios: ComentarioAlerta[];
  resolucion?: ResolucionAlerta;
  historial: HistorialAlerta[];
  tiempoRespuesta?: number; // segundos desde creación hasta primera acción
  tiempoResolucion?: number; // segundos desde creación hasta resolución
}

export interface HistorialAlerta {
  id: string;
  alertaId: string;
  tipo: 'creada' | 'asignada' | 'comentario' | 'estado_cambiado' | 'resuelta';
  usuarioId?: string;
  usuario?: Usuario;
  timestamp: number;
  detalles: any;
}

export interface FiltrosAlertas {
  estado?: 'todas' | 'activas' | 'asignadas' | 'resueltas';
  severidad?: Alerta['severidad'];
  tipo?: Alerta['tipo'];
  asignadoA?: string;
  fechaDesde?: number;
  fechaHasta?: number;
  busqueda?: string;
}

export interface EstadisticasAlertas {
  total: number;
  activas: number;
  asignadas: number;
  resueltas: number;
  porSeveridad: Record<Alerta['severidad'], number>;
  porTipo: Record<Alerta['tipo'], number>;
  tiempoPromedioRespuesta: number;
  tiempoPromedioResolucion: number;
  porUsuario: {
    usuarioId: string;
    usuario: Usuario;
    asignadas: number;
    resueltas: number;
    tiempoPromedio: number;
  }[];
}