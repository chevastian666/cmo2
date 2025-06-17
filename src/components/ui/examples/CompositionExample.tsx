import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Tabs,
  StatusBadge,
  Badge,
  BadgeGroup,
  InfoRow,
  InfoGrid,
  AlertsPanel,
  TransitCard,
  EmptyState,
  LoadingState,
  MapModule
} from '../index';
import { Package, Truck, AlertTriangle, Activity, MapPin } from 'lucide-react';

/**
 * This example demonstrates how to compose the modular UI components
 * to create complex, reusable interfaces
 */
export const CompositionExample: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(false);

  // Example data
  const mockAlerts = [
    {
      id: '1',
      title: 'PTN - BT20240001',
      message: 'Precinto abierto sin autorización',
      severity: 'alta' as const,
      timestamp: Date.now() / 1000 - 300,
      meta: 'Puerto Montevideo'
    },
    {
      id: '2',
      title: 'BBJ - BT20240045',
      message: 'Batería baja - 15% restante',
      severity: 'alta' as const,
      timestamp: Date.now() / 1000 - 1800
    }
  ];

  const mockTransit = {
    id: 'TR-001',
    vehicleId: 'UY-1234',
    origin: 'Montevideo',
    destination: 'Rivera',
    status: 'en_proceso' as const,
    startTime: Date.now() / 1000 - 7200,
    estimatedArrival: Date.now() / 1000 + 14400,
    progress: 35,
    cargo: {
      type: 'Contenedor',
      description: '40HC - MSKU7234561'
    },
    driver: {
      name: 'Juan Pérez',
      id: '1.234.567-8',
      phone: '+598 99 123 456'
    }
  };

  const tabs = [
    { id: 'overview', label: 'General', icon: <Activity className="h-4 w-4" /> },
    { id: 'transits', label: 'Tránsitos', icon: <Truck className="h-4 w-4" /> },
    { id: 'alerts', label: 'Alertas', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'map', label: 'Mapa', icon: <MapPin className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Ejemplos de Composición de Componentes</h1>
      
      {/* Example 1: Dashboard Layout with Tabs */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Panel de Monitoreo</h2>
            <BadgeGroup>
              <StatusBadge variant="success" pulse>Activo</StatusBadge>
              <Badge variant="blue">v2.0</Badge>
            </BadgeGroup>
          </div>
        </CardHeader>
        
        <div className="border-b border-gray-700">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        
        <CardContent>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transit Summary Card */}
              <Card variant="bordered">
                <CardHeader>
                  <h3 className="font-medium text-white">Tránsito Activo</h3>
                </CardHeader>
                <CardContent>
                  <TransitCard transit={mockTransit} variant="compact" />
                </CardContent>
              </Card>
              
              {/* Alerts Summary */}
              <Card variant="bordered">
                <CardHeader>
                  <h3 className="font-medium text-white">Alertas Recientes</h3>
                </CardHeader>
                <CardContent>
                  <AlertsPanel 
                    alerts={mockAlerts} 
                    variant="compact"
                    onAlertClick={(alert) => console.log('Alert clicked:', alert)}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'transits' && (
            <div className="space-y-4">
              <TransitCard transit={mockTransit} variant="detailed" />
              <InfoGrid>
                <InfoRow label="Total en viaje" value="12" />
                <InfoRow label="Pendientes" value="5" />
                <InfoRow label="Completados hoy" value="8" />
                <InfoRow label="Tiempo promedio" value="4.5h" />
              </InfoGrid>
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <AlertsPanel 
              alerts={[...mockAlerts, ...mockAlerts, ...mockAlerts]} 
              onAlertClick={(alert) => console.log('Alert clicked:', alert)}
            />
          )}
          
          {activeTab === 'map' && (
            <div className="h-96">
              <MapModule
                center={[-34.9011, -56.1645]}
                zoom={12}
                markers={[
                  {
                    id: '1',
                    position: [-34.9011, -56.1645],
                    type: 'vehicle',
                    popup: {
                      title: 'UY-1234',
                      description: 'En ruta hacia Rivera'
                    }
                  },
                  {
                    id: '2',
                    position: [-34.8721, -56.1595],
                    type: 'alert',
                    popup: {
                      title: 'Alerta PTN',
                      description: 'Precinto abierto'
                    }
                  }
                ]}
                showControls
                showLegend
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example 2: Loading States */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Estados de Carga</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Spinner</p>
              <LoadingState variant="spinner" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Dots</p>
              <LoadingState variant="dots" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Pulse</p>
              <LoadingState variant="pulse" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Skeleton</p>
              <LoadingState variant="skeleton" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Progress</p>
              <LoadingState variant="progress" progress={75} size="md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example 3: Empty States */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <EmptyState
              icon="package"
              title="Sin precintos"
              description="No hay precintos activos"
              size="sm"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <EmptyState
              icon="truck"
              title="Sin tránsitos"
              description="No hay tránsitos en proceso"
              action={{
                label: 'Crear tránsito',
                onClick: () => console.log('Create transit')
              }}
              size="sm"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <EmptyState
              icon="alert"
              title="Sin alertas"
              description="Todo funcionando correctamente"
              size="sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Example 4: Status Badges Showcase */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Variantes de Badges</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Status Badges</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="default">Default</StatusBadge>
                <StatusBadge variant="success">Success</StatusBadge>
                <StatusBadge variant="warning">Warning</StatusBadge>
                <StatusBadge variant="danger">Danger</StatusBadge>
                <StatusBadge variant="info">Info</StatusBadge>
                <StatusBadge variant="secondary">Secondary</StatusBadge>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">With Pulse Animation</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="success" pulse>Online</StatusBadge>
                <StatusBadge variant="danger" pulse>Alert</StatusBadge>
                <StatusBadge variant="warning" pulse>Processing</StatusBadge>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">Regular Badges</p>
              <BadgeGroup>
                <Badge variant="gray">Default</Badge>
                <Badge variant="red">Critical</Badge>
                <Badge variant="yellow">Warning</Badge>
                <Badge variant="green">Active</Badge>
                <Badge variant="blue">Info</Badge>
                <Badge variant="indigo">Special</Badge>
                <Badge variant="purple">Premium</Badge>
                <Badge variant="pink">New</Badge>
              </BadgeGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};