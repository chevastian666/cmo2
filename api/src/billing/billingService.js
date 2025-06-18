/**
 * Billing Service
 * Handles subscription management and usage-based billing
 * By Cheva
 */

import { TenantBilling, TenantUsage, Tenant, TenantPlan } from '../tenant/tenantModels.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { mainDb } from '../utils/database.js';
import cron from 'node-cron';

class BillingService {
  constructor() {
    this.initializeBillingJobs();
  }

  /**
   * Initialize scheduled billing jobs
   */
  initializeBillingJobs() {
    // Daily usage tracking (runs at 2 AM)
    cron.schedule('0 2 * * *', async () => {
      logger.info('Running daily usage tracking job');
      await this.trackDailyUsage();
    });

    // Monthly billing calculation (runs on 1st of each month at 3 AM)
    cron.schedule('0 3 1 * *', async () => {
      logger.info('Running monthly billing calculation');
      await this.calculateMonthlyBilling();
    });

    // Check trial expirations (runs daily at 9 AM)
    cron.schedule('0 9 * * *', async () => {
      logger.info('Checking trial expirations');
      await this.checkTrialExpirations();
    });
  }

  /**
   * Track daily usage for all tenants
   */
  async trackDailyUsage() {
    try {
      const tenants = await Tenant.findAll({
        where: { status: ['active', 'trial'] }
      });

      for (const tenant of tenants) {
        await this.updateTenantUsage(tenant.id);
      }

      logger.info(`Updated usage for ${tenants.length} tenants`);
    } catch (error) {
      logger.error('Error tracking daily usage:', error);
    }
  }

