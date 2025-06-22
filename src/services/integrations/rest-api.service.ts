/**
 * REST API Service with Swagger Documentation
 * Express.js server with OpenAPI specification
 * By Cheva
 */
export interface APIEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  parameters?: APIParameter[]
  responses: APIResponse[]
  authentication: 'none' | 'api_key' | 'bearer' | 'basic'
  rateLimit?: {
    requests: number
    window: number; // seconds
  }
  tags: string[]
  enabled: boolean
}
export interface APIParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'body'
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  example?: unknown
  enum?: string[]
}
export interface APIResponse {
  status: number
  description: string
  example?: unknown
  schema?: unknown
}
export interface APIConfig {
  baseUrl: string
  version: string
  title: string
  description: string
  port: number
  cors: {
    enabled: boolean
    origins: string[]
  }
  authentication: {
    apiKey: {
      enabled: boolean
      key: string
      header: string
    }
    bearer: {
      enabled: boolean
      secret: string
    }
  }
  rateLimit: {
    enabled: boolean
    requests: number
    window: number
  }
  logging: boolean
}
class RestAPIService {
  private config: APIConfig
  private endpoints = new Map<string, APIEndpoint>()
  private server: unknown = null
  private requestStats = new Map<string, { count: number; lastReset: number }>()
  constructor() {
    this.config = {
      baseUrl: 'http://localhost:3001',
      version: '1.0.0',
      title: 'CMO REST API',
      description: 'API para integración con el sistema CMO (Centro de Monitoreo de Operaciones)',
      port: 3001,
      cors: {
        enabled: true,
        origins: ['*']
      },
      authentication: {
        apiKey: {
          enabled: true,
          key: 'cmo-api-key-2024',
          header: 'X-API-Key'
        },
        bearer: {
          enabled: false,
          secret: ''
        }
      },
      rateLimit: {
        enabled: true,
        requests: 100,
        window: 3600 // 1 hour
      },
      logging: true
    }
    this.initializeDefaultEndpoints()
  }
  // Configuration
  updateConfig(updates: Partial<APIConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
  }
  getConfig(): APIConfig {
    return this.config
  }
  // Endpoints management
  addEndpoint(endpoint: Omit<APIEndpoint, 'id'>): APIEndpoint {
    const newEndpoint: APIEndpoint = {
      ...endpoint,
      id: this.generateId()
    }
    this.endpoints.set(newEndpoint.id, newEndpoint)
    this.saveEndpoints()
    return newEndpoint
  }
  updateEndpoint(id: string, updates: Partial<APIEndpoint>): APIEndpoint | null {
    const endpoint = this.endpoints.get(id)
    if (!endpoint) return null
    const updatedEndpoint = { ...endpoint, ...updates }
    this.endpoints.set(id, updatedEndpoint)
    this.saveEndpoints()
    return updatedEndpoint
  }
  deleteEndpoint(id: string): boolean {
    const deleted = this.endpoints.delete(id)
    if (deleted) {
      this.saveEndpoints()
    }
    return deleted
  }
  getEndpoint(id: string): APIEndpoint | null {
    return this.endpoints.get(id) || null
  }
  getAllEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values())
  }
  getEnabledEndpoints(): APIEndpoint[] {
    return this.getAllEndpoints().filter(endpoint => endpoint.enabled)
  }
  // OpenAPI/Swagger specification generation
  generateOpenAPISpec(): unknown {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: this.config.title,
        description: this.config.description,
        version: this.config.version,
        contact: {
          name: 'CMO Support',
          email: 'support@cmo.com'
        }
      },
      servers: [
        {
          url: this.config.baseUrl,
          description: 'CMO API Server'
        }
      ],
      components: {
        securitySchemes: {
          ...(this.config.authentication.apiKey.enabled && {
            ApiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: this.config.authentication.apiKey.header
            }
          }),
          ...(this.config.authentication.bearer.enabled && {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer'
            }
          })
        },
        schemas: this.generateSchemas()
      },
      paths: {},
      tags: this.generateTags()
    }
    // Generate paths from endpoints
    this.getEnabledEndpoints().forEach(endpoint => {
      const path = endpoint.path
      if (!spec.paths[path]) {
        spec.paths[path] = {}
      }
      spec.paths[path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: this.formatParameters(endpoint.parameters || []),
        responses: this.formatResponses(endpoint.responses),
        ...(endpoint.authentication !== 'none' && {
          security: this.formatSecurity(endpoint.authentication)
        })
      }
    })
    return spec
  }
  // Mock server functionality
  async startMockServer(): Promise<void> {
    if (this.server) {
      console.warn('Mock server is already running')
      return
    }
    // Create simple mock server
    this.server = {
      listen: (port: number, callback: () => void) => {
        console.log(`Mock API server would start on port ${port}`)
        callback()
      },
      close: (callback: () => void) => {
        console.log('Mock API server stopped')
        callback()
      }
    }
    return new Promise((resolve) => {
      this.server.listen(this.config.port, () => {
        console.log(`CMO REST API server started on port ${this.config.port}`)
        console.log(`API Documentation: ${this.config.baseUrl}/docs`)
        resolve()
      })
    })
  }
  async stopMockServer(): Promise<void> {
    if (!this.server) {
      console.warn('Mock server is not running')
      return
    }
    return new Promise((resolve) => {
      this.server.close(() => {
        this.server = null
        resolve()
      })
    })
  }
  // Request handling (_mock)
  async handleRequest(path: string, method: string, params: unknown = {}, headers: unknown = {}): Promise<any> {
    const endpoint = this.findEndpoint(path, method)
    if (!endpoint) {
      return {
        status: 404,
        data: { error: 'Endpoint not found' }
      }
    }
    if (!endpoint.enabled) {
      return {
        status: 503,
        data: { error: 'Endpoint is disabled' }
      }
    }
    // Check authentication
    if (endpoint.authentication !== 'none') {
      const authResult = this.checkAuthentication(endpoint.authentication, headers)
      if (!authResult.valid) {
        return {
          status: 401,
          data: { error: authResult.error }
        }
      }
    }
    // Check rate limiting
    if (endpoint.rateLimit || this.config.rateLimit.enabled) {
      const rateLimitResult = this.checkRateLimit(endpoint.id, endpoint.rateLimit)
      if (!rateLimitResult.allowed) {
        return {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      }
    }
    // Generate mock response based on endpoint configuration
    return this.generateMockResponse(endpoint, params)
  }
  // Data export functionality
  async exportData(format: 'json' | 'csv' | 'xml' = 'json', filters: unknown = {}): Promise<string> {
    const data = await this.getExportData(filters)
    switch (format) {
      case 'csv': {
        return this.convertToCSV(data)
      }
      case 'xml': {
        return this.convertToXML(data)
      }
      default:
        return JSON.stringify(data, null, 2)
    }
  }
  // Statistics and monitoring
  getAPIStats(): {
    totalEndpoints: number
    enabledEndpoints: number
    totalRequests: number
    requestsByEndpoint: Record<string, number>
    uptime: number
  } {
    const totalRequests = Array.from(this.requestStats.values())
      .reduce((sum, stat) => sum + stat.count, 0)
    const requestsByEndpoint: Record<string, number> = {}
    this.requestStats.forEach((stat, endpointId) => {
      const endpoint = this.endpoints.get(endpointId)
      if (endpoint) {
        requestsByEndpoint[endpoint.path] = stat.count
      }
    })
    return {
      totalEndpoints: this.endpoints.size,
      enabledEndpoints: this.getEnabledEndpoints().length,
      totalRequests,
      requestsByEndpoint,
      uptime: Date.now() - (this.startTime || Date.now())
    }
  }
  private startTime = Date.now()
  // Private helper methods
  private initializeDefaultEndpoints(): void {
    const defaultEndpoints: Omit<APIEndpoint, 'id'>[] = [
      {
        path: '/api/v1/alerts',
        method: 'GET',
        description: 'Obtener lista de alertas',
        parameters: [
          { name: 'status', in: 'query', type: 'string', required: false, description: 'Filtrar por estado', enum: ['active', 'resolved', 'acknowledged'] },
          { name: 'priority', in: 'query', type: 'string', required: false, description: 'Filtrar por prioridad', enum: ['low', 'medium', 'high', 'critical'] },
          { name: 'limit', in: 'query', type: 'number', required: false, description: 'Límite de resultados' },
          { name: 'offset', in: 'query', type: 'number', required: false, description: 'Offset para paginación' }
        ],
        responses: [
          { status: 200, description: 'Lista de alertas', example: { alerts: [], total: 0 } },
          { status: 401, description: 'No autorizado' },
          { status: 500, description: 'Error interno del servidor' }
        ],
        authentication: 'api_key',
        tags: ['Alertas'],
        enabled: true
      },
      {
        path: '/api/v1/transits',
        method: 'GET',
        description: 'Obtener lista de tránsitos',
        parameters: [
          { name: 'status', in: 'query', type: 'string', required: false, description: 'Filtrar por estado' },
          { name: 'origin', in: 'query', type: 'string', required: false, description: 'Filtrar por origen' },
          { name: 'destination', in: 'query', type: 'string', required: false, description: 'Filtrar por destino' }
        ],
        responses: [
          { status: 200, description: 'Lista de tránsitos', example: { transits: [], total: 0 } }
        ],
        authentication: 'api_key',
        tags: ['Tránsitos'],
        enabled: true
      },
      {
        path: '/api/v1/precintos',
        method: 'GET',
        description: 'Obtener lista de precintos',
        responses: [
          { status: 200, description: 'Lista de precintos', example: { precintos: [], total: 0 } }
        ],
        authentication: 'api_key',
        tags: ['Precintos'],
        enabled: true
      },
      {
        path: '/api/v1/statistics',
        method: 'GET',
        description: 'Obtener estadísticas del sistema',
        responses: [
          { status: 200, description: 'Estadísticas del sistema' }
        ],
        authentication: 'api_key',
        tags: ['Estadísticas'],
        enabled: true
      }
    ]
    defaultEndpoints.forEach(endpoint => {
      this.addEndpoint(endpoint)
    })
  }
  private generateSchemas(): unknown {
    return {
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          status: { type: 'string', enum: ['active', 'resolved', 'acknowledged'] },
          timestamp: { type: 'string', format: 'date-time' },
          source: { type: 'string' }
        }
      },
      Transit: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          status: { type: 'string' },
          departure: { type: 'string', format: 'date-time' },
          arrival: { type: 'string', format: 'date-time' }
        }
      },
      Precinto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          serial: { type: 'string' },
          status: { type: 'string' },
          location: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
  private generateTags(): unknown[] {
    const tags = new Set<string>()
    this.getEnabledEndpoints().forEach(endpoint => {
      endpoint.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).map(tag => ({
      name: tag,
      description: `Operaciones relacionadas con ${tag}`
    }))
  }
  private formatParameters(parameters: APIParameter[]): unknown[] {
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      required: param.required,
      description: param.description,
      schema: {
        type: param.type,
        ...(param.enum && { enum: param.enum }),
        ...(param.example && { example: param.example })
      }
    }))
  }
  private formatResponses(responses: APIResponse[]): unknown {
    const formatted: unknown = {}
    responses.forEach(response => {
      formatted[response.status] = {
        description: response.description,
        ...(response.example && {
          content: {
            'application/json': {
              example: response.example
            }
          }
        })
      }
    })
    return formatted
  }
  private formatSecurity(authType: string): unknown[] {
    switch (authType) {
      case 'api_key':
        return [{ ApiKeyAuth: [] }]
      case 'bearer':
        return [{ BearerAuth: [] }]
      default:
        return []
    }
  }
  private findEndpoint(path: string, method: string): APIEndpoint | null {
    return this.getEnabledEndpoints().find(
      endpoint => endpoint.path === path && endpoint.method === method.toUpperCase()
    ) || null
  }
  private checkAuthentication(authType: string, headers: unknown): { valid: boolean; error?: string } {
    switch (authType) {
      case 'api_key': {
        const apiKey = headers[this.config.authentication.apiKey.header.toLowerCase()]
        if (!apiKey || apiKey !== this.config.authentication.apiKey.key) {
          return { valid: false, error: 'Invalid API key' }
        }
        break
      }
      case 'bearer': {
        const authorization = headers.authorization
        if (!authorization || !authorization.startsWith('Bearer ')) {
          return { valid: false, error: 'Invalid bearer token' }
        }
        break
      }
    }
    return { valid: true }
  }
  private checkRateLimit(endpointId: string, endpointLimit?: { requests: number; window: number }): { allowed: boolean } {
    const limit = endpointLimit || this.config.rateLimit
    const now = Date.now()
    const windowStart = now - (limit.window * 1000)
    let stats = this.requestStats.get(endpointId)
    if (!stats || stats.lastReset < windowStart) {
      stats = { count: 0, lastReset: now }
      this.requestStats.set(endpointId, stats)
    }
    if (stats.count >= limit.requests) {
      return { allowed: false }
    }
    stats.count++
    return { allowed: true }
  }
  private generateMockResponse(endpoint: APIEndpoint, params: unknown): unknown {
    // Generate mock data based on endpoint path
    switch (endpoint.path) {
      case '/api/v1/alerts': {
        return {
          status: 200,
          data: {
            alerts: this.generateMockAlerts(params.limit || 10),
            total: 150,
            page: Math.floor((params.offset || 0) / (params.limit || 10)) + 1
          }
        }
      }
      case '/api/v1/transits':
        return {
          status: 200,
          data: {
            transits: this.generateMockTransits(params.limit || 10),
            total: 75
          }
        }
      case '/api/v1/precintos':
        return {
          status: 200,
          data: {
            precintos: this.generateMockPrecintos(params.limit || 10),
            total: 200
          }
        }
      case '/api/v1/statistics':
        return {
          status: 200,
          data: {
            alerts: { total: 150, active: 23, resolved: 127 },
            transits: { total: 75, inProgress: 15, completed: 60 },
            precintos: { total: 200, active: 180, violated: 5, inactive: 15 }
          }
        }
      default:
        return {
          status: 200,
          data: { message: 'Mock response', timestamp: new Date().toISOString() }
        }
    }
  }
  private generateMockAlerts(count: number): unknown[] {
    const alerts = []
    const priorities = ['low', 'medium', 'high', 'critical']
    const statuses = ['active', 'resolved', 'acknowledged']
    for (let i = 0; i < count; i++) {
      alerts.push({
        id: `alert_${i + 1}`,
        title: `Alerta ${i + 1}`,
        message: `Descripción de la alerta ${i + 1}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: 'CMO'
      })
    }
    return alerts
  }
  private generateMockTransits(count: number): unknown[] {
    const transits = []
    const origins = ['Montevideo', 'Buenos Aires', 'São Paulo', 'Santiago']
    const destinations = ['Montevideo', 'Buenos Aires', 'São Paulo', 'Santiago']
    for (let i = 0; i < count; i++) {
      const departure = new Date(Date.now() - Math.random() * 86400000)
      const arrival = new Date(departure.getTime() + Math.random() * 86400000)
      transits.push({
        id: `transit_${i + 1}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        status: Math.random() > 0.5 ? 'in_progress' : 'completed',
        departure: departure.toISOString(),
        arrival: arrival.toISOString()
      })
    }
    return transits
  }
  private generateMockPrecintos(count: number): unknown[] {
    const precintos = []
    const statuses = ['active', 'inactive', 'violated']
    for (let i = 0; i < count; i++) {
      precintos.push({
        id: `precinto_${i + 1}`,
        serial: `PRE${String(i + 1).padStart(6, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: `Ubicación ${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      })
    }
    return precintos
  }
  private async getExportData(filters: unknown): Promise<any[]> {
    // Mock export data - in real implementation, this would fetch from database
    return [
      { id: 1, type: 'alert', data: 'Sample alert data' },
      { id: 2, type: 'transit', data: 'Sample transit data' },
      { id: 3, type: 'precinto', data: 'Sample precinto data' }
    ]
  }
  private convertToCSV(data: unknown[]): string {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    })
    return csvRows.join('\n')
  }
  private convertToXML(data: unknown[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n'
    data.forEach(item => {
      xml += '  <item>\n'
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`
      })
      xml += '  </item>\n'
    })
    xml += '</data>'
    return xml
  }
  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  // Persistence
  private saveConfig(): void {
    try {
      localStorage.setItem('cmo_api_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('Failed to save API config:', error)
    }
  }
  private saveEndpoints(): void {
    try {
      const endpointsArray = Array.from(this.endpoints.values())
      localStorage.setItem('cmo_api_endpoints', JSON.stringify(endpointsArray))
    } catch (error) {
      console.error('Failed to save API endpoints:', error)
    }
  }
  loadConfig(): void {
    try {
      const stored = localStorage.getItem('cmo_api_config')
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Failed to load API config:', error)
    }
  }
  loadEndpoints(): void {
    try {
      const stored = localStorage.getItem('cmo_api_endpoints')
      if (stored) {
        const endpointsArray: APIEndpoint[] = JSON.parse(stored)
        this.endpoints.clear()
        endpointsArray.forEach(endpoint => {
          this.endpoints.set(endpoint.id, endpoint)
        })
      }
    } catch (error) {
      console.error('Failed to load API endpoints:', error)
    }
  }
}
// Singleton instance
export const restAPIService = new RestAPIService()
// Initialize on import
restAPIService.loadConfig()
restAPIService.loadEndpoints()
