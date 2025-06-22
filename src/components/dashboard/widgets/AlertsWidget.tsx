/**
 * Widget de alertas para el dashboard
 * By Cheva
 */

import React from 'react'
import {AlertCircle, AlertTriangle, Info, CheckCircle} from 'lucide-react'
import { cn} from '../../../utils/utils'
import { motion} from 'framer-motion'
import { useAlertasStore} from '../../../store/store'
import { AnimatedBadge} from '../../animations/AnimatedComponents'
// Alert interface removed - using data from store directly

export const AlertsWidget: React.FC = () => {
  const alertas = useAlertasStore(state => state.alertas)
  // Tomar las últimas 5 alertas
  const recentAlerts = alertas.slice(0, 5)
  const iconMap = {
    critica: <AlertCircle className="h-4 w-4" />,
    advertencia: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    exito: <CheckCircle className="h-4 w-4" />
  }
  const colorMap = {
    critica: 'text-red-400 bg-red-500/10',
    advertencia: 'text-yellow-400 bg-yellow-500/10',
    info: 'text-blue-400 bg-blue-500/10',
    exito: 'text-green-400 bg-green-500/10'
  }
  const getRelativeTime = (fecha: Date) => {
    const now = new Date()
    const diff = now.getTime() - fecha.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }
  if (recentAlerts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2 opacity-50" />
          <p className="text-gray-500">Sin alertas activas</p>
        </div>
      </div>
    )
  }

  return (<div className="h-full flex flex-col">
      <div className="flex-1 space-y-2 overflow-auto">
        {recentAlerts.map((alerta, index) => (
          <motion.div
            key={alerta.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-3 rounded-lg border',
              'bg-gray-800/50 border-gray-700',
              'hover:bg-gray-800 transition-colors'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-1.5 rounded',
                colorMap[alerta.severidad as keyof typeof colorMap] || colorMap.info
              )}>
                {iconMap[alerta.severidad as keyof typeof iconMap] || iconMap.info}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white line-clamp-2">
                  {alerta.mensaje}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(new Date(alerta.fecha))}
                  </span>
                  {alerta.severidad === 'CRITICA' && (
                    <AnimatedBadge variant="danger" pulse>
                      Crítica
                    </AnimatedBadge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {alertas.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            +{alertas.length - 5} alertas más
          </p>
        </div>
      )}
    </div>
  )
}