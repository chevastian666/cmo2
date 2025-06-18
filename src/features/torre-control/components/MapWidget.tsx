/**
 * Map Widget for Torre de Control
 * By Cheva
 */

import React from 'react';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import type { MapMarker, MapRoute } from '@/components/maps/InteractiveMap';
import type { TransitoTorreControl } from '../types';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapWidgetProps {
  data: TransitoTorreControl[];
}

export const MapWidget: React.FC<MapWidgetProps> = ({ data }) => {
  // Convert transitos to map markers
  const markers: MapMarker[] = data.map(transito => ({
    id: transito.id,
    position: transito.ubicacionActual || { lat: -32.5228, lng: -55.7658 },
    title: `${transito.dua} - ${transito.matricula}`,
    type: 'transito',
    color: transito.semaforo === 'verde' ? '#10B981' : 
           transito.semaforo === 'amarillo' ? '#F59E0B' : '#EF4444',
    data: {
      dua: transito.dua,
      matricula: transito.matricula,
      chofer: transito.chofer,
      origen: transito.origen,
      destino: transito.destino,
      estado: transito.estado,
      semaforo: transito.semaforo,
      progreso: transito.progreso,
      alertas: transito.alertas
    }
  }));

  // Create routes for active transits
  const routes: MapRoute[] = data
    .filter(t => t.ubicacionActual)
    .map(transito => {
      // Simplified route - in real app would use actual route data
      const origen = getLocationCoordinates(transito.origen);
      const destino = getLocationCoordinates(transito.destino);
      const current = transito.ubicacionActual!;
      
      return {
        id: `route-${transito.id}`,
        name: `${transito.origen} → ${transito.destino}`,
        path: [
          origen,
          current,
          destino
        ],
        color: transito.semaforo === 'verde' ? '#10B981' : 
               transito.semaforo === 'amarillo' ? '#F59E0B' : '#EF4444',
        strokeWeight: 2
      };
    });

  return (
    <div className="h-full flex flex-col map-widget-container">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-400" />
        Mapa de Tránsitos en Tiempo Real
      </h3>
      
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <InteractiveMap
          markers={markers}
          routes={routes}
          height="100%"
          showControls={true}
          showLegend={false}
          showSearch={false}
          zoom={8}
          onMarkerClick={(marker) => {
            console.log('Transit clicked:', marker);
          }}
        />
        
        {/* Custom Legend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3"
        >
          <p className="text-xs font-medium text-gray-300 mb-2">Estado de Tránsitos</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-400">Sin problemas ({data.filter(t => t.semaforo === 'verde').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-xs text-gray-400">Precaución ({data.filter(t => t.semaforo === 'amarillo').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Crítico ({data.filter(t => t.semaforo === 'rojo').length})</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to get coordinates for known locations
function getLocationCoordinates(location: string): { lat: number; lng: number } {
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'Montevideo': { lat: -34.9011, lng: -56.1645 },
    'Rivera': { lat: -30.9053, lng: -55.5508 },
    'Chuy': { lat: -33.6975, lng: -53.4594 },
    'Colonia': { lat: -34.4626, lng: -57.8400 },
    'Paysandú': { lat: -32.3214, lng: -58.0756 },
    'Salto': { lat: -31.3833, lng: -57.9667 },
    'Fray Bentos': { lat: -33.1264, lng: -58.3181 },
    'Nueva Palmira': { lat: -33.8798, lng: -58.4116 },
    'Artigas': { lat: -30.4000, lng: -56.4667 },
    'Tacuarembó': { lat: -31.7333, lng: -55.9833 }
  };
  
  return locationMap[location] || { lat: -32.5228, lng: -55.7658 };
}