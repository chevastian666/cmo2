import React from 'react';
import { X, MapPin, Battery, Thermometer, Activity, Package, AlertTriangle } from 'lucide-react';
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
  Tabs,
  MapModule,
  LoadingState
} from '../../../components/ui';
import { cn } from '../../../utils/utils';
import { PrecintoStatus, getStatusInfo } from '../types';
import type { Precinto } from '../../../types';

interface PrecintoDetailModalRefactoredProps {
  precinto: Precinto;
  isOpen: boolean;
  onClose: () => void;
}

export const PrecintoDetailModalRefactored: React.FC<PrecintoDetailModalRefactoredProps> = ({
  precinto,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = React.useState('info');
  const statusInfo = getStatusInfo(precinto.estado as any);

  if (!isOpen) return null;

  const tabs = [
    { id: 'info', label: 'Información', icon: <Package className="h-4 w-4" /> },
    { id: 'location', label: 'Ubicación', icon: <MapPin className="h-4 w-4" /> },
    { id: 'sensors', label: 'Sensores', icon: <Activity className="h-4 w-4" /> },
    { id: 'history', label: 'Historial', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  // Create map markers
  const mapMarkers: MapModuleProps['markers'] = precinto.ubicacionActual ? [{
    id: precinto.id,
    position: [precinto.ubicacionActual.lat, precinto.ubicacionActual.lng],
    type: 'vehicle',
    popup: {
      title: precinto.codigo,
      description: precinto.ubicacionActual.direccion || 'Ubicación actual'
    }
  }] : [];

  // Create route if we have origin and destination
  const mapRoute: MapModuleProps['route'] = precinto.ruta ? {
    id: 'main-route',
    points: [
      [-34.9011, -56.1645], // Mock origin coordinates
      [precinto.ubicacionActual?.lat || -34.9011, precinto.ubicacionActual?.lng || -56.1645]
    ],
    color: '#3B82F6'
  } : undefined;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Precinto {precinto.codigo}
                </h2>
                <BadgeGroup>
                  <StatusBadge 
                    variant={statusInfo.variant as any}
                    pulse={precinto.estado === 'alarma'}
                  >
                    {statusInfo.label}
                  </StatusBadge>
                  {precinto.bateria < 20 && (
                    <Badge variant="yellow">Batería baja</Badge>
                  )}
                </BadgeGroup>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          {/* Tabs */}
          <div className="border-b border-gray-700">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <InfoSection title="Información General">
                  <InfoGrid>
                    <InfoRow label="Número de Serie" value={precinto.nserie} copyable />
                    <InfoRow label="QR" value={precinto.nqr} />
                    <InfoRow label="Viaje" value={precinto.viaje || 'No asignado'} />
                    <InfoRow label="MOV" value={precinto.mov?.toString() || 'N/A'} />
                    <InfoRow label="DUA" value={precinto.dua || 'No especificado'} />
                    <InfoRow label="Tipo" value={precinto.tipo} />
                  </InfoGrid>
                </InfoSection>

                {precinto.contenedor && (
                  <InfoSection title="Contenedor" collapsible>
                    <InfoGrid>
                      <InfoRow label="Número" value={precinto.contenedor.numero} copyable />
                      <InfoRow label="Tipo" value={precinto.contenedor.tipo} />
                      <InfoRow label="Destino" value={precinto.contenedor.destino} />
                    </InfoGrid>
                  </InfoSection>
                )}

                {precinto.ruta && (
                  <InfoSection title="Ruta">
                    <InfoGrid>
                      <InfoRow label="Origen" value={precinto.ruta.origen} />
                      <InfoRow label="Destino" value={precinto.ruta.destino} />
                      {precinto.ruta.aduanaOrigen && (
                        <InfoRow label="Aduana Origen" value={precinto.ruta.aduanaOrigen} />
                      )}
                      {precinto.ruta.aduanaDestino && (
                        <InfoRow label="Aduana Destino" value={precinto.ruta.aduanaDestino} />
                      )}
                    </InfoGrid>
                  </InfoSection>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                {precinto.ubicacionActual ? (
                  <>
                    <InfoSection title="Ubicación Actual">
                      <InfoGrid>
                        <InfoRow 
                          label="Coordenadas" 
                          value={`${precinto.ubicacionActual.lat.toFixed(6)}, ${precinto.ubicacionActual.lng.toFixed(6)}`}
                          copyable
                        />
                        {precinto.ubicacionActual.direccion && (
                          <InfoRow label="Dirección" value={precinto.ubicacionActual.direccion} />
                        )}
                        <InfoRow 
                          label="Última actualización" 
                          value={new Date(precinto.fechaUltimaLectura * 1000).toLocaleString('es-UY')}
                        />
                      </InfoGrid>
                    </InfoSection>

                    <div className="h-96">
                      <MapModule
                        center={[precinto.ubicacionActual.lat, precinto.ubicacionActual.lng]}
                        zoom={13}
                        markers={mapMarkers}
                        route={mapRoute}
                        showControls
                        showLegend
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay información de ubicación disponible</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sensors' && (
              <div className="space-y-4">
                <InfoSection title="Estado de Sensores">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Battery Card */}
                    <Card variant="bordered">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Batería</span>
                          <Battery className={cn(
                            "h-5 w-5",
                            precinto.bateria >= 60 ? "text-green-500" :
                            precinto.bateria >= 30 ? "text-yellow-500" : "text-red-500"
                          )} />
                        </div>
                        <p className="text-2xl font-bold text-white">{precinto.bateria}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              precinto.bateria >= 60 ? "bg-green-500" :
                              precinto.bateria >= 30 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${precinto.bateria}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Temperature Card */}
                    <Card variant="bordered">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Temperatura</span>
                          <Thermometer className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {precinto.temperatura || 'N/A'}°C
                        </p>
                        {precinto.humedad && (
                          <p className="text-sm text-gray-400 mt-1">
                            Humedad: {precinto.humedad}%
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <InfoGrid className="mt-4">
                    <InfoRow 
                      label="GPS" 
                      value={precinto.gps?.activo ? 'Activo' : 'Inactivo'}
                      valueClassName={precinto.gps?.activo ? 'text-green-400' : 'text-red-400'}
                    />
                    {precinto.gps?.señal && (
                      <InfoRow label="Señal GPS" value={`${precinto.gps.señal}%`} />
                    )}
                    {precinto.gps?.satelites && (
                      <InfoRow label="Satélites" value={precinto.gps.satelites.toString()} />
                    )}
                    <InfoRow 
                      label="Estado Eslinga" 
                      value={precinto.eslinga.estado}
                      valueClassName={
                        precinto.eslinga.estado === 'cerrada' ? 'text-green-400' :
                        precinto.eslinga.estado === 'abierta' ? 'text-yellow-400' : 'text-red-400'
                      }
                    />
                  </InfoGrid>
                </InfoSection>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <LoadingState 
                  variant="skeleton" 
                  message="Historial próximamente disponible"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};