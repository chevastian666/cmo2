/**
 * Logistics Flow Chart Component
 * Visualizes transit flows between origins and destinations
 * By Cheva
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger} from '@/components/ui/Tabs'
import { Download, TrendingUp, MapPin, Package, Truck, AlertCircle, RefreshCw} from 'lucide-react'
import { SankeyChart} from '@/components/charts/sankey/SankeyChart'
import { 
  transformLogisticsFlow, transformPrecintoLifecycle, transformAlertFlow, transformTimeBasedFlow} from '@/components/charts/sankey/utils/dataTransformers'
import { motion} from 'framer-motion'
import { toast} from '@/hooks/use-toast'

// Transit data structure
interface Transito {
  id: string
  origen: string
  destino: string
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
  carga?: {
    peso: number
    tipo: string
  }
  tiempoEstimado?: number
  fechaCreacion: string | number
}

// Flow data structure
interface FlowData {
  origin: string
  destination: string
  transitCount: number
  totalVolume: number
  successCount: number
  totalTime: number
  successRate?: number
  avgTime?: number
}

export const LogisticsFlowChart: React.FC = () => {
  // Mock data - in production, replace with real data from store or API
  const transitos = useMemo<Transito[]>(() => [], [])
  
  const [timeRange, setTimeRange] = useState('week')
  const [flowType, setFlowType] = useState<'routes' | 'lifecycle' | 'alerts' | 'time'>('routes')
  const [loading, setLoading] = useState(false)
  // Transform transit data into logistics flows
  const routeFlows = useMemo(() => {
    const flowMap = new Map<string, FlowData>()
    transitos.forEach(transito => {
      const key = `${transito.origen}-${transito.destino}`
      if (!flowMap.has(key)) {
        flowMap.set(key, {
          origin: transito.origen,
          destination: transito.destino,
          transitCount: 0,
          totalVolume: 0,
          successCount: 0,
          totalTime: 0
        })
      }
      
      const flow = flowMap.get(key)
      flow.transitCount++
      flow.totalVolume += transito.carga?.peso || 0
      if (armadoData.transito.estado === 'completado') {
        flow.successCount++
      }
      if (armadoData.transito.tiempoEstimado) {
        flow.totalTime += transito.tiempoEstimado
      }
    })
    return Array.from(flowMap.values()).map(flow => ({
      ...flow,
      successRate: flow.transitCount > 0 ? (flow.successCount / flow.transitCount) * 100 : 0,
      avgTime: flow.transitCount > 0 ? flow.totalTime / flow.transitCount : 0
    }))
  }, [transitos])
  // Precinto lifecycle data
  const lifecycleData = useMemo(() => {
    // Mock data - in production, calculate from real precinto data
    return [
      { stage: 'created' as const, count: 1000, nextStage: 'activated', dropoffCount: 50 },
      { stage: 'activated' as const, count: 950, nextStage: 'in_transit', dropoffCount: 30 },
      { stage: 'in_transit' as const, count: 920, nextStage: 'completed', dropoffCount: 20 },
      { stage: 'completed' as const, count: 900, nextStage: 'deactivated', dropoffCount: 0 },
      { stage: 'deactivated' as const, count: 900 }
    ]
  }, [])
  // Alert flow data
  const alertFlowData = useMemo(() => {
    // Mock data - in production, calculate from real alert data
    return [
      { source: 'Sensor GPS', alertType: 'desvio_ruta', severity: 'high' as const, count: 45, resolution: 'Ruta Corregida', resolutionTime: 30 },
      { source: 'Sensor GPS', alertType: 'sin_señal', severity: 'medium' as const, count: 23, resolution: 'Señal Recuperada', resolutionTime: 15 },
      { source: 'Sensor Batería', alertType: 'bateria_baja', severity: 'low' as const, count: 67, resolution: 'Batería Reemplazada', resolutionTime: 120 },
      { source: 'Sensor Temperatura', alertType: 'temperatura_alta', severity: 'critical' as const, count: 12, resolution: 'Intervención Manual', resolutionTime: 45 },
      { source: 'Sistema', alertType: 'apertura_no_autorizada', severity: 'critical' as const, count: 8, resolution: 'Seguridad Notificada', resolutionTime: 5 }
    ]
  }, [])
  // Get appropriate data based on flow type
  const chartData = useMemo(() => {
    switch (flowType) {
      case 'routes':
        return transformLogisticsFlow(routeFlows)
      case 'lifecycle':
        return transformPrecintoLifecycle(lifecycleData)
      case 'alerts':
        return transformAlertFlow(alertFlowData)
      case 'time': {
        // Mock time-based data
        const timeData = transitos.map(t => ({
          timestamp: new Date(t.fechaCreacion),
          from: t.origen,
          to: t.destino,
          value: 1
        }))
        return transformTimeBasedFlow(timeData, timeRange as 'hour' | 'day' | 'week' | 'month')
      }
      default:
        return { nodes: [], links: [] }
    }
  }, [flowType, routeFlows, lifecycleData, alertFlowData, timeRange, transitos])
  // Calculate statistics
  const stats = useMemo(() => {
    const totalFlow = chartData.links.reduce((sum, link) => sum + link.value, 0)
    const avgFlow = chartData.links.length > 0 ? totalFlow / chartData.links.length : 0
    const maxFlow = Math.max(...chartData.links.map(l => l.value), 0)
    const minFlow = Math.min(...chartData.links.map(l => l.value), Infinity)
    return { totalFlow, avgFlow, maxFlow, minFlow }
  }, [chartData])
  const handleExport = () => {
    // Export chart as SVG or PNG
    toast({
      title: 'Exportando gráfico',
      description: 'El gráfico se descargará en breve.'
    })
  }
  // Node and link types from SankeyChart
  interface SankeyNode {
    name: string
    value?: number
    [key: string]: unknown
  }

  interface SankeyLink {
    source: string | SankeyNode
    target: string | SankeyNode
    value: number
    [key: string]: unknown
  }

  const handleNodeClick = (node: SankeyNode) => {
    toast({
      title: node.name,
      description: `Flujo total: ${node.value?.toLocaleString() || 0}`
    })
  }
  const handleLinkClick = (link: SankeyLink) => {
    const source = typeof link.source === 'object' ? link.source.name : link.source
    const target = typeof link.target === 'object' ? link.target.name : link.target
    toast({
      title: `${source} → ${target}`,
      description: `Flujo: ${link.value?.toLocaleString() || 0}`
    })
  }
  return (<Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Flujos Logísticos</CardTitle>
            <CardDescription>
              Visualización de flujos de datos y tránsitos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoading(!loading)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <Tabs value={flowType} onValueChange={(v) => setFlowType(v as 'routes' | 'lifecycle' | 'alerts' | 'time')} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="routes" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Rutas
                </TabsTrigger>
                <TabsTrigger value="lifecycle" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ciclo de Vida
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Alertas
                </TabsTrigger>
                <TabsTrigger value="time" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Temporal
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {flowType === 'time' && (
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Por Hora</SelectItem>
                  <SelectItem value="day">Por Día</SelectItem>
                  <SelectItem value="week">Por Semana</SelectItem>
                  <SelectItem value="month">Por Mes</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Flujo Total</span>
                <Truck className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalFlow.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Promedio</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{Math.round(stats.avgFlow).toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Máximo</span>
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.maxFlow.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Conexiones</span>
                <MapPin className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{chartData.links.length}</p>
            </motion.div>
          </div>

          {/* Sankey Chart */}
          <div className="bg-gray-900 rounded-lg p-6 min-h-[600px] flex items-center justify-center">
            {chartData.nodes.length > 0 && chartData.links.length > 0 ? (
              <SankeyChart
                data={chartData}
                width={1000}
                height={600}
                margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
                nodeWidth={20}
                nodePadding={20}
                animated={true}
                interactive={true}
                showLabels={true}
                showValues={true}
                labelPosition="outside"
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']}
              />
            ) : (
              <div className="text-center text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay datos de flujo disponibles</p>
                <p className="text-sm mt-2">Selecciona un período diferente o tipo de flujo</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            {flowType === 'routes' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span className="text-sm text-gray-400">Origen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded" />
                  <span className="text-sm text-gray-400">Destino</span>
                </div>
              </>
            )}
            {flowType === 'alerts' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm text-gray-400">Baja</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className="text-sm text-gray-400">Media</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span className="text-sm text-gray-400">Alta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm text-gray-400">Crítica</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}