/**
 * Data Processor Web Worker
 * Heavy calculations off the main thread
 * By Cheva
 */

import * as Comlink from 'comlink'
interface ProcessingResult {
  aggregations: Record<string, number>
  statistics: {
    mean: number
    median: number
    min: number
    max: number
    sum: number
    count: number
    standardDeviation: number
  }
  groupedData: Record<string, unknown[]>
  processedCount: number
  processingTime: number
}

export class DataProcessor {
  // Process large dataset with aggregations
  async processLargeDataset<T extends Record<string, unknown>>(
    data: T[],
    options: {
      groupBy?: keyof T
      aggregateFields?: (keyof T)[]
      filters?: Array<{ field: keyof T; operator: '=' | '>' | '<' | '>=' | '<=' | '!='; value: unknown }>
      sortBy?: { field: keyof T; order: 'asc' | 'desc' }
      limit?: number
    } = {}
  ): Promise<ProcessingResult> {
    const startTime = performance.now()
    // Apply filters
    let filteredData = data
    if (options.filters) {
      filteredData = data.filter(item => {
        return options.filters!.every(filter => {
          const value = item[filter.field]
          switch (filter.operator) {
            case '=': {
              return value === filter.value
            }
            case '>': {
              return (value as number) > (filter.value as number)
            }
            case '<': {
              return (value as number) < (filter.value as number)
            }
            case '>=': {
              return (value as number) >= (filter.value as number)
            }
            case '<=': {
              return (value as number) <= (filter.value as number)
            }
            case '!=': {
              return value !== filter.value
            }
            default: return true
          }
        })
      })
    }

    // Group data
    const groupedData: Record<string, T[]> = {}
    if (options.groupBy) {
      filteredData.forEach(item => {
        const key = String(item[options.groupBy!])
        if (!groupedData[key]) {
          groupedData[key] = []
        }
        groupedData[key].push(item)
      })
    }

    // Calculate aggregations
    const aggregations: Record<string, number> = {}
    if (options.aggregateFields) {
      options.aggregateFields.forEach(field => {
        const values = filteredData
          .map(item => item[field])
          .filter(val => typeof val === 'number')
        if (values.length > 0) {
          aggregations[`${String(field)}_sum`] = this.sum(values)
          aggregations[`${String(field)}_avg`] = this.mean(values)
          aggregations[`${String(field)}_min`] = Math.min(...values)
          aggregations[`${String(field)}_max`] = Math.max(...values)
        }
      })
    }

    // Calculate statistics for numeric fields
    const numericValues = this.extractNumericValues(filteredData)
    const statistics = this.calculateStatistics(numericValues)
    // Sort if needed
    if (options.sortBy) {
      filteredData.sort((a, b) => {
        const aVal = a[options.sortBy!.field]
        const bVal = b[options.sortBy!.field]
        const order = options.sortBy!.order === 'asc' ? 1 : -1
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
        return 0
      })
    }

    // Apply limit
    if (options.limit) {
      filteredData = filteredData.slice(0, options.limit)
    }

    const processingTime = performance.now() - startTime
    return {
      aggregations,
      statistics,
      groupedData,
      processedCount: filteredData.length,
      processingTime
    }
  }

  // Calculate complex statistics
  calculateStatistics(values: number[]): ProcessingResult['statistics'] {
    if (values.length === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        sum: 0,
        count: 0,
        standardDeviation: 0
      }
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = this.sum(values)
    const mean = sum / values.length
    const median = this.median(sorted)
    // Calculate standard deviation
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = this.sum(squaredDiffs) / values.length
    const standardDeviation = Math.sqrt(avgSquaredDiff)
    return {
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      sum,
      count: values.length,
      standardDeviation
    }
  }

  // Aggregate time series data
  aggregateTimeSeries(
    data: Array<{ timestamp: number; value: number; [key: string]: unknown }>,
    interval: 'minute' | 'hour' | 'day' | 'week' | 'month',
    aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count' = 'sum'
  ): Array<{ timestamp: number; value: number; count: number }> {
    const buckets = new Map<number, number[]>()
    data.forEach(item => {
      const bucketKey = this.getBucketKey(item.timestamp, interval)
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, [])
      }
      buckets.get(bucketKey)!.push(item.value)
    })
    const result: Array<{ timestamp: number; value: number; count: number }> = []
    buckets.forEach((values, timestamp) => {
      let value: number
      switch (aggregationType) {
        case 'sum': {
  value = this.sum(values)
          break
    }
            case 'avg': {
              value = this.mean(values)
              break
            }
            case 'min': {
              value = Math.min(...values)
              break
            }
            case 'max': {
          value = Math.max(...values)
          break
    }
    case 'count':
          value = values.length
          break
      }

      result.push({
        timestamp,
        value,
        count: values.length
      })
    })
    return result.sort((a, b) => a.timestamp - b.timestamp)
  }

  // Calculate percentiles
  calculatePercentiles(values: number[], percentiles: number[]): Record<string, number> {
    const sorted = [...values].sort((a, b) => a - b)
    const result: Record<string, number> = {}
    percentiles.forEach(p => {
      const index = Math.ceil((p / 100) * sorted.length) - 1
      result[`p${p}`] = sorted[Math.max(0, index)]
    })
    return result
  }

  // Detect anomalies using Z-score
  detectAnomalies(
    values: number[],
    threshold: number = 3
  ): Array<{ index: number; value: number; zScore: number }> {
    const stats = this.calculateStatistics(values)
    const anomalies: Array<{ index: number; value: number; zScore: number }> = []
    values.forEach((value, index) => {
      const zScore = Math.abs((value - stats.mean) / stats.standardDeviation)
      if (zScore > threshold) {
        anomalies.push({ index, value, zScore })
      }
    })
    return anomalies
  }

  // Private helper methods
  private sum(values: number[]): number {
    return values.reduce((acc, val) => acc + val, 0)
  }

  private mean(values: number[]): number {
    return values.length > 0 ? this.sum(values) / values.length : 0
  }

  private median(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2)
    return sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid]
  }

  private extractNumericValues(data: unknown[]): number[] {
    const values: number[] = []
    data.forEach(item => {
      Object.values(item as Record<string, unknown>).forEach(val => {
        if (typeof val === 'number' && !isNaN(val)) {
          values.push(val)
        }
      })
    })
    return values
  }

  private getBucketKey(timestamp: number, interval: string): number {
    const date = new Date(timestamp)
    switch (interval) {
      case 'minute': {
  date.setSeconds(0, 0)
        break
    }
      case 'hour': {
        date.setMinutes(0, 0, 0)
        break
      }
      case 'day': {
        date.setHours(0, 0, 0, 0)
        break
      }
      case 'week': {
        const dayOfWeek = date.getDay()
        date.setDate(date.getDate() - dayOfWeek)
        date.setHours(0, 0, 0, 0)
        break
      }
      case 'month':
        date.setDate(1)
        date.setHours(0, 0, 0, 0)
        break
    }

    return date.getTime()
  }
}

// Export the worker
Comlink.expose(new DataProcessor())