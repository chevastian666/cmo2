/**
 * Widget de tránsitos activos para el dashboard
 * By Cheva
 */

import React from 'react'
import {Truck, MapPin, Clock, AlertTriangle} from 'lucide-react'
import { cn} from '../../../utils/utils'
import { motion} from 'framer-motion'
import { useTransitosStore} from '../../../store/store'
export const TransitWidget: React.FC = () => {
  const transitos = useTransitosStore(state => state.transitos)
  // Filtrar solo tránsitos activos
  const activosTransitos = transitos
    .filter(t => t.estado === 'EN_TRANSITO')
    .slice(0, 4)
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EN_TRANSITO': {
  return 'text-green-400 bg-green-500/10'
      case 'DETENIDO': {
  return 'text-yellow-400 bg-yellow-500/10'
      case 'COMPLETADO': {
  return 'text-blue-400 bg-blue-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }
  const calcularProgreso = (inicio: Date, estimado: Date) => {
    const ahora = new Date()
    const tiempoTotal = estimado.getTime() - inicio.getTime()
    const tiempoTranscurrido = ahora.getTime() - inicio.getTime()
    return Math.min(Math.round((tiempoTranscurrido / tiempoTotal) * 100), 100)
  }
  if (activosTransitos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500">Sin tránsitos activos</p>
        </div>
      </div>
    )
  }

  return (<div className="h-full flex flex-col">
      <div className="flex-1 space-y-2 overflow-auto">
        {activosTransitos.map((transito, index) => (
          <motion.div
            key={transito.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-1.5 rounded',
                  getEstadoColor(transito.estado)
                )}>
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {transito.codigo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transito.conductor}
                  </p>
                </div>
              </div>
              
              {transito.alertas && transito.alertas > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">{transito.alertas}</span>
                </div>
              )}
            </div>
            
            {/* Ruta */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {transito.origen} → {transito.destino}
              </span>
            </div>
            
            {/* Progreso */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Progreso</span>
                <span className="text-gray-400">
                  {calcularProgreso(
                    new Date(transito.fechaInicio),
                    new Date(transito.fechaEstimada)
                  )}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${calcularProgreso(
                      new Date(transito.fechaInicio),
                      new Date(transito.fechaEstimada)
                    )}%` 
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
            </div>
            
            {/* Tiempo estimado */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3" />
              <span>
                Llegada estimada: {new Date(transito.fechaEstimada).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {transitos.length > 4 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <button className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Ver todos los tránsitos →
          </button>
        </div>
      )}
    </div>
  )
}