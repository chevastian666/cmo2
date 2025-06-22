/**
 * Widget de KPI para el dashboard
 * By Cheva
 */

import React from 'react'
import {TrendingUp, TrendingDown, Minus} from 'lucide-react'
import { cn} from '../../../utils/utils'
import { motion} from 'framer-motion'
interface KPIWidgetProps {
  title: string
  value: number | string
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  description?: string
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title, value, unit = '', change, trend = 'neutral', icon, color = 'blue', description
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
  const trendIcons = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />
  }
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  }
  return (
    <div className="h-full flex flex-col">
      {/* Ícono opcional */}
      {icon && (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
          colorClasses[color]
        )}>
          {icon}
        </div>
      )}
      
      {/* Título */}
      <div className="mb-1">
        <p className="text-sm text-gray-400">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      
      {/* Valor */}
      <div className="flex-1 flex items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-white"
        >
          {value}
          {unit && <span className="text-xl text-gray-400 ml-1">{unit}</span>}
        </motion.div>
      </div>
      
      {/* Cambio/Tendencia */}
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-sm mt-2',
          trendColors[trend]
        )}>
          {trendIcons[trend]}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      )}
    </div>
  )
}