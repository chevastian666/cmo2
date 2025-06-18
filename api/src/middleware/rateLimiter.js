/**
 * Rate Limiter Middleware
 * By Cheva
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: new Date(Date.now() + parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')).toISOString()
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: res.getHeader('Retry-After'),
      timestamp: new Date().toISOString()
    });
  }
});

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
});

// API key rate limiter (more generous)
export const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  handler: (req, res) => {
    logger.warn(`API key rate limit exceeded: ${req.headers['x-api-key'] || req.ip}`);
    res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'API rate limit exceeded, please slow down your requests.',
      limit: 60,
      window: '1 minute',
      retryAfter: res.getHeader('Retry-After'),
      timestamp: new Date().toISOString()
    });
  }
});

// Webhook rate limiter
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 webhook calls per minute per endpoint
  keyGenerator: (req) => `${req.params.id}:${req.ip}`,
  message: {
    error: 'Webhook Rate Limit',
    message: 'Too many webhook triggers, please try again later.'
  }
});