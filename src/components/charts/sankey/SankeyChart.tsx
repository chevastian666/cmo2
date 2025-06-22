/**
 * Sankey Chart Component (Minimal Version)
 * By Cheva
 */

import React from 'react'

interface SankeyChartProps {
  data?: unknown
  config?: unknown
  width?: number
  height?: number
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ width = 800, height = 400 }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-400">Sankey Chart Component</div>
    </div>
  )
}

export default SankeyChart
