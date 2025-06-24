/**
 * Sankey Data Transformers
 * Utilities to transform CMO data into Sankey format
 * By Cheva
 */

import type { 
  SankeyData, FlowData, LogisticsFlow, PrecintoFlow, AlertFlow} from '../types/sankey.types'
/**
 * Transform logistics flow data into Sankey format
 */
export function transformLogisticsFlow(flows: LogisticsFlow[]): SankeyData {
  const nodes = new Map<string, number>()
  const links: SankeyData['links'] = []
  // Extract unique locations and calculate totals
  flows.forEach(flow => {
    // Add origin node
    if (!nodes.has(flow.origin)) {
      nodes.set(flow.origin, 0)
    }
    nodes.set(flow.origin, nodes.get(flow.origin)! + flow.transitCount)
    // Add destination node
    if (!nodes.has(flow.destination)) {
      nodes.set(flow.destination, 0)
    }
    nodes.set(flow.destination, nodes.get(flow.destination)! + flow.transitCount)
    // Create link
    links.push({
      source: flow.origin,
      target: flow.destination,
      value: flow.transitCount,
      metadata: {
        totalVolume: flow.totalVolume,
        avgTime: flow.avgTime,
        successRate: flow.successRate
      }
    })
  })
  // Convert nodes map to array
  const nodeArray = Array.from(nodes.entries()).map(([id, value]) => ({
    id,
    name: id,
    value
  }))
  return { nodes: nodeArray, links }
}

/**
 * Transform precinto lifecycle data into Sankey format
 */
export function transformPrecintoLifecycle(stages: PrecintoFlow[]): SankeyData {
  const nodes = stages.map(stage => ({
    id: stage.stage,
    name: formatStageName(stage.stage),
    value: stage.count
  }))
  const links = stages
    .filter(stage => stage.nextStage)
    .map(stage => ({
      source: stage.stage,
      target: stage.nextStage!,
      value: stage.count - (stage.dropoffCount || 0)
    }))
  return { nodes, links }
}

/**
 * Transform alert flow data into Sankey format
 */
export function transformAlertFlow(alerts: AlertFlow[]): SankeyData {
  const sourceNodes = new Map<string, number>()
  const typeNodes = new Map<string, number>()
  const resolutionNodes = new Map<string, number>()
  const links: SankeyData['links'] = []
  alerts.forEach(alert => {
    // Count by source
    sourceNodes.set(alert.source, (sourceNodes.get(alert.source) || 0) + alert.count)
    // Count by type
    const typeKey = `${alert.alertType}_${alert.severity}`
    typeNodes.set(_typeKey, (typeNodes.get(_typeKey) || 0) + alert.count)
    // Count by resolution if exists
    if (alert.resolution) {
      resolutionNodes.set(alert.resolution, (resolutionNodes.get(alert.resolution) || 0) + alert.count)
    }

    // Create source -> type link
    links.push({
      source: alert.source,
      target: typeKey,
      value: alert.count,
      color: getSeverityColor(alert.severity)
    })
    // Create type -> resolution link if exists
    if (alert.resolution) {
      links.push({
        source: typeKey,
        target: alert.resolution,
        value: alert.count,
        color: getSeverityColor(alert.severity)
      })
    }
  })
  // Combine all nodes
  const nodes = [
    ...Array.from(sourceNodes.entries()).map(([id, value]) => ({
      id,
      name: id,
      value,
      color: '#3b82f6' // Blue for sources
    })),
    ...Array.from(typeNodes.entries()).map(([id, value]) => {
      const [type, severity] = id.split('_')
      return {
        id,
        name: `${formatAlertType(type)} (${severity})`,
        value,
        color: getSeverityColor(severity as 'low' | 'medium' | 'high' | 'critical')
      }
    }),
    ...Array.from(resolutionNodes.entries()).map(([id, value]) => ({
      id,
      name: id,
      value,
      color: '#10b981' // Green for resolutions
    }))
  ]
  return { nodes, links }
}

