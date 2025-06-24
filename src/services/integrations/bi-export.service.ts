/**
 * BI Export Service
 * Export data to Business Intelligence tools (Tableau, PowerBI, etc.)
 * By Cheva
 */

import type { DataRecord } from '@/types/integrations'

// Dataset data type
interface DatasetRecord {
  id: number
  timestamp: string
  alert_count: number
  transit_count: number
  precinto_count: number
  location: string
  priority: string
  status: string
  [key: string]: unknown
}

export interface BIConnection {
  id: string
  name: string
  type: 'tableau' | 'powerbi' | 'qlik' | 'looker' | 'metabase' | 'generic'
  config: BIConnectionConfig
  active: boolean
  lastSync?: Date
  syncCount: number
  errorCount: number
  created: Date
}

export interface BIConnectionConfig {
  // Tableau Server/Online
  tableau?: {
    server_url: string
    site_id?: string
    username: string
    password?: string
    personal_access_token?: string
    project_name?: string
  }
  // Power BI
  powerbi?: {
    tenant_id: string
    client_id: string
    client_secret?: string
    workspace_id: string
    dataset_id?: string
    username?: string
    password?: string
  }
  // QlikSense
  qlik?: {
    server_url: string
    app_id: string
    certificate_path?: string
    user_directory: string
    user_id: string
  }
  // Looker
  looker?: {
    base_url: string
    client_id: string
    client_secret: string
    project_id?: string
  }
  // Metabase
  metabase?: {
    server_url: string
    username: string
    password: string
    database_id?: number
  }
  // Generic REST API
  generic?: {
    endpoint_url: string
    method: 'POST' | 'PUT' | 'PATCH'
    headers: Record<string, string>
    auth_type: 'none' | 'basic' | 'bearer' | 'api_key'
    auth_config: Record<string, string>
  }
}

export interface BIDataset {
  id: string
  name: string
  description: string
  source_query: string
  refresh_schedule: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
    time?: string
    days?: number[]
  }
  data_mapping: BIDataMapping[]
  filters?: BIDataFilter[]
  connections: string[]
  active: boolean
  created: Date
  lastUpdate?: Date
}

// Transformation configuration types
export interface TransformationConfig {
  format?: {
    type: 'date' | 'currency' | 'percentage'
    locale?: string
    options?: Record<string, unknown>
  }
  calculation?: {
    operation: 'multiply' | 'divide' | 'add' | 'subtract'
    factor: number
  }
  lookup?: {
    mapping: Record<string, string | number>
  }
  aggregation?: {
    method: 'sum' | 'avg' | 'count' | 'max' | 'min'
    groupBy?: string
  }
}

export interface BIDataMapping {
  source_field: string
  target_field: string
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'json'
  transformation?: {
    type: 'format' | 'calculation' | 'lookup' | 'aggregation'
    config: TransformationConfig
  }
  required: boolean
}

export type FilterValue = string | number | boolean | Date | Array<string | number>

export interface BIDataFilter {
  field: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'contains'
  value: FilterValue
  description: string
}

export interface BIExportJob {
  id: string
  dataset_id: string
  connection_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: Date
  completed_at?: Date
  records_processed: number
  records_exported: number
  error_message?: string
  export_format: 'json' | 'csv' | 'parquet' | 'direct'
  file_path?: string
  file_size?: number
}

export interface BIExportMetadata {
  export_timestamp: string
  record_count: number
  dataset_name: string
  connection_type: string
  processing_time_ms: number
  [key: string]: unknown
}

export interface BIExportResult {
  success: boolean
  job_id: string
  records_exported: number
  export_time: number
  error?: string
  metadata?: BIExportMetadata
}

class BIExportService {
  private connections = new Map<string, BIConnection>()
  private datasets = new Map<string, BIDataset>()
  private jobs = new Map<string, BIExportJob>()
  private scheduledJobs = new Map<string, NodeJS.Timeout>()

