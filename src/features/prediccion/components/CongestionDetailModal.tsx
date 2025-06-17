import React from 'react';
import { X, TrendingUp, Truck, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  InfoRow,
  InfoGrid,
  InfoSection,
  Badge,
  StatusBadge
} from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { CongestionAnalysis } from '../types';

interface CongestionDetailModalProps {
  congestion: CongestionAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const CongestionDetailModal: React.FC<CongestionDetailModalProps> = ({
  congestion,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getSeverityBadge = () => {
    switch (congestion.severidad) {
      case 'critica':
        return <StatusBadge variant="danger" pulse>Crítica</StatusBadge>;
      case 'alta':
        return <StatusBadge variant="warning" pulse>Alta</StatusBadge>;
      case 'media':
        return <StatusBadge variant="warning">Media</StatusBadge>;
      default:
        return <StatusBadge variant="info">Baja</StatusBadge>;
    }
  };

  const timeRange = `${congestion.ventanaInicio.toLocaleTimeString('es-UY', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${congestion.ventanaFin.toLocaleTimeString('es-UY', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;

  const duracionVentana = Math.round(
    (congestion.ventanaFin.getTime() - congestion.ventanaInicio.getTime()) / (1000 * 60)
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-3xl w-full max-h-[90vh] overflow-hidden bg-gray-900">
          {/* Header */}
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  congestion.severidad === 'critica' ? "bg-red-900/20" :
                  congestion.severidad === 'alta' ? "bg-orange-900/20" :
                  congestion.severidad === 'media' ? "bg-yellow-900/20" : "bg-blue-900/20"
                )}>
                  <TrendingUp className={cn(
                    "h-6 w-6",
                    congestion.severidad === 'critica' ? "text-red-500" :
                    congestion.severidad === 'alta' ? "text-orange-500" :
                    congestion.severidad === 'media' ? "text-yellow-500" : "text-blue-500"
                  )} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Análisis de Congestión - {congestion.destino}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {timeRange}
                  </p>
                </div>
                {getSeverityBadge()}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="space-y-6">
              {/* Resumen */}
              <InfoSection title="Resumen de Congestión">
                <InfoGrid>
                  <InfoRow 
                    label="Punto de operación" 
                    value={congestion.destino}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <InfoRow 
                    label="Ventana temporal" 
                    value={timeRange}
                    icon={<Clock className="h-4 w-4" />}
                  />
                  <InfoRow 
                    label="Duración ventana" 
                    value={`${duracionVentana} minutos`}
                  />
                  <InfoRow 
                    label="Camiones afectados" 
                    value={congestion.cantidadCamiones.toString()}
                    icon={<Truck className="h-4 w-4" />}
                    valueClassName={
                      congestion.severidad === 'critica' ? 'text-red-400' :
                      congestion.severidad === 'alta' ? 'text-orange-400' :
                      congestion.severidad === 'media' ? 'text-yellow-400' : ''
                    }
                  />
                </InfoGrid>
              </InfoSection>

              {/* Advertencia para congestiones críticas */}
              {congestion.severidad === 'critica' && (
                <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium">
                        ⚠️ Congestión Crítica Detectada
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        Se recomienda tomar medidas preventivas inmediatas para evitar 
                        demoras operativas significativas en {congestion.destino}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista detallada de camiones */}
              <InfoSection title="Camiones en la ventana de congestión">
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase">
                    <div>Matrícula</div>
                    <div>Chofer</div>
                    <div>Origen</div>
                    <div>ETA</div>
                    <div>Tiempo hasta llegada</div>
                  </div>
                  
                  {congestion.camiones
                    .sort((a, b) => a.eta.getTime() - b.eta.getTime())
                    .map((camion) => {
                      const minutosHastaLlegada = Math.round(
                        (camion.eta.getTime() - Date.now()) / (1000 * 60)
                      );
                      
                      return (
                        <div key={camion.id} className="grid grid-cols-5 gap-4 py-2 border-b border-gray-800">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-500" />
                            <span className="text-white font-medium">{camion.matricula}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-300">{camion.chofer}</span>
                          </div>
                          <div className="text-gray-300">{camion.origen}</div>
                          <div className="font-mono text-gray-300">
                            {camion.eta.toLocaleTimeString('es-UY', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className={cn(
                            "font-medium",
                            minutosHastaLlegada <= 15 ? "text-red-400" :
                            minutosHastaLlegada <= 30 ? "text-yellow-400" : "text-green-400"
                          )}>
                            {minutosHastaLlegada > 0 
                              ? `En ${minutosHastaLlegada} min` 
                              : 'Ya llegó'}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </InfoSection>

              {/* Recomendaciones */}
              <InfoSection title="Recomendaciones Operativas">
                <div className="space-y-2">
                  {congestion.severidad === 'critica' && (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          Activar protocolo de descarga rápida en {congestion.destino}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          Notificar a los operadores del punto para preparar recursos adicionales
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          Considerar desvío temporal de algunos camiones a puntos alternativos
                        </p>
                      </div>
                    </>
                  )}
                  {(congestion.severidad === 'alta' || congestion.severidad === 'media') && (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          Preparar personal adicional en {congestion.destino}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          Coordinar con los choferes para escalonar llegadas si es posible
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </InfoSection>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};