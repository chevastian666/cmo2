/**
 * Map Visualization for Torre de Control
 * Alternative visualization without Google Maps
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import {_MapPin, Navigation, Activity, AlertTriangle, TrendingUp, Clock, Truck} from 'lucide-react'
import { Card} from '@/components/ui/Card'
import { Badge} from '@/components/ui/badge'
import { Progress} from '@/components/ui/progress'
import { ScrollArea} from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { motion, AnimatePresence} from 'framer-motion'
import type { TransitoTorreControl} from '../types'
import { cn} from '@/utils/utils'
interface MapVisualizationProps {
  data: TransitoTorreControl[]
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ data }) => {
  const [_selectedTab, _setSelectedTab] = useState('rutas')
  const [selectedTransito, setSelectedTransito] = useState<TransitoTorreControl | null>(null)
  const [_isLoading, _setIsLoading] = useState(true)
  useEffect(() => {
    // Simulate loading delay to ensure proper mounting
    const _timer = setTimeout(() => {
      _setIsLoading(false)
    }, 100)
    return () => clearTimeout(_timer)
  }, [])
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []
  // Group transitos by route
  const _routeGroups = safeData.reduce((acc, transito) => {
    const route = `${transito.origen} → ${transito.destino}`
    if (!acc[route]) {
      acc[route] = []
    }
    acc[route].push(transito)
    return acc
  }, {} as Record<string, TransitoTorreControl[]>)
  // Group by status
  const _statusGroups = {
    verde: safeData.filter(t => t.semaforo === 'verde'),
    amarillo: safeData.filter(t => t.semaforo === 'amarillo'),
    rojo: safeData.filter(t => t.semaforo === 'rojo')
  }
  // Sort routes by activity
  const sortedRoutes = Object.entries(_routeGroups).sort((a, b) => {
    const aActivity = a[1].filter(t => t.semaforo !== 'verde').length
    const bActivity = b[1].filter(t => t.semaforo !== 'verde').length
    return bActivity - aActivity
  })
  if (_isLoading) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-400" />
          Visualización de Rutas y Tránsitos
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!safeData || safeData.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-400" />
          Visualización de Rutas y Tránsitos
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Truck className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-300">No hay tránsitos activos</p>
            <p className="text-sm text-gray-500 mt-1">
              Los tránsitos aparecerán aquí cuando estén en ruta
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (<div className="h-full flex flex-col" style={{ minHeight: '400px' }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Navigation className="h-5 w-5 text-blue-400" />
        Visualización de Rutas y Tránsitos
      </h3>

      <Tabs value={s_electedTab} onValueChange={s_etSelectedTab} className="flex-1 flex flex-col" style={{ minHeight: '300px' }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rutas">Por Rutas</TabsTrigger>
          <TabsTrigger value="estado">Por Estado</TabsTrigger>
          <TabsTrigger value="tiempo">Línea de Tiempo</TabsTrigger>
        </TabsList>

        <TabsContent value="rutas" className="flex-1 mt-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {sortedRoutes.map(([route, transitos]) => {
                const hasIssues = transitos.some(t => t.semaforo !== 'verde')
                const criticalCount = transitos.filter(t => t.semaforo === 'rojo').length
                const warningCount = transitos.filter(t => t.semaforo === 'amarillo').length
                return (
                  <motion.div
                    key={route}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      hasIssues ? "bg-red-500/10 border-red-500/30" : "bg-gray-800 border-gray-700"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {route}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {transitos.length} tránsito{transitos.length !== 1 ? 's' : ''} activo{transitos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {criticalCount > 0 && (
                          <Badge variant="destructive" className="animate-pulse">
                            {_criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {warningCount > 0 && (
                          <Badge variant="warning">
                            {_warningCount} precaución
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {transitos.map((_transito) => (
                        <motion.div
                          key={transito.id}
                          className={cn(
                            "p-3 rounded-md cursor-pointer transition-all",
                            "hover:bg-gray-700/50",
                            selectedTransito?.id === transito.id && "ring-2 ring-blue-500"
                          )}
                          onClick={() => setSelectedTransito(_transito)}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                transito.semaforo === 'verde' && "bg-green-500",
                                transito.semaforo === 'amarillo' && "bg-yellow-500",
                                transito.semaforo === 'rojo' && "bg-red-500 animate-pulse"
                              )} />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {transito.matricula} - {transito.dua}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {transito.chofer}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Progress value={transito.progreso} className="w-20 h-2" />
                              <p className="text-xs text-gray-400 mt-1">{transito.progreso}%</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="estado" className="flex-1 mt-4">
          <div className="grid grid-cols-1 gap-4 h-full">
            {Object.entries(s_tatusGroups).map(([status, transitos]) => (
              <Card key={s_tatus} className={cn(
                "flex-1",
                status === 'verde' && "border-green-500/30 bg-green-500/5",
                status === 'amarillo' && "border-yellow-500/30 bg-yellow-500/5",
                status === 'rojo' && "border-red-500/30 bg-red-500/5"
              )}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={cn(
                      "font-medium capitalize flex items-center gap-2",
                      status === 'verde' && "text-green-400",
                      status === 'amarillo' && "text-yellow-400",
                      status === 'rojo' && "text-red-400"
                    )}>
                      <Activity className="h-4 w-4" />
                      {s_tatus} ({transitos.length})
                    </h4>
                  </div>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {transitos.map((_transito) => (
                        <div
                          key={transito.id}
                          className="p-2 bg-gray-800/50 rounded flex items-center justify-between text-sm"
                        >
                          <span className="text-white">{transito.matricula}</span>
                          <span className="text-gray-400">{transito.origen} → {transito.destino}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiempo" className="flex-1 mt-4">
          <ScrollArea className="h-full">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />
              
              {/* Timeline items */}
              <div className="space-y-6">
                {safeData
                  .sort((_a, b) => new Date(b.ultimaActualizacion).getTime() - new Date(a.ultimaActualizacion).getTime())
                  .map((_transito, index) => (
                    <motion.div
                      key={transito.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 bg-gray-900 z-10 mt-1",
                        transito.semaforo === 'verde' && "border-green-500",
                        transito.semaforo === 'amarillo' && "border-yellow-500",
                        transito.semaforo === 'rojo' && "border-red-500"
                      )} />
                      <div className="flex-1 bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-white">
                              {transito.matricula} - {transito.dua}
                            </p>
                            <p className="text-sm text-gray-400">
                              {transito.origen} → {transito.destino}
                            </p>
                          </div>
                          <Badge variant={
                            transito.semaforo === 'verde' ? 'default' : 
                            transito.semaforo === 'amarillo' ? 'warning' : 'destructive'
                          }>
                            {transito.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(transito.ultimaActualizacion).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {transito.progreso}%
                          </span>
                          {transito.alertas.length > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              {transito.alertas.length} alerta{transito.alertas.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Selected Transit Details */}
      <AnimatePresence>
        {selectedTransito && (<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Detalles del Tránsito</h4>
              <button
                onClick={() => setSelectedTransito(_null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">DUA:</span>
                <span className="ml-2 text-white">{selectedTransito.dua}</span>
              </div>
              <div>
                <span className="text-gray-400">Matrícula:</span>
                <span className="ml-2 text-white">{selectedTransito.matricula}</span>
              </div>
              <div>
                <span className="text-gray-400">Chofer:</span>
                <span className="ml-2 text-white">{selectedTransito.chofer}</span>
              </div>
              <div>
                <span className="text-gray-400">Progreso:</span>
                <span className="ml-2 text-white">{selectedTransito.progreso}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}