  /**
   * Update usage metrics for a specific tenant
   */
  async updateTenantUsage(tenantId) {
    const transaction = await mainDb.transaction();
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count current resources
      const [
        userCount,
        precintoCount,
        transitCount,
        alertCount,
        apiCallCount,
        webhookCount
      ] = await Promise.all([
        mainDb.models.TenantUser.count({ 
          where: { tenantId, status: 'active' } 
        }),
        mainDb.models.Precinto?.count({ 
          where: { tenantId } 
        }) || 0,
        mainDb.models.Transito?.count({ 
          where: { 
            tenantId,
            createdAt: { 
              [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) 
            }
          } 
        }) || 0,
        mainDb.models.Alerta?.count({ 
          where: { 
            tenantId,
            createdAt: { 
              [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) 
            }
          } 
        }) || 0,
        mainDb.models.ApiLog?.count({ 
          where: { 
            tenantId,
            createdAt: { [Op.gte]: today }
          } 
        }) || 0,
        mainDb.models.Webhook?.count({ 
          where: { tenantId, active: true } 
        }) || 0
      ]);

      // Calculate storage (simplified - in production, sum actual file sizes)
      const storageGB = await this.calculateTenantStorage(tenantId);

      // Create or update usage record
      const [usage, created] = await TenantUsage.findOrCreate({
        where: { tenantId, date: today },
        defaults: {
          tenantId,
          date: today,
          metrics: {
            users: userCount,
            precintos: precintoCount,
            transitos: transitCount,
            alerts: alertCount,
            apiCalls: apiCallCount,
            storage: storageGB,
            webhooks: webhookCount
          }
        },
        transaction
      });

      if (!created) {
        await usage.update({
          metrics: {
            users: userCount,
            precintos: precintoCount,
            transitos: transitCount,
            alerts: alertCount,
            apiCalls: apiCallCount,
            storage: storageGB,
            webhooks: webhookCount
          }
        }, { transaction });
      }

      await transaction.commit();
      
      return usage;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error updating usage for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate monthly billing for all tenants
   */
  async calculateMonthlyBilling() {
    try {
      const tenants = await Tenant.findAll({
        where: { status: 'active' },
        include: [TenantPlan, TenantBilling]
      });

      for (const tenant of tenants) {
        await this.generateMonthlyInvoice(tenant);
      }

      logger.info(`Generated invoices for ${tenants.length} tenants`);
    } catch (error) {
      logger.error('Error calculating monthly billing:', error);
    }
  }

  /**
   * Generate invoice for a tenant
   */
  async generateMonthlyInvoice(tenant) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    // Get usage for the month
    const monthlyUsage = await TenantUsage.findAll({
      where: {
        tenantId: tenant.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Calculate totals
    const totals = this.aggregateMonthlyUsage(monthlyUsage);
    const overage = this.calculateOverageCharges(totals, tenant.TenantPlan.limits);
    
    // Base plan cost
    const baseCost = tenant.TenantPlan.price.monthly;
    const overageCost = Object.values(overage).reduce((sum, o) => sum + o.cost, 0);
    const totalCost = baseCost + overageCost;

    // Create invoice record
    const invoice = {
      tenantId: tenant.id,
      period: {
        start: startDate,
        end: endDate
      },
      items: [
        {
          description: `${tenant.TenantPlan.displayName} Plan`,
          quantity: 1,
          unitPrice: baseCost,
          amount: baseCost
        }
      ],
      usage: totals,
      overage,
      subtotal: baseCost,
      overageCharges: overageCost,
      total: totalCost,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    // Add overage items
    Object.entries(overage).forEach(([resource, details]) => {
      if (details.amount > 0) {
        invoice.items.push({
          description: `${resource} overage (${details.amount} units)`,
          quantity: details.amount,
          unitPrice: details.rate,
          amount: details.cost
        });
      }
    });

    // Save invoice (in production, integrate with payment provider)
    // await this.saveInvoice(invoice);
    
    logger.info(`Generated invoice for tenant ${tenant.slug}: $${totalCost}`);
    
    return invoice;
  }

  /**
   * Aggregate monthly usage from daily records
   */
  aggregateMonthlyUsage(dailyUsage) {
    const totals = {
      users: 0,
      precintos: 0,
      transitos: 0,
      alerts: 0,
      apiCalls: 0,
      storage: 0,
      webhooks: 0
    };

    // For counts, take the maximum value
    // For cumulative metrics, sum them
    dailyUsage.forEach(day => {
      const metrics = day.metrics || {};
      
      // Max values (resources that don't accumulate)
      totals.users = Math.max(totals.users, metrics.users || 0);
      totals.precintos = Math.max(totals.precintos, metrics.precintos || 0);
      totals.webhooks = Math.max(totals.webhooks, metrics.webhooks || 0);
      totals.storage = Math.max(totals.storage, metrics.storage || 0);
      
      // Cumulative values (usage that accumulates)
      totals.transitos += metrics.transitos || 0;
      totals.alerts += metrics.alerts || 0;
      totals.apiCalls += metrics.apiCalls || 0;
    });

    return totals;
  }

  /**
   * Calculate overage charges
   */
  calculateOverageCharges(usage, limits) {
    const overageRates = {
      users: { rate: 5, unit: 'user' },
      precintos: { rate: 0.5, unit: 'precinto' },
      transitos: { rate: 0.1, unit: 'transit' },
      alerts: { rate: 0.05, unit: 'alert' },
      apiCalls: { rate: 0.001, unit: 'call' },
      storage: { rate: 0.1, unit: 'GB' },
      webhooks: { rate: 2, unit: 'webhook' }
    };

    const overage = {};

    Object.entries(usage).forEach(([resource, used]) => {
      const limitKey = resource === 'transitos' ? 'transitosPerMonth' :
                      resource === 'alerts' ? 'alertsPerMonth' :
                      resource === 'apiCalls' ? 'apiCallsPerDay' :
                      resource;
      
      const limit = limits[limitKey];
      
      if (limit && used > limit) {
        const overageAmount = used - limit;
        const rate = overageRates[resource];
        
        overage[resource] = {
          amount: overageAmount,
          rate: rate.rate,
          unit: rate.unit,
          cost: overageAmount * rate.rate
        };
      }
    });

    return overage;
  }

  /**
   * Check and handle trial expirations
   */
  async checkTrialExpirations() {
    try {
      const expiringTrials = await Tenant.findAll({
        where: {
          status: 'trial',
          trialEndsAt: {
            [Op.lte]: new Date()
          }
        }
      });

      for (const tenant of expiringTrials) {
        await this.handleTrialExpiration(tenant);
      }

      logger.info(`Processed ${expiringTrials.length} trial expirations`);
    } catch (error) {
      logger.error('Error checking trial expirations:', error);
    }
  }

  /**
   * Handle trial expiration for a tenant
   */
  async handleTrialExpiration(tenant) {
    // Update tenant status
    await tenant.update({ status: 'inactive' });
    
    // Notify tenant
    // await notificationService.sendTrialExpiredEmail(tenant);
    
    logger.info(`Trial expired for tenant ${tenant.slug}`);
  }

  /**
   * Calculate tenant storage usage
   */
  async calculateTenantStorage(tenantId) {
    // In production, sum actual file sizes from storage service
    // For now, return mock value based on records
    const recordCount = await mainDb.models.Precinto?.count({ 
      where: { tenantId } 
    }) || 0;
    
    // Assume ~1MB per record average
    return Math.round(recordCount * 0.001 * 100) / 100; // Convert to GB
  }

  /**
   * Get billing summary for a tenant
   */
  async getBillingSummary(tenantId) {
    const tenant = await Tenant.findByPk(tenantId, {
      include: [TenantPlan, TenantBilling]
    });

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    // Get current month usage
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const currentUsage = await this.aggregateMonthlyUsage(
      await TenantUsage.findAll({
        where: {
          tenantId,
          date: { [Op.gte]: startOfMonth }
        }
      })
    );

    // Calculate current overage
    const currentOverage = this.calculateOverageCharges(
      currentUsage, 
      tenant.TenantPlan.limits
    );
    
    const currentOverageCost = Object.values(currentOverage)
      .reduce((sum, o) => sum + o.cost, 0);

    // Get last 6 months of invoices
    const invoiceHistory = []; // In production, fetch from payment provider

    return {
      plan: {
        name: tenant.TenantPlan.displayName,
        price: tenant.TenantPlan.price,
        limits: tenant.TenantPlan.limits
      },
      billing: tenant.TenantBilling,
      currentPeriod: {
        start: startOfMonth,
        end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
        usage: currentUsage,
        overage: currentOverage,
        estimatedCost: tenant.TenantPlan.price.monthly + currentOverageCost
      },
      invoices: invoiceHistory,
      paymentMethod: tenant.TenantBilling?.paymentMethod,
      credits: tenant.TenantBilling?.credits || 0
    };
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(tenantId, paymentMethodData) {
    const billing = await TenantBilling.findOne({ where: { tenantId } });
    
    if (!billing) {
      throw ApiError.notFound('Billing record not found');
    }

    // In production, update payment method with payment provider
    await billing.update({
      paymentMethod: {
        type: paymentMethodData.type,
        last4: paymentMethodData.last4,
        brand: paymentMethodData.brand
      }
    });

    logger.info(`Payment method updated for tenant ${tenantId}`);
    return billing;
  }

  /**
   * Apply credits to tenant account
   */
  async applyCredits(tenantId, amount, reason) {
    const billing = await TenantBilling.findOne({ where: { tenantId } });
    
    if (!billing) {
      throw ApiError.notFound('Billing record not found');
    }

    const newCredits = (billing.credits || 0) + amount;
    await billing.update({ credits: newCredits });

    logger.info(`Applied ${amount} credits to tenant ${tenantId}: ${reason}`);
    return billing;
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;