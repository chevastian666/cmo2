/**
 * Enhanced Auth Service with JWT Implementation
 * By Cheva
 */

import { sharedApiService} from './sharedApi.service'
import { sharedStateService} from './sharedState.service'
import { SHARED_CONFIG} from '../../config/shared.config'
import { jwtService} from '../jwt.service'
import type { Usuario} from '../../types'
import type { LoginResponse} from '../../types/jwt'
interface AuthState {
  user: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthListener = (state: AuthState) => void
class AuthService {
  private listeners = new Set<AuthListener>()
  private authCheckInterval: NodeJS.Timeout | null = null
  private tokenRefreshInterval: NodeJS.Timeout | null = null
  private refreshPromise: Promise<void> | null = null
  // Initialize auth service
  async initialize(): Promise<void> {
    await this.checkAuth()
    this.startTokenRefresh()
    this.startAuthCheck()
  }

  // Check current authentication status
  async checkAuth(): Promise<boolean> {
    const token = jwtService.getAccessToken()
    if (!token || jwtService.isTokenExpired(token)) {
      this.notifyListeners({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      return false
    }

    try {
      // Get user from token
      const userFromToken = jwtService.getUserFromToken(token)
      if (userFromToken) {
        // Optionally verify with server
        const user = await sharedApiService.getCurrentUser()
        if (_user) {
          this.notifyListeners({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          return true
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Try to refresh token if it's expired
      if (jwtService.shouldRefreshToken()) {
        const refreshed = await this.refreshTokens()
        if (refreshed) {
          return this.checkAuth(); // Retry after refresh
        }
      }
      
      this.clearAuth()
    }

    return false
  }

  // Login with JWT
  async login(email: string, password: string): Promise<Usuario> {
    this.notifyListeners({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null
    })
    try {
      const response = await sharedApiService.login(_email, password) as LoginResponse
      console.log('Login response:', response); // Debug log
      
      // Save JWT tokens
      if (!response.tokens) {
        throw new Error('No tokens in response')
      }
      jwtService.saveTokens(response.tokens)
      // Save user data
      localStorage.setItem(SHARED_CONFIG.AUTH_USER_KEY, JSON.stringify(response.user))
      this.notifyListeners({
        user: response.user as Usuario,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      // Initialize shared state after login
      await sharedStateService.initialize()
      return response.user as Usuario
    } catch (error: unknown) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed'
      this.notifyListeners({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Notify server about logout
      await sharedStateService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuth()
      this.stopIntervals()
    }
  }

  // Refresh JWT tokens
  async refreshTokens(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      await this.refreshPromise
      return true
    }

    const refreshToken = jwtService.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    this.refreshPromise = (async () => {
      try {
        const response = await sharedApiService.refreshToken()
        if (response.accessToken) {
          // Update only access token
          const currentRefresh = jwtService.getRefreshToken()
          jwtService.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken || currentRefresh || ''
          })
          // Update user data if provided
          if (response.user) {
            localStorage.setItem(SHARED_CONFIG.AUTH_USER_KEY, JSON.stringify(response.user))
          }
          
          return true
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      } finally {
        this.refreshPromise = null
      }
      return false
    })()
    const result = await this.refreshPromise
    return result
  }

  // Get current user
  getCurrentUser(): Usuario | null {
    // First try to get from token
    const tokenUser = jwtService.getUserFromToken()
    if (tokenUser) {
      return tokenUser as Usuario
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(SHARED_CONFIG.AUTH_USER_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  // Get auth token
  getToken(): string | null {
    return jwtService.getAccessToken()
  }

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    return jwtService.getAuthHeader() as Record<string, string>
  }

  // Check if user has required role(_s)
  hasRole(requiredRoles: string | string[]): boolean {
    return jwtService.hasRole(requiredRoles)
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    return jwtService.hasPermission(permission)
  }

  // Check if user has access to CMO panel
  canAccessCMO(): boolean {
    return this.hasRole([
      SHARED_CONFIG.ROLES.ADMIN,
      SHARED_CONFIG.ROLES.SUPERVISOR,
      SHARED_CONFIG.ROLES.CMO_OPERATOR
    ])
  }

  // Check if user has access to Encargados panel
  canAccessEncargados(): boolean {
    return this.hasRole([
      SHARED_CONFIG.ROLES.ADMIN,
      SHARED_CONFIG.ROLES.SUPERVISOR,
      SHARED_CONFIG.ROLES.ENCARGADO,
      SHARED_CONFIG.ROLES.OPERADOR
    ])
  }

  // Subscribe to auth state changes
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(_listener)
    // Immediately notify with current state
    const user = this.getCurrentUser()
    listener({
      user,
      isAuthenticated: !!user && !jwtService.isTokenExpired(),
      isLoading: false,
      error: null
    })
    return () => this.listeners.delete(listener)
  }

  // Private methods
  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in auth listener:', error)
      }
    })
  }

  private clearAuth(): void {
    jwtService.clearTokens()
    localStorage.removeItem(SHARED_CONFIG.AUTH_USER_KEY)
    this.notifyListeners({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  private startTokenRefresh(): void {
    // Check token expiry every minute
    this.tokenRefreshInterval = setInterval(async () => {
      if (jwtService.shouldRefreshToken()) {
        const refreshed = await this.refreshTokens()
        if (!refreshed) {
          // If refresh fails, logout
          await this.logout()
        }
      }
    }, 60 * 1000); // 1 minute
  }

  private startAuthCheck(): void {
    // Check auth status every 5 minutes
    this.authCheckInterval = setInterval(async () => {
      const isValid = await this.checkAuth()
      if (!isValid) {
        this.clearAuth()
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private stopIntervals(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval)
      this.tokenRefreshInterval = null
    }
    
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval)
      this.authCheckInterval = null
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!jwtService.getAccessToken() && !jwtService.isTokenExpired()
  }

  getUserName(): string {
    const user = this.getCurrentUser()
    return user?.nombre || 'Usuario'
  }

  getUserRole(): string {
    const user = this.getCurrentUser()
    return user?.rol || ''
  }

  getUserEmail(): string {
    const user = this.getCurrentUser()
    return user?.email || ''
  }

  // Session management
  async extendSession(): Promise<void> {
    if (this.isAuthenticated() && jwtService.shouldRefreshToken()) {
      await this.refreshTokens()
    }
  }

  getSessionExpiry(): Date | null {
    const timeUntilExpiry = jwtService.getTimeUntilExpiry()
    if (timeUntilExpiry === null) return null
    return new Date(Date.now() + timeUntilExpiry)
  }

  isSessionExpired(): boolean {
    return jwtService.isTokenExpired()
  }

  getTimeUntilExpiry(): string {
    const ms = jwtService.getTimeUntilExpiry()
    if (ms === null) return 'Session expired'
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${_days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${_hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `${_minutes} minute${minutes > 1 ? 's' : ''}`
    return 'Less than a minute'
  }
}

// Export singleton instance
export const authService = new AuthService()