/**
 * Operational Treemap Component
 * Multi-dimensional operational view of the CMO system
 * By Cheva
 */

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Activity, Layers, Zap, Target} from 'lucide-react'
import { InteractiveTreemap} from '@/components/charts/treemap/InteractiveTreemap'
import type { TreemapData, TreemapNode} from '@/components/charts/treemap/types'
export const OperationalTreemap: React.FC = () => {

  const [viewMode, setViewMode] = useState<'overview' | 'efficiency' | 'risk'>('overview')
  const operationalData = useMemo((): TreemapData => {
    if (viewMode === 'overview') {
      // General operational overview
      const precintosNode: TreemapNode = {
        name: 'Precintos',
        children: [
          {
            name: 'Activos',
            value: precintos.filter(p => p.estado === 'activado' || p.estado === 'en_transito').length,
            color: '#10b981'
          },
          {
            name: 'Inactivos',
            value: precintos.filter(p => p.estado === 'creado' || p.estado === 'desactivado').length,
            color: '#6b7280'
          },
          {
            name: 'Alarma',
            value: precintos.filter(p => p.estado === 'alarma').length,
            color: '#ef4444'
          }
        ]
      }
      const transitosNode: TreemapNode = {
        name: 'Tránsitos',
        children: [
          {
            name: 'En Curso',
            value: transitos.filter(t => t.estado === 'en_curso').length,
            color: '#3b82f6'
          },
          {
            name: 'Completados',
            value: transitos.filter(t => t.estado === 'completado').length,
            color: '#10b981'
          },
          {
            name: 'Retrasados',
            value: transitos.filter(t => t.estado === 'retrasado').length,
            color: '#f59e0b'
          },
          {
            name: 'Cancelados',
            value: transitos.filter(t => t.estado === 'cancelado').length,
            color: '#ef4444'
          }
        ]
      }
      const alertasNode: TreemapNode = {
        name: 'Alertas',
        children: [
          {
            name: 'Críticas',
            value: alertas.filter(a => a.tipo === 'critica').length,
            color: '#dc2626'
          },
          {
            name: 'Altas',
            value: alertas.filter(a => a.tipo === 'alta').length,
            color: '#ef4444'
          },
          {
            name: 'Medias',
            value: alertas.filter(a => a.tipo === 'media').length,
            color: '#f59e0b'
          },
          {
            name: 'Bajas',
            value: alertas.filter(a => a.tipo === 'baja').length,
            color: '#3b82f6'
          }
        ]
      }
      return {
        name: 'Operaciones CMO',
        children: [precintosNode, transitosNode, alertasNode]
      }
    } else if (viewMode === 'efficiency') {
      // Efficiency analysis
      const routeEfficiency = new Map<string, { completed: number; total: number }>()
      transitos.forEach(t => {
        const route = `${t.origen} → ${t.destino}`
        if (!routeEfficiency.has(route)) {
          routeEfficiency.set(route, { completed: 0, total: 0 })
        }
        const stats = routeEfficiency.get(route)!
        stats.total++
        if (t.estado === 'completado') {
          stats.completed++
        }
      })
      const children: TreemapNode[] = Array.from(routeEfficiency.entries()).map(([route, stats]) => {
        const efficiency = (stats.completed / stats.total) * 100
        return {
          name: route,
          value: stats.total,
          children: [
            {
              name: `Eficiencia: ${efficiency.toFixed(1)}%`,
              value: stats.completed,
              color: efficiency > 80 ? '#10b981' : efficiency > 60 ? '#f59e0b' : '#ef4444'
            }
          ]
        }
      })
      return {
        name: 'Eficiencia por Ruta',
        children
      }
    } else {
      // Risk analysis
      const riskMap = new Map<string, number>()
      // High risk: routes with many alerts
      alertas.forEach(alert => {
        if (alert.transitoId) {
          const transito = transitos.find(t => t.id === alert.transitoId)
          if (transito) {
            const route = `${transito.origen} → ${transito.destino}`
            riskMap.set(route, (riskMap.get(route) || 0) + 
              (alert.tipo === 'critica' ? 10 : alert.tipo === 'alta' ? 5 : 1))
          }
        }
      })
      const children: TreemapNode[] = Array.from(riskMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([route, riskScore]) => ({
          name: route,
          value: riskScore,
          color: riskScore > 20 ? '#dc2626' : riskScore > 10 ? '#ef4444' : '#f59e0b'
        }))
      return {
        name: 'Análisis de Riesgo',
        children: children.length > 0 ? children : [{ name: 'Sin riesgos detectados', value: 1, color: '#10b981' }]
      }
    }
  }, [precintos, transitos, alertas])
  const stats = useMemo(() => {
    const totalOperations = precintos.length + transitos.length
    const activeOperations = precintos.filter(p => p.estado === 'en_transito').length + 
                           transitos.filter(t => t.estado === 'en_curso').length
    const criticalAlerts = alertas.filter(a => a.tipo === 'critica' && a.estado === 'activa').length
    const efficiency = transitos.length > 0 
      ? (transitos.filter(t => t.estado === 'completado').length / transitos.length) * 100 
      : 0
    return { totalOperations, activeOperations, criticalAlerts, efficiency }
  }, [precintos, transitos, alertas])
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Operaciones</p>
                <p className="text-xl font-bold">{stats.totalOperations}</p>
              </div>
              <Layers className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Activas</p>
                <p className="text-xl font-bold">{stats.activeOperations}</p>
              </div>
              <Activity className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Alertas Críticas</p>
                <p className="text-xl font-bold">{stats.criticalAlerts}</p>
              </div>
              <Zap className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Eficiencia</p>
                <p className="text-xl font-bold">{stats.efficiency.toFixed(1)}%</p>
              </div>
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vista Operacional Integral</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                General
              </Button>
              <Button
                variant={viewMode === 'efficiency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('efficiency')}
              >
                Eficiencia
              </Button>
              <Button
                variant={viewMode === 'risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('risk')}
              >
                Riesgos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InteractiveTreemap
            data={operationalData}
            width={900}
            height={600}
            title={
              viewMode === 'overview' ? 'Estado General del Sistema' :
              viewMode === 'efficiency' ? 'Análisis de Eficiencia Operacional' :
              'Mapa de Riesgos Operacionales'
            }
            subtitle={
              viewMode === 'overview' ? 'Vista consolidada de todas las operaciones' :
              viewMode === 'efficiency' ? 'Eficiencia por ruta basada en completitud' :
              'Rutas con mayor incidencia de alertas'
            }
            showBreadcrumb={true}
            showTooltip={true}
            animated={true}
            maxZoom={viewMode === 'risk' ? 50 : 100}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <span className="font-medium">Leyenda:</span>
              {viewMode === 'overview' && (
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline" className="bg-green-500/10">Activo/Completado</Badge>
                  <Badge variant="outline" className="bg-blue-500/10">En Proceso</Badge>
                  <Badge variant="outline" className="bg-yellow-500/10">Retrasado/Medio</Badge>
                  <Badge variant="outline" className="bg-red-500/10">Crítico/Cancelado</Badge>
                </div>
              )}
              {viewMode === 'efficiency' && (
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline" className="bg-green-500/10">&gt; 80% Eficiencia</Badge>
                  <Badge variant="outline" className="bg-yellow-500/10">60-80% Eficiencia</Badge>
                  <Badge variant="outline" className="bg-red-500/10">&lt; 60% Eficiencia</Badge>
                </div>
              )}
              {viewMode === 'risk' && (
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline" className="bg-red-600/10">Riesgo Alto</Badge>
                  <Badge variant="outline" className="bg-red-500/10">Riesgo Medio</Badge>
                  <Badge variant="outline" className="bg-yellow-500/10">Riesgo Bajo</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}