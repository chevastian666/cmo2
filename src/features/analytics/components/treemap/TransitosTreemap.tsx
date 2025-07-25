/**
 * Transitos Treemap Component
 * Hierarchical visualization of transits by route and status
 * By Cheva
 */

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import { MapPin, Truck, Clock } from 'lucide-react'
import { InteractiveTreemap} from '@/components/charts/treemap/InteractiveTreemap'
import { transformTransitsByRoute, createHierarchy, transformByTimePeriod} from '@/components/charts/treemap/utils/dataTransformers'

interface MockTransito {
  id: string;
  ruta?: string;
  origen?: string;
  destino?: string;
  fechaInicio?: Date | string;
  estado?: string;
  retraso?: number;
  // Add other transito properties as needed
}

export const TransitosTreemap: React.FC = () => {
  // Mock data - in production, replace with real data from store or API
  const transitos = useMemo<MockTransito[]>(() => [], [])
  
  const [viewMode, setViewMode] = useState<'routes' | 'timeline' | 'delays'>('routes')
  const treemapData = useMemo(() => {
    if (!transitos.length) {
      return {
        name: 'Tránsitos',
        children: [
          {
            name: 'Sin datos',
            value: 1,
            color: '#6b7280'
          }
        ]
      }
    }

    switch (viewMode) {
      case 'routes':
        return transformTransitsByRoute(transitos)
      case 'timeline':
        return transformByTimePeriod(transitos, 'fechaInicio', 'week')
      case 'delays': {
        const delayedTransits = transitos.filter(t => t.estado === 'retrasado')
        return createHierarchy(delayedTransits, ['origen', 'destino'])
      }
      default:
        return transformTransitsByRoute(transitos)
    }
  }, [transitos, viewMode])
  const stats = useMemo(() => {
    const total = transitos.length
    const active = transitos.filter(t => t.estado === 'en_curso').length
    const delayed = transitos.filter(t => t.estado === 'retrasado').length
    const routes = new Set(transitos.map(t => `${t.origen}-${t.destino}`)).size
    return { total, active, delayed, routes }
  }, [transitos])
  return (<div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Activos</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Retrasados</p>
                <p className="text-xl font-bold">{stats.delayed}</p>
              </div>
              <Clock className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Rutas</p>
                <p className="text-xl font-bold">{stats.routes}</p>
              </div>
              <MapPin className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Análisis de Tránsitos</CardTitle>
            <ToggleGroup value={viewMode} onValueChange={(value) => value && setViewMode(value as 'routes' | 'timeline' | 'delays')}>
              <ToggleGroupItem value="routes">Rutas</ToggleGroupItem>
              <ToggleGroupItem value="timeline">Línea de Tiempo</ToggleGroupItem>
              <ToggleGroupItem value="delays">Retrasos</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          <InteractiveTreemap
            data={treemapData}
            width={900}
            height={600}
            title={
              viewMode === 'routes' ? 'Tránsitos por Ruta' :
              viewMode === 'timeline' ? 'Tránsitos por Semana' :
              'Tránsitos Retrasados'
            }
            showBreadcrumb={true}
            showTooltip={true}
            animated={true}
            colorScheme={
              viewMode === 'delays' 
                ? ['#ef4444', '#f87171', '#fca5a5', '#fecaca']
                : ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}