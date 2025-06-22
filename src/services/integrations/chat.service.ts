/**
 * Chat Integrations Service
 * Slack and Discord integration for alerts
 * By Cheva
 */
export interface ChatConfig { /* TODO: Complete implementation */ }
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
export interface ChatMessage { /* TODO: Complete implementation */ }
  text: string
  blocks?: unknown[]
  embeds?: unknown[]
  attachments?: unknown[]
  username?: string
  icon_url?: string
  channel?: string
}
class ChatService { /* TODO: Complete implementation */ }
  private configs = new Map<string, ChatConfig>()
  // Configuration management
  async createChatConfig(config: Omit<ChatConfig, 'id' | 'created'>): Promise<ChatConfig> { /* TODO: Complete implementation */ }
    const chatConfig: ChatConfig = { /* TODO: Complete implementation */ }
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
  updateChatConfig(id: string, updates: Partial<ChatConfig>): ChatConfig | null { /* TODO: Complete implementation */ }
    const config = this.configs.get(_id)
    if (!config) return null
    const updatedConfig = { ...config, ...updates }
    this.configs.set(_id, updatedConfig)
    this.saveChatConfigs()
    return updatedConfig
  }
  deleteChatConfig(id: string): boolean { /* TODO: Complete implementation */ }
    const deleted = this.configs.delete(_id)
    if (_deleted) { /* TODO: Complete implementation */ }
      this.saveChatConfigs()
    }
    return deleted
  }
  getChatConfig(id: string): ChatConfig | null { /* TODO: Complete implementation */ }
    return this.configs.get(_id) || null
  }
  getAllChatConfigs(): ChatConfig[] { /* TODO: Complete implementation */ }
    return Array.from(this.configs.values())
  }
  getActiveChatConfigs(): ChatConfig[] { /* TODO: Complete implementation */ }
    return this.getAllChatConfigs().filter(config => config.active)
  }
  // Message sending
  async sendAlert(alertType: string, alert: unknown): Promise<void> { /* TODO: Complete implementation */ }
    const activeConfigs = this.getActiveChatConfigs()
      .filter(config => config.alert_types.includes(_alertType))
    if (activeConfigs.length === 0) return
    const promises = activeConfigs.map(config =>
      this.sendMessage(_config, this.formatAlertMessage(_alert, alertType, config))
    )
    await Promise.allSettled(_promises)
  }
  async sendCustomMessage(configId: string, message: ChatMessage): Promise<void> { /* TODO: Complete implementation */ }
    const config = this.configs.get(_configId)
    if (!config || !config.active) { /* TODO: Complete implementation */ }
      throw new Error('Chat configuration not found or inactive')
    }
    await this.sendMessage(_config, message)
  }
  private async sendMessage(config: ChatConfig, message: ChatMessage): Promise<void> { /* TODO: Complete implementation */ }
    const payload = this.formatMessageForPlatform(_config, message)
    try { /* TODO: Complete implementation */ }
      const response = await fetch(config.webhook_url, { /* TODO: Complete implementation */ }
        method: 'POST',
        headers: { /* TODO: Complete implementation */ }
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_payload)
      })
      if (!response.ok) { /* TODO: Complete implementation */ }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error(`Failed to send message to ${config.type}:`, error)
      throw error
    }
  }
  // Message formatting
  private formatAlertMessage(alert: unknown, alertType: string, config: ChatConfig): ChatMessage { /* TODO: Complete implementation */ }
    const severity = this.getAlertSeverity(alert.priority || alert.severity)
    const emoji = this.getAlertEmoji(_alertType, severity)
    switch (config.type) { /* TODO: Complete implementation */ }
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
  private formatSlackMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage { /* TODO: Complete implementation */ }
    const mentions = this.formatSlackMentions(_config)
    return { /* TODO: Complete implementation */ }
      text: `${_emoji} ${alertType.toUpperCase()} - ${alert.title}`,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      channel: config.channel,
      blocks: [
        { /* TODO: Complete implementation */ }
          type: 'header',
          text: { /* TODO: Complete implementation */ }
            type: 'plain_text',
            text: `${_emoji} ${alertType.toUpperCase()}`
          }
        },
        { /* TODO: Complete implementation */ }
          type: 'section',
          fields: [
            { /* TODO: Complete implementation */ }
              type: 'mrkdwn',
              text: `*Título:*\n${alert.title}`
            },
            { /* TODO: Complete implementation */ }
              type: 'mrkdwn',
              text: `*Severidad:*\n${s_everity}`
            },
            { /* TODO: Complete implementation */ }
              type: 'mrkdwn',
              text: `*Tiempo:*\n${new Date(alert.timestamp || Date.now()).toLocaleString()}`
            },
            { /* TODO: Complete implementation */ }
              type: 'mrkdwn',
              text: `*Ubicación:*\n${alert.location || 'N/A'}`
            }
          ]
        },
        { /* TODO: Complete implementation */ }
          type: 'section',
          text: { /* TODO: Complete implementation */ }
            type: 'mrkdwn',
            text: `*Descripción:*\n${alert.message || alert.description}`
          }
        },
        ...(mentions ? [{ /* TODO: Complete implementation */ }
          type: 'section',
          text: { /* TODO: Complete implementation */ }
            type: 'mrkdwn',
            text: mentions
          }
        }] : []),
        { /* TODO: Complete implementation */ }
          type: 'actions',
          elements: [
            { /* TODO: Complete implementation */ }
              type: 'button',
              text: { /* TODO: Complete implementation */ }
                type: 'plain_text',
                text: 'Ver en CMO'
              },
              style: 'primary',
              url: `${window.location.origin}/alertas/${alert.id}`
            },
            { /* TODO: Complete implementation */ }
              type: 'button',
              text: { /* TODO: Complete implementation */ }
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
  private formatDiscordMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage { /* TODO: Complete implementation */ }
    const mentions = this.formatDiscordMentions(_config)
    const color = this.getSeverityColor(s_everity)
    return { /* TODO: Complete implementation */ }
      text: mentions || undefined,
      username: config.username || 'CMO Alerts',
      icon_url: config.icon_url,
      embeds: [
        { /* TODO: Complete implementation */ }
          title: `${_emoji} ${alertType.toUpperCase()} - ${alert.title}`,
          description: alert.message || alert.description,
          color: color,
          fields: [
            { /* TODO: Complete implementation */ }
              name: 'Severidad',
              value: severity,
              inline: true
            },
            { /* TODO: Complete implementation */ }
              name: 'Tiempo',
              value: new Date(alert.timestamp || Date.now()).toLocaleString(),
              inline: true
            },
            { /* TODO: Complete implementation */ }
              name: 'Ubicación',
              value: alert.location || 'N/A',
              inline: true
            }
          ],
          footer: { /* TODO: Complete implementation */ }
            text: 'CMO - Centro de Monitoreo',
            icon_url: config.icon_url
          },
          timestamp: new Date(alert.timestamp || Date.now()).toISOString()
        }
      ]
    }
  }
  private formatTeamsMessage(alert: unknown, alertType: string, config: ChatConfig, emoji: string, severity: string): ChatMessage { /* TODO: Complete implementation */ }
    return { /* TODO: Complete implementation */ }
      text: `${_emoji} **${alertType.toUpperCase()}** - ${alert.title}`,
      attachments: [
        { /* TODO: Complete implementation */ }
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: { /* TODO: Complete implementation */ }
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              { /* TODO: Complete implementation */ }
                type: 'TextBlock',
                text: `${_emoji} ${alertType.toUpperCase()}`,
                weight: 'Bolder',
                size: 'Medium'
              },
              { /* TODO: Complete implementation */ }
                type: 'FactSet',
                facts: [
                  { title: 'Título', value: alert.title },
                  { title: 'Severidad', value: severity },
                  { title: 'Tiempo', value: new Date(alert.timestamp || Date.now()).toLocaleString() },
                  { title: 'Ubicación', value: alert.location || 'N/A' }
                ]
              },
              { /* TODO: Complete implementation */ }
                type: 'TextBlock',
                text: alert.message || alert.description,
                wrap: true
              }
            ],
            actions: [
              { /* TODO: Complete implementation */ }
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
  private formatMessageForPlatform(config: ChatConfig, message: ChatMessage): unknown { /* TODO: Complete implementation */ }
    switch (config.type) { /* TODO: Complete implementation */ }
      case 'slack': { /* TODO: Complete implementation */ }
  return { /* TODO: Complete implementation */ }
          text: message.text,
          username: message.username || config.username,
          icon_url: message.icon_url || config.icon_url,
          channel: message.channel || config.channel,
          blocks: message.blocks
        }
      case 'discord':
        return { /* TODO: Complete implementation */ }
          content: message.text,
          username: message.username || config.username,
          avatar_url: message.icon_url || config.icon_url,
          embeds: message.embeds
        }
      case 'teams':
        return { /* TODO: Complete implementation */ }
          text: message.text,
          attachments: message.attachments
        }
      default:
        return { text: message.text }
    }
  }
  private formatSlackMentions(config: ChatConfig): string | null { /* TODO: Complete implementation */ }
    const mentions = []
    if (config.mention_users?.length) { /* TODO: Complete implementation */ }
      mentions.push(...config.mention_users.map(user => `<@${_user}>`))
    }
    if (config.mention_roles?.length) { /* TODO: Complete implementation */ }
      mentions.push(...config.mention_roles.map(role => `<!subteam^${_role}>`))
    }
    return mentions.length > 0 ? mentions.join(' ') : null
  }
  private formatDiscordMentions(config: ChatConfig): string | null { /* TODO: Complete implementation */ }
    const mentions = []
    if (config.mention_users?.length) { /* TODO: Complete implementation */ }
      mentions.push(...config.mention_users.map(user => `<@${_user}>`))
    }
    if (config.mention_roles?.length) { /* TODO: Complete implementation */ }
      mentions.push(...config.mention_roles.map(role => `<@&${_role}>`))
    }
    return mentions.length > 0 ? mentions.join(' ') : null
  }
  private getAlertSeverity(priority: string): string { /* TODO: Complete implementation */ }
    const severityMap: Record<string, string> = { /* TODO: Complete implementation */ }
      'critical': 'CRÍTICA',
      'high': 'ALTA',
      'medium': 'MEDIA',
      'low': 'BAJA'
    }
    return severityMap[priority] || 'DESCONOCIDA'
  }
  private getAlertEmoji(alertType: string, severity: string): string { /* TODO: Complete implementation */ }
    if (severity === 'CRÍTICA') return '🚨'
    const emojiMap: Record<string, string> = { /* TODO: Complete implementation */ }
      'alert.created': '⚠️',
      'transit.delayed': '🚛',
      'precinto.violated': '🔓',
      'system.error': '💥',
      'threshold.exceeded': '📊'
    }
    return emojiMap[alertType] || '📢'
  }
  private getSeverityColor(severity: string): number { /* TODO: Complete implementation */ }
    const colorMap: Record<string, number> = { /* TODO: Complete implementation */ }
      'CRÍTICA': 0xFF0000, // Red
      'ALTA': 0xFF8C00,    // Orange
      'MEDIA': 0xFFD700,   // Gold
      'BAJA': 0x32CD32     // Green
    }
    return colorMap[severity] || 0x808080; // Gray
  }
  // Connection testing
  async testConnection(config: ChatConfig): Promise<boolean> { /* TODO: Complete implementation */ }
    const testMessage: ChatMessage = { /* TODO: Complete implementation */ }
      text: `🧪 Test de conexión desde CMO - ${new Date().toLocaleString()}`
    }
    try { /* TODO: Complete implementation */ }
      await this.sendMessage(_config, testMessage)
      return true
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error(`Test connection failed for ${config.type}:`, error)
      return false
    }
  }
  // Persistence
  private saveChatConfigs(): void { /* TODO: Complete implementation */ }
    try { /* TODO: Complete implementation */ }
      const configsArray = Array.from(this.configs.values())
      localStorage.setItem('cmo_chat_configs', JSON.stringify(_configsArray))
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error('Failed to save chat configs:', error)
    }
  }
  loadChatConfigs(): void { /* TODO: Complete implementation */ }
    try { /* TODO: Complete implementation */ }
      const stored = localStorage.getItem('cmo_chat_configs')
      if (s_tored) { /* TODO: Complete implementation */ }
        const configsArray: ChatConfig[] = JSON.parse(s_tored)
        this.configs.clear()
        configsArray.forEach(config => { /* TODO: Complete implementation */ }
          config.created = new Date(config.created)
          this.configs.set(config.id, config)
        })
      }
    } catch (_error) { /* TODO: Complete implementation */ }
      console.error('Failed to load chat configs:', error)
    }
  }
  private generateId(): string { /* TODO: Complete implementation */ }
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  // Available alert types
  getAvailableAlertTypes(): Array<{ value: string; label: string }> { /* TODO: Complete implementation */ }
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
