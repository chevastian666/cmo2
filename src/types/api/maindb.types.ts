/**
 * Types for Main Database (trokor)
 * By Cheva
 */

// Tabla: precinto
export interface Precinto {
  precintoid: number;
  nserie: string;
  nqr: string;
  telefono?: string;
  telefono2?: string;
  lmuestreo: number;
  smuestreo: number;
  ultimo: number;
  ured?: string;
  inicio: number;
  server?: number;
  token: string;
  type: number; // 0: trokor, 2: jointech
  diftime?: number;
  status: number; // 1: Listo, 2: Armado, 3: Alarma, 4: Fin Monitoreo, 5: Eliminado
}

// Tabla: precinto_viaje
export interface PrecintoViaje {
  pvid: number;
  precintoid: string;
  track: string;
  empresaid: number;
  empresaid2?: number;
  empresaid3?: number;
  fecha: number;
  fechafin: number;
  DUA?: string;
  VjeId: string;
  MovId: string;
  PrcId?: string;
  MatTra: string; // Matrícula tractor
  MatTraOrg?: string;
  MatZrr: string; // Matrícula zorra/remolque
  MatRemo: string;
  PrcAdic: string;
  ConTDoc: string; // Tipo documento conductor
  ConNDoc: string; // Número documento conductor
  ConODoc?: string; // Origen documento
  ConNmb: string; // Nombre conductor
  ConTel: string; // Teléfono conductor
  ConTelConf?: string;
  ContId: string;
  HmTxt?: string;
  plidStart?: number;
  plidEnd?: number;
  depEnd?: number;
  eslinga?: string;
  status: number;
}

// Tabla: alarm_system
export interface AlarmSystem {
  asid: number;
  alarmtype?: string;
  precintoid?: number;
  extradata?: string;
  first?: number;
  last?: number;
  lastedit?: number;
  wtime?: number;
  count?: number;
  status?: number;
}

// Tabla: empresas
export interface Empresa {
  empresaid: number;
  enombre: string;
  razonsocial: string;
  rut: string;
  direccion: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  emailcontacto?: string;
  logo: string;
  facturacion?: string;
  vencimiento?: number;
  emailoperaciones?: string;
  telefonooperaciones?: string;
  descuento?: number;
  adau?: number;
  operaciones?: number;
  tipo: number; // 0: TROKOR, 1: Empresas Finales, 2: Empresas Con gestión de Precinto
}

// Tabla: app_user
export interface AppUser {
  userid: number;
  email: string;
  pass?: string;
  avatar: string;
  token: string;
  phone: string;
  name: string;
  card?: string;
  signup: number;
  type: number; // 1: ADMIN EMPRESA, 2: APP, 99: MASTER
  empresaid: number;
  location?: string;
  status: number;
}

// Tabla: precinto_locations
export interface PrecintoLocation {
  plid: number;
  location: string;
  geolocation?: {
    lat: number;
    lng: number;
  };
  type: number;
  status: number;
}

// Tabla: precinto_aduana_alarma
export interface PrecintoAduanaAlarma {
  paaid: number;
  pvid?: number;
  VjeId: number;
  MovId: number;
  PrcId: number;
  RegId: number;
  FchHor: string;
  EvnId: string;
  Latitud?: number;
  Longitud?: number;
  Velocidad?: number;
  Orientacion?: number;
  Odometro?: number;
  Temperatura?: number;
  EstGPS?: string;
  EstPuerta?: string;
  EstBateria?: string;
  NivelBateria?: number;
}

// Tabla: precinto_aduana_report
export interface PrecintoAduanaReport {
  parid: number;
  pvid?: number;
  VjeId: number;
  MovId: number;
  PrcId: number;
  RegId: number;
  FchHor: string;
  Latitud?: number;
  Longitud?: number;
  Velocidad?: number;
  Orientacion?: number;
  Odometro?: number;
  Temperatura?: number;
  EstGPS?: string;
  EstPuerta?: string;
  EstBateria?: string;
  NivelBateria?: number;
}