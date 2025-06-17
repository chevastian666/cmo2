// Shared configuration for both CMO and Encargados panels
export const SHARED_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000',
  
  // Authentication
  AUTH_TOKEN_KEY: 'blocktracker_auth_token',
  AUTH_USER_KEY: 'blocktracker_current_user',
  
  // Cache Configuration
  CACHE_DURATION: 300000, // 5 minutes
  CACHE_PREFIX: 'bt_cache_',
  
  // System Roles
  ROLES: {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    OPERADOR: 'operador',
    ENCARGADO: 'encargado',
    CMO_OPERATOR: 'cmo_operator'
  },
  
  // Transit States
  TRANSIT_STATES: {
    PENDING: 'pendiente',
    IN_PROCESS: 'en_proceso',
    COMPLETED: 'completado',
    CANCELLED: 'cancelado'
  },
  
  // Precinto States
  PRECINTO_STATES: {
    SAL: 'SAL', // Salida
    LLE: 'LLE', // Llegada
    FMF: 'FMF', // Finalización Manual Forzada
    CFM: 'CFM', // Confirmado
    CNP: 'CNP'  // Cancelado No Precintado
  },
  
  // Alert Types
  ALERT_TYPES: {
    VIOLACION: 'violacion',
    BATERIA_BAJA: 'bateria_baja',
    FUERA_DE_RUTA: 'fuera_de_ruta',
    TEMPERATURA: 'temperatura',
    SIN_SIGNAL: 'sin_signal',
    INTRUSION: 'intrusion'
  },
  
  // Alert Severities
  ALERT_SEVERITIES: {
    CRITICA: 'critica',
    ALTA: 'alta',
    MEDIA: 'media',
    BAJA: 'baja'
  },
  
  // WebSocket Events
  WS_EVENTS: {
    // Connection
    CONNECTION: 'connection',
    AUTH: 'auth',
    
    // Transit Events
    TRANSIT_UPDATE: 'transit_update',
    TRANSIT_NEW: 'transit_new',
    TRANSIT_COMPLETED: 'transit_completed',
    
    // Precinto Events
    PRECINTO_UPDATE: 'precinto_update',
    PRECINTO_NEW: 'precinto_new',
    PRECINTO_ACTIVATED: 'precinto_activated',
    
    // Alert Events
    ALERT_NEW: 'alert_new',
    ALERT_UPDATE: 'alert_update',
    ALERT_RESOLVED: 'alert_resolved',
    
    // Vehicle Events
    TRUCK_POSITION: 'truck_position',
    TRUCK_STATUS: 'truck_status',
    
    // System Events
    SYSTEM_UPDATE: 'system_update',
    SYSTEM_ALERT: 'system_alert',
    
    // CMO Events
    CMO_MESSAGE: 'cmo_message',
    CMO_MESSAGE_READ: 'cmo_message_read',
    CMO_MESSAGE_RESPONSE: 'cmo_message_response'
  },
  
  // Time Thresholds (seconds)
  THRESHOLDS: {
    TRANSIT_WARNING: 1800,    // 30 minutes
    TRANSIT_CRITICAL: 3600,   // 1 hour
    BATTERY_LOW: 20,          // 20%
    BATTERY_CRITICAL: 10,     // 10%
    SIGNAL_TIMEOUT: 600,      // 10 minutes
    TEMPERATURE_MIN: -20,     // -20°C
    TEMPERATURE_MAX: 50       // 50°C
  },
  
  // Refresh Intervals (milliseconds)
  REFRESH_INTERVALS: {
    DASHBOARD: 30000,      // 30 seconds
    TRANSITS: 60000,       // 1 minute
    ALERTS: 10000,         // 10 seconds
    SYSTEM_STATUS: 5000,   // 5 seconds
    VEHICLE_TRACKING: 15000 // 15 seconds
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  
  // Feature Flags
  FEATURES: {
    REAL_TIME_SYNC: true,
    EXPORT_DATA: true,
    ADVANCED_FILTERS: true,
    VEHICLE_TRACKING: true,
    CMO_MESSAGING: true,
    STATISTICS: true
  }
};

// Helper to get authenticated headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper to check if user has role
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Helper to format API endpoint
export const formatApiEndpoint = (endpoint: string): string => {
  if (!endpoint) {
    console.error('formatApiEndpoint called with undefined endpoint');
    return SHARED_CONFIG.API_BASE_URL;
  }
  const baseUrl = SHARED_CONFIG.API_BASE_URL;
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};