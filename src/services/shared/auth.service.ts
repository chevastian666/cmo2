import { sharedApiService } from './sharedApi.service';
import { sharedStateService } from './sharedState.service';
import { SHARED_CONFIG, hasRole } from '../../config/shared.config';
import type { Usuario } from '../../types';

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthListener = (state: AuthState) => void;

class AuthService {
  private listeners = new Set<AuthListener>();
  private authCheckInterval: NodeJS.Timeout | null = null;
  private tokenRefreshInterval: NodeJS.Timeout | null = null;

  // Initialize auth service
  async initialize(): Promise<void> {
    await this.checkAuth();
    this.startTokenRefresh();
    this.startAuthCheck();
  }

  // Check current authentication status
  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      this.notifyListeners({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return false;
    }

    try {
      const user = await sharedApiService.getCurrentUser();
      if (user) {
        this.notifyListeners({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.clearAuth();
    }

    return false;
  }

  // Login
  async login(email: string, password: string): Promise<Usuario> {
    this.notifyListeners({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null
    });

    try {
      const response = await sharedApiService.login(email, password);
      
      this.notifyListeners({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Initialize shared state after login
      await sharedStateService.initialize();

      return response.user;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      this.notifyListeners({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await sharedStateService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      this.stopIntervals();
    }
  }

  // Get current user
  getCurrentUser(): Usuario | null {
    const stored = localStorage.getItem(SHARED_CONFIG.AUTH_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
  }

  // Check if user has required role(s)
  hasRole(requiredRoles: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return hasRole(user.rol, roles);
  }

  // Check if user has access to CMO panel
  canAccessCMO(): boolean {
    return this.hasRole([
      SHARED_CONFIG.ROLES.ADMIN,
      SHARED_CONFIG.ROLES.SUPERVISOR,
      SHARED_CONFIG.ROLES.CMO_OPERATOR
    ]);
  }

  // Check if user has access to Encargados panel
  canAccessEncargados(): boolean {
    return this.hasRole([
      SHARED_CONFIG.ROLES.ADMIN,
      SHARED_CONFIG.ROLES.SUPERVISOR,
      SHARED_CONFIG.ROLES.ENCARGADO,
      SHARED_CONFIG.ROLES.OPERADOR
    ]);
  }

  // Subscribe to auth state changes
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current state
    const user = this.getCurrentUser();
    listener({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null
    });
    
    return () => this.listeners.delete(listener);
  }

  // Private methods
  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
    localStorage.removeItem(SHARED_CONFIG.AUTH_USER_KEY);
    
    this.notifyListeners({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  private startTokenRefresh(): void {
    // Refresh token every 30 minutes
    this.tokenRefreshInterval = setInterval(async () => {
      try {
        await sharedApiService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, check auth status
        const isValid = await this.checkAuth();
        if (!isValid) {
          this.logout();
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  private startAuthCheck(): void {
    // Check auth status every 5 minutes
    this.authCheckInterval = setInterval(async () => {
      const isValid = await this.checkAuth();
      if (!isValid) {
        this.clearAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private stopIntervals(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
    
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
      this.authCheckInterval = null;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    return user?.nombre || 'Usuario';
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.rol || '';
  }

  getUserEmail(): string {
    const user = this.getCurrentUser();
    return user?.email || '';
  }

  // Session management
  async extendSession(): Promise<void> {
    if (this.isAuthenticated()) {
      await sharedApiService.refreshToken();
    }
  }

  getSessionExpiry(): Date | null {
    // This would typically decode the JWT token to get expiry
    // For now, return null
    return null;
  }

  isSessionExpired(): boolean {
    const expiry = this.getSessionExpiry();
    return expiry ? new Date() > expiry : false;
  }
}

// Export singleton instance
export const authService = new AuthService();