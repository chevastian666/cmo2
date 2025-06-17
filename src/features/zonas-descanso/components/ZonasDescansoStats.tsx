import React from 'react';
import { MapPin, Route, Truck } from 'lucide-react';

interface ZonasDescansoStatsProps {
  totalZonas: number;
  totalRutas: number;
}

export const ZonasDescansoStats: React.FC<ZonasDescansoStatsProps> = ({ 
  totalZonas, 
  totalRutas 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-lg">
          <MapPin className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Total de Zonas</p>
          <p className="text-2xl font-semibold text-white">{totalZonas}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-lg">
          <Route className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Rutas Cubiertas</p>
          <p className="text-2xl font-semibold text-white">{totalRutas}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-600/20 rounded-lg">
          <Truck className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Autorizadas por</p>
          <p className="text-lg font-semibold text-white">Aduana Uruguay</p>
        </div>
      </div>
    </div>
  );
};