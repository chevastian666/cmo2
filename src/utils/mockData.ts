import { 
  UBICACIONES_URUGUAY, 
  TIPO_CARGA, 
  ESTADO_PRECINTO,
  TIPO_PRECINTO,
  TIPO_ALERTA,
  SEVERIDAD_ALERTA
} from '../constants';
import { DESPACHANTES } from '../constants/locations';
import type { Precinto, TransitoPendiente, Alerta } from '../types';

export const generateMockPrecinto = (index: number): Precinto => {
  const estados = Object.values(ESTADO_PRECINTO);
  const estado = estados[Math.floor(Math.random() * estados.length)] as keyof typeof ESTADO_PRECINTO;
  
  return {
    id: `pr-${index}`,
    codigo: `BT${String(2024000 + index).padStart(8, '0')}`,
    numeroPrecinto: Math.floor(Math.random() * 1000) + 1,
    viaje: String(1000000 + Math.floor(Math.random() * 8999999)),
    mov: Math.floor(Math.random() * 999) + 1,
    tipo: 'RF-01',
    estado: estado,
    fechaActivacion: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7),
    fechaUltimaLectura: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
    ubicacionActual: {
      lat: -34.9011 + (Math.random() - 0.5) * 0.1,
      lng: -56.1645 + (Math.random() - 0.5) * 0.1,
      direccion: [...UBICACIONES_URUGUAY.ORIGEN, ...UBICACIONES_URUGUAY.DESTINO][
        Math.floor(Math.random() * (UBICACIONES_URUGUAY.ORIGEN.length + UBICACIONES_URUGUAY.DESTINO.length))
      ]
    },
    contenedor: {
      numero: `MSKU${Math.floor(Math.random() * 9000000 + 1000000)}`,
      tipo: '40HC',
      destino: ['Buenos Aires', 'Asunción', 'São Paulo'][Math.floor(Math.random() * 3)]
    },
    bateria: Math.floor(Math.random() * 80 + 20),
    temperatura: Math.floor(Math.random() * 10 + 18),
    humedad: Math.floor(Math.random() * 30 + 40),
    gps: {
      activo: Math.random() > 0.1,
      señal: Math.floor(Math.random() * 30 + 70)
    },
    eslinga: {
      estado: index === 2 || estado === 'CNP' ? 
        'violada' : 
        Math.random() > 0.9 ? 'abierta' : 'cerrada',
      ultimoCambio: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600)
    }
  };
};

export const generateMockTransito = (index: number): TransitoPendiente => {
  // Add observations to some transits (30% chance)
  const observaciones = Math.random() < 0.3 ? [
    'Documentación incompleta - Falta certificado de origen',
    'Verificar precinto anterior - Posible daño en contenedor',
    'Carga requiere inspección adicional',
    'Demora en despacho - Aguardando confirmación de destino',
    'Prioridad alta - Cliente preferencial',
    'Revisar temperatura del contenedor refrigerado',
    'Precinto debe ser colocado por supervisor'
  ][Math.floor(Math.random() * 7)] : undefined;

  return {
    id: `tr-${index}`,
    numeroViaje: String(7581856 + Math.floor(Math.random() * 100000)),
    mov: Math.floor(Math.random() * 9999) + 1,
    dua: String(788553 + Math.floor(Math.random() * 11000)),
    tipoCarga: TIPO_CARGA[Math.floor(Math.random() * TIPO_CARGA.length)],
    matricula: 'STP1234',
    origen: UBICACIONES_URUGUAY.ORIGEN[Math.floor(Math.random() * UBICACIONES_URUGUAY.ORIGEN.length)],
    destino: UBICACIONES_URUGUAY.DESTINO[Math.floor(Math.random() * UBICACIONES_URUGUAY.DESTINO.length)],
    despachante: DESPACHANTES[Math.floor(Math.random() * DESPACHANTES.length)],
    fechaIngreso: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 7200),
    estado: index < 5 ? 'pendiente' : index < 8 ? 'en_proceso' : 'precintado',
    observaciones
  };
};

export const generateMockTransitos = (count: number = 10): TransitoPendiente[] => {
  return Array.from({ length: count }, (_, i) => generateMockTransito(i));
};

export const generateMockPrecintos = (count: number = 20): Precinto[] => {
  return Array.from({ length: count }, (_, i) => generateMockPrecinto(i));
};

