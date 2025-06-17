import React, { useState, useCallback } from 'react';
import { VirtualizedAlertList } from '../VirtualizedAlertList';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import type { Alert, AlertFilters } from '../types/alerts';

// Mock data generator
function generateMockAlerts(count: number, startId: number = 0): Alert[] {
  const severities: Alert['severity'][] = ['low', 'medium', 'high', 'critical'];
  const statuses: Alert['status'][] = ['active', 'acknowledged', 'resolved'];
  const locations = [
    'Buenos Aires, Argentina',
    'Rosario, Argentina',
    'Córdoba, Argentina',
    'Mendoza, Argentina',
    'La Plata, Argentina'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    return {
      id: `alert-${id}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      severity: severities[Math.floor(Math.random() * severities.length)],
      precintoId: `PRECINTO-${1000 + Math.floor(Math.random() * 9000)}`,
      vehicleId: Math.random() > 0.3 ? `VEHICLE-${100 + Math.floor(Math.random() * 900)}` : undefined,
      location: {
        lat: -34.6037 + (Math.random() - 0.5) * 2,
        lng: -58.3816 + (Math.random() - 0.5) * 2,
        address: locations[Math.floor(Math.random() * locations.length)]
      },
      message: `Alerta de prueba #${id}: ${generateRandomMessage()}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedTo: Math.random() > 0.5 ? `Operador ${Math.floor(Math.random() * 10)}` : undefined
    };
  });
}

function generateRandomMessage(): string {
  const messages = [
    'Temperatura fuera de rango permitido',
    'Apertura no autorizada detectada',
    'Pérdida de señal GPS',
    'Batería baja en dispositivo',
    'Movimiento inesperado detectado',
    'Desvío de ruta programada',
    'Tiempo de parada excedido',
    'Intento de manipulación',
    'Sensor de impacto activado',
    'Conexión perdida con servidor'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export const VirtualizedListExample: React.FC = () => {
  const [filters, setFilters] = useState<AlertFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Mock API call
  const loadMoreAlerts = useCallback(async (page: number) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pageSize = 50;
    const totalAlerts = 100000; // Simulate 100k alerts
    const hasMore = (page + 1) * pageSize < totalAlerts;
    
    return {
      alerts: generateMockAlerts(pageSize, page * pageSize),
      hasMore,
      total: totalAlerts
    };
  }, []);

  const handleAlertClick = useCallback((alert: Alert, index: number) => {
    console.log('Alert clicked:', alert, 'at index:', index);
  }, []);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            Centro de Alertas - Virtual Scrolling Demo
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por precinto, vehículo, mensaje..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Severity filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Severidad
                </label>
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map(severity => (
                    <label key={severity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          const current = filters.severity || [];
                          if (e.target.checked) {
                            setFilters(prev => ({ 
                              ...prev, 
                              severity: [...current, severity as Alert['severity']] 
                            }));
                          } else {
                            setFilters(prev => ({ 
                              ...prev, 
                              severity: current.filter(s => s !== severity) 
                            }));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-300 capitalize">{severity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <div className="space-y-2">
                  {['active', 'acknowledged', 'resolved'].map(status => (
                    <label key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          const current = filters.status || [];
                          if (e.target.checked) {
                            setFilters(prev => ({ 
                              ...prev, 
                              status: [...current, status as Alert['status']] 
                            }));
                          } else {
                            setFilters(prev => ({ 
                              ...prev, 
                              status: current.filter(s => s !== status) 
                            }));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-300 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virtual list */}
      <div className="flex-1 relative">
        <VirtualizedAlertList
          alerts={[]} // Empty initial, will load via onLoadMore
          itemHeight={100} // Approximate height
          containerHeight={window.innerHeight - 200} // Adjust based on header height
          overscan={5}
          onItemClick={handleAlertClick}
          onLoadMore={loadMoreAlerts}
          filters={filters}
          className="h-full"
        />
      </div>
    </div>
  );
};