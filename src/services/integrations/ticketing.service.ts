/**
 * Ticketing Systems Integration Service
 * Jira, ServiceNow, and other ticketing platforms
 * By Cheva
 */

export interface TicketingConfig {
  id: string
  name: string
  type: 'jira' | 'servicenow' | 'freshdesk' | 'zendesk' | 'generic'
  base_url: string
  authentication: {
    type: 'basic' | 'bearer' | 'api_key' | 'oauth2'
    username?: string
    password?: string
    token?: string
    api_key?: string
    client_id?: string
    client_secret?: string
  }
  default_project?: string
  default_assignee?: string
  custom_fields?: Record<string, unknown>
  auto_create_tickets: boolean
  alert_types: string[]
  active: boolean
  created: Date
}

export interface TicketData {
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  type: 'Bug' | 'Task' | 'Story' | 'Incident' | 'Problem' | 'Change'
  project?: string
  assignee?: string
  labels?: string[]
  custom_fields?: Record<string, unknown>
  attachments?: Array<{
    name: string
    content: string
    mime_type: string
  }>
}

export interface CreatedTicket {
  id: string
  key: string
  url: string
  status: string
  created_at: Date
}

class TicketingService {
  private configs = new Map<string, TicketingConfig>()
  private ticketCache = new Map<string, CreatedTicket>()
  // Configuration management
  async createTicketingConfig(config: Omit<TicketingConfig, 'id' | 'created'>): Promise<TicketingConfig> {
    const ticketingConfig: TicketingConfig = {
      ...config,
      id: this.generateId(),
      created: new Date()
    }
    // Test the connection
    await this.testConnection(ticketingConfig)
    this.configs.set(ticketingConfig.id, ticketingConfig)
    this.saveTicketingConfigs()
    return ticketingConfig
  }

  updateTicketingConfig(id: string, updates: Partial<TicketingConfig>): TicketingConfig | null {
    const config = this.configs.get(id)
    if (!config) return null
    const updatedConfig = { ...config, ...updates }
    this.configs.set(id, updatedConfig)
    this.saveTicketingConfigs()
    return updatedConfig
  }

  deleteTicketingConfig(id: string): boolean {
    const deleted = this.configs.delete(id)
    if (deleted) {
      this.saveTicketingConfigs()
    }
    return deleted
  }

  getTicketingConfig(id: string): TicketingConfig | null {
    return this.configs.get(id) || null
  }

  getAllTicketingConfigs(): TicketingConfig[] {
    return Array.from(this.configs.values())
  }

  getActiveTicketingConfigs(): TicketingConfig[] {
    return this.getAllTicketingConfigs().filter(config => config.active)
  }

