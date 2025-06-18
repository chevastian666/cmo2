/**
 * Widget de mapa para el dashboard
 * By Cheva
 */

import React from 'react';
import {_MapPin, Navigation, Activity} from 'lucide-react';

interface MapWidgetProps {
  showControls?: boolean;
  showLegend?: boolean;
}

// Placeholder del mapa mientras se resuelve el lazy loading
const MapPlaceholder: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-900 relative overflow-hidden">
      {/* Simulación de mapa */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #374151 1px, transparent 1px),
                              linear-gradient(to bottom, #374151 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Puntos simulados */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Overlay con texto */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-800/80 px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Vista de mapa en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
};

export const MapWidget: React.FC<MapWidgetProps> = ({
  showControls = false,
  showLegend = false
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Mini controles del mapa */}
      {showControls && (
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
              <Navigation className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
              <Activity className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <span className="text-xs text-gray-500">En tiempo real</span>
        </div>
      )}
      
      {/* Mapa */}
      <div className="flex-1 relative">
        <MapPlaceholder />
        
        {/* Leyenda opcional */}
        {showLegend && (
          <div className="absolute bottom-2 left-2 bg-gray-900/90 p-2 rounded-lg text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400">Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-400">En tránsito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-400">Alerta</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};