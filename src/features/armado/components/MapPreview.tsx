import React, { useState } from 'react';
import {MapPin, Maximize2, X} from 'lucide-react';
import { cn} from '../../../utils/utils';

interface MapPreviewProps {
  lat: number;
  lng: number;
  title?: string;
  height?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ 
  lat, lng, title = 'Ubicación', height = '300px' 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className={cn(
        "bg-gray-800 rounded-lg border border-gray-700",
        isFullscreen && "fixed inset-0 z-50 m-4"
      )}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Ubicación del Precinto
            </h3>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <X className="h-5 w-5 text-gray-400" />
              ) : (
                <Maximize2 className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <div 
          className="w-full bg-gray-900 flex items-center justify-center"
          style={{ height: isFullscreen ? 'calc(100% - 73px)' : height }}
        >
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 text-gray-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-300">Mapa no disponible</p>
              <p className="text-sm text-gray-500 mt-1">
                Vista de mapa temporalmente deshabilitada
              </p>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
              <p className="text-xs text-gray-400">
                Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Coordinates display */}
        <div className="p-3 border-t border-gray-700 bg-gray-900/50">
          <p className="text-xs text-gray-400 text-center">
            Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </>
  );
};