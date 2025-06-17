import type { Precinto, TransitoPendiente, Alerta } from '../../types';

export type WebSocketMessageType = 
  | 'precinto_update'
  | 'transito_update'
  | 'alerta_nueva'
  | 'alerta_update'
  | 'sistema_update'
  | 'connection'
  | 'heartbeat';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  timestamp: number;
  data: T;
}

export interface PrecintoUpdateData {
  precinto: Partial<Precinto> & { id: string };
  action: 'update' | 'create' | 'delete';
}

export interface TransitoUpdateData {
  transito: Partial<TransitoPendiente> & { id: string };
  action: 'update' | 'create' | 'delete' | 'precintado';
}

export interface AlertaUpdateData {
  alerta: Alerta;
  action: 'create' | 'update' | 'atender' | 'asignar' | 'comentar' | 'resolver';
  detalles?: {
    asignacion?: any;
    comentario?: any;
    resolucion?: any;
  };
}

export interface SistemaUpdateData {
  smsPendientes?: number;
  dbStats?: {
    memoriaUsada: number;
    discoUsado: number;
  };
  apiStats?: {
    memoriaUsada: number;
    discoUsado: number;
  };
  reportesPendientes?: number;
  precintosActivos?: number;
  alertasActivas?: number;
}

export interface ConnectionData {
  status: 'connected' | 'disconnected' | 'reconnecting';
  message?: string;
}

export type WebSocketEventHandlers = {
  onPrecintoUpdate?: (data: PrecintoUpdateData) => void;
  onTransitoUpdate?: (data: TransitoUpdateData) => void;
  onAlertaNueva?: (data: AlertaUpdateData) => void;
  onAlertaUpdate?: (data: AlertaUpdateData) => void;
  onSistemaUpdate?: (data: SistemaUpdateData) => void;
  onConnectionChange?: (data: ConnectionData) => void;
  onError?: (error: Error) => void;
};