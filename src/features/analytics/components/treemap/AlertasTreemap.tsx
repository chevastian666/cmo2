/**
 * Alertas Treemap Component
 * Hierarchical visualization of alerts by severity and status
 * By Cheva
 */

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label} from '@/components/ui/label'
import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { InteractiveTreemap} from '@/components/charts/treemap/InteractiveTreemap'
import { transformAlertsBySeverity, createHierarchy} from '@/components/charts/treemap/utils/dataTransformers'

// Alert data structure for treemap
interface TreemapAlert {
  id: string
  tipo: 'critica' | 'alta' | 'media' | 'baja'
  estado: 'activa' | 'resuelta' | 'pendiente'
  timestamp: string | number
  origen?: string
  timeCategory?: string
  [key: string]: unknown
}

export const AlertasTreemap: React.FC = () => {
  // Mock data - in production, replace with real data from store or API
  const alertas = useMemo<TreemapAlert[]>(() => [], [])
  
  const [groupBy, setGroupBy] = useState<'severity' | 'source' | 'time'>('severity')
  const treemapData = useMemo(() => {
    if (!alertas.length) {
      return {
        name: 'Alertas',
        children: [
          {
            name: 'Sin alertas activas',
            value: 1,
            color: '#10b981'
          }
        ]
      }
    }

    switch (groupBy) {
      case 'severity':
        return transformAlertsBySeverity(alertas)
      case 'source':
        return createHierarchy(alertas, ['origen', 'tipo', 'estado'])
      case 'time': {

        const now = new Date()
        const categorizedAlerts = alertas.map(alert => {
          const alertTime = new Date(alert.timestamp)
          const hoursDiff = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60)
          let timeCategory = 'Más de 48h'
          if (hoursDiff < 1) timeCategory = 'Última hora'
          else if (hoursDiff < 24) timeCategory = 'Últimas 24h'
          else if (hoursDiff < 48) timeCategory = 'Últimas 48h'
          return { ...alert, timeCategory }
        })
        return createHierarchy(categorizedAlerts, ['timeCategory', 'tipo'])
      }
      default:
        return transformAlertsBySeverity(alertas)
    }
  }, [alertas, groupBy])
  const stats = useMemo(() => {
    const total = alertas.length
    const critical = alertas.filter(a => a.tipo === 'critica').length
    const active = alertas.filter(a => a.estado === 'activa').length
    const resolved = alertas.filter(a => a.estado === 'resuelta').length
    return { total, critical, active, resolved }
  }, [alertas])
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critica':
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case 'activa':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      case 'resuelta':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      default:
        return <XCircle className="h-6 w-6 text-gray-500" />
    }
  }
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Críticas</p>
                <p className="text-xl font-bold">{stats.critical}</p>
              </div>
              {getAlertIcon('critica')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Activas</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
              {getAlertIcon('activa')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Resueltas</p>
                <p className="text-xl font-bold">{stats.resolved}</p>
              </div>
              {getAlertIcon('resuelta')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mapa de Alertas</CardTitle>
            <RadioGroup value={groupBy} onValueChange={(value) => setGroupBy(value as 'severity' | 'source' | 'time')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severity" id="severity" />
                  <Label htmlFor="severity">Severidad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="source" id="source" />
                  <Label htmlFor="source">Origen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time" id="time" />
                  <Label htmlFor="time">Tiempo</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardHeader>
        <CardContent>
          <InteractiveTreemap
            data={treemapData}
            width={900}
            height={600}
            title={
              groupBy === 'severity' ? 'Alertas por Severidad' :
              groupBy === 'source' ? 'Alertas por Origen' :
              'Alertas por Tiempo'
            }
            subtitle="El tamaño representa la cantidad de alertas"
            showBreadcrumb={true}
            showTooltip={true}
            animated={true}
            colorScheme={
              groupBy === 'severity' 
                ? ['#dc2626', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280']
                : ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}