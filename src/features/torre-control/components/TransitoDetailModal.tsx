import React, { useEffect, useRef, useState } from 'react';
import {_X, _Truck, _User, _MapPin, _Clock, _Package, _AlertTriangle, _CheckCircle, _XCircle, Battery, _Wifi, Navigation, _Calendar, Activity, Shield, Route, Gauge, _MessageSquare, _FileText, _Hash, Camera, Maximize2, Download, Play, Pause} from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  InfoRow,
  InfoGrid,
  InfoSection,
  Badge,
  BadgeGroup,
  AlertsPanel
} from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { TransitoTorreControl, EstadoSemaforo } from '../types';


interface TransitoDetailModalProps {
  transito: TransitoTorreControl;
  isOpen: boolean;
  onClose: () => void;
}

export const TransitoDetailModal: React.FC<TransitoDetailModalProps> = ({
  transito,
  isOpen,
  onClose
}) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(100); // 0-100 representing journey progress
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);






  const handleTimelineChange = (value: number) => {
    setTimelinePosition(value);
    
    // Calculate the time based on position
    const totalDuration = transito.eta.getTime() - transito.fechaSalida.getTime();
    const currentDuration = (totalDuration * value) / 100;
    const currentTime = new Date(transito.fechaSalida.getTime() + currentDuration);
    setSelectedTime(currentTime);
  };

  const togglePlayTimeline = () => {
    if (isPlayingTimeline) {
      // Stop playing
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlayingTimeline(false);
    } else {
      // Start playing
      setIsPlayingTimeline(true);
      let currentPos = timelinePosition;
      
      playIntervalRef.current = setInterval(() => {
        currentPos += 2; // Move 2% each interval
        if (currentPos >= 100) {
          currentPos = 0; // Loop back to start
        }
        handleTimelineChange(currentPos);
      }, 100); // Update every 100ms
    }
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const getSemaforoIcon = (semaforo: EstadoSemaforo) => {
    switch (semaforo) {
      case 'verde':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'amarillo':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'rojo':
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getSemaforoLabel = (semaforo: EstadoSemaforo) => {
    switch (semaforo) {
      case 'verde':
        return 'Sin problemas';
      case 'amarillo':
        return 'Advertencia';
      case 'rojo':
        return 'Problemas detectados';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    const duration = transito.eta.getTime() - transito.fechaSalida.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const alerts = transito.alertas?.map((alerta, index) => ({
    id: `alert-${index}`,
    title: `Alerta #${index + 1}`,
    message: alerta,
    severity: 'alta' as const,
    timestamp: Date.now() / 1000
  })) || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
        <Card variant="elevated" className="pointer-events-auto max-w-4xl w-full max-h-[90vh] overflow-hidden bg-gray-900">
          {/* Header */}
          <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl",
                    transito.semaforo === 'verde' ? "bg-green-900/30" :
                    transito.semaforo === 'amarillo' ? "bg-yellow-900/30" : "bg-red-900/30"
                  )}>
                    <Truck className={cn(
                      "h-6 w-6",
                      transito.semaforo === 'verde' ? "text-green-500" :
                      transito.semaforo === 'amarillo' ? "text-yellow-500" : "text-red-500"
                    )} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Tránsito {transito.pvid}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-400">{transito.matricula}</span>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1.5">
                        {getSemaforoIcon(transito.semaforo)}
                        <span className={cn(
                          "text-sm font-medium",
                          transito.semaforo === 'verde' ? "text-green-400" :
                          transito.semaforo === 'amarillo' ? "text-yellow-400" : "text-red-400"
                        )}>
                          {getSemaforoLabel(transito.semaforo)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Cerrar (ESC)"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Información del Viaje */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-500" />
                    Información del Viaje
                  </h3>
                  <div className="space-y-3">
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
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Progreso del viaje</span>
                      <span className="text-xs text-gray-400">{transito.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 relative overflow-hidden",
                          transito.semaforo === 'verde' ? "bg-green-500" :
                          transito.semaforo === 'amarillo' ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${transito.progreso}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Aduanera */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Información Aduanera
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DUA</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                          {transito.dua || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Viaje</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroViaje || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Movimiento</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroMovimiento || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Chofer */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Información del Chofer
                  </h3>
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
                </div>

                {/* Información del Precinto */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Información del Precinto
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código de Precinto</p>
                      <p className={cn(
                        "font-medium flex items-center gap-2",
                        transito.precinto ? "text-white" : "text-red-400"
                      )}>
                        <Package className="h-4 w-4" />
                        {transito.precinto || 'No asignado'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Larga</span>
                        <span className={cn(
                          "text-sm font-medium",
                          transito.eslinga_larga ? "text-green-400" : "text-red-400"
                        )}>
                          {transito.eslinga_larga ? '✓ Colocada' : '✗ No colocada'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Corta</span>
                        <span className={cn(
                          "text-sm font-medium",
                          transito.eslinga_corta ? "text-green-400" : "text-red-400"
                        )}>
                          {transito.eslinga_corta ? '✓ Colocada' : '✗ No colocada'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Foto del Precintado */}
                {transito.fotoPrecintado && (
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-500" />
                      Foto del Precintado
                    </h3>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download functionality
                            const link = document.createElement('a');
                            link.href = transito.fotoPrecintado!;
                            link.download = `precinto-${transito.pvid}.jpg`;
                            link.click();
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {transito.observaciones && (
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Observaciones
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{transito.observaciones}</p>
                  </div>
                )}

                {/* Alertas */}
                {alerts.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Alertas Activas ({alerts.length})
                    </h3>
                    <AlertsPanel 
                      alerts={alerts}
                      variant="compact"
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Map */}
              <div className="space-y-6">
                {/* Ubicación Actual */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-500" />
                    Ubicación en Tiempo Real
                  </h3>
                  
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
                                <button
                                  onClick={togglePlayTimeline}
                                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                  title={isPlayingTimeline ? 'Pausar' : 'Reproducir'}
                                >
                                  {isPlayingTimeline ? (
                                    <Pause className="h-4 w-4 text-white" />
                                  ) : (
                                    <Play className="h-4 w-4 text-white" />
                                  )}
                                </button>
                                
                                <div className="flex-1 relative">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={timelinePosition}
                                    onChange={(e) => handleTimelineChange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${timelinePosition}%, #374151 ${timelinePosition}%, #374151 100%)`
                                    }}
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
                </div>
                
                {/* Additional Stats */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Estadísticas del Viaje
                  </h3>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Image Modal */}
      {showFullImage && transito.fotoPrecintado && (
        <>
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img 
                src={transito.fotoPrecintado} 
                alt="Precinto colocado - Vista completa"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Precinto {transito.precinto}</p>
                    <p className="text-sm text-gray-300">Tránsito {transito.pvid}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = transito.fotoPrecintado!;
                      link.download = `precinto-${transito.pvid}-full.jpg`;
                      link.click();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar imagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};