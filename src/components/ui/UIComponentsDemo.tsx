import React, { useState } from 'react';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  AlertsPanel, Alert,
  TransitCard, TransitInfo,
  StatusBadge,
  MapModule, MapMarker,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, BadgeGroup,
  InfoRow, InfoGrid, InfoSection,
  EmptyState,
  LoadingState, LoadingOverlay, Skeleton
} from './index';

export const UIComponentsDemo: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('tabs');

  // Sample data
  const sampleAlerts: Alert[] = [
    {
      id: '1',
      title: 'Temperatura Alta Detectada',
      description: 'El precinto #12345 ha registrado una temperatura superior a los límites establecidos',
      severity: 'critical',
      timestamp: new Date(Date.now() - 300000),
      source: 'Sensor Temp #12345',
      status: 'active'
    },
    {
      id: '2',
      title: 'Batería Baja',
      description: 'Nivel de batería al 15%',
      severity: 'medium',
      timestamp: new Date(Date.now() - 3600000),
      source: 'Precinto #67890',
      status: 'acknowledged'
    },
    {
      id: '3',
      title: 'Conexión Restaurada',
      severity: 'info',
      timestamp: new Date(Date.now() - 7200000),
      source: 'Sistema',
      status: 'resolved'
    }
  ];

  const sampleTransit: TransitInfo = {
    id: 'TRN-001',
    origin: 'Buenos Aires',
    destination: 'Mendoza',
    status: 'in-transit',
    progress: 65,
    startTime: new Date(Date.now() - 7200000),
    estimatedArrival: new Date(Date.now() + 3600000),
    vehicle: {
      type: 'Camión',
      plate: 'ABC-123',
      driver: 'Juan Pérez'
    },
    cargo: {
      description: 'Contenedor Refrigerado',
      weight: 2500,
      units: 1
    }
  };

  const sampleMarkers: MapMarker[] = [
    { id: '1', lat: -34.6037, lng: -58.3816, type: 'origin', label: 'Buenos Aires' },
    { id: '2', lat: -32.8908, lng: -68.8272, type: 'destination', label: 'Mendoza' },
    { id: '3', lat: -33.4489, lng: -60.6693, type: 'vehicle', label: 'Posición Actual', status: 'active' },
    { id: '4', lat: -33.0, lng: -61.0, type: 'alert', label: 'Alerta', status: 'alert' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">UI Components Demo</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="tabs">Tabs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="transit">Transit</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
          </TabsList>

          <TabsContent value="tabs">
            <Card>
              <CardHeader>
                <CardTitle>Tabs Component</CardTitle>
                <CardDescription>Navegación con pestañas reutilizable</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1">
                  <TabsList>
                    <TabsTrigger value="tab1">Pestaña 1</TabsTrigger>
                    <TabsTrigger value="tab2">Pestaña 2</TabsTrigger>
                    <TabsTrigger value="tab3" disabled>Deshabilitada</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">
                    <p className="text-gray-300">Contenido de la primera pestaña</p>
                  </TabsContent>
                  <TabsContent value="tab2">
                    <p className="text-gray-300">Contenido de la segunda pestaña</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-6">
              <AlertsPanel
                alerts={sampleAlerts}
                title="Panel de Alertas"
                onAlertClick={(alert) => console.log('Alert clicked:', alert)}
              />
              
              <AlertsPanel
                alerts={sampleAlerts}
                variant="compact"
                title="Panel Compacto"
                maxHeight="200px"
              />
              
              <AlertsPanel
                alerts={[]}
                title="Sin Alertas"
                emptyMessage="No hay alertas en este momento"
              />
            </div>
          </TabsContent>

          <TabsContent value="transit">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TransitCard
                transit={sampleTransit}
                onClick={(t) => console.log('Transit clicked:', t)}
              />
              
              <TransitCard
                transit={{ ...sampleTransit, status: 'delayed', progress: 45 }}
                variant="compact"
              />
              
              <TransitCard
                transit={{ ...sampleTransit, status: 'arrived', actualArrival: new Date() }}
                variant="detailed"
              />
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge variant="default">Default</StatusBadge>
                    <StatusBadge variant="success">Success</StatusBadge>
                    <StatusBadge variant="warning">Warning</StatusBadge>
                    <StatusBadge variant="danger">Danger</StatusBadge>
                    <StatusBadge variant="info">Info</StatusBadge>
                    <StatusBadge variant="secondary">Secondary</StatusBadge>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <StatusBadge variant="danger" pulse>Pulsing</StatusBadge>
                    <StatusBadge variant="success" outline>Outline</StatusBadge>
                    <StatusBadge variant="info" size="xs">Extra Small</StatusBadge>
                    <StatusBadge variant="warning" size="lg">Large</StatusBadge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>General Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <BadgeGroup>
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="success" dot>Active</Badge>
                      <Badge variant="warning" removable onRemove={() => console.log('Removed')}>
                        Removable
                      </Badge>
                    </BadgeGroup>
                    
                    <BadgeGroup max={3}>
                      <Badge>Tag 1</Badge>
                      <Badge>Tag 2</Badge>
                      <Badge>Tag 3</Badge>
                      <Badge>Tag 4</Badge>
                      <Badge>Tag 5</Badge>
                    </BadgeGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="space-y-6">
              <MapModule
                markers={sampleMarkers}
                height="500px"
                onMarkerClick={(marker) => console.log('Marker clicked:', marker)}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MapModule
                  markers={sampleMarkers.slice(0, 2)}
                  variant="compact"
                  height="300px"
                  showControls={false}
                />
                
                <MapModule
                  markers={[sampleMarkers[2]]}
                  variant="compact"
                  height="300px"
                  showLegend={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Default</CardTitle>
                  <CardDescription>Descripción de la tarjeta</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Contenido de la tarjeta con estilo por defecto.</p>
                </CardContent>
                <CardFooter>
                  <button className="text-blue-400 hover:text-blue-300">Acción</button>
                </CardFooter>
              </Card>
              
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Card Elevated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tarjeta con sombra elevada.</p>
                </CardContent>
              </Card>
              
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Card Bordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tarjeta con borde prominente.</p>
                </CardContent>
              </Card>
              
              <Card variant="ghost">
                <CardHeader>
                  <CardTitle>Card Ghost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tarjeta con fondo semi-transparente.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardContent>
                <InfoSection title="Información General">
                  <InfoRow label="ID" value="TRN-001" copyable />
                  <InfoRow label="Estado" value="Activo" variant="highlight" />
                  <InfoRow label="Fecha" value="14/06/2025" extra="10:30 AM" />
                  <InfoRow 
                    label="Ubicación" 
                    value="Buenos Aires"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                </InfoSection>
                
                <InfoSection title="Detalles Adicionales" collapsible className="mt-6">
                  <InfoGrid columns={2}>
                    <InfoRow label="Peso" value="2,500 kg" variant="compact" />
                    <InfoRow label="Volumen" value="45 m³" variant="compact" />
                    <InfoRow label="Temperatura" value="4°C" variant="compact" />
                    <InfoRow label="Humedad" value="65%" variant="compact" />
                  </InfoGrid>
                </InfoSection>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="states">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <LoadingState variant="spinner" size="md" />
                      <p className="text-sm text-gray-400 mt-2">Spinner</p>
                    </div>
                    <div className="text-center">
                      <LoadingState variant="dots" size="md" />
                      <p className="text-sm text-gray-400 mt-2">Dots</p>
                    </div>
                    <div className="text-center">
                      <LoadingState variant="pulse" size="md" />
                      <p className="text-sm text-gray-400 mt-2">Pulse</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <LoadingState variant="progress" progress={65} />
                  </div>
                  
                  <div className="mt-8">
                    <LoadingState variant="skeleton" rows={3} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Empty States</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EmptyState
                      title="Sin resultados"
                      message="No se encontraron elementos que coincidan con tu búsqueda"
                      icon="search"
                      action={{
                        label: 'Limpiar filtros',
                        onClick: () => console.log('Clear filters')
                      }}
                    />
                    
                    <EmptyState
                      message="No hay datos disponibles"
                      icon="data"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Skeletons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                    <div className="flex gap-4">
                      <Skeleton variant="circular" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="80%" />
                      </div>
                    </div>
                    <Skeleton variant="rectangular" height={200} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};