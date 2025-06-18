/**
 * Rate Limiter Middleware
 * API rate limiting configuration
 * By Cheva
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

export const rateLimiter = rateLimit({
  windowMs: config.api.rateLimitWindow * 60 * 1000, // Convert minutes to milliseconds
  max: config.api.rateLimitMax,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the request limit. Please try again later.',
    retryAfter: config.api.rateLimitWindow
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `You have exceeded the ${config.api.rateLimitMax} requests in ${config.api.rateLimitWindow} minutes limit.`,
      retryAfter: `${config.api.rateLimitWindow} minutes`,
      timestamp: new Date().toISOString()
    });
  }
});

// Specific rate limiters for different endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts. Please try again later.',
  skipSuccessfulRequests: true
});

export const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 webhooks per minute
  message: 'Too many webhook requests. Please slow down.'
});