/**
 * Webhooks Service
 * Configurable webhooks for external integrations
 * By Cheva
 */

import { EventEmitter } from 'events';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  active: boolean;
  retries: number;
  timeout: number;
  headers?: Record<string, string>;
  filters?: WebhookFilter[];
  created: Date;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
}

export interface WebhookEvent {
  type: 'alert.created' | 'alert.resolved' | 'transit.delayed' | 'precinto.violated' | 
        'system.error' | 'user.login' | 'data.export' | 'threshold.exceeded';
  description: string;
}

export interface WebhookFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains';
  value: any;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  source: 'cmo' | 'trokor' | 'system';
  webhook_id: string;
  signature?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: WebhookPayload;
  url: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  last_attempt: Date;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  created: Date;
}

class WebhooksService extends EventEmitter {
  private webhooks = new Map<string, WebhookConfig>();
  private deliveries = new Map<string, WebhookDelivery>();
  private retryQueue: string[] = [];
  private isProcessingQueue = false;

  // Webhook management
  async createWebhook(config: Omit<WebhookConfig, 'id' | 'created' | 'successCount' | 'errorCount'>): Promise<WebhookConfig> {
    const webhook: WebhookConfig = {
      ...config,
      id: this.generateId(),
      created: new Date(),
      successCount: 0,
      errorCount: 0
    };

    // Validate webhook URL
    await this.validateWebhookUrl(webhook.url);

    this.webhooks.set(webhook.id, webhook);
    this.emit('webhook.created', webhook);

    // Save to localStorage for persistence
    this.saveWebhooks();

    return webhook;
  }

  updateWebhook(id: string, updates: Partial<WebhookConfig>): WebhookConfig | null {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updatedWebhook = { ...webhook, ...updates };
    this.webhooks.set(id, updatedWebhook);
    this.emit('webhook.updated', updatedWebhook);

    this.saveWebhooks();
    return updatedWebhook;
  }

  deleteWebhook(id: string): boolean {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;

    this.webhooks.delete(id);
    this.emit('webhook.deleted', webhook);

    this.saveWebhooks();
    return true;
  }

  getWebhook(id: string): WebhookConfig | null {
    return this.webhooks.get(id) || null;
  }

  getAllWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  getActiveWebhooks(): WebhookConfig[] {
    return this.getAllWebhooks().filter(webhook => webhook.active);
  }

  // Event triggering
  async triggerEvent(
    eventType: WebhookEvent['type'], 
    data: any, 
    source: WebhookPayload['source'] = 'cmo'
  ): Promise<void> {
    const activeWebhooks = this.getActiveWebhooks()
      .filter(webhook => webhook.events.some(event => event.type === eventType));

    if (activeWebhooks.length === 0) return;

    const promises = activeWebhooks.map(webhook => {
      // Apply filters
      if (webhook.filters && !this.applyFilters(data, webhook.filters)) {
        return Promise.resolve();
      }

      return this.deliverWebhook(webhook, eventType, data, source);
    });

    await Promise.allSettled(promises);
  }

  // Webhook delivery
  private async deliverWebhook(
    webhook: WebhookConfig,
    eventType: string,
    data: any,
    source: WebhookPayload['source']
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
      source,
      webhook_id: webhook.id
    };

    // Add signature if secret is provided
    if (webhook.secret) {
      payload.signature = await this.generateSignature(payload, webhook.secret);
    }

    const delivery: WebhookDelivery = {
      id: this.generateId(),
      webhook_id: webhook.id,
      event: eventType,
      payload,
      url: webhook.url,
      status: 'pending',
      attempts: 0,
      last_attempt: new Date(),
      created: new Date()
    };

    this.deliveries.set(delivery.id, delivery);