export const generateMockAlerta = (index: number): Alerta => {
  const tipos: Array<Alerta['tipo']> = ['AAR', 'BBJ', 'DEM', 'DNR', 'DTN', 'NPG', 'NPN', 'PTN', 'SNA'];
  const severidades = [SEVERIDAD_ALERTA.BAJA, SEVERIDAD_ALERTA.MEDIA, SEVERIDAD_ALERTA.ALTA, SEVERIDAD_ALERTA.CRITICA];
  
  const tipoSeleccionado = tipos[Math.floor(Math.random() * tipos.length)];
  
  // Generate appropriate message based on type
  const mensajes: Record<Alerta['tipo'], string> = {
    'AAR': 'Atraso en arribo de reporte por más de 30 minutos',
    'BBJ': 'Nivel de batería crítico: 15%',
    'DEM': 'Tránsito demorado - Excedió tiempo estimado',
    'DNR': 'Desvío detectado: 5km fuera de la ruta planificada',
    'DTN': 'Vehículo detenido por más de 2 horas',
    'NPG': 'Sin señal GPS por más de 1 hora',
    'NPN': 'Sin reporte del precinto por más de 4 horas',
    'PTN': 'Precinto abierto sin autorización en zona no permitida',
    'SNA': 'Salida no autorizada detectada del depósito'
  };
  
  return {
    id: `ALR-${index}`,
    tipo: tipoSeleccionado,
    precintoId: `pr-${Math.floor(Math.random() * 20)}`,
    codigoPrecinto: `BT${String(2024000 + Math.floor(Math.random() * 1000)).padStart(8, '0')}`,
    mensaje: mensajes[tipoSeleccionado],
    timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 7200),
    ubicacion: {
      lat: -34.9011 + (Math.random() - 0.5) * 0.1,
      lng: -56.1645 + (Math.random() - 0.5) * 0.1
    },
    severidad: severidades[Math.floor(Math.random() * severidades.length)],
    atendida: Math.random() > 0.8
  };
};

export const generateMockAlertas = (): Alerta[] => [
  {
    id: '1',
    tipo: 'PTN',
    precintoId: 'pr-2',
    codigoPrecinto: 'BT20240002',
    mensaje: 'Precinto abierto sin autorización en zona no permitida',
    timestamp: Math.floor(Date.now() / 1000) - 300,
    ubicacion: { lat: -34.9011, lng: -56.1645 },
    severidad: SEVERIDAD_ALERTA.CRITICA,
    atendida: false
  },
  {
    id: '2',
    tipo: 'BBJ',
    precintoId: 'pr-5',
    codigoPrecinto: 'BT20240045',
    mensaje: 'Nivel de batería crítico: 12%',
    timestamp: Math.floor(Date.now() / 1000) - 1800,
    severidad: SEVERIDAD_ALERTA.ALTA,
    atendida: false
  },
  {
    id: '3',
    tipo: 'DTN',
    precintoId: 'pr-7',
    codigoPrecinto: 'BT20240067',
    mensaje: 'Vehículo detenido por más de 3 horas en zona no autorizada',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    ubicacion: { lat: -34.8511, lng: -56.1045 },
    severidad: SEVERIDAD_ALERTA.MEDIA,
    atendida: false
  },
  {
    id: '4',
    tipo: 'SNA',
    precintoId: 'pr-10',
    codigoPrecinto: 'BT20240089',
    mensaje: 'Salida no autorizada detectada del depósito TCU',
    timestamp: Math.floor(Date.now() / 1000) - 1200,
    ubicacion: { lat: -34.8856, lng: -56.1234 },
    severidad: SEVERIDAD_ALERTA.ALTA,
    atendida: false
  },
  {
    id: '5',
    tipo: 'AAR',
    precintoId: 'pr-12',
    codigoPrecinto: 'BT20240103',
    mensaje: 'Atraso en arribo de reporte por más de 2 horas',
    timestamp: Math.floor(Date.now() / 1000) - 7200,
    ubicacion: { lat: -34.9101, lng: -56.1801 },
    severidad: SEVERIDAD_ALERTA.MEDIA,
    atendida: false
  },
  {
    id: '6',
    tipo: 'NPG',
    precintoId: 'pr-15',
    codigoPrecinto: 'BT20240127',
    mensaje: 'Sin señal GPS por más de 2 horas',
    timestamp: Math.floor(Date.now() / 1000) - 900,
    ubicacion: { lat: -34.8734, lng: -56.1567 },
    severidad: SEVERIDAD_ALERTA.ALTA,
    atendida: false
  },
  {
    id: '7',
    tipo: 'DEM',
    precintoId: 'pr-18',
    codigoPrecinto: 'BT20240145',
    mensaje: 'Tránsito demorado - Excedió tiempo estimado en 4 horas',
    timestamp: Math.floor(Date.now() / 1000) - 2400,
    ubicacion: { lat: -34.8923, lng: -56.1423 },
    severidad: SEVERIDAD_ALERTA.ALTA,
    atendida: false
  }
];