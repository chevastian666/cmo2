/**
 * Precinto Lifecycle Flow Component
 * Visualizes the lifecycle stages of precintos
 * By Cheva
 */

import React, { useMemo } from 'react'
import { Card, CardContent} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Package, CheckCircle, XCircle, Zap, TrendingDown } from 'lucide-react'
import { SankeyChart} from '@/components/charts/sankey/SankeyChart'
import { transformPrecintoLifecycle} from '@/components/charts/sankey/utils/dataTransformers'
import type { PrecintoFlow} from '@/components/charts/types/sankey.types'
import type { Precinto } from '@/types/api/maindb.types'
interface PrecintoLifecycleFlowProps {
  dateRange?: { from: Date; to: Date }
}

export const PrecintoLifecycleFlow: React.FC<PrecintoLifecycleFlowProps> = ({ dateRange: _dateRange }) => {

  // Calculate lifecycle stages from actual data
  const lifecycleData = useMemo(() => {
    const precintos: Precinto[] = []; // Mock data
    const stages: PrecintoFlow[] = [
      {
        stage: 'created',
        count: precintos.filter(p => p.estado === 'CNP').length || 100,
        nextStage: 'activated',
        dropoffCount: 5
      },
      {
        stage: 'activated',
        count: precintos.filter(p => p.estado === 'SAL').length || 95,
        nextStage: 'in_transit',
        dropoffCount: 3
      },
      {
        stage: 'in_transit',
        count: precintos.filter(p => p.estado === 'en_transito').length || 92,
        nextStage: 'completed',
        dropoffCount: 2
      },
      {
        stage: 'completed',
        count: precintos.filter(p => p.estado === 'completado').length || 90,
        nextStage: 'deactivated',
        dropoffCount: 0
      },
      {
        stage: 'deactivated',
        count: precintos.filter(p => p.estado === 'desactivado').length || 90
      }
    ]
    return stages
  }, [])
  const chartData = useMemo(() => {
    return transformPrecintoLifecycle(lifecycleData)
  }, [lifecycleData])
  // Calculate conversion rates
  const conversionRates = useMemo(() => {
    const rates = []
    for (let i = 0; i < lifecycleData.length - 1; i++) {
      const current = lifecycleData[i]
      const next = lifecycleData[i + 1]
      if (current.count > 0 && next) {
        rates.push({
          from: current.stage,
          to: next.stage,
          rate: ((next.count / current.count) * 100).toFixed(1)
        })
      }
    }
    return rates
  }, [lifecycleData])
  const stageIcons: Record<string, React.ReactNode> = {
    created: <Package className="h-5 w-5" />,
    activated: <Zap className="h-5 w-5" />,
    in_transit: <Package className="h-5 w-5" />,
    completed: <CheckCircle className="h-5 w-5" />,
    deactivated: <XCircle className="h-5 w-5" />
  }
  const stageColors: Record<string, string> = {
    created: 'bg-gray-500',
    activated: 'bg-blue-500',
    in_transit: 'bg-purple-500',
    completed: 'bg-green-500',
    deactivated: 'bg-red-500'
  }
  return (<div className="space-y-6">
      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {lifecycleData.map((stage) => (
          <Card key={stage.stage} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stageColors[stage.stage]}/10`}>
                  <div className={`${stageColors[stage.stage].replace('bg-', 'text-')}`}>
                    {stageIcons[stage.stage]}
                  </div>
                </div>
                {stage.dropoffCount && stage.dropoffCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -{stage.dropoffCount}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 capitalize">
                {stage.stage.replace('_', ' ')}
              </p>
              <p className="text-2xl font-bold">{stage.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sankey Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-900 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            <SankeyChart
              data={chartData}
              width={900}
              height={400}
              margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
              nodeWidth={30}
              nodePadding={40}
              animated={true}
              interactive={true}
              showLabels={true}
              showValues={true}
              colors={['#6b7280', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']}
              valueFormat={(v) => `${v} precintos`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tasas de Conversión</h3>
          <div className="space-y-3">
            {conversionRates.map((rate) => (
              <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 capitalize">
                    {rate.from.replace('_', ' ')}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className="text-sm text-gray-400 capitalize">
                    {rate.to.replace('_', ' ')}
                  </span>
                </div>
                <Badge 
                  variant={parseFloat(rate.rate) >= 95 ? 'success' : 
                          parseFloat(rate.rate) >= 90 ? 'warning' : 'destructive'}
                >
                  {rate.rate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}