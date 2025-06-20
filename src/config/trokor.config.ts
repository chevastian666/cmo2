/**
 * Configuración específica para la API de Trokor
 * By Cheva
 */

export const TROKOR_CONFIG = {
  // Base URLs
  API_BASE: import.meta.env.VITE_TROKOR_API_BASE || 'https://api.trokor.com/api',
  MAINDB_BASE: import.meta.env.VITE_TROKOR_MAINDB_BASE || 'https://maindb.trokor.com',
  AUXDB_BASE: import.meta.env.VITE_TROKOR_AUXDB_BASE || 'https://auxdb.trokor.com',
  
  // Authentication
  API_KEY: import.meta.env.VITE_API_KEY || '',
  API_SECRET: import.meta.env.VITE_API_SECRET || '',
  
  // Endpoints mapping
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    
    // Precintos
    PRECINTOS: '/precintos',
    PRECINTOS_ACTIVOS: '/precintos/activos',
    PRECINTO_BY_ID: (id: string) => `/precintos/${id}`,
    PRECINTO_BY_NQR: (nqr: string) => `/precintos/nqr/${nqr}`,
    PRECINTO_STATUS: (id: string) => `/precintos/${id}/status`,
    PRECINTO_FINALIZAR: (id: string) => `/precintos/${id}/finalizar`,
    
    // Viajes (Tránsitos)
    VIAJES: '/viajes',
    VIAJE_BY_ID: (id: string) => `/viajes/${id}`,
    VIAJES_PENDIENTES: '/viajes/pendientes',
    VIAJE_PRECINTAR: (id: string) => `/viajes/${id}/precintar`,
    
    // Alarmas
    ALARMAS: '/alarmas',
    ALARMA_BY_ID: (id: string) => `/alarmas/${id}`,
    ALARMAS_ACTIVAS: '/alarmas/activas',
    ALARMA_ATENDER: (id: string) => `/alarmas/${id}/atender`,
    ALARMA_VERIFICAR: (id: string) => `/alarmas/${id}/verificar`,
    
    // Empresas
    EMPRESAS: '/empresas',
    EMPRESA_BY_ID: (id: string) => `/empresas/${id}`,
    
    // Usuarios
    USUARIOS: '/usuarios',
    USUARIO_BY_ID: (id: string) => `/usuarios/${id}`,
    
    // Ubicaciones
    UBICACIONES: '/ubicaciones',
    UBICACION_BY_PRECINTO: (precintoId: string) => `/ubicaciones/precinto/${precintoId}`,
    
    // Estadísticas
    ESTADISTICAS: '/estadisticas',
    ESTADISTICAS_DASHBOARD: '/estadisticas/dashboard',
    ESTADISTICAS_TRANSITOS: '/estadisticas/transitos',
    ESTADISTICAS_ALERTAS: '/estadisticas/alertas',
    
    // Sistema
    SYSTEM_STATUS: '/system/status',
    SYSTEM_HEALTH: '/system/health',
    
    // Exportación
    EXPORT_TRANSITOS: '/export/transitos',
    EXPORT_PRECINTOS: '/export/precintos',
    EXPORT_ALERTAS: '/export/alertas',
  },
  
  // WebSocket events
  WS_EVENTS: {
    // Precinto events
    PRECINTO_UPDATE: 'precinto:update',
    PRECINTO_LOCATION: 'precinto:location',
    PRECINTO_ALARM: 'precinto:alarm',
    
    // Viaje events
    VIAJE_UPDATE: 'viaje:update',
    VIAJE_NEW: 'viaje:new',
    VIAJE_COMPLETED: 'viaje:completed',
    
    // System events
    SYSTEM_UPDATE: 'system:update',
    SYSTEM_ALERT: 'system:alert',
  },
  
  // Estado mappings (Trokor to CMO)
  ESTADO_MAPPING: {
    PRECINTO: {
      0: 'DISPONIBLE',
      1: 'EN_TRANSITO',
      2: 'CON_NOVEDAD',
      3: 'CON_ALERTA',
      4: 'FINALIZADO',
      5: 'INACTIVO'
    },
    VIAJE: {
      0: 'PENDIENTE',
      1: 'EN_CURSO',
      2: 'COMPLETADO',
      3: 'CANCELADO'
    },
    ALARMA: {
      0: 'NUEVA',
      1: 'EN_PROCESO',
      2: 'RESUELTA',
      3: 'DESCARTADA'
    }
  },
  
  // Tipo de alarma mappings
  TIPO_ALARMA_MAPPING: {
    'AAR': 'atraso_reportes',
    'BBJ': 'bateria_baja',
    'DEM': 'demorado',
    'DNR': 'desvio_ruta',
    'DTN': 'detenido',
    'NPG': 'sin_gps',
    'NPN': 'sin_reporte',
    'PTN': 'precinto_abierto',
    'SNA': 'salida_no_autorizada'
  }
};

// Helper para obtener headers con autenticación
export const getTrokorHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (TROKOR_CONFIG.API_KEY) {
    headers['X-API-Key'] = TROKOR_CONFIG.API_KEY;
  }
  
  if (TROKOR_CONFIG.API_SECRET) {
    headers['X-API-Secret'] = TROKOR_CONFIG.API_SECRET;
  }
  
  const token = localStorage.getItem('trokor_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper para construir URLs completas
export const buildTrokorUrl = (endpoint: string, base: string = TROKOR_CONFIG.API_BASE): string => {
  return `${base}${endpoint}`;
};