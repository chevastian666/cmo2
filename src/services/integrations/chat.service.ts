/**
 * Chat Integrations Service
 * Slack and Discord integration for alerts
 * By Cheva
 */

// Alert data structure for chat messages
export interface ChatAlert {
  id?: string
  title: string
  message?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  severity?: 'baja' | 'media' | 'alta' | 'critica'
  timestamp?: number
  location?: string
  precinto_id?: string
  alert_type?: string
  [key: string]: unknown
}
export interface ChatConfig {
  id: string
  name: string
  type: 'slack' | 'discord' | 'teams'
  webhook_url: string
  channel?: string
  username?: string
  icon_url?: string
  active: boolean
  alert_types: string[]
  mention_users?: string[]
  mention_roles?: string[]
  created: Date
}
export interface ChatMessage {
  text: string
  blocks?: unknown[]
  embeds?: unknown[]
  attachments?: unknown[]
  username?: string
  icon_url?: string
  channel?: string
}
class ChatService {
  private configs = new Map<string, ChatConfig>()
  // Configuration management
  async createChatConfig(config: Omit<ChatConfig, 'id' | 'created'>): Promise<ChatConfig> {
    const chatConfig: ChatConfig = {
      ...config,
      id: this.generateId(),
      created: new Date()
    }
    // Test the webhook
    await this.testConnection(chatConfig)
    this.configs.set(chatConfig.id, chatConfig)
    this.saveChatConfigs()
    return chatConfig
  }
  updateChatConfig(id: string, updates: Partial<ChatConfig>): ChatConfig | null {
    const config = this.configs.get(id)
    if (!config) return null
    const updatedConfig = { ...config, ...updates }
    this.configs.set(id, updatedConfig)
    this.saveChatConfigs()
    return updatedConfig
  }
  deleteChatConfig(id: string): boolean {
    const deleted = this.configs.delete(id)
    if (deleted) {
      this.saveChatConfigs()
    }
    return deleted
  }
  getChatConfig(id: string): ChatConfig | null {
    return this.configs.get(id) || null
  }
  getAllChatConfigs(): ChatConfig[] {
    return Array.from(this.configs.values())
  }
  getActiveChatConfigs(): ChatConfig[] {
    return this.getAllChatConfigs().filter(config => config.active)
  }
  // Message sending
  async sendAlert(alertType: string, alert: ChatAlert): Promise<void> {
    const activeConfigs = this.getActiveChatConfigs()
      .filter(config => config.alert_types.includes(alertType))
    if (activeConfigs.length === 0) return
    const promises = activeConfigs.map(config =>
      this.sendMessage(config, this.formatAlertMessage(alert as ChatAlert, alertType, config))
    )
    await Promise.allSettled(promises)
  }
  async sendCustomMessage(configId: string, message: ChatMessage): Promise<void> {
    const config = this.configs.get(configId)
    if (!config || !config.active) {
      throw new Error('Chat configuration not found or inactive')
    }
    await this.sendMessage(config, message)
  }
  private async sendMessage(config: ChatConfig, message: ChatMessage): Promise<void> {
    const payload = this.formatMessageForPlatform(config, message)
    try {
      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Failed to send message to ${config.type}:`, error)
      throw error
    }
  }
  // Message formatting
  private formatAlertMessage(alert: ChatAlert, alertType: string, config: ChatConfig): ChatMessage {
    const severity = this.getAlertSeverity(alert.priority || alert.severity)
    const emoji = this.getAlertEmoji(alertType, severity)
    switch (config.type) {
      case 'slack':
        return this.formatSlackMessage(alert, alertType, config, emoji, severity)
      case 'discord':
        return this.formatDiscordMessage(alert, alertType, config, emoji, severity)
      case 'teams':
        return this.formatTeamsMessage(alert, alertType, config, emoji, severity)
      default:
        return { text: `${emoji} ${alert.title || alert.message}` }
    }
  }
  private formatSlackMessage(alert: ChatAlert, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    const mentions = this.formatSlackMentions(config)
    return {
      text: `${emoji} ${alertType.toUpperCase()} - ${alert.title}`,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      channel: config.channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${alertType.toUpperCase()}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Título:*\n${alert.title}`
            },
            {
              type: 'mrkdwn',
              text: `*Severidad:*\n${severity}`
            },
            {
              type: 'mrkdwn',
              text: `*Tiempo:*\n${new Date(alert.timestamp || Date.now()).toLocaleString()}`
            },
            {
              type: 'mrkdwn',
              text: `*Ubicación:*\n${alert.location || 'N/A'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Descripción:*\n${alert.message || alert.description}`
          }
        },
        ...(mentions ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: mentions
          }
        }] : []),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Ver en CMO'
              },
              style: 'primary',
              url: `${window.location.origin}/alertas/${alert.id}`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Confirmar'
              },
              style: 'danger',
              value: alert.id
            }
          ]
        }
      ]
    }
  }
  private formatDiscordMessage(alert: ChatAlert, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    const mentions = this.formatDiscordMentions(config)
    const color = this.getSeverityColor(severity)
    return {
      text: mentions || undefined,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      embeds: [
        {
          title: `${emoji} ${alertType.toUpperCase()} - ${alert.title}`,
          description: alert.message || alert.description,
          color: color,
          fields: [
            {
              name: 'Severidad',
              value: severity,
              inline: true
            },
            {
              name: 'Tiempo',
              value: new Date(alert.timestamp || Date.now()).toLocaleString(),
              inline: true
            },
            {
              name: 'Ubicación',
              value: alert.location || 'N/A',
              inline: true
            }
          ],
          footer: {
            text: 'CMO - Centro de Monitoreo',
            icon_url: config.icon_url
          },
          timestamp: new Date(alert.timestamp || Date.now()).toISOString()
        }
      ]
    }
  }
  private formatTeamsMessage(alert: ChatAlert, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    return {
      text: `${emoji} **${alertType.toUpperCase()}** - ${alert.title}`,
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                text: `${emoji} ${alertType.toUpperCase()}`,
                weight: 'Bolder',
                size: 'Medium'
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Título', value: alert.title },
                  { title: 'Severidad', value: severity },
                  { title: 'Tiempo', value: new Date(alert.timestamp || Date.now()).toLocaleString() },
                  { title: 'Ubicación', value: alert.location || 'N/A' }
                ]
              },
              {
                type: 'TextBlock',
                text: alert.message || alert.description,
                wrap: true
              }
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'Ver en CMO',
                url: `${window.location.origin}/alertas/${alert.id}`
              }
            ]
          }
        }
      ]
    }
  }
  // Helper methods
  private formatMessageForPlatform(config: ChatConfig, message: ChatMessage): unknown {
    switch (config.type) {
      case 'slack': {
        return {
          text: message.text,
          username: message.username || config.username,
          icon_url: message.icon_url || config.icon_url,
          channel: message.channel || config.channel,
          blocks: message.blocks
        }
      }
      case 'discord': {
        return {
          content: message.text,
          username: message.username || config.username,
          avatar_url: message.icon_url || config.icon_url,
          embeds: message.embeds
        }
      }
      case 'teams': {
        return {
          text: message.text,
          attachments: message.attachments
        }
      }
      default: {
        return { text: message.text }
      }
    }
  }
  private formatSlackMentions(config: ChatConfig): string | null {
    const mentions = []
    if (config.mention_users?.length) {
      mentions.push(...config.mention_users.map(user => `<@${user}>`))
    }
    if (config.mention_roles?.length) {
      mentions.push(...config.mention_roles.map(role => `<!subteam^${role}>`))
    }
    return mentions.length > 0 ? mentions.join(' ') : null
  }
  private formatDiscordMentions(config: ChatConfig): string | null {
    const mentions = []
    if (config.mention_users?.length) {
      mentions.push(...config.mention_users.map(user => `<@${_user}>`))
    }
    if (config.mention_roles?.length) {
      mentions.push(...config.mention_roles.map(role => `<@&${_role}>`))
    }
    return mentions.length > 0 ? mentions.join(' ') : null
  }
  private getAlertSeverity(priority: string): string {
    const severityMap: Record<string, string> = {
      'critical': 'CRÍTICA',
      'high': 'ALTA',
      'medium': 'MEDIA',
      'low': 'BAJA'
    }
    return severityMap[priority] || 'DESCONOCIDA'
  }
  private getAlertEmoji(alertType: string, severity: string): string {
    if (severity === 'CRÍTICA') return '🚨'
    const emojiMap: Record<string, string> = {
      'alert.created': '⚠️',
      'transit.delayed': '🚛',
      'precinto.violated': '🔓',
      'system.error': '💥',
      'threshold.exceeded': '📊'
    }
    return emojiMap[alertType] || '📢'
  }
  private getSeverityColor(severity: string): number {
    const colorMap: Record<string, number> = {
      'CRÍTICA': 0xFF0000, // Red
      'ALTA': 0xFF8C00,    // Orange
      'MEDIA': 0xFFD700,   // Gold
      'BAJA': 0x32CD32     // Green
    }
    return colorMap[severity] || 0x808080; // Gray
  }
  // Connection testing
  async testConnection(config: ChatConfig): Promise<boolean> {
    const testMessage: ChatMessage = {
      text: `🧪 Test de conexión desde CMO - ${new Date().toLocaleString()}`
    }
    try {
      await this.sendMessage(config, testMessage)
      return true
    } catch (error) {
      console.error(`Test connection failed for ${config.type}:`, error)
      return false
    }
  }
  // Persistence
  private saveChatConfigs(): void {
    try {
      const configsArray = Array.from(this.configs.values())
      localStorage.setItem('cmo_chat_configs', JSON.stringify(configsArray))
    } catch (error) {
      console.error('Failed to save chat configs:', error)
    }
  }
  loadChatConfigs(): void {
    try {
      const stored = localStorage.getItem('cmo_chat_configs')
      if (stored) {
        const configsArray: ChatConfig[] = JSON.parse(stored)
        this.configs.clear()
        configsArray.forEach(config => {
          config.created = new Date(config.created)
          this.configs.set(config.id, config)
        })
      }
    } catch (error) {
      console.error('Failed to load chat configs:', error)
    }
  }
  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  // Available alert types
  getAvailableAlertTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'alert.created', label: 'Nueva Alerta' },
      { value: 'alert.resolved', label: 'Alerta Resuelta' },
      { value: 'transit.delayed', label: 'Tránsito Retrasado' },
      { value: 'precinto.violated', label: 'Violación de Precinto' },
      { value: 'system.error', label: 'Error del Sistema' },
      { value: 'threshold.exceeded', label: 'Umbral Excedido' }
    ]
  }
}
// Singleton instance
export const chatService = new ChatService()
// Initialize on import
chatService.loadChatConfigs()
