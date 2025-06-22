/**
 * Widget de mapa para el dashboard
 * By Cheva
 */

import React from 'react'
import {MapPin, Navigation, Activity} from 'lucide-react'
interface MapWidgetProps {
  showControls?: boolean
  showLegend?: boolean
}

// Placeholder del mapa mientras se resuelve el lazy loading
const MapPlaceholder: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-900 relative overflow-hidden rounded-lg">
      {/* Simulación de mapa */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900">
        {/* Grid pattern más sutil */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, #4b5563 1px, transparent 1px),
                              linear-gradient(to bottom, #4b5563 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Puntos simulados con mejor distribución */}
        <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
        <div className="absolute top-[45%] left-[75%] w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[35%] right-[20%] w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] right-[50%] w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[25%] left-[60%] w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[40%] w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '2.5s' }} />
        
        {/* Líneas de conexión simuladas */}
        <div className="absolute top-[20%] left-[15%] w-[60%] h-[1px] bg-gradient-to-r from-green-500/50 to-transparent" 
             style={{ transform: 'rotate(15deg)', transformOrigin: 'left' }} />
        <div className="absolute top-[45%] left-[75%] w-[25%] h-[1px] bg-gradient-to-r from-yellow-500/50 to-transparent"
             style={{ transform: 'rotate(-45deg)', transformOrigin: 'left' }} />
      </div>
      
      {/* Overlay con texto centrado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-gray-800/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600/50">
          <p className="text-xs text-gray-300 flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Mapa en Tiempo Real
          </p>
        </div>
      </div>
      
      {/* Indicador de zoom en esquina superior derecha */}
      <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-400">
        Zoom: 1:500k
      </div>
    </div>
  )
}
export const MapWidget: React.FC<MapWidgetProps> = ({
  showControls = false, showLegend = false
}) => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Mini controles del mapa */}
      {showControls && (
        <div className="flex items-center justify-between p-2 border-b border-gray-700 shrink-0">
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
      <div className="flex-1 relative min-h-0">
        <MapPlaceholder />
        
        {/* Leyenda opcional */}
        {showLegend && (
          <div className="absolute bottom-2 left-2 bg-gray-900/90 backdrop-blur-sm p-2 rounded-lg text-xs z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-300 text-xs">Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-300 text-xs">En tránsito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-300 text-xs">Alerta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-300 text-xs">Destino</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}