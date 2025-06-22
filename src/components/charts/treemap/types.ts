/**
 * Treemap Types
 * Type definitions for interactive treemap visualization
 * By Cheva
 */

export interface TreemapNode {
  name: string
  value?: number
  children?: TreemapNode[]
  color?: string
  data?: unknown
}

export interface TreemapData {
  name: string
  children: TreemapNode[]
}

export interface TreemapProps {
  data: TreemapData
  width?: number
  height?: number
  colorScheme?: string[]
  valueFormat?: (value: number) => string
  onNodeClick?: (node: TreemapNode, event: MouseEvent) => void
  onNodeHover?: (node: TreemapNode | null, event: MouseEvent) => void
  animated?: boolean
  className?: string
  title?: string
  subtitle?: string
  showBreadcrumb?: boolean
  showTooltip?: boolean
  minZoom?: number
  maxZoom?: number
}

export interface TreemapTooltipData {
  name: string
  value: number
  percentage?: number
  path: string[]
  data?: unknown
}

export interface ZoomState {
  scale: number
  translateX: number
  translateY: number
  node: TreemapNode | null
}