/**
 * Types for Auxiliary Database (satoshi)
 * By Cheva
 */

// Tabla: aduana
export interface Aduana {
  alid: number;
  viaje: number;
  mov: number;
  carga: string;
  origen: number;
  nombre: string;
  aduana?: number;
  ano: number;
  dua: number;
  desp: number;
  matricula?: string;
  remolque?: string;
  contenedor?: string;
  destino?: string;
  despnombre?: string;
  precintadora?: string;
  date: number;
  noti: number;
  status?: number;
}

// Tabla: DUA
export interface DUA {
  duaid: number;
  CODI_ADUAN: number;
  ANO_PRESE: number;
  NUME_CORRE: number;
  CODI_ALMA: number;
  ESTADO: string;
  DESP_URGE: number;
  CODI_AGENT: number;
  TipoDocAgente: number;
  DocumentoAgente: string;
  NombreAgente: string;
  NUME_ORDEN: number;
  CTIPODOC: number;
  CDOCUMEN: string;
  UNID_TRANS: number;
  VIA_TRANSP: number;
  CODI_MONED: number;
  FECH_INGSI: number;
  HORA_INGSI: string;
  POLDEPDEST?: number;
  NOMB_IMPOR?: string;
  DIRE_IMPOR: string;
  CALMDEST: string;
  NDOCEMPTRA: string;
  POLDOBS: string;
  CONTENEDORES: number;
  date: number;
}

// Tabla: DUA_ALERT
export interface DUAAlert {
  daid: number;
  value: string;
  skey: string;
  repeat: number;
  status: number;
}

// Tabla: aduanaAlert
export interface AduanaAlert {
  aid: number;
  alert: string;
  value: string;
  debug: string;
  extra: string;
  whatsapp: number;
}

// Tabla: office
export interface Office {
  officeid: number;
  name: string;
  code: string;
  location?: string;
  status: number;
}

// Enums y tipos compartidos
export type EstadoDUA = 'PENDIENTE' | 'EN_PROCESO' | 'PRECINTADO' | 'DESPRECINTADO' | 'CANCELADO';

export type TipoCarga = 'CONTENEDOR' | 'ENLONADA' | 'GRANEL' | 'REFRIGERADA';

export interface DespachanteSatoshi {
  desp: number;
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
}