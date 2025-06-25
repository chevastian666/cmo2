// @ts-nocheck
 
import React, { useEffect, useRef, useState } from 'react'
import { User, MapPin, Clock, Package, Battery, Navigation, Calendar, Activity, Shield, Route, Gauge, MessageSquare, FileText, Hash, Camera, Maximize2, Download, Play, Pause, Link2} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Card, CardContent, CardHeader} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Slider} from '@/components/ui/slider'
import { cn} from '@/lib/utils'
export interface TransitoDashboard {
  id: string
  numeroViaje: string
  numeroMovimiento: string
  dua: string
  matricula: string
  chofer: string
  choferCI: string
  origen: string
  destino: string
  fechaSalida: Date
  eta: Date
  estado: 'en_ruta' | 'detenido' | 'completado'
  precintoId: string
  precintoNumero: string
  eslinga_larga: boolean
  eslinga_corta: boolean
  observaciones?: string
  alertas?: string[]
  ubicacionActual?: {
    lat: number
    lng: number
  }
  progreso: number
  fotoPrecintado?: string
  bateria?: number
  temperatura?: number
}

interface TransitoDetailModalProps {
  transitoId: string
  isOpen: boolean
  onClose: () => void
}

export const TransitoDetailModalV2: React.FC<TransitoDetailModalProps> = ({
  transitoId, isOpen, onClose
}) => {
  const [showFullImage, setShowFullImage] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(100); // 0-100 representing journey progress
  const [selectedTime, setSelectedTime] = useState<Date>(new Date())
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [transito, setTransito] = useState<TransitoDashboard | null>(null)
  // Fetch transit data based on transitoId

  useEffect(() => {
    if (isOpen && transitoId) {
      // In a real app, this would fetch from API
      // For now, we'll create mock data
      const mockTransito: TransitoDashboard = {
        id: transitoId,
        numeroViaje: '7581856',
        numeroMovimiento: '1234',
        dua: '788553',
        matricula: 'STP1234',
        chofer: 'Juan Pérez',
        choferCI: '1.234.567-8',
        origen: 'Montevideo',
        destino: 'Rivera',
        fechaSalida: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        eta: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        estado: 'en_ruta',
        precintoId: 'BT20240001',
        precintoNumero: '234',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'Transporte de carga refrigerada. Temperatura controlada.',
        alertas: [],
        ubicacionActual: { lat: -32.5228, lng: -55.7658 },
        progreso: 60,
        fotoPrecintado: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        bateria: 85,
        temperatura: -18
      }
      setTransito(mockTransito)
      setTimelinePosition(mockTransito.progreso)
    }
  }, [isOpen, transitoId])
  const handleTimelineChange = (value: number[]) => {
    const newPosition = value[0]
    setTimelinePosition(newPosition)
    if (!transito) return
    // Calculate the time based on position
    const totalDuration = transito.eta.getTime() - transito.fechaSalida.getTime()
    const currentDuration = (totalDuration * newPosition) / 100
    const currentTime = new Date(transito.fechaSalida.getTime() + currentDuration)
    setSelectedTime(currentTime)
  }
  const togglePlayTimeline = () => {
    if (isPlayingTimeline) {
      // Stop playing
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
      setIsPlayingTimeline(false)
    } else {
      // Start playing
      setIsPlayingTimeline(true)
      let currentPos = timelinePosition
      playIntervalRef.current = setInterval(() => {
        currentPos += 2; // Move 2% each interval
        if (currentPos >= 100) {
          currentPos = 0; // Loop back to start
        }
        handleTimelineChange([currentPos])
      }, 100); // Update every 100ms
    }
  }
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])
  if (!transito) return null
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const calculateDuration = () => {
    const duration = transito.eta.getTime() - transito.fechaSalida.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="border-b border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-900/30">
                  <Link2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Precinto {transito.precintoNumero}
                  </DialogTitle>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-400">{transito.matricula}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">ID: {transito.precintoId}</span>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1.5">
                      <Battery className={cn(
                        "h-4 w-4",
                        transito.bateria && transito.bateria >= 60 ? "text-green-400" :
                        transito.bateria && transito.bateria >= 30 ? "text-yellow-400" : "text-red-400"
                      )} />
                      <span className="text-sm text-gray-400">{transito.bateria}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Información del Viaje */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Route className="h-5 w-5 text-blue-500" />
                      Información del Viaje
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Origen</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {transito.origen}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destino</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {transito.destino}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salida</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDateTime(transito.fechaSalida)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Llegada Estimada</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(transito.eta)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duración</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          {calculateDuration()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Progreso</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-gray-400" />
                          {transito.progreso}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Progreso del viaje</span>
                        <span className="text-xs text-gray-400">{transito.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 relative overflow-hidden bg-green-500"
                          style={{ width: `${transito.progreso}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Aduanera */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Información Aduanera
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DUA</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                          {transito.dua}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Viaje</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroViaje}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Movimiento</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroMovimiento}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del Chofer */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Información del Chofer
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
                        <p className="text-white font-medium">{transito.chofer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CI</p>
                        <p className="text-white font-medium">{transito.choferCI}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del Precinto */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Información del Precinto
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código de Precinto</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {transito.precintoId}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Larga</span>
                        <Badge variant={transito.eslinga_larga ? "success" : "destructive"}>
                          {transito.eslinga_larga ? '✓ Colocada' : '✗ No colocada'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Corta</span>
                        <Badge variant={transito.eslinga_corta ? "success" : "destructive"}>
                          {transito.eslinga_corta ? '✓ Colocada' : '✗ No colocada'}
                        </Badge>
                      </div>
                    </div>

                    {transito.temperatura !== undefined && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Temperatura</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          {transito.temperatura}°C
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Foto del Precintado */}
                {transito.fotoPrecintado && (<Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-500" />
                        Foto del Precintado
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="relative group">
                        <img 
                          src={transito.fotoPrecintado} 
                          alt="Precinto colocado"
                          className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
                          onClick={() => setShowFullImage(true)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                          <Maximize2 className="h-8 w-8 text-white" />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-gray-400">Click para ampliar</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Download functionality
                              const link = document.createElement('a')
                              link.href = transito.fotoPrecintado!
                              link.download = `precinto-${transito.precintoId}.jpg`
                              link.click()
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Observaciones */}
                {transito.observaciones && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Observaciones
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">{transito.observaciones}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Map */}
              <div className="space-y-6">
                {/* Ubicación Actual */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-blue-500" />
                      Ubicación en Tiempo Real
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {transito.ubicacionActual ? (
                      <>
                        {/* Coordinates */}
                        <div className="mb-4 bg-gray-900/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Coordenadas</span>
                            <code className="text-sm text-gray-300 font-mono">
                              {transito.ubicacionActual.lat.toFixed(6)}, {transito.ubicacionActual.lng.toFixed(6)}
                            </code>
                          </div>
                        </div>
                        
                        {/* Map Container - Placeholder */}
                        <div className="relative rounded-lg overflow-hidden border border-gray-700">
                          <div className="w-full h-[400px] bg-gray-900/50 flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                              <p className="text-lg text-gray-400 font-medium mb-2">Mapa no disponible</p>
                              <p className="text-sm text-gray-500">Vista de mapa temporalmente deshabilitada</p>
                              {transito.ubicacionActual && (
                                <p className="text-xs text-gray-500 mt-3">
                                  Coordenadas: {transito.ubicacionActual.lat.toFixed(6)}, {transito.ubicacionActual.lng.toFixed(6)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Timeline Controls */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-700">
                            <div className="space-y-3">
                              {/* Time display */}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Hora simulada:</span>
                                <span className="text-white font-medium">
                                  {selectedTime.toLocaleString('es-UY', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              
                              {/* Timeline slider */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="icon"
                                    onClick={togglePlayTimeline}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    title={isPlayingTimeline ? 'Pausar' : 'Reproducir'}
                                  >
                                    {isPlayingTimeline ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                  
                                  <div className="flex-1 relative">
                                    <Slider
                                      value={[timelinePosition]}
                                      onValueChange={handleTimelineChange}
                                      max={100}
                                      step={1}
                                      className="w-full"
                                    />
                                    
                                    {/* Timeline markers */}
                                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                                      <span>Inicio</span>
                                      <span>{Math.round(timelinePosition)}%</span>
                                      <span>Fin</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Journey info */}
                              <div className="grid grid-cols-2 gap-4 mt-6 pt-3 border-t border-gray-800">
                                <div>
                                  <p className="text-xs text-gray-500">Distancia recorrida</p>
                                  <p className="text-sm text-white font-medium">
                                    {Math.round((timelinePosition / 100) * 450)} km de 450 km
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Tiempo transcurrido</p>
                                  <p className="text-sm text-white font-medium">
                                    {Math.floor((timelinePosition / 100) * 5)}h {Math.round(((timelinePosition / 100) * 5 % 1) * 60)}m de 5h 0m
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-900/50 rounded-lg p-8 text-center">
                        <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Sin ubicación disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Additional Stats */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Estadísticas del Viaje
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{transito.progreso}%</p>
                        <p className="text-xs text-gray-500 mt-1">Completado</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{calculateDuration()}</p>
                        <p className="text-xs text-gray-500 mt-1">Duración Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Modal */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-5xl p-0 bg-black/90">
          <div className="relative">
            <img 
              src={transito.fotoPrecintado} 
              alt="Precinto colocado - Vista completa"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Precinto {transito.precintoId}</p>
                  <p className="text-sm text-gray-300">Viaje {transito.numeroViaje}</p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement('a')
                    link.href = transito.fotoPrecintado!
                    link.download = `precinto-${transito.precintoId}-full.jpg`
                    link.click()
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar imagen
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}