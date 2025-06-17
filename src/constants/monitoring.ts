export const ESTADO_PRECINTO = {
  SAL: 'SAL',
  LLE: 'LLE',
  FMF: 'FMF',
  CFM: 'CFM',
  CNP: 'CNP'
} as const;

export const TIPO_PRECINTO = {
  RFID: 'RFID',
  GPS: 'GPS',
  HYBRID: 'HYBRID'
} as const;

export const ESTADO_ESLINGA = {
  CERRADA: 'cerrada',
  ABIERTA: 'abierta',
  VIOLADA: 'violada'
} as const;

export const TIPO_ALERTA = {
  VIOLACION: 'violacion',
  BATERIA_BAJA: 'bateria_baja',
  FUERA_DE_RUTA: 'fuera_de_ruta',
  SIN_SIGNAL: 'sin_signal',
  TEMPERATURA: 'temperatura',
  INTRUSION: 'intrusion'
} as const;

export const SEVERIDAD_ALERTA = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica'
} as const;

export const UBICACIONES_URUGUAY = {
  ORIGEN: [
    'ZONA FRANCA MONTEVIDEO',
    'MONTECON S.A',
    'TERMINAL CUENCA DEL PLATA S.A.',
    'ZONA FRANCA NUEVA PALMIRA',
    'PUERTO DE NUEVA PALMIRA',
    'ZONA FRANCA COLONIA',
    'PUENTE SAN MARTIN',
    'CONTROL INTEGRADO CHUY',
    'SUPRAMAR S.A.',
    'TCU S.A',
    'GODILCO S.A.',
    'BOMPORT S.A.',
    'ZONA FRANCA DE FLORIDA',
    'MONTEVIDEO PORT SERVICES S.A.',
    'TERMINAL BUQUEBUS',
    'AEROPUERTO C. CURBELO',
    'LOBRAUS PUERTO LIBRE S.A',
    'NAVINTEN S.A.',
    'PUENTE GRAL. ARTIGAS',
    'CONTROL INTEGRADO RIO BRANCO'
  ],
  DESTINO: [
    'MURCHISON URUGUAY S.A.',
    'ZONA FRANCA PUNTA PEREIRA S.A.',
    'RILCOMAR S.A.',
    'TAMINER S.A.',
    'BRIASOL S.A',
    'RINCORANDO S.A',
    'TALFIR S.A.',
    'FIANCAR S.A',
    'PROVIMAR LTDA',
    'PERKINSTON S.A.',
    'CAVIMAR S.A.',
    'TREBOLIR S.A',
    'CUECAR S.A.',
    'CAMPUSOL S.A',
    'VIMALCOR S.A.',
    'CALIRAL S.A.',
    'DRIMPER S.A.',
    'MIRENTEX S.A.',
    'WTC FREE ZONE S.A',
    'ASOCIACION RURAL DEL URUGUAY'
  ]
};


export const TIPO_CARGA = ['Contenedor', 'Enlonada'];

export const THRESHOLDS = {
  BATERIA_BAJA: 20,
  BATERIA_MEDIA: 50,
  TIEMPO_PENDIENTE_VERDE: 1800, // 30 minutos
  TIEMPO_PENDIENTE_AMARILLO: 3600, // 60 minutos (1 hora)
  TIEMPO_PENDIENTE_NARANJA: 14400, // 4 horas (ya no se usa, todo después de 60 min es rojo)
};