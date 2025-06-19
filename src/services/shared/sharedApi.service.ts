import { SHARED_CONFIG, formatApiEndpoint } from '../../config/shared.config';
import { jwtService } from '../jwt.service';
import type { 
  Precinto, 
  TransitoPendiente, 
  Alerta, 
  EstadisticasMonitoreo,
  Usuario 
} from '../../types';
import type { LoginResponse, RefreshTokenResponse } from '../../types/jwt';

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
  private cache = new Map<string, CacheItem<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  // Cache management
  private getCacheKey(endpoint: string, params?: unknown): string {
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
    data?: unknown,
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
        ...jwtService.getAuthHeader(),
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
          // Handle 401 Unauthorized for token refresh
          if (response.status === 401 && endpoint !== '/auth/refresh') {
            // Try to refresh token
            const refreshToken = jwtService.getRefreshToken();
            if (refreshToken) {
              try {
                await this.refreshToken();
                // Retry the original request with new token
                const retryOptions = {
                  ...requestOptions,
                  headers: {
                    ...requestOptions.headers,
                    ...jwtService.getAuthHeader()
                  }
                };
                const retryResponse = await fetch(url, retryOptions);
                if (retryResponse.ok) {
                  const retryData: ApiResponse<T> = await retryResponse.json();
                  return retryData.data || retryData as T;
                }
              } catch (_refreshError) {
                // Refresh failed, continue with original error
                console.error('Token refresh failed:', refreshError);
              }
            }
          }
          
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
      } catch (_error) {
        // If we have retries left and it's a network error, retry
        if (retriesLeft > 0 && (_error instanceof TypeError || (_error as any).code === 'ECONNREFUSED')) {
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
        
        throw _error;
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
  async login(email: string, password: string): Promise<LoginResponse> {
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
        // Generate mock JWT tokens
        const mockResponse: LoginResponse = {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol
          },
          tokens: {
            accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
              id: user.id,
              email: user.email,
              nombre: user.nombre,
              rol: user.rol,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
            }))}.mock-signature`,
            refreshToken: `refresh-${Date.now()}`
          }
        };
        
        return mockResponse;
      } else {
        throw new Error('Credenciales inválidas');
      }
    }
    
    return this.request<LoginResponse>('POST', '/auth/login', { email, password }, {}, false);
  }

  async logout(): Promise<void> {
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      // Mock logout
      jwtService.clearTokens();
      localStorage.removeItem(SHARED_CONFIG.AUTH_USER_KEY);
      this.clearCache();
      return;
    }
    
    try {
      await this.request('POST', '/auth/logout', null, {}, false);
    } finally {
      jwtService.clearTokens();
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
      const user = await this.request<Usuario>('GET', '/auth/me');
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

  async precintarTransito(transitoId: string, precintoData: unknown): Promise<Precinto> {
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
  async getAlertas(filtros?: unknown): Promise<Alerta[]> {
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

  async getEstadisticasTransitos(periodo?: string): Promise<unknown> {
    const params = periodo ? `?periodo=${periodo}` : '';
    return this.request('GET', `/estadisticas/transitos${params}`);
  }

  async getEstadisticasAlertas(periodo?: string): Promise<unknown> {
    const params = periodo ? `?periodo=${periodo}` : '';
    return this.request('GET', `/estadisticas/alertas${params}`);
  }

  // Vehicle endpoints (for encargados)
  async getVehiculosEnRuta(): Promise<unknown[]> {
    return this.request('GET', '/vehiculos/en-ruta');
  }

  async buscarVehiculo(criterio: string): Promise<unknown[]> {
    return this.request('GET', `/vehiculos/buscar?q=${encodeURIComponent(criterio)}`);
  }

  // Stock endpoints (for encargados)
  async getStock(): Promise<unknown> {
    return this.request('GET', '/stock');
  }

  async updateStock(location: string, cantidad: number): Promise<void> {
    await this.request('PUT', '/stock', { location, cantidad });
    this.clearCache('stock');
  }

  // CMO messaging endpoints
  async getCMOMessages(unreadOnly = false): Promise<unknown[]> {
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
  async getSystemStatus(): Promise<unknown> {
    return this.request('GET', '/system/status');
  }

  async getSystemHealth(): Promise<unknown> {
    return this.request('GET', '/system/health', null, {}, false);
  }

  // Export endpoints
  async exportData(
    type: 'transitos' | 'precintos' | 'alertas',
    format: 'csv' | 'xlsx' | 'pdf',
    filtros?: unknown
  ): Promise<Blob> {
    const params = new URLSearchParams({ format, ...filtros }).toString();
    const response = await fetch(
      formatApiEndpoint(`/export/${type}?${params}`),
      {
        headers: {
          ...jwtService.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Real-time subscription management
  subscribeToUpdates(eventType: string, callback: (data: unknown) => void): () => void {
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
      const {generateMockTransitos} = await import('../../utils/mockData');
      return generateMockTransitos() as T;
    }
    
    if (endpoint.includes('/precintos/activos')) {
      const {generateMockPrecintos} = await import('../../utils/mockData');
      return generateMockPrecintos() as T;
    }
    
    if (endpoint.includes('/alertas/activas')) {
      const {generateMockAlertas} = await import('../../utils/mockData');
      return generateMockAlertas().filter(a => !a.atendida) as T;
    }
    
    if (endpoint.includes('/alertas')) {
      const {generateMockAlertas} = await import('../../utils/mockData');
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

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = jwtService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      // Mock token refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = jwtService.getUserFromToken();
      if (!userData) {
        throw new Error('Invalid token');
      }
      
      return {
        accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
          ...userData,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        }))}.mock-signature-refreshed`
      };
    }
    
    return this.request<RefreshTokenResponse>('POST', '/auth/refresh', { refreshToken }, {}, false);
  }
}

// Export singleton instance
export const sharedApiService = new SharedApiService();