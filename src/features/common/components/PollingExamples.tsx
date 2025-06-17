import React from 'react';
import { MapModule } from '../../../components/ui/MapModule';
import { TransitCard } from '../../../components/ui/TransitCard';
import { AlertsPanel } from '../../../components/ui/AlertsPanel';
import { useMapPolling, useTransitPolling, useAlertsPolling } from '../hooks/usePollingIntegration';
import { Card } from '../../../components/ui/Card';
import { RefreshCw } from 'lucide-react';

/**
 * Ejemplo de MapModule con actualización automática
 */
export const MapWithPolling: React.FC = () => {
  const { markers, routes, isLoading, error, refresh } = useMapPolling();

  return (
    <Card className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={refresh}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <MapModule
        markers={markers}
        routes={routes}
        height="500px"
        useDetailedIcons
        onMarkerClick={(marker) => {
          console.log('Marker clicked:', marker);
        }}
      />
      
      {error && (
        <div className="absolute bottom-4 left-4 bg-red-500/20 border border-red-500 rounded-lg p-2 text-sm text-red-400">
          Error actualizando mapa
        </div>
      )}
    </Card>
  );
};

/**
 * Ejemplo de TransitCard con actualización automática
 */
export const TransitCardWithPolling: React.FC<{ transitId: string }> = ({ transitId }) => {
  const { transit, isLoading, error } = useTransitPolling(transitId);

  if (isLoading && !transit) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-gray-700 rounded"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-red-400">
        Error cargando tránsito
      </Card>
    );
  }

  if (!transit) {
    return null;
  }

  return (
    <TransitCard
      transit={transit}
      onViewHistory={(plate) => {
        console.log('Ver historial de:', plate);
      }}
    />
  );
};

/**
 * Ejemplo de AlertsPanel con actualización automática
 */
export const AlertsPanelWithPolling: React.FC = () => {
  const { 
    alerts, 
    isLoading, 
    error, 
    hasNewCriticalAlert,
    acknowledgeAlert,
    refresh 
  } = useAlertsPolling();

  return (
    <div className="space-y-4">
      {/* Indicador de nuevas alertas críticas */}
      {hasNewCriticalAlert && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 animate-pulse">
          <p className="text-red-400 font-medium flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            ¡Nueva alerta crítica recibida!
          </p>
        </div>
      )}

      <div className="relative">
        {/* Botón de actualización manual */}
        <button
          onClick={refresh}
          className="absolute -top-2 right-2 z-10 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          disabled={isLoading}
          title="Actualizar alertas"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <AlertsPanel
          alerts={alerts}
          onAlertClick={(alert) => {
            console.log('Alert clicked:', alert);
          }}
          onAlertAcknowledge={acknowledgeAlert}
          groupByPriority
          enableSound
          enableVisualPulse
          maxHeight="600px"
        />

        {error && (
          <div className="mt-2 text-sm text-red-400">
            Error actualizando alertas
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Dashboard con todos los componentes integrados con polling
 */
export const DashboardWithPolling: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mapa con actualización automática */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-white mb-4">
          Mapa en Tiempo Real
        </h2>
        <MapWithPolling />
      </div>

      {/* Panel de alertas */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Centro de Alertas
        </h2>
        <AlertsPanelWithPolling />
      </div>

      {/* Tránsitos activos */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Tránsitos Activos
        </h2>
        <div className="space-y-4">
          <TransitCardWithPolling transitId="TR001" />
          <TransitCardWithPolling transitId="TR002" />
        </div>
      </div>
    </div>
  );
};