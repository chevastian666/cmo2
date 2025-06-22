/**
 * Webhooks Service
 * Configurable webhooks for external integrations
 * By Cheva
 */
import { EventEmitter} from 'events'
export interface WebhookConfig { /* TODO: Complete implementation */ }
  id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  active: boolean
  retries: number
  timeout: number
  headers?: Record<string, string>
  filters?: WebhookFilter[]
  created: Date
  lastTriggered?: Date
  successCount: number
  errorCount: number
}
export interface WebhookEvent { /* TODO: Complete implementation */ }
  type: 'alert.created' | 'alert.resolved' | 'transit.delayed' | 'precinto.violated' |
        'system.error' | 'user.login' | 'data.export' | 'threshold.exceeded'
  description: string
}
export interface WebhookFilter { /* TODO: Complete implementation */ }
  field: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains'
  value: unknown
}
export interface WebhookPayload { /* TODO: Complete implementation */ }
  event: string
  timestamp: string
  data: unknown
  source: 'cmo' | 'trokor' | 'system'
  webhook_id: string
  signature?: string
}
export interface WebhookDelivery { /* TODO: Complete implementation */ }
  id: string
  webhook_id: string
  event: string
  payload: WebhookPayload
  url: string
  status: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number
  last_attempt: Date
  response_status?: number
  response_body?: string
  error_message?: string
  created: Date
}
class WebhooksService extends EventEmitter { /* TODO: Complete implementation */ }
  private webhooks = new Map<string, WebhookConfig>()
  private deliveries = new Map<string, WebhookDelivery>()
  private retryQueue: string[] = []
  private isProcessingQueue = false
  // Webhook management
  async createWebhook(config: Omit<WebhookConfig, 'id' | 'created' | 'successCount' | 'errorCount'>): Promise<WebhookConfig> { /* TODO: Complete implementation */ }
    const webhook: WebhookConfig = { /* TODO: Complete implementation */ }
      ...config,
      id: this.generateId(),
      created: new Date(),
      successCount: 0,
      errorCount: 0
    }
    // Validate webhook URL
    await this.validateWebhookUrl(webhook.url)
    this.webhooks.set(webhook.id, webhook)
    this.emit('webhook.created', webhook)
    // Save to localStorage for persistence
    this.saveWebhooks()
    return webhook
  }
  updateWebhook(id: string, updates: Partial<WebhookConfig>): WebhookConfig | null { /* TODO: Complete implementation */ }
    const webhook = this.webhooks.get(_id)
    if (!webhook) return null
    const updatedWebhook = { ...webhook, ...updates }
    this.webhooks.set(_id, updatedWebhook)
    this.emit('webhook.updated', updatedWebhook)
    this.saveWebhooks()
    return updatedWebhook
  }
  deleteWebhook(id: string): boolean { /* TODO: Complete implementation */ }
    const webhook = this.webhooks.get(_id)
    if (!webhook) return false
    this.webhooks.delete(_id)
    this.emit('webhook.deleted', webhook)
    this.saveWebhooks()
    return true
  }
  getWebhook(id: string): WebhookConfig | null { /* TODO: Complete implementation */ }
    return this.webhooks.get(_id) || null
  }
  getAllWebhooks(): WebhookConfig[] { /* TODO: Complete implementation */ }
    return Array.from(this.webhooks.values())
  }
  getActiveWebhooks(): WebhookConfig[] { /* TODO: Complete implementation */ }
    return this.getAllWebhooks().filter(webhook => webhook.active)
  }
  // Event triggering
  async triggerEvent(
    eventType: WebhookEvent['type'],
    data: unknown,
    source: WebhookPayload['source'] = 'cmo'
  ): Promise<void> { /* TODO: Complete implementation */ }
    const activeWebhooks = this.getActiveWebhooks()
      .filter(webhook => webhook.events.some(event => event.type === eventType))
    if (activeWebhooks.length === 0) return
    const promises = activeWebhooks.map(webhook => { /* TODO: Complete implementation */ }
      // Apply filters
      if (webhook.filters && !this.applyFilters(_data, webhook.filters)) { /* TODO: Complete implementation */ }
        return Promise.resolve()
      }
      return this.deliverWebhook(_webhook, eventType, data, source)
    })
    await Promise.allSettled(_promises)
  }
  // Webhook delivery
  private async deliverWebhook(
    webhook: WebhookConfig,
    eventType: string,
    data: unknown,
    source: WebhookPayload['source']
  ): Promise<void> { /* TODO: Complete implementation */ }
    const payload: WebhookPayload = { /* TODO: Complete implementation */ }
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
      source,
      webhook_id: webhook.id
    }
    // Add signature if secret is provided
    if (webhook.secret) { /* TODO: Complete implementation */ }
      payload.signature = await this.generateSignature(_payload, webhook.secret)
    }
    const delivery: WebhookDelivery = { /* TODO: Complete implementation */ }
      id: this.generateId(),
      webhook_id: webhook.id,
      event: eventType,
      payload,
      url: webhook.url,
      status: 'pending',
      attempts: 0,
      last_attempt: new Date(),
      created: new Date()
    }
    this.deliveries.set(delivery.id, delivery)
    try { /* TODO: Complete implementation */ }
      await this.sendWebhook(_delivery, webhook)
      this.updateDeliveryStatus(delivery.id, 'success')
      this.updateWebhookStats(webhook.id, 'success')
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error(`Webhook delivery failed for ${webhook.id}:`, error)
      this.updateDeliveryStatus(delivery.id, 'failed', error as Error)
      this.updateWebhookStats(webhook.id, 'error')
      // Add to retry queue if retries are enabled
      if (delivery.attempts < webhook.retries) { /* TODO: Complete implementation */ }
        this.retryQueue.push(delivery.id)
        this.processRetryQueue()
      }
    }
  }
  private async sendWebhook(delivery: WebhookDelivery, webhook: WebhookConfig): Promise<void> { /* TODO: Complete implementation */ }
    delivery.attempts++
    delivery.last_attempt = new Date()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout)
    try { /* TODO: Complete implementation */ }
      const response = await fetch(delivery.url, { /* TODO: Complete implementation */ }
        method: 'POST',
        headers: { /* TODO: Complete implementation */ }
          'Content-Type': 'application/json',
          'User-Agent': 'CMO-Webhooks/1.0',
          ...webhook.headers
        },
        body: JSON.stringify(delivery.payload),
        signal: controller.signal
      })
      clearTimeout(_timeoutId)
      delivery.response_status = response.status
      delivery.response_body = await response.text()
      if (!response.ok) { /* TODO: Complete implementation */ }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      this.emit('webhook.delivered', delivery)
    } catch (_error) { /* TODO: Complete implementation */ }
      clearTimeout(_timeoutId)
      delivery.error_message = (error as Error).message
      throw error
    }
  }
  // Retry mechanism
  private async processRetryQueue(): Promise<void> { /* TODO: Complete implementation */ }
    if (this.isProcessingQueue || this.retryQueue.length === 0) return
    this.isProcessingQueue = true
    while (this.retryQueue.length > 0) { /* TODO: Complete implementation */ }
      const deliveryId = this.retryQueue.shift()!
      const delivery = this.deliveries.get(_deliveryId)
      if (!delivery) continue
      const webhook = this.webhooks.get(delivery.webhook_id)
      if (!webhook || !webhook.active) continue
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, delivery.attempts - 1), 30000)
      await new Promise(resolve => setTimeout(_resolve, delay))
      try { /* TODO: Complete implementation */ }
        delivery.status = 'retrying'
        await this.sendWebhook(_delivery, webhook)
        this.updateDeliveryStatus(delivery.id, 'success')
        this.updateWebhookStats(webhook.id, 'success')
      } catch (_error) { /* TODO: Complete implementation */ }
        this.updateDeliveryStatus(delivery.id, 'failed', error as Error)
        this.updateWebhookStats(webhook.id, 'error')
        // Retry again if attempts remaining
        if (delivery.attempts < webhook.retries) { /* TODO: Complete implementation */ }
          this.retryQueue.push(delivery.id)
        }
      }
    }
    this.isProcessingQueue = false
  }
  // Test webhook
  async testWebhook(id: string): Promise<WebhookDelivery> { /* TODO: Complete implementation */ }
    const webhook = this.webhooks.get(_id)
    if (!webhook) { /* TODO: Complete implementation */ }
      throw new Error('Webhook not found')
    }
    const testPayload = { /* TODO: Complete implementation */ }
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { /* TODO: Complete implementation */ }
        message: 'This is a test webhook from CMO',
        webhook_id: id
      },
      source: 'cmo' as const,
      webhook_id: id
    }
    const delivery: WebhookDelivery = { /* TODO: Complete implementation */ }
      id: this.generateId(),
      webhook_id: id,
      event: 'webhook.test',
      payload: testPayload,
      url: webhook.url,
      status: 'pending',
      attempts: 0,
      last_attempt: new Date(),
      created: new Date()
    }
    this.deliveries.set(delivery.id, delivery)
    try { /* TODO: Complete implementation */ }
      await this.sendWebhook(_delivery, webhook)
      this.updateDeliveryStatus(delivery.id, 'success')
    } catch (_error) { /* TODO: Complete implementation */ }
      this.updateDeliveryStatus(delivery.id, 'failed', error as Error)
    }
    return this.deliveries.get(delivery.id)!
  }
  // Delivery history
  getDeliveries(webhookId?: string, limit = 100): WebhookDelivery[] { /* TODO: Complete implementation */ }
    let deliveries = Array.from(this.deliveries.values())
    if (_webhookId) { /* TODO: Complete implementation */ }
      deliveries = deliveries.filter(d => d.webhook_id === webhookId)
    }
    return deliveries
      .sort((_a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, limit)
  }
  getDeliveryStats(webhookId?: string): { /* TODO: Complete implementation */ }
    total: number
    success: number
    failed: number
    pending: number
    successRate: number
  } { /* TODO: Complete implementation */ }
    const deliveries = this.getDeliveries(_webhookId, 1000)
    const stats = deliveries.reduce((_acc, delivery) => { /* TODO: Complete implementation */ }
      acc.total++
      acc[delivery.status as keyof typeof acc]++
      return acc
    }, { total: 0, success: 0, failed: 0, pending: 0, retrying: 0 })
    return { /* TODO: Complete implementation */ }
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      pending: stats.pending + stats.retrying,
      successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0
    }
  }
  // Helper methods
  private applyFilters(data: unknown, filters: WebhookFilter[]): boolean { /* TODO: Complete implementation */ }
    return filters.every(filter => { /* TODO: Complete implementation */ }
      const value = this.getNestedValue(_data, filter.field)
      switch (filter.operator) { /* TODO: Complete implementation */ }
        case '=': { /* TODO: Complete implementation */ }
  return value === filter.value
        case '!=': { /* TODO: Complete implementation */ }
  return value !== filter.value
        case '>': { /* TODO: Complete implementation */ }
  return value > filter.value
        case '<': { /* TODO: Complete implementation */ }
  return value < filter.value
        case '>=': { /* TODO: Complete implementation */ }
  return value >= filter.value
        case '<=': { /* TODO: Complete implementation */ }
  return value <= filter.value
        case 'contains': { /* TODO: Complete implementation */ }
  return String(_value).includes(String(filter.value))
        case 'not_contains': { /* TODO: Complete implementation */ }
  return !String(_value).includes(String(filter.value))
        default: return true
      }
    })
  }
  private getNestedValue(obj: unknown, path: string): unknown { /* TODO: Complete implementation */ }
    return path.split('.').reduce((_current, key) => current?.[key], obj)
  }
  private async generateSignature(payload: WebhookPayload, secret: string): Promise<string> { /* TODO: Complete implementation */ }
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(_payload))
    const key = encoder.encode(s_ecret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
    return Array.from(new Uint8Array(s_ignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  private async validateWebhookUrl(url: string): Promise<void> { /* TODO: Complete implementation */ }
    try { /* TODO: Complete implementation */ }
      new URL(_url); // Validate URL format
      // Optional: Test connectivity
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 5000)
      await fetch(_url, { /* TODO: Complete implementation */ }
        method: 'HEAD',
        signal: controller.signal
      })
    } catch (_error) { /* TODO: Complete implementation */ }
      // URL validation failed, but we'll allow it for flexibility
      console.warn(`Webhook URL validation failed: ${_error}`)
    }
  }
  private updateDeliveryStatus(
    deliveryId: string,
    status: WebhookDelivery['status'],
    error?: Error
  ): void { /* TODO: Complete implementation */ }
    const delivery = this.deliveries.get(_deliveryId)
    if (!delivery) return
    delivery.status = status
    if (_error) { /* TODO: Complete implementation */ }
      delivery.error_message = error.message
    }
    this.emit('delivery.updated', delivery)
  }
  private updateWebhookStats(__webhookId: string, result: 'success' | 'error'): void { /* TODO: Complete implementation */ }
    const webhook = this.webhooks.get(_webhookId)
    if (!webhook) return
    if (result === 'success') { /* TODO: Complete implementation */ }
      webhook.successCount++
      webhook.lastTriggered = new Date()
    } else { /* TODO: Complete implementation */ }
      webhook.errorCount++
    }
    this.saveWebhooks()
  }
  private generateId(): string { /* TODO: Complete implementation */ }
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  // Persistence
  private saveWebhooks(): void { /* TODO: Complete implementation */ }
    try { /* TODO: Complete implementation */ }
      const webhooksArray = Array.from(this.webhooks.values())
      localStorage.setItem('cmo_webhooks', JSON.stringify(_webhooksArray))
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error('Failed to save webhooks:', error)
    }
  }
  loadWebhooks(): void { /* TODO: Complete implementation */ }
    try { /* TODO: Complete implementation */ }
      const stored = localStorage.getItem('cmo_webhooks')
      if (s_tored) { /* TODO: Complete implementation */ }
        const webhooksArray: WebhookConfig[] = JSON.parse(s_tored)
        this.webhooks.clear()
        webhooksArray.forEach(webhook => { /* TODO: Complete implementation */ }
          // Convert date strings back to Date objects
          webhook.created = new Date(webhook.created)
          if (webhook.lastTriggered) { /* TODO: Complete implementation */ }
            webhook.lastTriggered = new Date(webhook.lastTriggered)
          }
          this.webhooks.set(webhook.id, webhook)
        })
      }
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error('Failed to load webhooks:', error)
    }
  }
  // Available events
  getAvailableEvents(): WebhookEvent[] { /* TODO: Complete implementation */ }
    return [
      { type: 'alert.created', description: 'Nueva alerta creada' },
      { type: 'alert.resolved', description: 'Alerta resuelta' },
      { type: 'transit.delayed', description: 'Tránsito retrasado' },
      { type: 'precinto.violated', description: 'Violación de precinto detectada' },
      { type: 'system.error', description: 'Error del sistema' },
      { type: 'user.login', description: 'Usuario inició sesión' },
      { type: 'data.export', description: 'Exportación de datos completada' },
      { type: 'threshold.exceeded', description: 'Umbral excedido' }
    ]
  }
  // Cleanup
  cleanup(): void { /* TODO: Complete implementation */ }
    this.removeAllListeners()
    this.webhooks.clear()
    this.deliveries.clear()
    this.retryQueue = []
  }
}
// Singleton instance
export const webhooksService = new WebhooksService()
// Initialize on import
webhooksService.loadWebhooks()
