export type TipoDocumento = 'DUA' | 'Autorizacion' | 'Comunicacion' | 'Resolucion' | 'Otro';

export interface Documento {
  id: string;
  tipo: TipoDocumento;
  numeroDUA?: string;
  fechaDocumento: Date;
  fechaSubida: Date;
  descripcion: string;
  palabrasClave: string[];
  nombreArchivo: string;
  tamanioArchivo: number; // en bytes
  rutaArchivo: string;
  empresa?: string;
  destacado: boolean;
  confidencial: boolean;
  subidoPor: {
    id: string;
    nombre: string;
    email: string;
  };
  ultimaModificacion?: Date;
  modificadoPor?: {
    id: string;
    nombre: string;
  };
  estado: 'activo' | 'archivado' | 'eliminado';
}

export interface FiltrosDocumentos {
  busqueda: string;
  tipo: TipoDocumento | '';
  numeroDUA: string;
  empresa: string;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  soloDestacados: boolean;
  incluirConfidenciales: boolean;
  estado: 'activo' | 'archivado' | 'todos';
}

export interface LogAuditoria {
  id: string;
  documentoId: string;
  accion: 'subida' | 'descarga' | 'modificacion' | 'eliminacion' | 'visualizacion';
  usuarioId: string;
  usuarioNombre: string;
  fecha: Date;
  ip: string;
  detalles?: string;
}

export interface EstadisticasDocumentacion {
  totalDocumentos: number;
  porTipo: Record<TipoDocumento, number>;
  espacioUsado: number; // en bytes
  documentosMes: number;
  ultimaActualizacion: Date;
}

export const TIPOS_DOCUMENTO: Record<TipoDocumento, {
  label: string;
  icon: string;
  color: string;
}> = {
  DUA: {
    label: 'DUA',
    icon: 'file-text',
    color: 'blue'
  },
  Autorizacion: {
    label: 'Autorización',
    icon: 'check-square',
    color: 'green'
  },
  Comunicacion: {
    label: 'Comunicación',
    icon: 'mail',
    color: 'purple'
  },
  Resolucion: {
    label: 'Resolución',
    icon: 'gavel',
    color: 'orange'
  },
  Otro: {
    label: 'Otro',
    icon: 'file',
    color: 'gray'
  }
};

export const FILTROS_DEFAULT: FiltrosDocumentos = {
  busqueda: '',
  tipo: '',
  numeroDUA: '',
  empresa: '',
  fechaDesde: null,
  fechaHasta: null,
  soloDestacados: false,
  incluirConfidenciales: true,
  estado: 'activo'
};