  // Ticket creation
  async createTicketForAlert(alertType: string, alert: unknown): Promise<CreatedTicket[]> {
    const activeConfigs = this.getActiveTicketingConfigs()
      .filter(config => 
        config.auto_create_tickets && 
        config.alert_types.includes(alertType)
      )
    if (activeConfigs.length === 0) return []
    const promises = activeConfigs.map(async config => {
      const ticketData = this.formatAlertAsTicket(alert, alertType, config)
      return this.createTicket(config, ticketData)
    })
    const results = await Promise.allSettled(promises)
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<CreatedTicket>).value)
  }

  async createTicket(config: TicketingConfig, ticketData: TicketData): Promise<CreatedTicket> {
    const payload = this.formatTicketForPlatform(config, ticketData)
    const headers = this.getAuthHeaders(config)
    try {
      const response = await fetch(this.getCreateTicketUrl(config), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()
      const ticket = this.parseTicketResponse(config, responseData)
      // Cache the ticket
      this.ticketCache.set(ticket.id, ticket)
      return ticket
    } catch (error) {
      console.error(`Failed to create ticket in ${config.type}:`, error)
      throw error
    }
  }

  // Ticket updates
  async updateTicket(configId: string, _ticketId: string, updates: Partial<TicketData>): Promise<void> {
    const config = this.configs.get(configId)
    if (!config) {
      throw new Error('Ticketing configuration not found')
    }

    const payload = this.formatTicketForPlatform(config, updates)
    const headers = this.getAuthHeaders(config)
    try {
      const response = await fetch(this.getUpdateTicketUrl(config, ticketId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error(`Failed to update ticket ${ticketId}:`, error)
      throw error
    }
  }

  // Platform-specific implementations
  private formatTicketForPlatform(config: TicketingConfig, ticketData: Partial<TicketData>): unknown {
    switch (config.type) {
      case 'jira': {
  return this.formatJiraTicket(config, ticketData)
      case 'servicenow': {
  return this.formatServiceNowTicket(config, ticketData)
      case 'freshdesk': {
  return this.formatFreshdeskTicket(config, ticketData)
      case 'zendesk': {
  return this.formatZendeskTicket(config, ticketData)
      default:
        return ticketData
    }
  }

  private formatJiraTicket(config: TicketingConfig, ticketData: Partial<TicketData>): unknown {
    const priorityMap: Record<string, string> = {
      'Critical': '1',
      'High': '2',
      'Medium': '3',
      'Low': '4'
    }
    const issueTypeMap: Record<string, string> = {
      'Bug': 'Bug',
      'Task': 'Task',
      'Story': 'Story',
      'Incident': 'Bug',
      'Problem': 'Bug',
      'Change': 'Task'
    }
    return {
      fields: {
        project: { key: ticketData.project || config.default_project },
        summary: ticketData.title,
        description: ticketData.description,
        issuetype: { name: issueTypeMap[ticketData.type || 'Task'] },
        priority: ticketData.priority ? { id: priorityMap[ticketData.priority] } : undefined,
        assignee: ticketData.assignee ? { name: ticketData.assignee } : 
                  config.default_assignee ? { name: config.default_assignee } : undefined,
        labels: ticketData.labels,
        ...config.custom_fields,
        ...ticketData.custom_fields
      }
    }
  }

  private formatServiceNowTicket(config: TicketingConfig, ticketData: Partial<TicketData>): unknown {
    const priorityMap: Record<string, string> = {
      'Critical': '1',
      'High': '2',
      'Medium': '3',
      'Low': '4'
    }
    return {
      short_description: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority ? priorityMap[ticketData.priority] : '3',
      assigned_to: ticketData.assignee || config.default_assignee,
      category: 'Hardware',
      subcategory: 'Monitor',
      ...config.custom_fields,
      ...ticketData.custom_fields
    }
  }

  private formatFreshdeskTicket(config: TicketingConfig, ticketData: Partial<TicketData>): unknown {
    const priorityMap: Record<string, number> = {
      'Critical': 4,
      'High': 3,
      'Medium': 2,
      'Low': 1
    }
    return {
      subject: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority ? priorityMap[ticketData.priority] : 2,
      status: 2, // Open
      source: 2, // Email
      tags: ticketData.labels,
      ...config.custom_fields,
      ...ticketData.custom_fields
    }
  }

  private formatZendeskTicket(config: TicketingConfig, ticketData: Partial<TicketData>): unknown {
    const priorityMap: Record<string, string> = {
      'Critical': 'urgent',
      'High': 'high',
      'Medium': 'normal',
      'Low': 'low'
    }
    return {
      ticket: {
        subject: ticketData.title,
        comment: { body: ticketData.description },
        priority: ticketData.priority ? priorityMap[ticketData.priority] : 'normal',
        assignee_id: ticketData.assignee || config.default_assignee,
        tags: ticketData.labels,
        custom_fields: ticketData.custom_fields
      }
    }
  }

  // URL generation
  private getCreateTicketUrl(config: TicketingConfig): string {
    switch (config.type) {
      case 'jira':
        return `${config.base_url}/rest/api/2/issue`
      case 'servicenow':
        return `${config.base_url}/api/now/table/incident`
      case 'freshdesk':
        return `${config.base_url}/api/v2/tickets`
      case 'zendesk':
        return `${config.base_url}/api/v2/tickets.json`
      default:
        return `${config.base_url}/tickets`
    }
  }

  private getUpdateTicketUrl(config: TicketingConfig, ticketId: string): string {
    switch (config.type) {
      case 'jira':
        return `${config.base_url}/rest/api/2/issue/${ticketId}`
      case 'servicenow':
        return `${config.base_url}/api/now/table/incident/${ticketId}`
      case 'freshdesk':
        return `${config.base_url}/api/v2/tickets/${ticketId}`
      case 'zendesk':
        return `${config.base_url}/api/v2/tickets/${ticketId}.json`
      default:
        return `${config.base_url}/tickets/${ticketId}`
    }
  }

  // Authentication
  private getAuthHeaders(config: TicketingConfig): Record<string, string> {
    const auth = config.authentication
    switch (auth.type) {
      case 'basic': {

        const credentials = btoa(`${auth.username}:${auth.password}`)
        return { 'Authorization': `Basic ${credentials}` }
      case 'bearer':
        return { 'Authorization': `Bearer ${auth.token}` }
      case 'api_key':
        if (config.type === 'freshdesk') {
          const credentials = btoa(`${auth.api_key}:X`)
          return { 'Authorization': `Basic ${credentials}` }
        }
        return { 'X-API-Key': auth.api_key! }
      default:
        return {}
    }
  }

  // Response parsing
  private parseTicketResponse(config: TicketingConfig, response: unknown): CreatedTicket {
    switch (config.type) {
      case 'jira':
        return {
          id: response.id,
          key: response.key,
          url: `${config.base_url}/browse/${response.key}`,
          status: 'Open',
          created_at: new Date()
        }
      case 'servicenow':
        return {
          id: response.result.sys_id,
          key: response.result.number,
          url: `${config.base_url}/incident.do?sys_id=${response.result.sys_id}`,
          status: response.result.state,
          created_at: new Date()
        }
      case 'freshdesk':
        return {
          id: response.id.toString(),
          key: `#${response.id}`,
          url: `${config.base_url}/a/tickets/${response.id}`,
          status: this.getFreshdeskStatus(response.status),
          created_at: new Date(response.created_at)
        }
      case 'zendesk':
        return {
          id: response.ticket.id.toString(),
          key: `#${response.ticket.id}`,
          url: `${config.base_url}/agent/tickets/${response.ticket.id}`,
          status: response.ticket.status,
          created_at: new Date(response.ticket.created_at)
        }
      default:
        return {
          id: response.id || response.ticket_id,
          key: response.key || response.number,
          url: response.url || `${config.base_url}/tickets/${response.id}`,
          status: response.status || 'Open',
          created_at: new Date()
        }
    }
  }

  private getFreshdeskStatus(statusCode: number): string {
    const statusMap: Record<number, string> = {
      2: 'Open',
      3: 'Pending',
      4: 'Resolved',
      5: 'Closed'
    }
    return statusMap[statusCode] || 'Unknown'
  }

  // Alert formatting
  private formatAlertAsTicket(alert: unknown, alertType: string, config: TicketingConfig): TicketData {
    const priority = this.mapAlertPriority(alert.priority || alert.severity)
    const type = this.mapAlertType(alertType)
    return {
      title: `[CMO] ${alertType.toUpperCase()}: ${alert.title}`,
      description: this.buildAlertDescription(alert, alertType),
      priority,
      type,
      project: config.default_project,
      assignee: config.default_assignee,
      labels: ['cmo', 'automated', alertType.replace('.', '-')],
      custom_fields: {
        alert_id: alert.id,
        alert_type: alertType,
        source_system: 'CMO',
        created_by: 'system'
      }
    }
  }

  private buildAlertDescription(alert: unknown, alertType: string): string {
    const sections = [
      `**Tipo de Alerta:** ${alertType}`,
      `**Descripción:** ${alert.message || alert.description}`,
      `**Fecha/Hora:** ${new Date(alert.timestamp || Date.now()).toLocaleString()}`,
      `**Ubicación:** ${alert.location || 'N/A'}`,
      `**ID de Alerta:** ${alert.id}`,
      '',
      '**Detalles Adicionales:**'
    ]
    // Add custom fields
    Object.entries(alert).forEach(([key, value]) => {
      if (!['id', 'title', 'message', 'description', 'timestamp', 'location'].includes(key)) {
        sections.push(`- ${key}: ${value}`)
      }
    })
    sections.push('', '---', '*Ticket creado automáticamente por CMO*')
    return sections.join('\n')
  }

  private mapAlertPriority(alertPriority: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const priorityMap: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    }
    return priorityMap[alertPriority] || 'Medium'
  }

  private mapAlertType(alertType: string): 'Bug' | 'Task' | 'Story' | 'Incident' | 'Problem' | 'Change' {
    const typeMap: Record<string, 'Bug' | 'Task' | 'Story' | 'Incident' | 'Problem' | 'Change'> = {
      'alert.created': 'Incident',
      'system.error': 'Bug',
      'precinto.violated': 'Incident',
      'transit.delayed': 'Problem',
      'threshold.exceeded': 'Task'
    }
    return typeMap[alertType] || 'Task'
  }

  // Connection testing
  async testConnection(config: TicketingConfig): Promise<boolean> {
    const headers = this.getAuthHeaders(config)
    try {
      // Test with a simple GET request to projects or users endpoint
      const testUrl = this.getTestUrl(config)
      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      })
      return response.ok
    } catch (error) {
      console.error(`Test connection failed for ${config.type}:`, error)
      return false
    }
  }

  private getTestUrl(config: TicketingConfig): string {
    switch (config.type) {
      case 'jira':
        return `${config.base_url}/rest/api/2/myself`
      case 'servicenow':
        return `${config.base_url}/api/now/table/sys_user?sysparm_limit=1`
      case 'freshdesk':
        return `${config.base_url}/api/v2/tickets?per_page=1`
      case 'zendesk':
        return `${config.base_url}/api/v2/users/me.json`
      default:
        return config.base_url
    }
  }

  // Persistence
  private saveTicketingConfigs(): void {
    try {
      const configsArray = Array.from(this.configs.values())
      // Remove sensitive data before saving
      const sanitizedConfigs = configsArray.map(config => ({
        ...config,
        authentication: {
          ...config.authentication,
          password: config.authentication.password ? '***' : undefined,
          token: config.authentication.token ? '***' : undefined,
          api_key: config.authentication.api_key ? '***' : undefined,
          client_secret: config.authentication.client_secret ? '***' : undefined
        }
      }))
      localStorage.setItem('cmo_ticketing_configs', JSON.stringify(sanitizedConfigs))
    } catch (error) {
      console.error('Failed to save ticketing configs:', error)
    }
  }

  loadTicketingConfigs(): void {
    try {
      const stored = localStorage.getItem('cmo_ticketing_configs')
      if (stored) {
        const configsArray: TicketingConfig[] = JSON.parse(stored)
        this.configs.clear()
        configsArray.forEach(config => {
          config.created = new Date(config.created)
          this.configs.set(config.id, config)
        })
      }
    } catch (error) {
      console.error('Failed to load ticketing configs:', error)
    }
  }

  private generateId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get created tickets
  getCreatedTickets(): CreatedTicket[] {
    return Array.from(this.ticketCache.values())
  }
}

// Singleton instance
export const ticketingService = new TicketingService()
// Initialize on import
ticketingService.loadTicketingConfigs()
}