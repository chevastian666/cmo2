import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Tabs,
  AlertsPanel,
  TransitCard,
  StatusBadge,
  InfoRow,
  InfoGrid,
  LoadingState,
  EmptyState,
  Badge,
  BadgeGroup
} from '../../../components/ui';
import { SystemStatusCard } from './SystemStatusCard';
import { KPICards } from './KPICards';
import { RealtimeIndicator } from './RealtimeIndicator';
import { 
  usePrecintosActivos, 
  useTransitosPendientes, 
  useAlertasActivas, 
  useSystemStatus 
} from '../../../store/hooks';
import { formatTimeAgo } from '../../../utils/formatters';
import { Package, Truck, AlertTriangle, Activity } from 'lucide-react';

export const DashboardRefactored: React.FC = () => {
  const { precintos, loading: precintosLoading } = usePrecintosActivos();
  const { estadisticas, smsPendientes, dbStats, apiStats, reportesPendientes } = useSystemStatus();
  const { alertas, loading: alertasLoading } = useAlertasActivas();
  const { transitos, loading: transitosLoading } = useTransitosPendientes();
  const [activeTab, setActiveTab] = useState('overview');

  // Transform alerts for AlertsPanel
  const alertItems = alertas.map(alerta => ({
    id: alerta.id,
    title: alerta.codigoPrecinto,
    message: alerta.mensaje,
    severity: alerta.severidad,
    timestamp: alerta.timestamp,
    meta: alerta.ubicacion ? `${alerta.ubicacion.lat.toFixed(4)}, ${alerta.ubicacion.lng.toFixed(4)}` : undefined
  }));

  // Transform transits for TransitCard
  const activeTransits = transitos.filter(t => t.estado === 'en_proceso').slice(0, 5);

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: <Activity className="h-4 w-4" /> },
    { id: 'transits', label: 'Tránsitos', icon: <Truck className="h-4 w-4" /> },
    { id: 'alerts', label: 'Alertas', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'seals', label: 'Precintos', icon: <Package className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Panel de Control</h2>
          <p className="text-gray-400 mt-1 text-base sm:text-lg">
            Sistema de Monitoreo de Precintos Electrónicos - Block Tracker
          </p>
        </div>
        <RealtimeIndicator />
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPICards transitos={transitos} alertas={alertas} />

          {/* System Status */}
          <SystemStatusCard
            smsPendientes={smsPendientes}
            dbStats={dbStats}
            apiStats={apiStats}
            reportesPendientes={reportesPendientes}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Transits */}
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Tránsitos Activos</h3>
                <BadgeGroup>
                  <Badge variant="blue">{activeTransits.length} activos</Badge>
                  <Badge variant="yellow">{transitos.filter(t => t.estado === 'pendiente').length} pendientes</Badge>
                </BadgeGroup>
              </CardHeader>
              <CardContent className="space-y-3">
                {transitosLoading ? (
                  <LoadingState variant="pulse" />
                ) : activeTransits.length === 0 ? (
                  <EmptyState 
                    icon="truck"
                    title="Sin tránsitos activos"
                    description="No hay tránsitos en proceso en este momento"
                  />
                ) : (
                  activeTransits.map(transito => (
                    <TransitCard
                      key={transito.id}
                      transit={{
                        id: transito.id || '',
                        vehicleId: transito.matricula,
                        origin: transito.origen,
                        destination: transito.destino,
                        status: transito.estado || 'pendiente',
                        startTime: transito.fechaIngreso || Math.floor(Date.now() / 1000),
                        cargo: {
                          type: transito.tipoCarga,
                          description: `DUA: ${transito.dua}`
                        },
                        driver: {
                          name: transito.chofer || 'No asignado',
                          id: transito.ci || ''
                        }
                      }}
                      variant="compact"
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Alerts Panel */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Alertas Activas</h3>
              </CardHeader>
              <CardContent>
                {alertasLoading ? (
                  <LoadingState variant="dots" />
                ) : (
                  <AlertsPanel
                    alerts={alertItems}
                    variant="compact"
                    onAlertClick={(alert) => console.log('Alert clicked:', alert)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Seals Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Resumen de Precintos</h3>
            </CardHeader>
            <CardContent>
              <InfoGrid>
                <InfoRow
                  label="Precintos Activos"
                  value={precintos.length.toString()}
                  icon={<Package className="h-4 w-4" />}
                />
                <InfoRow
                  label="En Alarma"
                  value={precintos.filter(p => p.estado === 'alarma').length.toString()}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  valueClassName="text-red-400"
                />
                <InfoRow
                  label="Batería Baja"
                  value={estadisticas?.precintosConBateriaBaja?.toString() || '0'}
                  valueClassName="text-yellow-400"
                />
                <InfoRow
                  label="Tiempo Promedio"
                  value={`${estadisticas?.tiempoPromedioTransito || 0}h`}
                />
              </InfoGrid>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'transits' && (
        <Card>
          <CardContent>
            <EmptyState
              icon="truck"
              title="Sección de Tránsitos"
              description="Vista detallada de tránsitos próximamente"
              action={{
                label: 'Ver tabla completa',
                onClick: () => console.log('Navigate to transits')
              }}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardContent>
            <AlertsPanel
              alerts={alertItems}
              onAlertClick={(alert) => console.log('Alert clicked:', alert)}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'seals' && (
        <Card>
          <CardContent>
            <EmptyState
              icon="package"
              title="Sección de Precintos"
              description="Vista detallada de precintos próximamente"
              action={{
                label: 'Ver todos los precintos',
                onClick: () => console.log('Navigate to seals')
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};