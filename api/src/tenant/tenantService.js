/**
 * Tenant Service
 * Business logic for multi-tenant operations
 * By Cheva
 */

import { 
  Tenant, 
  TenantPlan, 
  TenantUser, 
  TenantUsage, 
  TenantBilling,
  TenantInvite,
  TenantCustomField,
  TenantActivityLog 
} from './tenantModels.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandler.js';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { mainDb } from '../utils/database.js';

class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(data, ownerId = null) {
    const transaction = await mainDb.transaction();
    
    try {
      // Validate slug uniqueness
      const existingTenant = await Tenant.findOne({ 
        where: { slug: data.slug.toLowerCase() } 
      });
      
      if (existingTenant) {
        throw ApiError.conflict('Tenant slug already exists');
      }

      // Get default plan
      const plan = data.planId 
        ? await TenantPlan.findByPk(data.planId)
        : await TenantPlan.findOne({ where: { name: 'starter' } });

      if (!plan) {
        throw ApiError.badRequest('Invalid plan specified');
      }

      // Create tenant
      const tenant = await Tenant.create({
        ...data,
        slug: data.slug.toLowerCase(),
        planId: plan.id,
        status: 'trial'
      }, { transaction });

      // Create billing record
      await TenantBilling.create({
        tenantId: tenant.id,
        subscriptionStatus: 'trialing'
      }, { transaction });

      // Create initial usage record
      await TenantUsage.create({
        tenantId: tenant.id,
        date: new Date(),
        metrics: { users: ownerId ? 1 : 0 }
      }, { transaction });

      // Create owner user if provided
      if (ownerId) {
        await TenantUser.create({
          id: ownerId,
          tenantId: tenant.id,
          email: data.ownerEmail,
          role: 'owner',
          permissions: ['*'], // All permissions
          profile: {
            firstName: data.ownerFirstName || '',
            lastName: data.ownerLastName || ''
          }
        }, { transaction });
      }

      // Create default custom fields
      await this.createDefaultCustomFields(tenant.id, transaction);

      await transaction.commit();
      
      logger.info(`Tenant created: ${tenant.slug} (${tenant.id})`);
      return tenant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update tenant settings
   */
  async updateTenant(tenantId, updates) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    // Prevent certain fields from being updated
    delete updates.id;
    delete updates.slug;
    delete updates.planId;
    delete updates.status;

    await tenant.update(updates);
    
    logger.info(`Tenant updated: ${tenant.slug}`);
    return tenant;
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId) {
    const tenant = await Tenant.findByPk(tenantId, {
      include: [TenantPlan]
    });

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentUsage = await TenantUsage.findOne({
      where: {
        tenantId,
        date: {
          [Op.gte]: startOfMonth
        }
      },
      order: [['date', 'DESC']]
    });

    // Get historical usage (last 12 months)
    const historicalUsage = await TenantUsage.findAll({
      where: {
        tenantId,
        date: {
          [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      },
      order: [['date', 'DESC']],
      limit: 365
    });

    // Calculate current counts
    const [userCount, precintoCount, transitCount, alertCount] = await Promise.all([
      TenantUser.count({ where: { tenantId, status: 'active' } }),
      mainDb.models.Precinto?.count({ where: { tenantId } }) || 0,
      mainDb.models.Transito?.count({ 
        where: { 
          tenantId,
          createdAt: { [Op.gte]: startOfMonth }
        } 
      }) || 0,
      mainDb.models.Alerta?.count({ 
        where: { 
          tenantId,
          createdAt: { [Op.gte]: startOfMonth }
        } 
      }) || 0
    ]);

    const usage = {
      current: {
        users: userCount,
        precintos: precintoCount,
        transitos: transitCount,
        alerts: alertCount,
        apiCalls: currentUsage?.metrics?.apiCalls || 0,
        storage: currentUsage?.metrics?.storage || 0,
        webhooks: currentUsage?.metrics?.webhooks || 0
      },
      limits: tenant.TenantPlan.limits,
      history: historicalUsage.map(u => ({
        date: u.date,
        metrics: u.metrics,
        cost: u.cost
      })),
      overage: this.calculateOverage(
        {
          users: userCount,
          precintos: precintoCount,
          transitos: transitCount,
          alerts: alertCount
        },
        tenant.TenantPlan.limits
      )
    };

    return usage;
  }

  /**
   * Switch tenant plan
   */
  async changePlan(tenantId, newPlanId) {
    const transaction = await mainDb.transaction();
    
    try {
      const tenant = await Tenant.findByPk(tenantId, { transaction });
      const newPlan = await TenantPlan.findByPk(newPlanId, { transaction });

      if (!tenant || !newPlan) {
        throw ApiError.notFound('Tenant or plan not found');
      }

      // Check if downgrade is possible
      const usage = await this.getTenantUsage(tenantId);
      const canDowngrade = this.canDowngrade(usage.current, newPlan.limits);

      if (!canDowngrade.allowed) {
        throw ApiError.conflict(`Cannot downgrade: ${canDowngrade.reason}`);
      }

      // Update tenant plan
      await tenant.update({ planId: newPlanId }, { transaction });

      // Update billing
      const billing = await TenantBilling.findOne({ 
        where: { tenantId },
        transaction 
      });
      
      if (billing) {
        await billing.update({
          subscriptionStatus: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }, { transaction });
      }

      await transaction.commit();
      
      logger.info(`Tenant ${tenant.slug} changed plan to ${newPlan.name}`);
      return tenant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Invite user to tenant
   */
  async inviteUser(tenantId, invitedBy, data) {
    // Check if user already exists in tenant
    const existingUser = await TenantUser.findOne({
      where: {
        tenantId,
        email: data.email
      }
    });

    if (existingUser) {
      throw ApiError.conflict('User already exists in this tenant');
    }

    // Check for pending invite
    const existingInvite = await TenantInvite.findOne({
      where: {
        tenantId,
        email: data.email,
        acceptedAt: null
      }
    });

    if (existingInvite) {
      throw ApiError.conflict('Invite already sent to this email');
    }

    // Create invite
    const token = crypto.randomBytes(32).toString('hex');
    const invite = await TenantInvite.create({
      tenantId,
      email: data.email,
      role: data.role || 'operator',
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      token
    });

    // TODO: Send invitation email
    
    logger.info(`User invited to tenant ${tenantId}: ${data.email}`);
    return invite;
  }

  /**
   * Accept tenant invite
   */
  async acceptInvite(token, userData) {
    const invite = await TenantInvite.findOne({
      where: { 
        token,
        acceptedAt: null
      },
      include: [Tenant]
    });

    if (!invite) {
      throw ApiError.notFound('Invalid or expired invitation');
    }

    if (new Date() > invite.expiresAt) {
      throw ApiError.badRequest('Invitation has expired');
    }

    const transaction = await mainDb.transaction();
    
    try {
      // Create user
      const user = await TenantUser.create({
        tenantId: invite.tenantId,
        email: invite.email,
        passwordHash: userData.password, // Will be hashed by hook
        role: invite.role,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      }, { transaction });

      // Mark invite as accepted
      await invite.update({ 
        acceptedAt: new Date() 
      }, { transaction });

      // Update usage
      await this.incrementUsage(invite.tenantId, 'users', 1, transaction);

      await transaction.commit();
      
      logger.info(`Invite accepted for tenant ${invite.Tenant.slug}: ${user.email}`);
      return { user, tenant: invite.Tenant };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get tenant users
   */
  async getTenantUsers(tenantId, options = {}) {
    const { page = 1, limit = 20, role, status = 'active' } = options;
    
    const where = { tenantId };
    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows } = await TenantUser.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash', 'twoFactorSecret'] }
    });

    return {
      users: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update tenant user
   */
  async updateTenantUser(tenantId, userId, updates) {
    const user = await TenantUser.findOne({
      where: { id: userId, tenantId }
    });

    if (!user) {
      throw ApiError.notFound('User not found in this tenant');
    }

    // Prevent updating certain fields
    delete updates.id;
    delete updates.tenantId;
    delete updates.email;

    await user.update(updates);
    
    logger.info(`Tenant user updated: ${user.email} in tenant ${tenantId}`);
    return user;
  }

  /**
   * Remove user from tenant
   */
  async removeTenantUser(tenantId, userId, removedBy) {
    const user = await TenantUser.findOne({
      where: { id: userId, tenantId }
    });

    if (!user) {
      throw ApiError.notFound('User not found in this tenant');
    }

    if (user.role === 'owner') {
      throw ApiError.conflict('Cannot remove tenant owner');
    }

    await user.update({ status: 'inactive' });
    
    // Log activity
    await TenantActivityLog.create({
      tenantId,
      userId: removedBy,
      action: 'user.removed',
      entity: 'user',
      entityId: userId,
      metadata: { removedUser: user.email }
    });

    logger.info(`User removed from tenant ${tenantId}: ${user.email}`);
  }

  /**
   * Get tenant activity log
   */
  async getActivityLog(tenantId, options = {}) {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      entity,
      startDate,
      endDate 
    } = options;

    const where = { tenantId };
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await TenantActivityLog.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      include: [{
        model: TenantUser,
        attributes: ['email', 'profile']
      }]
    });

    return {
      activities: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Helper methods
  
  calculateOverage(usage, limits) {
    const overage = {};
    
    Object.keys(usage).forEach(key => {
      const limit = limits[key] || limits[`${key}PerMonth`];
      if (limit && usage[key] > limit) {
        overage[key] = {
          amount: usage[key] - limit,
          cost: this.calculateOverageCost(key, usage[key] - limit)
        };
      }
    });

    return overage;
  }

  calculateOverageCost(resource, amount) {
    const rates = {
      users: 5,
      precintos: 0.5,
      transitos: 0.1,
      alerts: 0.05,
      apiCalls: 0.001
    };

    return (rates[resource] || 0) * amount;
  }

  canDowngrade(currentUsage, newLimits) {
    for (const [key, value] of Object.entries(currentUsage)) {
      const limit = newLimits[key] || newLimits[`${key}PerMonth`];
      if (limit && value > limit) {
        return {
          allowed: false,
          reason: `Current ${key} usage (${value}) exceeds new plan limit (${limit})`
        };
      }
    }

    return { allowed: true };
  }

  async createDefaultCustomFields(tenantId, transaction) {
    const defaultFields = [
      {
        tenantId,
        entity: 'precinto',
        name: 'notes',
        label: 'Notas',
        type: 'text',
        required: false,
        position: 1
      },
      {
        tenantId,
        entity: 'transito',
        name: 'carrier',
        label: 'Transportista',
        type: 'text',
        required: false,
        position: 1
      },
      {
        tenantId,
        entity: 'alerta',
        name: 'priority',
        label: 'Prioridad',
        type: 'select',
        options: ['Baja', 'Media', 'Alta', 'Urgente'],
        required: false,
        position: 1
      }
    ];

    await TenantCustomField.bulkCreate(defaultFields, { transaction });
  }

  async incrementUsage(tenantId, metric, amount = 1, transaction = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usage] = await TenantUsage.findOrCreate({
      where: {
        tenantId,
        date: today
      },
      defaults: {
        tenantId,
        date: today,
        metrics: {}
      },
      transaction
    });

    const metrics = usage.metrics || {};
    metrics[metric] = (metrics[metric] || 0) + amount;

    await usage.update({ metrics }, { transaction });
  }
}

// Export singleton instance
export const tenantService = new TenantService();
export default tenantService;