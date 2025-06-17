import { SHARED_CONFIG, getAuthHeaders, formatApiEndpoint } from '../../config/shared.config';
import type { 
  Precinto, 
  TransitoPendiente, 
  Alerta, 
  EstadisticasMonitoreo,
  Usuario 
} from '../../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class SharedApiService {
  private cache = new Map<string, CacheItem<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  // Cache management
  private getCacheKey(endpoint: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${SHARED_CONFIG.CACHE_PREFIX}${endpoint}_${paramStr}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > SHARED_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // Generic request handler with retry logic
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {},
    useCache = true,
    retries = 3
  ): Promise<T> {
    const url = formatApiEndpoint(endpoint);
    const cacheKey = this.getCacheKey(endpoint, data);
    
    const requestOptions: RequestInit = {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined
    };

    // Check cache first for GET requests
    if (method === 'GET' && useCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) return cached;

      // Check if request is already pending
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) return pending;
    }

    // In development/mock mode, return mock data
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      const mockData = await this.getMockData<T>(endpoint, requestOptions);
      if (mockData !== null) {
        // Cache mock data
        if (method === 'GET' && useCache) {
          this.setCache(cacheKey, mockData);
        }
        return mockData;
      }
    }
    
    // Retry logic wrapper
    const executeWithRetry = async (retriesLeft: number): Promise<T> => {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const data: ApiResponse<T> = await response.json();
        
        if (!data.success && data.error) {
          throw new Error(data.error);
        }
        
        const result = data.data || data as T;
        
        // Cache successful GET requests
        if (method === 'GET' && useCache) {
          this.setCache(cacheKey, result);
        }
        
        return result;
      } catch (error) {
        // If we have retries left and it's a network error, retry
        if (retriesLeft > 0 && (error instanceof TypeError || (error as any).code === 'ECONNREFUSED')) {
          console.warn(`Request failed, retrying... (${retriesLeft} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retries - retriesLeft + 1))); // Exponential backoff
          return executeWithRetry(retriesLeft - 1);
        }
        
        // In development, try mock data on error
        if (SHARED_CONFIG.IS_DEVELOPMENT) {
          const mockData = await this.getMockData<T>(endpoint, requestOptions);
          if (mockData !== null) {
            if (method === 'GET' && useCache) {
              this.setCache(cacheKey, mockData);
            }
            return mockData;
          }
        }
        
        throw error;
      }
    };

    // Create request promise
    const requestPromise = executeWithRetry(retries).finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    // Store pending request for deduplication
    if (method === 'GET') {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ token: string; user: Usuario }> {
    // Mock authentication for development
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users
      const mockUsers: Record<string, Usuario> = {
        'sebastian.saucedo@blocktracker.uy': {
          id: 'usr-1',
          nombre: 'Sebastian Saucedo',
          email: 'sebastian.saucedo@blocktracker.uy',
          rol: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Sebastian+Saucedo&background=3b82f6&color=fff',
          activo: true
        },
        'maria.fernandez@blocktracker.uy': {
          id: 'usr-2',
          nombre: 'María Fernández',
          email: 'maria.fernandez@blocktracker.uy',
          rol: 'supervisor',
          avatar: 'https://ui-avatars.com/api/?name=Maria+Fernandez&background=8b5cf6&color=fff',
          activo: true
        },
        'juan.perez@blocktracker.uy': {
          id: 'usr-3',
          nombre: 'Juan Pérez',
          email: 'juan.perez@blocktracker.uy',
          rol: 'operador',
          avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=10b981&color=fff',
          activo: true
        }
      };
      
      const user = mockUsers[email];
      
      if (user && password === 'password123') {
        const token = `mock-token-${Date.now()}`;
        
        // Store auth data
        localStorage.setItem(SHARED_CONFIG.AUTH_TOKEN_KEY, token);
        localStorage.setItem(SHARED_CONFIG.AUTH_USER_KEY, JSON.stringify(user));
        
        return { token, user };
      } else {
        throw new Error('Credenciales inválidas');
      }
    }
    
    try {
      const response = await this.request<{ token: string; user: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }, false);

      // Store auth data
      localStorage.setItem(SHARED_CONFIG.AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(SHARED_CONFIG.AUTH_USER_KEY, JSON.stringify(response.user));

      return response;
    } catch (error) {
      // If API fails in development, try mock login
      if (SHARED_CONFIG.IS_DEVELOPMENT) {
        return this.login(email, password);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      // Mock logout
      localStorage.removeItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
      localStorage.removeItem(SHARED_CONFIG.AUTH_USER_KEY);
      this.clearCache();
      return;
    }
    
    try {
      await this.request('/auth/logout', { method: 'POST' }, false);
    } finally {
      localStorage.removeItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
      localStorage.removeItem(SHARED_CONFIG.AUTH_USER_KEY);
      this.clearCache();
    }
  }

  async getCurrentUser(): Promise<Usuario | null> {
    const stored = localStorage.getItem(SHARED_CONFIG.AUTH_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    // In development, return null if no stored user
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      return null;
    }

    try {
      const user = await this.request<Usuario>('/auth/me');
      localStorage.setItem(SHARED_CONFIG.AUTH_USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  // Transit endpoints (shared between panels)
  async getTransitosPendientes(): Promise<TransitoPendiente[]> {
    return this.request<TransitoPendiente[]>('GET', '/transitos/pendientes');
  }

  async getTransito(id: string): Promise<TransitoPendiente> {
    return this.request<TransitoPendiente>('GET', `/transitos/${id}`);
  }

  async updateTransito(id: string, data: Partial<TransitoPendiente>): Promise<TransitoPendiente> {
    const result = await this.request<TransitoPendiente>('PUT', `/transitos/${id}`, data);
    this.clearCache('transitos');
    return result;
  }

  async precintarTransito(transitoId: string, precintoData: any): Promise<Precinto> {
    const result = await this.request<Precinto>('POST', `/transitos/${transitoId}/precintar`, precintoData);
    this.clearCache('transitos');
    this.clearCache('precintos');
    return result;
  }

  async addObservacion(transitoId: string, observacion: string): Promise<void> {
    await this.request('POST', `/transitos/${transitoId}/observaciones`, { observacion });
    this.clearCache(`transitos/${transitoId}`);
  }

  // Precinto endpoints
  async getPrecintosActivos(): Promise<Precinto[]> {
    return this.request<Precinto[]>('GET', '/precintos/activos');
  }

  async getPrecinto(id: string): Promise<Precinto> {
    return this.request<Precinto>('GET', `/precintos/${id}`);
  }

  async updatePrecinto(id: string, data: Partial<Precinto>): Promise<Precinto> {
    const result = await this.request<Precinto>('PUT', `/precintos/${id}`, data);
    this.clearCache('precintos');
    return result;
  }

  async finalizarPrecinto(id: string, motivo: string): Promise<void> {
    await this.request('POST', `/precintos/${id}/finalizar`, { motivo });
    this.clearCache('precintos');
  }

  // Alert endpoints
  async getAlertas(filtros?: any): Promise<Alerta[]> {
    const params = new URLSearchParams(filtros).toString();
    const endpoint = params ? `/alertas?${params}` : '/alertas';
    return this.request<Alerta[]>('GET', endpoint);
  }

  async getAlertasActivas(): Promise<Alerta[]> {
    return this.request<Alerta[]>('GET', '/alertas/activas');
  }

  async atenderAlerta(id: string): Promise<void> {
    await this.request('POST', `/alertas/${id}/atender`);
    this.clearCache('alertas');
  }

  async asignarAlerta(alertaId: string, usuarioId: string, notas?: string): Promise<void> {
    await this.request('POST', `/alertas/${alertaId}/asignar`, { usuarioId, notas });
    this.clearCache('alertas');
  }

  async comentarAlerta(alertaId: string, mensaje: string): Promise<void> {
    await this.request('POST', `/alertas/${alertaId}/comentarios`, { mensaje });
  }

  async resolverAlerta(
    alertaId: string, 
    tipo: string, 
    descripcion: string, 
    acciones?: string[]
  ): Promise<void> {
    await this.request('POST', `/alertas/${alertaId}/resolver`, { tipo, descripcion, acciones });
    this.clearCache('alertas');
  }

  // Statistics endpoints
  async getEstadisticas(): Promise<EstadisticasMonitoreo> {
    return this.request<EstadisticasMonitoreo>('GET', '/estadisticas');
  }

  async getEstadisticasTransitos(periodo?: string): Promise<any> {
    const params = periodo ? `?periodo=${periodo}` : '';
    return this.request('GET', `/estadisticas/transitos${params}`);
  }

  async getEstadisticasAlertas(periodo?: string): Promise<any> {
    const params = periodo ? `?periodo=${periodo}` : '';
    return this.request('GET', `/estadisticas/alertas${params}`);
  }

  // Vehicle endpoints (for encargados)
  async getVehiculosEnRuta(): Promise<any[]> {
    return this.request('GET', '/vehiculos/en-ruta');
  }

  async buscarVehiculo(criterio: string): Promise<any[]> {
    return this.request('GET', `/vehiculos/buscar?q=${encodeURIComponent(criterio)}`);
  }

  // Stock endpoints (for encargados)
  async getStock(): Promise<any> {
    return this.request('GET', '/stock');
  }

  async updateStock(location: string, cantidad: number): Promise<void> {
    await this.request('PUT', '/stock', { location, cantidad });
    this.clearCache('stock');
  }

  // CMO messaging endpoints
  async getCMOMessages(unreadOnly = false): Promise<any[]> {
    const params = unreadOnly ? '?unread=true' : '';
    return this.request('GET', `/cmo/messages${params}`);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.request('POST', `/cmo/messages/${messageId}/read`);
  }

  async respondToMessage(messageId: string, response: string): Promise<void> {
    await this.request('POST', `/cmo/messages/${messageId}/respond`, { response });
  }

  // System status endpoints
  async getSystemStatus(): Promise<any> {
    return this.request('GET', '/system/status');
  }

  async getSystemHealth(): Promise<any> {
    return this.request('GET', '/system/health', null, {}, false);
  }

  // Export endpoints
  async exportData(
    type: 'transitos' | 'precintos' | 'alertas',
    format: 'csv' | 'xlsx' | 'pdf',
    filtros?: any
  ): Promise<Blob> {
    const params = new URLSearchParams({ format, ...filtros }).toString();
    const response = await fetch(
      formatApiEndpoint(`/export/${type}?${params}`),
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Real-time subscription management
  subscribeToUpdates(eventType: string, callback: (data: any) => void): () => void {
    // This will be handled by the WebSocket service
    // Return unsubscribe function
    return () => {};
  }

  // Mock data generator
  private async getMockData<T>(endpoint: string, options: RequestInit): Promise<T | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    // Generate mock data based on endpoint
    if (endpoint.includes('/transitos/pendientes')) {
      const { generateMockTransitos } = await import('../../utils/mockData');
      return generateMockTransitos() as T;
    }
    
    if (endpoint.includes('/precintos/activos')) {
      const { generateMockPrecintos } = await import('../../utils/mockData');
      return generateMockPrecintos() as T;
    }
    
    if (endpoint.includes('/alertas/activas')) {
      const { generateMockAlertas } = await import('../../utils/mockData');
      return generateMockAlertas().filter(a => !a.atendida) as T;
    }
    
    if (endpoint.includes('/alertas')) {
      const { generateMockAlertas } = await import('../../utils/mockData');
      return generateMockAlertas() as T;
    }
    
    if (endpoint.includes('/estadisticas')) {
      const mockStats: EstadisticasMonitoreo = {
        precintosActivos: 127,
        alertasActivas: 3,
        transitosEnCurso: 45,
        tiempoPromedioTransito: 4.5,
        lecturasPorHora: 850,
        alertasPorHora: 12,
        precintosConBateriaBaja: 8
      };
      return mockStats as T;
    }
    
    if (endpoint.includes('/system/status') || endpoint.includes('/system/health')) {
      return {
        smsPendientes: Math.floor(Math.random() * 200),
        dbStats: {
          memoriaUsada: 60 + Math.random() * 30,
          discoUsado: 40 + Math.random() * 20
        },
        apiStats: {
          memoriaUsada: 50 + Math.random() * 40,
          discoUsado: 20 + Math.random() * 30
        },
        reportesPendientes: Math.floor(Math.random() * 30),
        estadisticas: {
          precintosActivos: 127,
          alertasActivas: 3,
          transitosEnCurso: 45,
          tiempoPromedioTransito: 4.5,
          lecturasPorHora: 850,
          alertasPorHora: 12,
          precintosConBateriaBaja: 8
        }
      } as T;
    }

    // For POST/PUT/DELETE, just return success
    if (options.method !== 'GET') {
      return {} as T;
    }

    return null;
  }

  // Utility methods
  clearAllCache(): void {
    this.clearCache();
  }

  refreshToken(): Promise<void> {
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      return Promise.resolve();
    }
    return this.request('/auth/refresh', { method: 'POST' }, false);
  }
}

// Export singleton instance
export const sharedApiService = new SharedApiService();