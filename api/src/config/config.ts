/**
 * Configuration Management
 * Centralized configuration for the API
 * By Cheva
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // Database configuration
  database: {
    main: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'cmo_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      dialect: 'postgres' as const,
      logging: process.env.NODE_ENV === 'development',
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
      }
    },
    auxiliary: {
      host: process.env.AUX_DB_HOST || 'localhost',
      port: parseInt(process.env.AUX_DB_PORT || '5432', 10),
      name: process.env.AUX_DB_NAME || 'satoshi_db',
      user: process.env.AUX_DB_USER || 'postgres',
      password: process.env.AUX_DB_PASSWORD || '',
      dialect: 'postgres' as const,
      logging: false
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined
  },
  
  // API configuration
  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
    rateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW || '15', 10),
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10)
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174'
  },
  
  // Webhook configuration
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'webhook-secret'
  },
  
  // Socket.IO configuration
  socket: {
    path: process.env.SOCKET_PATH || '/socket.io'
  },
  
  // External services
  services: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    smsApiKey: process.env.SMS_API_KEY || '',
    emailApiKey: process.env.EMAIL_SERVICE_API_KEY || ''
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/api.log'
  }
};