  // Connection management
  async createConnection(config: Omit<BIConnection, 'id' | 'created' | 'syncCount' | 'errorCount'>): Promise<BIConnection> {
    const connection: BIConnection = {
      ...config,
      id: this.generateId(),
      created: new Date(),
      syncCount: 0,
      errorCount: 0
    }

    // Test the connection
    const testResult = await this.testConnection(connection)
    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.error}`)
    }

    this.connections.set(connection.id, connection)
    this.saveConnections()
    return connection
  }

  updateConnection(id: string, updates: Partial<BIConnection>): BIConnection | null {
    const connection = this.connections.get(id)
    if (!connection) return null

    const updatedConnection = { ...connection, ...updates }
    this.connections.set(id, updatedConnection)
    this.saveConnections()
    return updatedConnection
  }

  deleteConnection(id: string): boolean {
    const deleted = this.connections.delete(id)
    if (deleted) {
      this.cancelScheduledJobsForConnection(id)
      this.saveConnections()
    }
    return deleted
  }

  getConnection(id: string): BIConnection | null {
    return this.connections.get(id) || null
  }

  getAllConnections(): BIConnection[] {
    return Array.from(this.connections.values())
  }

  getActiveConnections(): BIConnection[] {
    return this.getAllConnections().filter(conn => conn.active)
  }

  // Dataset management
  createDataset(config: Omit<BIDataset, 'id' | 'created'>): BIDataset {
    const dataset: BIDataset = {
      ...config,
      id: this.generateId(),
      created: new Date()
    }

    this.datasets.set(dataset.id, dataset)

    // Schedule if enabled
    if (dataset.refresh_schedule.enabled) {
      this.scheduleDatasetRefresh(dataset)
    }

    this.saveDatasets()
    return dataset
  }

  updateDataset(id: string, updates: Partial<BIDataset>): BIDataset | null {
    const dataset = this.datasets.get(id)
    if (!dataset) return null

    const updatedDataset = { ...dataset, ...updates }
    this.datasets.set(id, updatedDataset)

    // Update schedule
    this.cancelScheduledJob(id)
    if (updatedDataset.refresh_schedule.enabled && updatedDataset.active) {
      this.scheduleDatasetRefresh(updatedDataset)
    }

    this.saveDatasets()
    return updatedDataset
  }

  deleteDataset(id: string): boolean {
    const deleted = this.datasets.delete(id)
    if (deleted) {
      this.cancelScheduledJob(id)
      this.saveDatasets()
    }
    return deleted
  }

  getDataset(id: string): BIDataset | null {
    return this.datasets.get(id) || null
  }

  getAllDatasets(): BIDataset[] {
    return Array.from(this.datasets.values())
  }

  getActiveDatasets(): BIDataset[] {
    return this.getAllDatasets().filter(dataset => dataset.active)
  }

  // Export operations
  async exportDataset(datasetId: string, connectionId?: string): Promise<BIExportResult> {
    const dataset = this.getDataset(datasetId)
    if (!dataset) {
      throw new Error('Dataset not found')
    }

    const connections = connectionId
      ? [this.getConnection(connectionId)].filter(Boolean) as BIConnection[]
      : dataset.connections.map(id => this.getConnection(id)).filter(Boolean) as BIConnection[]

    if (connections.length === 0) {
      throw new Error('No valid connections found')
    }

    const results = await Promise.allSettled(
      connections.map(connection => this.exportToConnection(dataset, connection))
    )

    const successful = results.filter(result => result.status === 'fulfilled')
    const failed = results.filter(result => result.status === 'rejected')

    if (successful.length === 0) {
      throw new Error(`All exports failed: ${failed.map(f => (f as PromiseRejectedResult).reason).join(', ')}`)
    }

    return {
      success: true,
      job_id: this.generateId(),
      records_exported: (successful[0] as PromiseFulfilledResult<BIExportResult>).value.records_exported,
      export_time: (successful[0] as PromiseFulfilledResult<BIExportResult>).value.export_time,
      metadata: {
        successful_connections: successful.length,
        failed_connections: failed.length
      }
    }
  }

  private async exportToConnection(dataset: BIDataset, connection: BIConnection): Promise<BIExportResult> {
    const startTime = Date.now()

    // Create export job
    const job: BIExportJob = {
      id: this.generateId(),
      dataset_id: dataset.id,
      connection_id: connection.id,
      status: 'running',
      started_at: new Date(),
      records_processed: 0,
      records_exported: 0,
      export_format: this.getExportFormat(connection.type)
    }

    this.jobs.set(job.id, job)

    try {
      // Fetch data using dataset query
      const data = await this.fetchDatasetData(dataset)
      job.records_processed = data.length

      // Transform data according to mapping
      const transformedData = this.transformData(data, dataset.data_mapping)

      // Export to specific BI tool
      await this.exportToBITool(connection, transformedData, dataset)

      job.status = 'completed'
      job.completed_at = new Date()
      job.records_exported = transformedData.length

      // Update connection stats
      connection.syncCount++
      connection.lastSync = new Date()
      this.updateConnection(connection.id, connection)

      const exportTime = Date.now() - startTime
      return {
        success: true,
        job_id: job.id,
        records_exported: job.records_exported,
        export_time: exportTime
      }
    } catch (error) {
      job.status = 'failed'
      job.error_message = (error as Error).message
      job.completed_at = new Date()

      // Update connection error count
      connection.errorCount++
      this.updateConnection(connection.id, connection)
      throw error
    } finally {
      this.jobs.set(job.id, job)
    }
  }

  // BI Tool specific exports
  private async exportToBITool(connection: BIConnection, data: DataRecord[], dataset: BIDataset): Promise<void> {
    switch (connection.type) {
      case 'tableau':
        await this.exportToTableau(connection, data, dataset)
        break
      case 'powerbi':
        await this.exportToPowerBI(connection, data, dataset)
        break
      case 'qlik':
        await this.exportToQlik(connection, data, dataset)
        break
      case 'looker':
        await this.exportToLooker(connection, data, dataset)
        break
      case 'metabase':
        await this.exportToMetabase(connection, data, dataset)
        break
      case 'generic':
        await this.exportToGeneric(connection, data, dataset)
        break
      default:
        throw new Error(`Unsupported BI tool: ${connection.type}`)
    }
  }

  private async exportToTableau(connection: BIConnection, data: DataRecord[], _dataset: BIDataset): Promise<void> {
    const config = connection.config.tableau!
    console.log(`Exporting ${data.length} records to Tableau Server: ${config.server_url}`)
    await this.simulateAPICall(1000 + Math.random() * 2000)
  }

  private async exportToPowerBI(connection: BIConnection, data: DataRecord[], _dataset: BIDataset): Promise<void> {
    const config = connection.config.powerbi!
    console.log(`Exporting ${data.length} records to Power BI workspace: ${config.workspace_id}`)
    await this.simulateAPICall(800 + Math.random() * 1500)
  }

  private async exportToQlik(connection: BIConnection, data: DataRecord[], _dataset: BIDataset): Promise<void> {
    const config = connection.config.qlik!
    console.log(`Exporting ${data.length} records to QlikSense app: ${config.app_id}`)
    await this.simulateAPICall(1200 + Math.random() * 1800)
  }

  private async exportToLooker(connection: BIConnection, data: DataRecord[], _dataset: BIDataset): Promise<void> {
    const config = connection.config.looker!
    console.log(`Exporting ${data.length} records to Looker: ${config.base_url}`)
    await this.simulateAPICall(900 + Math.random() * 1600)
  }

  private async exportToMetabase(connection: BIConnection, data: DataRecord[], _dataset: BIDataset): Promise<void> {
    const config = connection.config.metabase!
    console.log(`Exporting ${data.length} records to Metabase: ${config.server_url}`)
    await this.simulateAPICall(700 + Math.random() * 1300)
  }

  private async exportToGeneric(connection: BIConnection, data: DataRecord[], dataset: BIDataset): Promise<void> {
    const config = connection.config.generic!
    const headers = { ...config.headers }

    // Add authentication headers
    switch (config.auth_type) {
      case 'basic': {
        const credentials = btoa(`${config.auth_config.username}:${config.auth_config.password}`)
        headers['Authorization'] = `Basic ${credentials}`
        break
      }
      case 'bearer':
        headers['Authorization'] = `Bearer ${config.auth_config.token}`
        break
      case 'api_key':
        headers[config.auth_config.header] = config.auth_config.key
        break
    }

    const response = await fetch(config.endpoint_url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        dataset: dataset.name,
        data: data,
        metadata: {
          export_time: new Date().toISOString(),
          record_count: data.length
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // Data processing
  // Dataset data type

  private async fetchDatasetData(dataset: BIDataset): Promise<DatasetRecord[]> {
    // Mock data fetching
    const mockData = []
    const recordCount = 100 + Math.floor(Math.random() * 900)

    for (let i = 0; i < recordCount; i++) {
      mockData.push({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        alert_count: Math.floor(Math.random() * 10),
        transit_count: Math.floor(Math.random() * 5),
        precinto_count: Math.floor(Math.random() * 20),
        location: ['Montevideo', 'Buenos Aires', 'São Paulo', 'Santiago'][Math.floor(Math.random() * 4)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        status: ['active', 'resolved', 'pending'][Math.floor(Math.random() * 3)]
      })
    }

    // Apply filters
    let filteredData = mockData
    if (dataset.filters) {
      filteredData = this.applyFilters(mockData, dataset.filters)
    }

    return filteredData
  }

  private transformData(data: DataRecord[], mappings: BIDataMapping[]): DataRecord[] {
    return data.map(record => {
      const transformed: DataRecord = {}
      mappings.forEach(mapping => {
        let value = record[mapping.source_field]

        // Apply transformation if specified
        if (mapping.transformation) {
          value = this.applyTransformation(value, mapping.transformation)
        }

        // Convert data type
        value = this.convertDataType(value, mapping.data_type)
        transformed[mapping.target_field] = value
      })
      return transformed
    })
  }

  private applyFilters(data: DataRecord[], filters: BIDataFilter[]): DataRecord[] {
    return data.filter(record => {
      return filters.every(filter => {
        const value = record[filter.field]
        switch (filter.operator) {
          case '=':
            return value === filter.value
          case '!=':
            return value !== filter.value
          case '>':
            return value > filter.value
          case '<':
            return value < filter.value
          case '>=':
            return value >= filter.value
          case '<=':
            return value <= filter.value
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value)
          case 'not_in':
            return Array.isArray(filter.value) && !filter.value.includes(value)
          case 'contains':
            return String(value).includes(String(filter.value))
          default:
            return true
        }
      })
    })
  }

  private applyTransformation(value: unknown, transformation: { type: string; config: TransformationConfig }): unknown {
    switch (transformation.type) {
      case 'format':
        if (transformation.config.format?.type === 'date') {
          return new Date(String(value)).toLocaleDateString(transformation.config.format.locale)
        }
        return value
      case 'calculation':
        if (transformation.config.calculation?.operation === 'multiply') {
          return Number(value) * transformation.config.calculation.factor
        }
        return value
      case 'lookup': {
        const lookup = transformation.config.lookup?.mapping
        if (lookup) {
          const key = String(value)
          return lookup[key] || value
        }
        return value
      }
      default:
        return value
    }
  }

  private convertDataType(value: unknown, targetType: string): unknown {
    switch (targetType) {
      case 'string':
        return String(value)
      case 'number':
        return Number(value) || 0
      case 'date':
        return new Date(String(value)).toISOString()
      case 'boolean':
        return Boolean(value)
      case 'json':
        return typeof value === 'object' ? value : JSON.parse(String(value))
      default:
        return value
    }
  }

  // Connection testing
  async testConnection(connection: BIConnection): Promise<{ success: boolean; error?: string }> {
    try {
      switch (connection.type) {
        case 'tableau':
          return await this.testTableauConnection(connection.config.tableau!)
        case 'powerbi':
          return await this.testPowerBIConnection(connection.config.powerbi!)
        case 'generic':
          return await this.testGenericConnection(connection.config.generic!)
        default:
          return { success: true }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  private async testTableauConnection(_config: BIConnectionConfig['tableau']): Promise<{ success: boolean; error?: string }> {
    await this.simulateAPICall(500 + Math.random() * 1000)
    return { success: true }
  }

  private async testPowerBIConnection(_config: BIConnectionConfig['powerbi']): Promise<{ success: boolean; error?: string }> {
    await this.simulateAPICall(400 + Math.random() * 800)
    return { success: true }
  }

  private async testGenericConnection(config: BIConnectionConfig['generic']): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(config.endpoint_url, {
        method: 'HEAD',
        headers: config.headers
      })
      return { success: response.ok }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Scheduling
  private scheduleDatasetRefresh(dataset: BIDataset): void {
    if (!dataset.refresh_schedule.enabled) return

    const schedule = dataset.refresh_schedule
    let interval: number

    switch (schedule.frequency) {
      case 'hourly':
        interval = 60 * 60 * 1000
        break
      case 'daily':
        interval = 24 * 60 * 60 * 1000
        break
      case 'weekly':
        interval = 7 * 24 * 60 * 60 * 1000
        break
      case 'monthly':
        interval = 30 * 24 * 60 * 60 * 1000
        break
      default:
        return
    }

    const timeoutId = setInterval(async () => {
      try {
        await this.exportDataset(dataset.id)
        console.log(`Scheduled export completed for dataset: ${dataset.name}`)
      } catch (error) {
        console.error(`Scheduled export failed for dataset ${dataset.name}:`, error)
      }
    }, interval)

    this.scheduledJobs.set(dataset.id, timeoutId)
  }

  private cancelScheduledJob(datasetId: string): void {
    const timeoutId = this.scheduledJobs.get(datasetId)
    if (timeoutId) {
      clearInterval(timeoutId)
      this.scheduledJobs.delete(datasetId)
    }
  }

  private cancelScheduledJobsForConnection(connectionId: string): void {
    this.getAllDatasets()
      .filter(dataset => dataset.connections.includes(connectionId))
      .forEach(dataset => this.cancelScheduledJob(dataset.id))
  }

  // Job management
  getExportJobs(limit = 50): BIExportJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())
      .slice(0, limit)
  }

  getExportJob(id: string): BIExportJob | null {
    return this.jobs.get(id) || null
  }

  // Statistics
  getExportStats(): {
    total_connections: number
    active_connections: number
    total_datasets: number
    active_datasets: number
    total_jobs: number
    successful_jobs: number
    failed_jobs: number
    total_records_exported: number
  } {
    const jobs = Array.from(this.jobs.values())
    return {
      total_connections: this.connections.size,
      active_connections: this.getActiveConnections().length,
      total_datasets: this.datasets.size,
      active_datasets: this.getActiveDatasets().length,
      total_jobs: jobs.length,
      successful_jobs: jobs.filter(job => job.status === 'completed').length,
      failed_jobs: jobs.filter(job => job.status === 'failed').length,
      total_records_exported: jobs.reduce((sum, job) => sum + job.records_exported, 0)
    }
  }

  // Helper methods
  private getExportFormat(biType: string): 'json' | 'csv' | 'parquet' | 'direct' {
    switch (biType) {
      case 'tableau':
      case 'qlik':
        return 'csv'
      case 'powerbi':
      case 'looker':
        return 'json'
      case 'metabase':
        return 'direct'
      default:
        return 'json'
    }
  }

  private async simulateAPICall(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private generateId(): string {
    return `bi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Persistence
  private saveConnections(): void {
    try {
      const connectionsArray = Array.from(this.connections.values())
      const sanitized = connectionsArray.map(conn => ({
        ...conn,
        config: this.sanitizeConfig(conn.config)
      }))
      localStorage.setItem('cmo_bi_connections', JSON.stringify(sanitized))
    } catch (error) {
      console.error('Failed to save BI connections:', error)
    }
  }

