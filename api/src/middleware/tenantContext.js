/**
 * Tenant Context Middleware
 * Ensures complete isolation between tenants
 * By Cheva
 */

import { ApiError } from './errorHandler.js';
import { logger } from '../utils/logger.js';
import { Tenant, TenantUser } from '../tenant/tenantModels.js';
import jwt from 'jsonwebtoken';

/**
 * Extract tenant from request
 * Supports multiple strategies:
 * 1. Subdomain (e.g., acme.app.com)
 * 2. Custom domain (e.g., app.acme.com)
 * 3. Header (X-Tenant-ID or X-Tenant-Slug)
 * 4. JWT claim
 * 5. Query parameter (for testing)
 */
export const extractTenant = async (req, res, next) => {
  try {
    let tenantIdentifier = null;
    let identifierType = null;

    // 1. Check subdomain
    const host = req.get('host');
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'app') {
      tenantIdentifier = subdomain;
      identifierType = 'subdomain';
    }

    // 2. Check custom domain
    if (!tenantIdentifier) {
      const tenant = await Tenant.findOne({ where: { domain: host } });
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
        logger.debug(`Tenant resolved by custom domain: ${tenant.slug}`);
        return next();
      }
    }

    // 3. Check headers
    if (!tenantIdentifier) {
      tenantIdentifier = req.headers['x-tenant-id'] || req.headers['x-tenant-slug'];
      if (tenantIdentifier) {
        identifierType = req.headers['x-tenant-id'] ? 'id' : 'slug';
      }
    }

    // 4. Check JWT token
    if (!tenantIdentifier && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.decode(token);
        if (decoded && decoded.tenantId) {
          tenantIdentifier = decoded.tenantId;
          identifierType = 'jwt';
        }
      } catch (err) {
        // Continue to other methods
      }
    }

    // 5. Check query parameter (only in development)
    if (!tenantIdentifier && process.env.NODE_ENV === 'development') {
      tenantIdentifier = req.query.tenant;
      if (tenantIdentifier) {
        identifierType = 'query';
      }
    }

    // If no tenant identifier found
    if (!tenantIdentifier) {
      throw ApiError.badRequest('Tenant identification required');
    }

    // Find tenant
    const where = identifierType === 'id' 
      ? { id: tenantIdentifier }
      : { slug: tenantIdentifier.toLowerCase() };

    const tenant = await Tenant.findOne({ 
      where,
      include: [{ 
        model: require('../tenant/tenantModels.js').TenantPlan,
        attributes: ['name', 'limits', 'features']
      }]
    });

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    // Check tenant status
    if (tenant.status === 'suspended') {
      throw ApiError.forbidden('Tenant account is suspended');
    }

    if (tenant.status === 'inactive') {
      throw ApiError.forbidden('Tenant account is inactive');
    }

    // Check trial expiration
    if (tenant.status === 'trial' && tenant.trialEndsAt && new Date() > tenant.trialEndsAt) {
      // Auto-update status
      await tenant.update({ status: 'inactive' });
      throw ApiError.forbidden('Trial period has expired');
    }

    // Attach tenant to request
    req.tenant = tenant;
    req.tenantId = tenant.id;

    logger.debug(`Tenant context set: ${tenant.slug} (${identifierType})`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user belongs to tenant
 */
export const verifyTenantAccess = async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // For API key authentication, skip user-tenant verification
    if (req.apiClient) {
      return next();
    }

    // Verify user belongs to tenant
    const tenantUser = await TenantUser.findOne({
      where: {
        id: req.user.id,
        tenantId: req.tenant.id,
        status: 'active'
      }
    });

    if (!tenantUser) {
      logger.warn(`User ${req.user.id} attempted to access tenant ${req.tenant.id} without permission`);
      throw ApiError.forbidden('Access denied to this tenant');
    }

    // Update request with full tenant user info
    req.user = {
      ...req.user,
      tenantId: req.tenant.id,
      role: tenantUser.role,
      permissions: tenantUser.permissions
    };

    // Set tenant context for database queries
    req.dbContext = {
      tenantId: req.tenant.id,
      userId: req.user.id
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check tenant plan limits
 */
export const checkTenantLimits = (resource) => {
  return async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw ApiError.unauthorized('Tenant context required');
      }

      const limits = req.tenant.TenantPlan.limits;
      const usage = await require('../tenant/tenantService.js').getTenantUsage(req.tenant.id);

      let withinLimits = true;
      let limitMessage = '';

      switch (resource) {
        case 'users':
          withinLimits = usage.current.users < limits.users;
          limitMessage = `User limit reached (${limits.users} users)`;
          break;
        case 'precintos':
          withinLimits = usage.current.precintos < limits.precintos;
          limitMessage = `Precinto limit reached (${limits.precintos} precintos)`;
          break;
        case 'transitos':
          withinLimits = usage.current.transitos < limits.transitosPerMonth;
          limitMessage = `Monthly transit limit reached (${limits.transitosPerMonth} transits)`;
          break;
        case 'alerts':
          withinLimits = usage.current.alerts < limits.alertsPerMonth;
          limitMessage = `Monthly alert limit reached (${limits.alertsPerMonth} alerts)`;
          break;
        case 'apiCalls':
          withinLimits = usage.current.apiCalls < limits.apiCallsPerDay;
          limitMessage = `Daily API call limit reached (${limits.apiCallsPerDay} calls)`;
          break;
        case 'webhooks':
          withinLimits = usage.current.webhooks < limits.webhooks;
          limitMessage = `Webhook limit reached (${limits.webhooks} webhooks)`;
          break;
      }

      if (!withinLimits) {
        logger.warn(`Tenant ${req.tenant.slug} exceeded ${resource} limit`);
        throw ApiError.forbidden(limitMessage + '. Please upgrade your plan.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check tenant feature access
 */
export const requireTenantFeature = (feature) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return next(ApiError.unauthorized('Tenant context required'));
    }

    const features = req.tenant.TenantPlan.features || [];
    
    if (!features.includes(feature)) {
      logger.warn(`Tenant ${req.tenant.slug} attempted to access unavailable feature: ${feature}`);
      return next(ApiError.forbidden(`Feature '${feature}' is not available in your plan`));
    }

    next();
  };
};

/**
 * Log tenant activity
 */
export const logTenantActivity = (action, entity = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to log after success
    res.send = function(data) {
      res.locals.responseData = data;
      originalSend.call(this, data);
    };

    res.json = function(data) {
      res.locals.responseData = data;
      originalJson.call(this, data);
    };

    // Continue to next middleware
    next();

    // Log activity after response
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.tenant && req.user) {
        try {
          const { TenantActivityLog } = require('../tenant/tenantModels.js');
          
          await TenantActivityLog.create({
            tenantId: req.tenant.id,
            userId: req.user.id,
            action,
            entity,
            entityId: req.params.id || res.locals.responseData?.id,
            changes: req.method === 'PUT' || req.method === 'PATCH' ? req.body : null,
            metadata: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
          });
        } catch (error) {
          logger.error('Failed to log tenant activity:', error);
        }
      }
    });
  };
};

/**
 * Apply tenant isolation to Sequelize models
 */
export const applyTenantScope = (req, res, next) => {
  if (!req.tenant) {
    return next();
  }

  // Store original model methods
  const models = req.app.locals.models || {};
  
  // Create tenant-scoped versions
  req.models = {};
  
  Object.keys(models).forEach(modelName => {
    const model = models[modelName];
    
    // Skip models that don't have tenantId
    if (!model.rawAttributes.tenantId) {
      req.models[modelName] = model;
      return;
    }

    // Create scoped version
    req.models[modelName] = require('../tenant/tenantModels.js').getTenantScoped(model, req.tenant.id);
  });

  next();
};