    try {
      await this.sendWebhook(delivery, webhook);
      this.updateDeliveryStatus(delivery.id, 'success');
      this.updateWebhookStats(webhook.id, 'success');
    } catch (error) {
      console.error(`Webhook delivery failed for ${webhook.id}:`, error);
      this.updateDeliveryStatus(delivery.id, 'failed', error as Error);
      this.updateWebhookStats(webhook.id, 'error');

      // Add to retry queue if retries are enabled
      if (delivery.attempts < webhook.retries) {
        this.retryQueue.push(delivery.id);
        this.processRetryQueue();
      }
    }
  }

  private async sendWebhook(delivery: WebhookDelivery, webhook: WebhookConfig): Promise<void> {
    delivery.attempts++;
    delivery.last_attempt = new Date();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

    try {
      const response = await fetch(delivery.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CMO-Webhooks/1.0',
          ...webhook.headers
        },
        body: JSON.stringify(delivery.payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      delivery.response_status = response.status;
      delivery.response_body = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.emit('webhook.delivered', delivery);
    } catch (error) {
      clearTimeout(timeoutId);
      delivery.error_message = (error as Error).message;
      throw error;
    }
  }

  // Retry mechanism
  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.retryQueue.length > 0) {
      const deliveryId = this.retryQueue.shift()!;
      const delivery = this.deliveries.get(deliveryId);
      
      if (!delivery) continue;

      const webhook = this.webhooks.get(delivery.webhook_id);
      if (!webhook || !webhook.active) continue;

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, delivery.attempts - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        delivery.status = 'retrying';
        await this.sendWebhook(delivery, webhook);
        this.updateDeliveryStatus(delivery.id, 'success');
        this.updateWebhookStats(webhook.id, 'success');
      } catch (error) {
        this.updateDeliveryStatus(delivery.id, 'failed', error as Error);
        this.updateWebhookStats(webhook.id, 'error');

        // Retry again if attempts remaining
        if (delivery.attempts < webhook.retries) {
          this.retryQueue.push(delivery.id);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Test webhook
  async testWebhook(id: string): Promise<WebhookDelivery> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from CMO',
        webhook_id: id
      },
      source: 'cmo' as const,
      webhook_id: id
    };

    const delivery: WebhookDelivery = {
      id: this.generateId(),
      webhook_id: id,
      event: 'webhook.test',
      payload: testPayload,
      url: webhook.url,
      status: 'pending',
      attempts: 0,
      last_attempt: new Date(),
      created: new Date()
    };

    this.deliveries.set(delivery.id, delivery);

    try {
      await this.sendWebhook(delivery, webhook);
      this.updateDeliveryStatus(delivery.id, 'success');
    } catch (error) {
      this.updateDeliveryStatus(delivery.id, 'failed', error as Error);
    }

    return this.deliveries.get(delivery.id)!;
  }

  // Delivery history
  getDeliveries(webhookId?: string, limit = 100): WebhookDelivery[] {
    let deliveries = Array.from(this.deliveries.values());
    
    if (webhookId) {
      deliveries = deliveries.filter(d => d.webhook_id === webhookId);
    }

    return deliveries
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, limit);
  }

  getDeliveryStats(webhookId?: string): {
    total: number;
    success: number;
    failed: number;
    pending: number;
    successRate: number;
  } {
    const deliveries = this.getDeliveries(webhookId, 1000);
    
    const stats = deliveries.reduce((acc, delivery) => {
      acc.total++;
      acc[delivery.status as keyof typeof acc]++;
      return acc;
    }, { total: 0, success: 0, failed: 0, pending: 0, retrying: 0 });

    return {
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      pending: stats.pending + stats.retrying,
      successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0
    };
  }

  // Helper methods
  private applyFilters(data: any, filters: WebhookFilter[]): boolean {
    return filters.every(filter => {
      const value = this.getNestedValue(data, filter.field);
      
      switch (filter.operator) {
        case '=': return value === filter.value;
        case '!=': return value !== filter.value;
        case '>': return value > filter.value;
        case '<': return value < filter.value;
        case '>=': return value >= filter.value;
        case '<=': return value <= filter.value;
        case 'contains': return String(value).includes(String(filter.value));
        case 'not_contains': return !String(value).includes(String(filter.value));
        default: return true;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = encoder.encode(secret);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async validateWebhookUrl(url: string): Promise<void> {
    try {
      new URL(url); // Validate URL format
      
      // Optional: Test connectivity
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
    } catch (error) {
      // URL validation failed, but we'll allow it for flexibility
      console.warn(`Webhook URL validation failed: ${error}`);
    }
  }

  private updateDeliveryStatus(
    deliveryId: string, 
    status: WebhookDelivery['status'], 
    error?: Error
  ): void {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) return;

    delivery.status = status;
    if (error) {
      delivery.error_message = error.message;
    }

    this.emit('delivery.updated', delivery);
  }

  private updateWebhookStats(webhookId: string, result: 'success' | 'error'): void {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return;

    if (result === 'success') {
      webhook.successCount++;
      webhook.lastTriggered = new Date();
    } else {
      webhook.errorCount++;
    }

    this.saveWebhooks();
  }

  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  private saveWebhooks(): void {
    try {
      const webhooksArray = Array.from(this.webhooks.values());
      localStorage.setItem('cmo_webhooks', JSON.stringify(webhooksArray));
    } catch (error) {
      console.error('Failed to save webhooks:', error);
    }
  }

  loadWebhooks(): void {
    try {
      const stored = localStorage.getItem('cmo_webhooks');
      if (stored) {
        const webhooksArray: WebhookConfig[] = JSON.parse(stored);
        this.webhooks.clear();
        
        webhooksArray.forEach(webhook => {
          // Convert date strings back to Date objects
          webhook.created = new Date(webhook.created);
          if (webhook.lastTriggered) {
            webhook.lastTriggered = new Date(webhook.lastTriggered);
          }
          this.webhooks.set(webhook.id, webhook);
        });
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  }

  // Available events
  getAvailableEvents(): WebhookEvent[] {
    return [
      { type: 'alert.created', description: 'Nueva alerta creada' },
      { type: 'alert.resolved', description: 'Alerta resuelta' },
      { type: 'transit.delayed', description: 'Tránsito retrasado' },
      { type: 'precinto.violated', description: 'Violación de precinto detectada' },
      { type: 'system.error', description: 'Error del sistema' },
      { type: 'user.login', description: 'Usuario inició sesión' },
      { type: 'data.export', description: 'Exportación de datos completada' },
      { type: 'threshold.exceeded', description: 'Umbral excedido' }
    ];
  }

  // Cleanup
  cleanup(): void {
    this.removeAllListeners();
    this.webhooks.clear();
    this.deliveries.clear();
    this.retryQueue = [];
  }
}

// Singleton instance
export const webhooksService = new WebhooksService();

// Initialize on import
webhooksService.loadWebhooks();