/**
 * Transform time-based flow data
 */
export function transformTimeBasedFlow(
  data: Array<{
    timestamp: Date
    from: string
    to: string
    value: number
  }>,
  timeInterval: 'hour' | 'day' | 'week' | 'month'
): SankeyData {
  const timeGroups = new Map<string, Map<string, number>>()
  data.forEach(item => {
    const timeKey = getTimeKey(item.timestamp, timeInterval)
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, new Map())
    }
    
    const flowKey = `${item.from}-${item.to}`
    const flows = timeGroups.get(timeKey)!
    flows.set(flowKey, (flows.get(flowKey) || 0) + item.value)
  })
  const nodes = new Set<string>()
  const links: SankeyData['links'] = []
  timeGroups.forEach((flows, timeKey) => {
    flows.forEach((value, flowKey) => {
      const [from, to] = flowKey.split('-')
      const fromNode = `${from}_${timeKey}`
      const toNode = `${to}_${timeKey}`
      nodes.add(fromNode)
      nodes.add(toNode)
      links.push({
        source: fromNode,
        target: toNode,
        value
      })
    })
  })
  const nodeArray = Array.from(nodes).map(id => {
    const [name, time] = id.split('_')
    return {
      id,
      name: `${name} (${time})`,
      value: 0 // Will be calculated by D3
    }
  })
  return { nodes: nodeArray, links }
}

/**
 * Create multi-level hierarchical flow
 */
export function createHierarchicalFlow(
  levels: Array<{
    level: number
    items: Array<{ id: string; name: string; value: number }>
  }>,
  connections: Array<{ from: string; to: string; value: number }>
): SankeyData {
  const nodes = levels.flatMap(level => 
    level.items.map(item => ({
      ...item,
      color: getColorByLevel(level.level)
    }))
  )
  const links = connections.map(conn => ({
    source: conn.from,
    target: conn.to,
    value: conn.value
  }))
  return { nodes, links }
}

// Helper functions
function formatStageName(stage: string): string {
  const stageNames: Record<string, string> = {
    created: 'Creado',
    activated: 'Activado',
    in_transit: 'En Tránsito',
    completed: 'Completado',
    deactivated: 'Desactivado'
  }
  return stageNames[stage] || stage
}

function formatAlertType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    low: '#10b981',    // Green
    medium: '#f59e0b', // Yellow
    high: '#f97316',   // Orange
    critical: '#ef4444' // Red
  }
  return colors[severity]
}

function getColorByLevel(level: number): string {
  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Yellow
    '#10b981'  // Green
  ]
  return colors[level % colors.length]
}

function getTimeKey(date: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
  const d = new Date(date)
  switch (interval) {
    case 'hour':
      return `${d.toLocaleDateString()} ${d.getHours()}:00`
    case 'day':
      return d.toLocaleDateString()
    case 'week': {
      const week = Math.ceil((d.getDate() + 6 - d.getDay()) / 7)
      return `Week ${week}, ${d.getFullYear()}`
    }
    case 'month':
      return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`
  }
}

/**
 * Aggregate flow data by grouping similar paths
 */
export function aggregateFlows(flows: FlowData[], threshold = 0): SankeyData {
  const aggregated = new Map<string, number>()
  const nodes = new Set<string>()
  flows.forEach(flow => {
    const key = `${flow.from}-${flow.to}`
    aggregated.set(key, (aggregated.get(key) || 0) + flow.value)
    nodes.add(flow.from)
    nodes.add(flow.to)
  })
  const nodeArray = Array.from(nodes).map(id => ({
    id,
    name: id,
    value: 0
  }))
  const links = Array.from(aggregated.entries())
    .filter(([, value]) => value > threshold)
    .map(([key, value]) => {
      const [source, target] = key.split('-')
      return { source, target, value }
    })
  return { nodes: nodeArray, links }
}