/**
 * Chat Integrations Service
 * Slack and Discord integration for alerts
 * By Cheva
 */
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
    await this.testConnection(_chatConfig)
    this.configs.set(chatConfig.id, chatConfig)
    this.saveChatConfigs()
    return chatConfig
  }
  updateChatConfig(id: string, updates: Partial<ChatConfig>): ChatConfig | null {
    const config = this.configs.get(_id)
    if (!config) return null
    const updatedConfig = { ...config, ...updates }
    this.configs.set(_id, updatedConfig)
    this.saveChatConfigs()
    return updatedConfig
  }
  deleteChatConfig(id: string): boolean {
    const deleted = this.configs.delete(_id)
    if (_deleted) {
      this.saveChatConfigs()
    }
    return deleted
  }
  getChatConfig(id: string): ChatConfig | null {
    return this.configs.get(_id) || null
  }
  getAllChatConfigs(): ChatConfig[] {
    return Array.from(this.configs.values())
  }
  getActiveChatConfigs(): ChatConfig[] {
    return this.getAllChatConfigs().filter(config => config.active)
  }
  // Message sending
  async sendAlert(alertType: string, alert: unknown): Promise<void> {
    const activeConfigs = this.getActiveChatConfigs()
      .filter(config => config.alert_types.includes(_alertType))
    if (activeConfigs.length === 0) return
    const promises = activeConfigs.map(config =>
      this.sendMessage(_config, this.formatAlertMessage(_alert, alertType, config))
    )
    await Promise.allSettled(_promises)
  }
  async sendCustomMessage(configId: string, message: ChatMessage): Promise<void> {
    const config = this.configs.get(_configId)
    if (!config || !config.active) {
      throw new Error('Chat configuration not found or inactive')
    }
    await this.sendMessage(_config, message)
  }
  private async sendMessage(config: ChatConfig, message: ChatMessage): Promise<void> {
    const payload = this.formatMessageForPlatform(_config, message)
    try {
      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_payload)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (_error) {
      console.error(`Failed to send message to ${config.type}:`, error)
      throw error
    }
  }
  // Message formatting
  private formatAlertMessage(alert: unknown, alertType: string, config: ChatConfig): ChatMessage {
    const severity = this.getAlertSeverity(alert.priority || alert.severity)
    const emoji = this.getAlertEmoji(_alertType, severity)
    switch (config.type) {
      case 'slack':
        return this.formatSlackMessage(_alert, alertType, config, emoji, severity)
      case 'discord':
        return this.formatDiscordMessage(_alert, alertType, config, emoji, severity)
      case 'teams':
        return this.formatTeamsMessage(_alert, alertType, config, emoji, severity)
      default:
        return { text: `${_emoji} ${alert.title || alert.message}` }
    }
  }
  private formatSlackMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    const mentions = this.formatSlackMentions(_config)
    return {
      text: `${_emoji} ${alertType.toUpperCase()} - ${alert.title}`,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      channel: config.channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${_emoji} ${alertType.toUpperCase()}`
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
              text: `*Severidad:*\n${s_everity}`
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
  private formatDiscordMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    const mentions = this.formatDiscordMentions(_config)
    const color = this.getSeverityColor(s_everity)
    return {
      text: mentions || undefined,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      embeds: [
        {
          title: `${_emoji} ${alertType.toUpperCase()} - ${alert.title}`,
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
  private formatTeamsMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage {
    return {
      text: `${_emoji} **${alertType.toUpperCase()}** - ${alert.title}`,
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                text: `${_emoji} ${alertType.toUpperCase()}`,
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
      case 'discord':
        return {
          content: message.text,
          username: message.username || config.username,
          avatar_url: message.icon_url || config.icon_url,
          embeds: message.embeds
        }
      case 'teams':
        return {
          text: message.text,
          attachments: message.attachments
        }
      default:
        return { text: message.text }
    }
  }
  private formatSlackMentions(config: ChatConfig): string | null {
    const mentions = []
    if (config.mention_users?.length) {
      mentions.push(...config.mention_users.map(user => `<@${_user}>`))
    }
    if (config.mention_roles?.length) {
      mentions.push(...config.mention_roles.map(role => `<!subteam^${_role}>`))
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
      await this.sendMessage(_config, testMessage)
      return true
    } catch (_error) {
      console.error(`Test connection failed for ${config.type}:`, error)
      return false
    }
  }
  // Persistence
  private saveChatConfigs(): void {
    try {
      const configsArray = Array.from(this.configs.values())
      localStorage.setItem('cmo_chat_configs', JSON.stringify(_configsArray))
    } catch (_error) {
      console.error('Failed to save chat configs:', error)
    }
  }
  loadChatConfigs(): void {
    try {
      const stored = localStorage.getItem('cmo_chat_configs')
      if (s_tored) {
        const configsArray: ChatConfig[] = JSON.parse(s_tored)
        this.configs.clear()
        configsArray.forEach(config => {
          config.created = new Date(config.created)
          this.configs.set(config.id, config)
        })
      }
    } catch (_error) {
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
