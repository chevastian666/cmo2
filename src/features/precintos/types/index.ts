export interface Precinto {
  id: string;
  nserie: string;
  nqr: string;
  telefono: string;
  telefono2?: string;
  status: PrecintoStatus;
  bateria?: number;
  ultimoReporte?: string;
  inicioReporte?: string;
  ubicacion?: string;
  eslinga?: boolean;
  asignadoTransito?: string;
  empresa?: string;
  empresaId?: string;
  fechaActivacion?: string;
  gps?: {
    lat: number;
    lng: number;
  };
  signal?: number;
  muestreoLocal?: number;
  muestreoServidor?: number;
}

export const PrecintoStatus = {
  LISTO: 1,
  ARMADO: 2,
  ALARMA: 3,
  FIN_MONITOREO: 4,
  ROTO: 5
} as const;

export type PrecintoStatus = typeof PrecintoStatus[keyof typeof PrecintoStatus];

export const PrecintoStatusText: Record<PrecintoStatus, string> = {
  [PrecintoStatus.LISTO]: 'Listo',
  [PrecintoStatus.ARMADO]: 'Armado',
  [PrecintoStatus.ALARMA]: 'Alarma',
  [PrecintoStatus.FIN_MONITOREO]: 'Fin de Monitoreo',
  [PrecintoStatus.ROTO]: 'Roto/Inutilizable'
};

export const PrecintoStatusColor: Record<PrecintoStatus, string> = {
  [PrecintoStatus.LISTO]: 'bg-green-500',
  [PrecintoStatus.ARMADO]: 'bg-blue-500',
  [PrecintoStatus.ALARMA]: 'bg-red-500',
  [PrecintoStatus.FIN_MONITOREO]: 'bg-gray-500',
  [PrecintoStatus.ROTO]: 'bg-red-600'
};

export interface PrecintoFilters {
  search?: string;
  status?: PrecintoStatus;
  empresa?: string;
  bateriaBaja?: boolean;
  ubicacion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface PrecintoCommand {
  type: 'CFM' | 'SAL' | 'LLE';
  frecuencia?: number;
  timestamp?: string;
}

export interface PrecintoHistorial {
  id: string;
  precintoId: string;
  fecha: string;
  evento: string;
  descripcion: string;
  usuario?: string;
  ubicacion?: string;
}