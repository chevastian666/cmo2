/**
 * Alert Flow Analysis Component
 * Visualizes alert flows from source to resolution
 * By Cheva
 */

import React, { useMemo } from 'react'
import { Card, CardContent} from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Clock} from 'lucide-react'
import { SankeyChart} from '@/components/charts/sankey/SankeyChart'
import { transformAlertFlow} from '@/components/charts/sankey/utils/dataTransformers'
import type { AlertFlow} from '@/components/charts/types/sankey.types'
interface AlertFlowAnalysisProps {
  dateRange?: { from: Date; to: Date }
}

export const AlertFlowAnalysis: React.FC<AlertFlowAnalysisProps> = ({ dateRange: _dateRange }) => {

  // Mock data for alerts - this should come from props or context
  const alertas = useMemo(() => [] as unknown[], [])
  
  // Transform alerts into flow data
  const alertFlowData = useMemo(() => {
    const flows: AlertFlow[] = []
    const sourceMap = new Map<string, Map<string, number>>()
    alertas.forEach(alerta => {
      const source = alerta.origen || 'Sistema'
      const type = alerta.tipo
      const severity = alerta.severidad
      const resolution = alerta.estado === 'resuelta' ? alerta.resolucion || 'Resuelto' : 'Pendiente'
      const key = `${source}-${type}-${severity}-${resolution}`
      if (!sourceMap.has(key)) {
        flows.push({
          source,
          alertType: type,
          severity: severity as unknown,
          count: 0,
          resolution: alerta.estado === 'resuelta' ? resolution : undefined,
          resolutionTime: alerta.tiempoResolucion
        })
      }

      const flow = flows.find(f => 
        f.source === source && 
        f.alertType === type && 
        f.severity === severity &&
        f.resolution === (alerta.estado === 'resuelta' ? resolution : undefined)
      )
      if (flow) {
        flow.count++
      }
    })
    return flows
  }, [alertas])
  const chartData = useMemo(() => {
    return transformAlertFlow(alertFlowData)
  }, [alertFlowData])
  // Calculate statistics
  const stats = useMemo(() => {
    const total = alertas.length
    const resolved = alertas.filter(a => a.estado === 'resuelta').length
    const pending = alertas.filter(a => a.estado === 'activa').length
    const avgResolutionTime = alertas
      .filter(a => a.tiempoResolucion)
      .reduce((sum, a) => sum + (a.tiempoResolucion || 0), 0) / resolved || 0
    const bySeverity = {
      critica: alertas.filter(a => a.severidad === 'critica').length,
      alta: alertas.filter(a => a.severidad === 'alta').length,
      media: alertas.filter(a => a.severidad === 'media').length,
      baja: alertas.filter(a => a.severidad === 'baja').length
    }
    return {
      total,
      resolved,
      pending,
      resolutionRate: total > 0 ? (resolved / total * 100).toFixed(1) : 0,
      avgResolutionTime: Math.round(avgResolutionTime),
      bySeverity
    }
  }, [alertas])
  return (<div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Alertas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Resueltas</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-green-500">{stats.resolutionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Críticas</p>
                <p className="text-2xl font-bold">{stats.bySeverity.critica}</p>
                <p className="text-xs text-red-500">Requieren atención</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sankey Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-900 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
            <SankeyChart
              data={chartData}
              width={1000}
              height={500}
              margin={{ top: 20, right: 150, bottom: 20, left: 120 }}
              nodeWidth={25}
              nodePadding={15}
              animated={true}
              interactive={true}
              showLabels={true}
              showValues={true}
              valueFormat={(v) => `${v} alertas`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución por Severidad</h3>
          <div className="space-y-3">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : 0
              const colors = {
                critica: 'bg-red-500',
                alta: 'bg-orange-500',
                media: 'bg-yellow-500',
                baja: 'bg-green-500'
              }
              return (
                <div key={severity} className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-20 capitalize">{severity}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className={`${colors[severity as keyof typeof colors]} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}