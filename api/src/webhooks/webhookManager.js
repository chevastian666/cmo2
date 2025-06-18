/**
 * Webhook Manager
 * Handles webhook subscriptions and event dispatching
 * By Cheva
 */

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { mainDb } from '../utils/database.js';
import { DataTypes } from 'sequelize';

// Webhook model
const Webhook = mainDb.define('Webhook', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  events: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  headers: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  retryConfig: {
    type: DataTypes.JSON,
    defaultValue: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  lastTriggered: {
    type: DataTypes.DATE
  },
  failureCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Webhook delivery log
const WebhookDelivery = mainDb.define('WebhookDelivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  webhookId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  responseStatus: {
    type: DataTypes.INTEGER
  },
  responseBody: {
    type: DataTypes.TEXT
  },
  error: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER
  },
  nextRetry: {
    type: DataTypes.DATE
  }
});

// Set up associations
Webhook.hasMany(WebhookDelivery, { foreignKey: 'webhookId' });
WebhookDelivery.belongsTo(Webhook, { foreignKey: 'webhookId' });

class WebhookManager {
  constructor() {
    this.deliveryQueue = [];
    this.processing = false;
  }

  async initialize() {
    try {
      await Webhook.sync();
      await WebhookDelivery.sync();
      logger.info('✅ Webhook system initialized');
      
      // Start processing queue
      this.startProcessing();
    } catch (error) {
      logger.error('Failed to initialize webhook system:', error);
      throw error;
    }
  }

  // Register a new webhook
  async register(data) {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');
    
    const webhook = await Webhook.create({
      ...data,
      secret
    });

    logger.info(`Webhook registered: ${webhook.id} for events: ${webhook.events.join(', ')}`);
    return webhook;
  }

  // Update webhook
  async update(id, data) {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    await webhook.update(data);
    logger.info(`Webhook updated: ${id}`);
    return webhook;
  }

  // Delete webhook
  async delete(id) {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    await webhook.destroy();
    logger.info(`Webhook deleted: ${id}`);
  }

  // Trigger event
  async trigger(event, payload) {
    logger.debug(`Triggering event: ${event}`);
    
    // Find all active webhooks subscribed to this event
    const webhooks = await Webhook.findAll({
      where: {
        active: true,
        events: {
          [mainDb.Sequelize.Op.contains]: [event]
        }
      }
    });

    if (webhooks.length === 0) {
      logger.debug(`No webhooks subscribed to event: ${event}`);
      return;
    }

    // Create delivery records
    const deliveries = await Promise.all(
      webhooks.map(webhook => 
        WebhookDelivery.create({
          webhookId: webhook.id,
          event,
          payload
        })
      )
    );

    // Add to delivery queue
    deliveries.forEach(delivery => {
      this.deliveryQueue.push(delivery);
    });

    logger.info(`Queued ${deliveries.length} webhook deliveries for event: ${event}`);
  }

  // Process delivery queue
  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.processing) {
      if (this.deliveryQueue.length > 0) {
        const delivery = this.deliveryQueue.shift();
        await this.processDelivery(delivery);
      } else {
        // Check for pending retries
        await this.checkRetries();
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // Process a single delivery
  async processDelivery(delivery) {
    const startTime = Date.now();
    
    try {
      const webhook = await Webhook.findByPk(delivery.webhookId);
      if (!webhook || !webhook.active) {
        await delivery.update({ status: 'failed', error: 'Webhook inactive or not found' });
        return;
      }

      // Increment attempts
      await delivery.update({ attempts: delivery.attempts + 1 });

      // Generate signature
      const signature = this.generateSignature(webhook.secret, delivery.payload);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': delivery.event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Delivery': delivery.id,
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...webhook.headers
      };

      // Make request
      logger.debug(`Delivering webhook ${delivery.id} to ${webhook.url}`);
      
      const response = await axios.post(webhook.url, delivery.payload, {
        headers,
        timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '10000'),
        validateStatus: () => true // Don't throw on any status
      });

      const duration = Date.now() - startTime;

      // Update delivery record
      await delivery.update({
        status: response.status >= 200 && response.status < 300 ? 'success' : 'failed',
        responseStatus: response.status,
        responseBody: JSON.stringify(response.data).substring(0, 1000),
        duration
      });

      // Update webhook
      await webhook.update({
        lastTriggered: new Date(),
        failureCount: response.status >= 200 && response.status < 300 ? 0 : webhook.failureCount + 1
      });

      logger.info(`Webhook delivered: ${delivery.id} (${response.status} in ${duration}ms)`);

      // Handle failure
      if (response.status < 200 || response.status >= 300) {
        await this.handleFailure(delivery, webhook, `HTTP ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`Webhook delivery failed: ${delivery.id}`, error);
      
      await delivery.update({
        error: error.message,
        duration
      });

      const webhook = await Webhook.findByPk(delivery.webhookId);
      await this.handleFailure(delivery, webhook, error.message);
    }
  }

  // Handle delivery failure
  async handleFailure(delivery, webhook, error) {
    const { maxAttempts, backoffMultiplier, initialDelay } = webhook.retryConfig;

    if (delivery.attempts >= maxAttempts) {
      await delivery.update({
        status: 'failed',
        error: `Max attempts (${maxAttempts}) exceeded. Last error: ${error}`
      });

      // Disable webhook after too many failures
      if (webhook.failureCount >= 10) {
        await webhook.update({ active: false });
        logger.warn(`Webhook ${webhook.id} disabled after ${webhook.failureCount} failures`);
      }
    } else {
      // Calculate next retry time
      const delay = initialDelay * Math.pow(backoffMultiplier, delivery.attempts - 1);
      const nextRetry = new Date(Date.now() + delay);

      await delivery.update({
        nextRetry,
        error
      });

      logger.info(`Webhook ${delivery.id} scheduled for retry at ${nextRetry.toISOString()}`);
    }
  }

  // Check for deliveries that need retry
  async checkRetries() {
    const now = new Date();
    
    const pendingRetries = await WebhookDelivery.findAll({
      where: {
        status: 'pending',
        nextRetry: {
          [mainDb.Sequelize.Op.lte]: now
        }
      }
    });

    pendingRetries.forEach(delivery => {
      this.deliveryQueue.push(delivery);
    });

    if (pendingRetries.length > 0) {
      logger.debug(`Added ${pendingRetries.length} deliveries for retry`);
    }
  }

  // Generate HMAC signature
  generateSignature(secret, payload) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  // Verify webhook signature
  verifySignature(secret, payload, signature) {
    const expected = this.generateSignature(secret, payload);
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }

  // Get webhook statistics
  async getStats(webhookId) {
    const webhook = await Webhook.findByPk(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const deliveries = await WebhookDelivery.findAll({
      where: { webhookId },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const stats = {
      total: deliveries.length,
      successful: deliveries.filter(d => d.status === 'success').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      averageResponseTime: deliveries
        .filter(d => d.duration)
        .reduce((sum, d) => sum + d.duration, 0) / deliveries.filter(d => d.duration).length || 0,
      lastDelivery: deliveries[0]
    };

    return stats;
  }

  // Stop processing
  stop() {
    this.processing = false;
    logger.info('Webhook processing stopped');
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager();

// Initialize webhooks
export async function initializeWebhooks() {
  await webhookManager.initialize();
}