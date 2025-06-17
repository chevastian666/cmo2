import type { Precinto, TransitoPendiente, Alerta, EstadisticasMonitoreo, AlertaExtendida, ComentarioAlerta } from '../../types';

// Precintos Store
export interface PrecintosState {
  precintos: Precinto[];
  precintosActivos: Precinto[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

export interface PrecintosActions {
  setPrecintos: (precintos: Precinto[]) => void;
  setPrecintosActivos: (precintos: Precinto[]) => void;
  updatePrecinto: (id: string, data: Partial<Precinto>) => void;
  removePrecinto: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPrecintos: () => Promise<void>;
  fetchPrecintosActivos: () => Promise<void>;
}

export type PrecintosStore = PrecintosState & PrecintosActions;

// Transitos Store
export interface TransitosState {
  transitos: TransitoPendiente[];
  transitosPendientes: TransitoPendiente[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

export interface TransitosActions {
  setTransitos: (transitos: TransitoPendiente[]) => void;
  setTransitosPendientes: (transitos: TransitoPendiente[]) => void;
  updateTransito: (id: string, data: Partial<TransitoPendiente>) => void;
  removeTransito: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTransitos: () => Promise<void>;
  fetchTransitosPendientes: () => Promise<void>;
  precintarTransito: (transitoId: string, precintoId: string) => Promise<void>;
}

export type TransitosStore = TransitosState & TransitosActions;

// Alertas Store
export interface AlertasState {
  alertas: Alerta[];
  alertasActivas: Alerta[];
  alertasExtendidas: Map<string, AlertaExtendida>;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  filter: {
    tipo?: string;
    severidad?: string;
    atendida?: boolean;
    estado?: 'todas' | 'activas' | 'asignadas' | 'resueltas';
    asignadoA?: string;
  };
}

export interface AlertasActions {
  setAlertas: (alertas: Alerta[]) => void;
  setAlertasActivas: (alertas: Alerta[]) => void;
  addAlerta: (alerta: Alerta) => void;
  updateAlerta: (id: string, data: Partial<Alerta>) => void;
  removeAlerta: (id: string) => void;
  atenderAlerta: (id: string) => Promise<void>;
  setFilter: (filter: AlertasState['filter']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAlertas: () => Promise<void>;
  fetchAlertasActivas: () => Promise<void>;
  // Extended alert management
  fetchAlertaExtendida: (id: string) => Promise<AlertaExtendida | null>;
  asignarAlerta: (alertaId: string, usuarioId: string, notas?: string) => Promise<void>;
  comentarAlerta: (alertaId: string, mensaje: string) => Promise<void>;
  resolverAlerta: (alertaId: string, tipo: string, descripcion: string, acciones?: string[]) => Promise<void>;
  updateAlertaExtendida: (id: string, data: Partial<AlertaExtendida>) => void;
}

export type AlertasStore = AlertasState & AlertasActions;

// System Status Store
export interface SystemStatusState {
  estadisticas: EstadisticasMonitoreo | null;
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
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

export interface SystemStatusActions {
  setEstadisticas: (stats: EstadisticasMonitoreo) => void;
  updateSystemStatus: (status: Partial<SystemStatusState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchEstadisticas: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
}

export type SystemStatusStore = SystemStatusState & SystemStatusActions;

// Root Store
export interface RootStore {
  precintos: PrecintosStore;
  transitos: TransitosStore;
  alertas: AlertasStore;
  systemStatus: SystemStatusStore;
}