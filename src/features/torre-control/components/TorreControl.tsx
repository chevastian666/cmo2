/**
 * Torre de Control - Sistema de Monitoreo en Tiempo Real
 * By Cheva
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  User,
  RefreshCw,
  Filter,
  ChevronRight,
  Activity
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { Card } from '../../../components/ui';
import { TransitoRow } from './TransitoRow';
import { TransitoDetailModal } from './TransitoDetailModal';
import { TorreControlFilters } from './TorreControlFilters';
import { TorreControlHeader } from './TorreControlHeader';
import { CountdownTimer } from './CountdownTimer';
import { CongestionPanel } from '../../prediccion';
import { notificationService } from '../../../services/shared/notification.service';
import { torreControlService } from '../services/torreControl.service';
import type { TransitoTorreControl, EstadoSemaforo } from '../types';
import type { CongestionAnalysis } from '../../prediccion/types';

interface TorreControlProps {
  className?: string;
}

export const TorreControl: React.FC<TorreControlProps> = ({ className }) => {
  const [transitos, setTransitos] = useState<TransitoTorreControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransito, setSelectedTransito] = useState<TransitoTorreControl | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCongestionPanel, setShowCongestionPanel] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [lastCongestionNotification, setLastCongestionNotification] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    origen: '',
    destino: '',
    estado: '' as EstadoSemaforo | ''
  });

  // Fetch transitos data from API
  const fetchTransitos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await torreControlService.getTransitosEnRuta();
      setTransitos(data);
      setLastUpdate(new Date());
      
      // Mock data fallback (remove this when API is ready)
      if (data.length === 0) {
        const mockData: TransitoTorreControl[] = [
        {
          id: '1',
          pvid: 'STP5678',
          matricula: 'STP1234',
          chofer: 'Juan Pérez',
          choferCI: '1.234.567-8',
          origen: 'Montevideo',
          destino: 'Rivera',
          fechaSalida: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          eta: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
          estado: 1,
          semaforo: 'verde',
          precinto: 'BT20240001',
          eslinga_larga: true,
          eslinga_corta: true,
          observaciones: 'En ruta sin novedades',
          ubicacionActual: { lat: -32.5228, lng: -55.7658 },
          progreso: 40
        },
        {
          id: '2',
          pvid: 'STP5678',
          matricula: 'STP1234',
          chofer: 'María Silva',
          choferCI: '2.345.678-9',
          origen: 'Chuy',
          destino: 'Montevideo',
          fechaSalida: new Date(Date.now() - 4 * 60 * 60 * 1000),
          eta: new Date(Date.now() + 1 * 60 * 60 * 1000),
          estado: 1,
          semaforo: 'amarillo',
          precinto: 'BT20240002',
          eslinga_larga: true,
          eslinga_corta: false,
          observaciones: 'Falta eslinga corta',
          alertas: ['Eslinga corta no colocada'],
          ubicacionActual: { lat: -33.2524, lng: -54.1234 },
          progreso: 75
        },
        {
          id: '3',
          pvid: 'STP5678',
          matricula: 'STP1234',
          chofer: 'Pedro González',
          choferCI: '3.456.789-0',
          origen: 'Fray Bentos',
          destino: 'Paysandú',
          fechaSalida: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
          eta: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
          estado: 1,
          semaforo: 'rojo',
          precinto: '',
          eslinga_larga: false,
          eslinga_corta: false,
          observaciones: 'Precinto no asignado',
          alertas: ['Precinto no asignado', 'Eslingas no colocadas'],
          progreso: 0
        },
        {
          id: '4',
          pvid: 'STP5678',
          matricula: 'STP1234',
          chofer: 'Ana Rodríguez',
          choferCI: '4.567.890-1',
          origen: 'Nueva Palmira',
          destino: 'Colonia',
          fechaSalida: new Date(Date.now() - 1 * 60 * 60 * 1000),
          eta: new Date(Date.now() + 45 * 60 * 1000),
          estado: 1,
          semaforo: 'verde',
          precinto: 'BT20240004',
          eslinga_larga: true,
          eslinga_corta: true,
          observaciones: 'Transporte refrigerado',
          ubicacionActual: { lat: -34.0983, lng: -57.8456 },
          progreso: 85
        },
        {
          id: '5',
          pvid: 'STP5678',
          matricula: 'STP1234',
          chofer: 'Sebastian Saucedo',
          choferCI: '5.678.901-2',
          origen: 'Rivera',
          destino: 'Montevideo',
          fechaSalida: new Date(Date.now() - 6 * 60 * 60 * 1000),
          eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
          estado: 1,
          semaforo: 'amarillo',
          precinto: 'BT20240005',
          eslinga_larga: true,
          eslinga_corta: true,
          observaciones: 'Demora en aduana',
          alertas: ['Retraso de 1 hora'],
          ubicacionActual: { lat: -31.3833, lng: -55.9667 },
          progreso: 60
        }
        ];
        setTransitos(mockData);
      }
    } catch (err) {
      setError('Error al cargar los tránsitos');
      console.error('Error fetching transitos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchTransitos();
    const interval = setInterval(fetchTransitos, 10000);
    return () => clearInterval(interval);
  }, [fetchTransitos]);

  // Filter transitos
  const filteredTransitos = transitos.filter(transito => {
    if (filters.origen && !transito.origen.toLowerCase().includes(filters.origen.toLowerCase())) {
      return false;
    }
    if (filters.destino && !transito.destino.toLowerCase().includes(filters.destino.toLowerCase())) {
      return false;
    }
    if (filters.estado && transito.semaforo !== filters.estado) {
      return false;
    }
    return true;
  });

  // Sort by ETA
  const sortedTransitos = [...filteredTransitos].sort((a, b) => 
    a.eta.getTime() - b.eta.getTime()
  );

  const handleTransitoClick = (transito: TransitoTorreControl) => {
    setSelectedTransito(transito);
  };

  const handleCloseModal = () => {
    setSelectedTransito(null);
  };

  const getSemaforoIcon = (semaforo: EstadoSemaforo) => {
    switch (semaforo) {
      case 'verde':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'amarillo':
        return <AlertTriangle className="h-6 w-6 text-yellow-500 animate-pulse" />;
      case 'rojo':
        return <XCircle className="h-6 w-6 text-red-500 animate-pulse" />;
    }
  };

  // Manejar detección de congestiones
  const handleCongestionDetected = useCallback((congestions: CongestionAnalysis[]) => {
    setLastCongestionNotification(prev => {
      // Filtrar congestiones críticas no notificadas
      const criticas = congestions.filter(c => c.severidad === 'critica');
      const nuevasCriticas = criticas.filter(c => {
        const key = `${c.destino}-${c.ventanaInicio.getTime()}`;
        return !prev.includes(key);
      });

      if (nuevasCriticas.length > 0) {
        // Notificar cada congestión crítica nueva
        nuevasCriticas.forEach(congestion => {
          notificationService.error(
            `¡Congestión crítica en ${congestion.destino}!`,
            `${congestion.cantidadCamiones} camiones llegarán entre ${congestion.ventanaInicio.toLocaleTimeString('es-UY', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} y ${congestion.ventanaFin.toLocaleTimeString('es-UY', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}`
          );
        });

        // Retornar las notificaciones actualizadas
        return [
          ...prev,
          ...nuevasCriticas.map(c => `${c.destino}-${c.ventanaInicio.getTime()}`)
        ];
      }
      
      return prev; // No hay cambios
    });
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-950 flex", className)}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TorreControlHeader 
          lastUpdate={lastUpdate}
          transitosCount={sortedTransitos.length}
          onRefresh={fetchTransitos}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Congestion Alert Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
          <CongestionPanel
            transitos={transitos}
            variant="compact"
            onCongestionDetected={handleCongestionDetected}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-b border-gray-800">
            <div className="max-w-full mx-auto px-4 py-4">
              <TorreControlFilters
                filters={filters}
                onFiltersChange={setFilters}
                origenOptions={[...new Set(transitos.map(t => t.origen))]}
                destinoOptions={[...new Set(transitos.map(t => t.destino))]}
              />
            </div>
          </div>
        )}

        {/* Main Content with Timeline */}
        <div className="flex-1 flex">
          <div className="flex-1 max-w-full mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Cargando tránsitos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={fetchTransitos}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : sortedTransitos.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Truck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No hay tránsitos activos</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto px-2 sm:px-4">
            <table className="w-full min-w-[800px] sm:min-w-[1000px] lg:min-w-[1200px]">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Hora Salida
                    </span>
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Camión
                    </span>
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Chofer
                    </span>
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Origen
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Destino
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ETA
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Observaciones
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Acción
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedTransitos.map((transito, index) => (
                  <TransitoRow
                    key={transito.id}
                    transito={transito}
                    index={index}
                    onClick={() => handleTransitoClick(transito)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  </div>

      {/* Congestion Sidebar */}
      {showCongestionPanel && (
        <CongestionPanel
          transitos={transitos}
          variant="sidebar"
          onCongestionDetected={handleCongestionDetected}
          className="shadow-xl"
        />
      )}

      {/* Detail Modal */}
      {selectedTransito && (
        <TransitoDetailModal
          transito={selectedTransito}
          isOpen={!!selectedTransito}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};