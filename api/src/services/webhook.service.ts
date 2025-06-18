/**
 * Webhook Service
 * Handles webhook delivery and management
 * By Cheva
 */

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { config } from '../config/config';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  headers: Record<string, string>;
  companyId?: string;
  active: boolean;
}

interface WebhookPayload {
  event: string;
  data: unknown;
  timestamp?: Date;
}

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: unknown;
  error?: string;
  responseTime: number;
}

class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();
  private deliveryLogs: Map<string, unknown[]> = new Map();

  async getAll(companyId?: string): Promise<Webhook[]> {
    const webhooks = Array.from(this.webhooks.values());
    if (companyId) {
      return webhooks.filter(w => w.companyId === companyId);
    }
    return webhooks;
  }

  async getById(id: string): Promise<Webhook | null> {
    return this.webhooks.get(id) || null;
  }

  async create(data: Partial<Webhook>): Promise<Webhook> {
    const webhook: Webhook = {
      id: crypto.randomUUID(),
      url: data.url!,
      events: data.events || [],
      secret: data.secret || crypto.randomBytes(32).toString('hex'),
      headers: data.headers || {},
      companyId: data.companyId,
      active: true
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  async update(id: string, data: Partial<Webhook>): Promise<Webhook> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const updated = { ...webhook, ...data, id };
    this.webhooks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.webhooks.delete(id);
    this.deliveryLogs.delete(id);
  }

  async trigger(event: string, data: unknown): Promise<void> {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date()
    };

    // Find all webhooks subscribed to this event
    const webhooks = Array.from(this.webhooks.values()).filter(
      w => w.active && w.events.includes(event)
    );

    // Deliver to all subscribed webhooks
    const deliveryPromises = webhooks.map(webhook => 
      this.deliver(webhook, payload).catch(error => {
        logger.error(`Failed to deliver webhook ${webhook.id}:`, error);
      })
    );

    await Promise.allSettled(deliveryPromises);
  }

  async deliver(webhook: Webhook, payload: WebhookPayload): Promise<DeliveryResult> {
    const startTime = Date.now();
    const payloadString = JSON.stringify(payload);
    
    // Create HMAC signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(payloadString)
      .digest('hex');

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event,
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': webhook.id,
          'X-Webhook-Timestamp': payload.timestamp?.toISOString() || new Date().toISOString(),
          ...webhook.headers
        },
        timeout: 30000, // 30 seconds timeout
        validateStatus: () => true // Don't throw on any status
      });

      const result: DeliveryResult = {
        success: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        response: response.data,
        responseTime: Date.now() - startTime
      };

      // Log delivery
      this.logDelivery(webhook.id, payload.event, result);

      return result;
    } catch (error: unknown) {
      const result: DeliveryResult = {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };

      // Log failed delivery
      this.logDelivery(webhook.id, payload.event, result);

      return result;
    }
  }

  async getLogs(webhookId: string, limit: number = 50): Promise<unknown[]> {
    const logs = this.deliveryLogs.get(webhookId) || [];
    return logs.slice(-limit);
  }

  private logDelivery(webhookId: string, event: string, result: DeliveryResult): void {
    const log = {
      id: crypto.randomUUID(),
      event,
      status: result.success ? 'success' : 'failed',
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      error: result.error,
      timestamp: new Date()
    };

    const logs = this.deliveryLogs.get(webhookId) || [];
    logs.push(log);
    
    // Keep only last 1000 logs per webhook
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    this.deliveryLogs.set(webhookId, logs);
  }
}

export const webhookService = new WebhookService();