  private saveDatasets(): void {
    try {
      const datasetsArray = Array.from(this.datasets.values())
      localStorage.setItem('cmo_bi_datasets', JSON.stringify(datasetsArray))
    } catch (error) {
      console.error('Failed to save BI datasets:', error)
    }
  }

  private sanitizeConfig(config: BIConnectionConfig): BIConnectionConfig {
    const sanitized = JSON.parse(JSON.stringify(config))

    // Remove sensitive fields
    if (sanitized.tableau) {
      sanitized.tableau.password = sanitized.tableau.password ? '***' : undefined
      sanitized.tableau.personal_access_token = sanitized.tableau.personal_access_token ? '***' : undefined
    }
    if (sanitized.powerbi) {
      sanitized.powerbi.client_secret = sanitized.powerbi.client_secret ? '***' : undefined
      sanitized.powerbi.password = sanitized.powerbi.password ? '***' : undefined
    }
    if (sanitized.looker) {
      sanitized.looker.client_secret = sanitized.looker.client_secret ? '***' : undefined
    }
    if (sanitized.metabase) {
      sanitized.metabase.password = sanitized.metabase.password ? '***' : undefined
    }

    return sanitized
  }

  loadConnections(): void {
    try {
      const stored = localStorage.getItem('cmo_bi_connections')
      if (stored) {
        const connectionsArray: BIConnection[] = JSON.parse(stored)
        this.connections.clear()
        connectionsArray.forEach(connection => {
          connection.created = new Date(connection.created)
          if (connection.lastSync) {
            connection.lastSync = new Date(connection.lastSync)
          }
          this.connections.set(connection.id, connection)
        })
      }
    } catch (error) {
      console.error('Failed to load BI connections:', error)
    }
  }

  loadDatasets(): void {
    try {
      const stored = localStorage.getItem('cmo_bi_datasets')
      if (stored) {
        const datasetsArray: BIDataset[] = JSON.parse(stored)
        this.datasets.clear()
        datasetsArray.forEach(dataset => {
          dataset.created = new Date(dataset.created)
          if (dataset.lastUpdate) {
            dataset.lastUpdate = new Date(dataset.lastUpdate)
          }
          this.datasets.set(dataset.id, dataset)

          // Restore schedules for active datasets
          if (dataset.active && dataset.refresh_schedule.enabled) {
            this.scheduleDatasetRefresh(dataset)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load BI datasets:', error)
    }
  }

  // Cleanup
  cleanup(): void {
    this.scheduledJobs.forEach(timeoutId => clearInterval(timeoutId))
    this.scheduledJobs.clear()
  }
}

// Singleton instance
export const biExportService = new BIExportService()

// Initialize on import
biExportService.loadConnections()
biExportService.loadDatasets()