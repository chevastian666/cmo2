/**
 * Common type definitions for integration services
 * By Cheva
 */

// Generic record type for data processing
export type DataRecord = Record<string, unknown>

// Generic response from external services
export interface ExternalServiceResponse {
  success: boolean
  data?: unknown
  error?: string
  statusCode?: number
  headers?: Record<string, string>
}

// Common field value types
export type FieldValue = string | number | boolean | Date | null | undefined

// Common filter operators
export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'contains' | 'not_contains'

// Common data transformation result
export interface TransformationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

// Common pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Common API configuration
export interface ApiConfiguration {
  baseUrl: string
  timeout?: number
  retryCount?: number
  headers?: Record<string, string>
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2'
    credentials?: Record<string, string>
  }
}

// Export result metadata
export interface ExportMetadata {
  exportTimestamp: string
  recordCount: number
  datasetName?: string
  format?: string
  processingTimeMs?: number
  [key: string]: unknown
}