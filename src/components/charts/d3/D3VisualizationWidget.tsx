/**
 * D3 Visualization Widget
 * Comprehensive interactive visualization component
 * By Cheva
 */

import React, { useState, useMemo } from 'react'
import { InteractiveLineChart} from './InteractiveLineChart'
import { ActivityHeatmap} from './ActivityHeatmap'
import { NetworkGraph} from './NetworkGraph'
import { InteractiveTreemap} from './InteractiveTreemap'
import { 
  TimeSeriesData, HeatmapData, NetworkData, TreemapNode, ChartConfig, DEFAULT_CHART_CONFIG, NetworkNode, NetworkLink} from './types'
type VisualizationType = 'line' | 'heatmap' | 'network' | 'treemap'
interface D3VisualizationWidgetProps {
  type: VisualizationType
  data: TimeSeriesData[] | HeatmapData[] | NetworkData | TreemapNode
  config?: Partial<ChartConfig>
  title?: string
  className?: string
  onDataPointClick?: (data: TimeSeriesData | HeatmapData | TreemapNode) => void
  onZoomChange?: (domain: [Date, Date]) => void
  onNodeClick?: (node: NetworkNode | TreemapNode) => void
  onLinkClick?: (link: NetworkLink) => void
}

// Mock data generators for demonstration
const generateTimeSeriesData = (count = 30): TimeSeriesData[] => {
  const now = new Date()
  const data: TimeSeriesData[] = []
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000)
    data.push({
      date,
      value: Math.floor(Math.random() * 100) + 50 + Math.sin(i * 0.3) * 20,
      category: ['Import', 'Export', 'Transit'][Math.floor(Math.random() * 3)],
      metadata: {
        id: `T${i + 1}`,
        status: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)]
      }
    })
  }
  
  return data
}
const generateHeatmapData = (): HeatmapData[] => {
  const data: HeatmapData[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        day,
        hour,
        value: Math.floor(Math.random() * 50) + (hour > 8 && hour < 18 ? 30 : 10),
        label: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
      })
    }
  }
  
  return data
}
const generateNetworkData = (): NetworkData => {
  const nodes = [
    { id: 'MVD', label: 'Montevideo', value: 100, group: 'Puerto' },
    { id: 'BA', label: 'Buenos Aires', value: 85, group: 'Puerto' },
    { id: 'SP', label: 'Santos', value: 75, group: 'Puerto' },
    { id: 'TERM1', label: 'Terminal 1', value: 50, group: 'Terminal' },
    { id: 'TERM2', label: 'Terminal 2', value: 45, group: 'Terminal' },
    { id: 'WH1', label: 'Depósito A', value: 30, group: 'Depósito' },
    { id: 'WH2', label: 'Depósito B', value: 25, group: 'Depósito' },
    { id: 'CUST1', label: 'Cliente 1', value: 20, group: 'Cliente' },
    { id: 'CUST2', label: 'Cliente 2', value: 15, group: 'Cliente' }
  ]
  const links = [
    { source: 'MVD', target: 'TERM1', value: 40, label: 'Ruta Principal' },
    { source: 'MVD', target: 'TERM2', value: 35, label: 'Ruta Secundaria' },
    { source: 'BA', target: 'TERM1', value: 30, label: 'Internacional' },
    { source: 'SP', target: 'TERM2', value: 25, label: 'Internacional' },
    { source: 'TERM1', target: 'WH1', value: 35, label: 'Distribución' },
    { source: 'TERM1', target: 'WH2', value: 20, label: 'Distribución' },
    { source: 'TERM2', target: 'WH1', value: 15, label: 'Distribución' },
    { source: 'WH1', target: 'CUST1', value: 25, label: 'Entrega' },
    { source: 'WH1', target: 'CUST2', value: 15, label: 'Entrega' },
    { source: 'WH2', target: 'CUST1', value: 10, label: 'Entrega' }
  ]
  return { nodes, links }
}
const generateTreemapData = (): TreemapNode => {
  return {
    name: 'Transacciones',
    value: 0,
    children: [
      {
        name: 'Import',
        value: 0,
        category: 'Import',
        children: [
          { name: 'Contenedores', value: 120, category: 'Import' },
          { name: 'Carga Suelta', value: 80, category: 'Import' },
          { name: 'Refrigerado', value: 45, category: 'Import' }
        ]
      },
      {
        name: 'Export',
        value: 0,
        category: 'Export',
        children: [
          { name: 'Granos', value: 95, category: 'Export' },
          { name: 'Carne', value: 65, category: 'Export' },
          { name: 'Lácteos', value: 40, category: 'Export' }
        ]
      },
      {
        name: 'Tránsito',
        value: 0,
        category: 'Transit',
        children: [
          { name: 'Paraguay', value: 75, category: 'Transit' },
          { name: 'Argentina', value: 55, category: 'Transit' },
          { name: 'Brasil', value: 35, category: 'Transit' }
        ]
      }
    ]
  }
}
export const D3VisualizationWidget: React.FC<D3VisualizationWidgetProps> = ({
  type, data: providedData, config: userConfig, title, className = ''
}) => {
  const [selectedType, setSelectedType] = useState<VisualizationType>(type)
  const config = { ...DEFAULT_CHART_CONFIG, ...userConfig }
  // Generate or use provided data
  const chartData = useMemo(() => {
    if (providedData) return providedData
    switch (selectedType) {
      case 'line':
        return generateTimeSeriesData()
      case 'heatmap':
        return generateHeatmapData()
      case 'network':
        return generateNetworkData()
      case 'treemap':
        return generateTreemapData()
      default:
        return []
    }
  }, [providedData, selectedType])
  const renderVisualization = () => {
    switch (selectedType) {
      case 'line':
        return (
          <InteractiveLineChart
            data={chartData as TimeSeriesData[]}
            config={config}
          />
        )
      case 'heatmap':
        return (
          <ActivityHeatmap
            data={chartData as HeatmapData[]}
            config={config}
          />
        )
      case 'network':
        return (
          <NetworkGraph
            data={chartData as NetworkData}
            config={config}
          />
        )
      case 'treemap':
        return (
          <InteractiveTreemap
            data={chartData as TreemapNode}
            config={config}
          />
        )
      default:
        return <div className="flex items-center justify-center h-full text-gray-400">
          Tipo de visualización no soportado
        </div>
    }
  }
  const visualizationTypes = [
    { key: 'line', label: 'Líneas Temporales', icon: '📈' },
    { key: 'heatmap', label: 'Mapa de Calor', icon: '🔥' },
    { key: 'network', label: 'Red de Conexiones', icon: '🕸️' },
    { key: 'treemap', label: 'Treemap', icon: '🗂️' }
  ]
  return (<div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {title || 'Visualización Interactiva D3.js'}
          </h3>
          
          {/* Type selector */}
          <div className="flex space-x-2">
            {visualizationTypes.map(({ key, label, icon }) => (<button
                key={key}
                onClick={() => setSelectedType(key as VisualizationType)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedType === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={label}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualization container */}
      <div className="p-4">
        <div className="h-96 w-full">
          {renderVisualization()}
        </div>
      </div>

      {/* Footer with info */}
      <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>
            {selectedType === 'line' && 'Zoom y pan habilitados • Click en puntos para detalles'}
            {selectedType === 'heatmap' && 'Actividad por hora y día • Hover para información'}
            {selectedType === 'network' && 'Arrastra nodos • Zoom para explorar • Click para detalles'}
            {selectedType === 'treemap' && 'Click para drill-down • Breadcrumbs para navegación'}
          </span>
          <span className="text-blue-400">D3.js Interactive</span>
        </div>
      </div>
    </div>
  )
}