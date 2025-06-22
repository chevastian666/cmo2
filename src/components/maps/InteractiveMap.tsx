 
/**
 * Interactive Map Component Placeholder
 * Google Maps dependency removed
 * By Cheva
 */

import React, { useState } from 'react'
import {Map, Navigation2, ZoomIn, ZoomOut, Maximize2, Search, ChevronLeft, ChevronRight, MapPin} from 'lucide-react'
import { Card} from '@/components/ui/Card'
import { Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Separator} from '@/components/ui/separator'
import { Switch} from '@/components/ui/switch'
import { Label} from '@/components/ui/label'
import { ScrollArea} from '@/components/ui/scroll-area'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/utils/utils'
import { AnimatedButton, AnimatedDiv} from '@/components/animations/AnimatedComponents'
export interface MapMarker {
  id: string
  position: { lat: number; lng: number }
  title: string
  type: 'precinto' | 'transito' | 'deposito' | 'zona' | 'alerta'
  data?: unknown
  icon?: string
  color?: string
}

export interface MapRoute {
  id: string
  path: Array<{ lat: number; lng: number }>
  color?: string
  strokeWeight?: number
  name?: string
}

interface InteractiveMapProps {
  markers?: MapMarker[]
  routes?: MapRoute[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onMarkerClick?: (marker: MapMarker) => void
  showControls?: boolean
  showLegend?: boolean
  showSearch?: boolean
  className?: string
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
}

const URUGUAY_CENTER = { lat: -32.5228, lng: -55.7658 }
const MARKER_CONFIGS = {
  precinto: {
    icon: '📍',
    color: '#3B82F6',
    zIndex: 100
  },
  transito: {
    icon: '🚛',
    color: '#10B981',
    zIndex: 200
  },
  deposito: {
    icon: '🏭',
    color: '#8B5CF6',
    zIndex: 150
  },
  zona: {
    icon: '🛑',
    color: '#F59E0B',
    zIndex: 50
  },
  alerta: {
    icon: '⚠️',
    color: '#EF4444',
    zIndex: 300
  }
}
export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  markers = [], routes: _routes = [], center: _center = URUGUAY_CENTER, zoom = 7, height = "600px", onMarkerClick, showControls = true, showLegend = true, showSearch = true, className, mapType: _mapType = 'roadmap'
}) => {
  // Unused variables to avoid lint errors - will be used when map is implemented
  void _routes
  void _center
  void _mapType
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showTraffic, setShowTraffic] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [, setCurrentZoom] = useState(zoom)
  // Filter markers based on search and filter
  const filteredMarkers = markers.filter(marker => {
    const matchesSearch = !searchTerm || 
      marker.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || marker.type === filterType
    return matchesSearch && matchesFilter
  })
  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 1, 20))
  }
  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 1, 1))
  }
  const handleCenter = () => {
    setCurrentZoom(zoom)
  }
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
    if (onMarkerClick) {
      onMarkerClick(marker)
    }
  }
  return (
    <Card className={cn("relative overflow-hidden", className)} style={{ height }}>
      <div className="absolute inset-0 flex">
        {/* Map Container - Placeholder */}
        <div className={cn(
          "flex-1 relative bg-gray-900",
          showSidebar && showControls ? "mr-80" : ""
        )}>
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-gray-600 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-gray-300">Mapa no disponible</p>
                <p className="text-sm text-gray-500 mt-1">
                  Vista de mapa temporalmente deshabilitada
                </p>
              </div>
              {filteredMarkers.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-2">
                    {filteredMarkers.length} elementos en el mapa
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map Controls */}
          {showControls && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 space-y-2"
            >
              <AnimatedButton
                size="sm"
                variant="secondary"
                onClick={handleZoomIn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                size="sm"
                variant="secondary"
                onClick={handleZoomOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomOut className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                size="sm"
                variant="secondary"
                onClick={handleCenter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Navigation2 className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                size="sm"
                variant="secondary"
                onClick={toggleFullscreen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Maximize2 className="h-4 w-4" />
              </AnimatedButton>
            </motion.div>
          )}

          {/* Legend */}
          {showLegend && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3"
            >
              <p className="text-xs font-medium text-gray-300 mb-2">Leyenda</p>
              <div className="space-y-1">
                {Object.entries(MARKER_CONFIGS).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-xs text-gray-400 capitalize">
                      {config.icon} {type}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Toggle Sidebar Button */}
          {showControls && (<motion.button
              className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => setShowSidebar(!showSidebar)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showSidebar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </motion.button>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && showControls && (<motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700 flex flex-col"
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-500" />
                  Control de Mapa
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Search */}
                  {showSearch && (
                    <div>
                      <Label htmlFor="search">Buscar</Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Buscar en el mapa..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Filter */}
                  <div>
                    <Label htmlFor="filter">Filtrar por tipo</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger id="filter" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="precinto">Precintos</SelectItem>
                        <SelectItem value="transito">Tránsitos</SelectItem>
                        <SelectItem value="deposito">Depósitos</SelectItem>
                        <SelectItem value="zona">Zonas</SelectItem>
                        <SelectItem value="alerta">Alertas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="traffic" className="text-sm">Mostrar tráfico</Label>
                      <Switch
                        id="traffic"
                        checked={showTraffic}
                        onCheckedChange={setShowTraffic}
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Markers List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Elementos ({filteredMarkers.length})
                    </h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredMarkers.map((marker, index) => (
                          <motion.div
                            key={marker.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer",
                              selectedMarker?.id === marker.id && "ring-2 ring-blue-500"
                            )}
                            onClick={() => handleMarkerClick(marker)}
                          >
                            <div className="flex items-start gap-3">
                              <div 
                                className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                                style={{ backgroundColor: marker.color || MARKER_CONFIGS[marker.type].color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-white truncate">
                                  {marker.title}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {MARKER_CONFIGS[marker.type].icon} {marker.type}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Marker Details */}
                  {selectedMarker && (
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-800 rounded-lg"
                    >
                      <h4 className="font-medium text-white mb-2">{selectedMarker.title}</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>Tipo: {selectedMarker.type}</p>
                        <p>Lat: {selectedMarker.position.lat.toFixed(6)}</p>
                        <p>Lng: {selectedMarker.position.lng.toFixed(6)}</p>
                        {selectedMarker.data && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <pre className="text-xs">{JSON.stringify(selectedMarker.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </AnimatedDiv>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
export default InteractiveMap