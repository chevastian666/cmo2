/**
 * Usage Overview Component
 * Shows tenant resource usage and limits
 * By Cheva
 */

import React from 'react'
import {Users, Package, Truck, AlertTriangle, Zap, HardDrive, TrendingUp, CreditCard} from 'lucide-react'
import {_Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/Card'
import { Progress} from '@/components/ui/progress'
import { Badge} from '@/components/ui/badge'
import { Button} from '@/components/ui/button'
import { cn} from '@/utils/utils'
import { motion} from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'
interface UsageMetric {
  label: string
  current: number
  limit: number
  icon: React.ReactNode
  color: string
  unit?: string
}

export const UsageOverview: React.FC = () => {

  if (!currentTenant || !context) {
    return null
  }

  const metrics: UsageMetric[] = [
    {
      label: 'Users',
      current: usage.current.users,
      limit: limits.users,
      icon: <Users className="h-5 w-5" />,
      color: 'blue'
    },
    {
      label: 'Precintos',
      current: usage.current.precintos,
      limit: limits.precintos,
      icon: <Package className="h-5 w-5" />,
      color: 'green'
    },
    {
      label: 'Transits/Month',
      current: usage.current.transitos,
      limit: limits.transitosPerMonth,
      icon: <Truck className="h-5 w-5" />,
      color: 'purple'
    },
    {
      label: 'Alerts/Month',
      current: usage.current.alerts,
      limit: limits.alertsPerMonth,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'orange'
    },
    {
      label: 'API Calls/Day',
      current: usage.current.apiCalls,
      limit: limits.apiCallsPerDay,
      icon: <Zap className="h-5 w-5" />,
      color: 'yellow'
    },
    {
      label: 'Storage',
      current: usage.current.storage,
      limit: 100, // GB
      icon: <HardDrive className="h-5 w-5" />,
      color: 'pink',
      unit: 'GB'
    }
  ]
  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-orange-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  // Mock historical data for chart
  const _historicalData = usage.history.slice(-30).map((h, _index) => ({
    date: new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    transitos: h.metrics.transitos || 0,
    alerts: h.metrics.alerts || 0,
    apiCalls: h.metrics.apiCalls || 0
  }))
  const totalOverageCost = Object.values(usage.overage || {})
    .reduce((sum, overage) => sum + overage.cost, 0)
  return (<div className="space-y-6">
      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((_metric, index) => {
          const percentage = getUsagePercentage(metric.current, metric.limit)
          const isOverLimit = metric.current > metric.limit
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "relative overflow-hidden",
                isOverLimit && "border-red-500/50"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        `bg-${metric.color}-500/10 text-${metric.color}-500`
                      )}>
                        {metric.icon}
                      </div>
                      {metric.label}
                    </CardDescription>
                    {isOverLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Over Limit
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold">
                        {metric.current.toLocaleString()}
                        {metric.unit && <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        / {metric.limit.toLocaleString()} {metric.unit}
                      </div>
                    </div>
                    
                    <Progress 
                      value={_percentage} 
                      className="h-2"
                      indicatorClassName={getProgressColor(_percentage)}
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={getUsageColor(_percentage)}>
                        {percentage.toFixed(1)}% used
                      </span>
                      {metric.limit - metric.current > 0 ? (
                        <span className="text-gray-500">
                          {(metric.limit - metric.current).toLocaleString()} remaining
                        </span>
                      ) : (
                        <span className="text-red-500">
                          {(metric.current - metric.limit).toLocaleString()} over
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>
            Last 30 days activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={_historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="transitos"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                  name="Transits"
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                  name="Alerts"
                />
                <Area
                  type="monotone"
                  dataKey="apiCalls"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="API Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Overage & Billing Alert */}
      {totalOverageCost > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <CardTitle>Usage Overage Detected</CardTitle>
              </div>
              <Badge variant="warning" className="text-lg px-3 py-1">
                +${totalOverageCost.toFixed(2)}
              </Badge>
            </div>
            <CardDescription>
              You have exceeded your plan limits. Additional charges will apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usage.overage || {}).map(([resource, overage]) => (
                <div key={resource} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{resource}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      +{overage.amount} units
                    </span>
                    <Badge variant="outline">
                      ${overage.cost.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                <span className="font-medium">Total Additional Cost</span>
                <span className="font-bold text-orange-500">
                  ${totalOverageCost.toFixed(2)}/month
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  View Billing Details
                </Button>
                <Button size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan: {plan.name}</CardTitle>
              <CardDescription>
                {plan.features.length} features included
              </CardDescription>
            </div>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {plan.features.map((_feature) => (
              <div key={_feature} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-gray-300">{_feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}