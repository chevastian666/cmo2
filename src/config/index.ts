export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

export const APP_CONFIG = {
  APP_NAME: 'Block Tracker - Centro de Monitoreo',
  VERSION: '1.0.0',
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export const QUERY_KEYS = {
  PRECINTOS: 'precintos',
  ESTADISTICAS: 'estadisticas',
  ALERTAS: 'alertas',
  TRANSITOS_PENDIENTES: 'transitos-pendientes',
  EVENTOS: 'eventos',
  PUNTOS_CONTROL: 'puntos-control',
} as const;