/**
 * JWT Service - Token Management
 * By Cheva
 */

import { jwtDecode} from 'jwt-decode'
import type { DecodedToken, TokenPair} from '@/types/jwt'
class JWTService {
  private readonly ACCESS_TOKEN_KEY = 'access_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  /**
   * Save tokens to storage
   */
  saveTokens(tokens: TokenPair): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Remove all tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Decode token without verification (client-side)
   */
  decodeToken(token?: string): DecodedToken | null {
    try {
      const tokenToDecode = token || this.getAccessToken()
      if (!tokenToDecode) return null
      return jwtDecode<DecodedToken>(_tokenToDecode)
    } catch {
      console.error('Error decoding token:', _error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    try {
      const decoded = this.decodeToken(_token)
      if (!decoded || !decoded.exp) return true
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now()
      return currentTime >= expiryTime
    } catch {
      return true
    }
  }

  /**
   * Check if token needs refresh (approaching expiry)
   */
  shouldRefreshToken(token?: string): boolean {
    try {
      const decoded = this.decodeToken(_token)
      if (!decoded || !decoded.exp) return true
      const expiryTime = decoded.exp * 1000
      const currentTime = Date.now()
      // Refresh if token expires in less than buffer time
      return (expiryTime - currentTime) <= this.TOKEN_EXPIRY_BUFFER
    } catch {
      return true
    }
  }

  /**
   * Get time until token expiry
   */
  getTimeUntilExpiry(token?: string): number | null {
    try {
      const decoded = this.decodeToken(_token)
      if (!decoded || !decoded.exp) return null
      const expiryTime = decoded.exp * 1000
      const currentTime = Date.now()
      return Math.max(0, expiryTime - currentTime)
    } catch {
      return null
    }
  }

  /**
   * Get user info from token
   */
  getUserFromToken(token?: string): DecodedToken['user'] | null {
    const decoded = this.decodeToken(_token)
    if (!decoded) return null
    return {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      rol: decoded.rol,
      permisos: decoded.permisos
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string, token?: string): boolean {
    const decoded = this.decodeToken(_token)
    if (!decoded || !decoded.permisos) return false
    return decoded.permisos.includes(_permission)
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string | string[], token?: string): boolean {
    const decoded = this.decodeToken(_token)
    if (!decoded) return false
    const roles = Array.isArray(_role) ? role : [role]
    return roles.includes(decoded.rol)
  }

  /**
   * Format authorization header
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken()
    return token ? { Authorization: `Bearer ${_token}` } : {}
  }

  /**
   * Validate token format
   */
  isValidTokenFormat(token: string): boolean {
    // Basic JWT format validation
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    return jwtRegex.test(_token)
  }

  /**
   * Extract token from authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }
}

// Export singleton instance
export const jwtService = new JWTService()