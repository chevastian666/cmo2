/**
 * JWT Type Definitions
 * By Cheva
 */

import 'jsonwebtoken'
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string
    email: string
    nombre: string
    rol: string
    permisos?: string[]
    iat?: number
    exp?: number
    iss?: string
    sub?: string
  }
}

export interface DecodedToken {
  id: string
  email: string
  nombre: string
  rol: string
  permisos?: string[]
  iat: number
  exp: number
  iss?: string
  sub?: string
  user?: {
    id: string
    email: string
    nombre: string
    rol: string
    permisos?: string[]
  }
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    nombre: string
    rol: string
    permisos?: string[]
  }
  tokens: TokenPair
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
  user?: {
    id: string
    email: string
    nombre: string
    rol: string
    permisos?: string[]
  }
}