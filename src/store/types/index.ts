/**
 * Store Types with Enhanced Zustand Patterns
 * Includes: Computed properties, filters, batch operations
 * By Cheva
 */

// import type { Precinto, Alerta, EstadisticasMonitoreo, AlertaExtendida, ComentarioAlerta } from '../../types';
import type { Transito} from '../../features/transitos/types';

// Filters for stores
export interface StoreFilters {
  search: string;
  estado: string;
  tipo: string;
}

// Precintos Store
export interface PrecintosState {
  precintos: Precinto[];
  precintosActivos: Precinto[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  filters: StoreFilters;
}

export interface PrecintosComputedProperties {
  // Computed getters
  filteredPrecintos: Precinto[];
  precintosStats: {
    total: number;
    enTransito: number;
    conNovedad: number;
    conAlerta: number;
    finalizados: number;
  };
  // Legacy computed properties
  getPrecintosConAlertas: () => Precinto[];
  getPrecintosBajaBateria: () => Precinto[];
}

export interface PrecintosActions {
  // Basic actions
  setPrecintos: (precintos: Precinto[]) => void;
  setPrecintosActivos: (precintos: Precinto[]) => void;
  updatePrecinto: (id: string, data: Partial<Precinto>) => void;
  removePrecinto: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Filter actions
  setFilters: (filters: Partial<StoreFilters>) => void;
  clearFilters: () => void;
  // Async actions
  fetchPrecintos: () => Promise<Precinto[]>;
  fetchPrecintosActivos: () => Promise<Precinto[]>;
  // Batch operations
  batchUpdatePrecintos: (updates: Array<{ id: string; data: Partial<Precinto> }>) => void;
  // Reset
  reset: () => void;
}

export type PrecintosStore = PrecintosState & PrecintosComputedProperties & PrecintosActions;

// Transitos Store
export interface TransitosState {
  transitos: Transito[];
  transitosPendientes: Transito[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  filters: StoreFilters & {
    origen?: string;
    destino?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  };
}

export interface TransitosComputedProperties {
  // New computed getters
  filteredTransitos: Transito[];
  transitosStats: {
    total: number;
    enCurso: number;
    completados: number;
    conAlertas: number;
    demorados: number;
  };
  // Legacy computed properties
  transitosEnCurso: Transito[];
  transitosCompletados: Transito[];
  transitosConAlertas: Transito[];
}

export interface TransitosActions {
  setTransitos: (transitos: Transito[]) => void;
  setTransitosPendientes: (transitos: Transito[]) => void;
  updateTransito: (id: string, data: Partial<Transito>) => void;
  removeTransito: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Filter actions
  setFilters: (filters: Partial<TransitosState['filters']>) => void;
  clearFilters: () => void;
  // Async actions
  fetchTransitos: () => Promise<Transito[]>;
  fetchTransitosPendientes: () => Promise<Transito[]>;
  precintarTransito: (transitoId: string, precintoId: string) => Promise<void>;
  markDesprecintado: (transitoId: string) => Promise<void>;
  // Batch operations
  batchUpdateTransitos: (updates: Array<{ id: string; data: Partial<Transito> }>) => void;
  // Reset
  reset: () => void;
}

export type TransitosStore = TransitosState & TransitosComputedProperties & TransitosActions;

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
    search?: string;
  };
}

export interface AlertasComputedProperties {
  // Computed getters
  filteredAlertas: Alerta[];
  alertasStats: {
    total: number;
    criticas: number;
    altas: number;
    medias: number;
    bajas: number;
    sinAtender: number;
    asignadas: number;
    resueltas: number;
  };
  alertasCriticas: Alerta[];
  alertasPorTipo: Map<string, Alerta[]>;
}

export interface AlertasActions {
  setAlertas: (alertas: Alerta[]) => void;
  setAlertasActivas: (alertas: Alerta[]) => void;
  addAlerta: (alerta: Alerta) => void;
  updateAlerta: (id: string, data: Partial<Alerta>) => void;
  removeAlerta: (id: string) => void;
  atenderAlerta: (id: string) => Promise<void>;
  setFilter: (filter: Partial<AlertasState['filter']>) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAlertas: () => Promise<Alerta[]>;
  fetchAlertasActivas: () => Promise<Alerta[]>;
  // Extended alert management
  fetchAlertaExtendida: (id: string) => Promise<AlertaExtendida | null>;
  asignarAlerta: (alertaId: string, usuarioId: string, notas?: string) => Promise<void>;
  comentarAlerta: (alertaId: string, mensaje: string) => Promise<void>;
  resolverAlerta: (alertaId: string, tipo: string, descripcion: string, acciones?: string[]) => Promise<void>;
  updateAlertaExtendida: (id: string, data: Partial<AlertaExtendida>) => void;
  // Batch operations
  batchUpdateAlertas: (updates: Array<{ id: string; data: Partial<Alerta> }>) => void;
  batchAtenderAlertas: (ids: string[]) => Promise<void>;
  // Reset
  reset: () => void;
}

export type AlertasStore = AlertasState & AlertasComputedProperties & AlertasActions;

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
  // Performance metrics
  performance: {
    avgResponseTime: number;
    activeConnections: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export interface SystemStatusComputedProperties {
  // Health status
  systemHealth: 'healthy' | 'warning' | 'critical';
  memoryUsagePercent: number;
  diskUsagePercent: number;
  isSystemOverloaded: boolean;
}

export interface SystemStatusActions {
  setEstadisticas: (stats: EstadisticasMonitoreo) => void;
  updateSystemStatus: (status: Partial<SystemStatusState>) => void;
  updatePerformanceMetrics: (metrics: Partial<SystemStatusState['performance']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchEstadisticas: () => Promise<EstadisticasMonitoreo>;
  fetchSystemStatus: () => Promise<void>;
  // Reset
  reset: () => void;
}

export type SystemStatusStore = SystemStatusState & SystemStatusComputedProperties & SystemStatusActions;

// Root Store
export interface RootStore {
  precintos: PrecintosStore;
  transitos: TransitosStore;
  alertas: AlertasStore;
  systemStatus: SystemStatusStore;
}

// Store Selectors for optimization
export interface StoreSelectors {
  // Precintos selectors
  usePrecintosActivos: () => Precinto[];
  usePrecintosStats: () => PrecintosComputedProperties['precintosStats'];
  useFilteredPrecintos: () => Precinto[];
  
  // Transitos selectors
  useTransitosEnCurso: () => Transito[];
  useTransitosStats: () => TransitosComputedProperties['transitosStats'];
  useFilteredTransitos: () => Transito[];
  
  // Alertas selectors
  useAlertasCriticas: () => Alerta[];
  useAlertasStats: () => AlertasComputedProperties['alertasStats'];
  useFilteredAlertas: () => Alerta[];
  
  // System selectors
  useSystemHealth: () => SystemStatusComputedProperties['systemHealth'];
  useIsSystemOverloaded: () => boolean;
}