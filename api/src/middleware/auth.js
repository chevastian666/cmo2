/**
 * Authentication Middleware
 * By Cheva
 */

import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw ApiError.unauthorized('No authorization header provided');
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    logger.debug(`Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token expired'));
    } else {
      next(error);
    }
  }
};

// Verify API key
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      throw ApiError.unauthorized('API key required');
    }

    // In production, validate against database
    if (apiKey !== process.env.API_KEY) {
      logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
      throw ApiError.unauthorized('Invalid API key');
    }

    // Add API client info to request
    req.apiClient = {
      type: 'external',
      key: apiKey.substring(0, 8) + '...'
    };

    logger.debug(`API key authenticated: ${req.apiClient.key}`);
    next();
  } catch (error) {
    next(error);
  }
};

// Check user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} to ${req.originalUrl}`);
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// Check specific permissions
export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`Permission denied for ${req.user.email}: ${permissions.join(', ')}`);
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    // Continue without authentication
    logger.debug('Optional auth failed, continuing as anonymous');
    next();
  }
};