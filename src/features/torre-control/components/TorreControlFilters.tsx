import React from 'react';
import { Search, MapPin, Flag, CircleDot } from 'lucide-react';
import type { TorreControlFilters, EstadoSemaforo } from '../types';

interface TorreControlFiltersProps {
  filters: TorreControlFilters;
  onFiltersChange: (filters: TorreControlFilters) => void;
  origenOptions: string[];
  destinoOptions: string[];
}

export const TorreControlFilters: React.FC<TorreControlFiltersProps> = ({
  filters,
  onFiltersChange,
  origenOptions,
  destinoOptions
}) => {
  const handleChange = (key: keyof TorreControlFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Origen Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-500" />
        </div>
        <select
          value={filters.origen}
          onChange={(e) => handleChange('origen', e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los orígenes</option>
          {origenOptions.map(origen => (
            <option key={origen} value={origen}>{origen}</option>
          ))}
        </select>
      </div>

      {/* Destino Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Flag className="h-5 w-5 text-gray-500" />
        </div>
        <select
          value={filters.destino}
          onChange={(e) => handleChange('destino', e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los destinos</option>
          {destinoOptions.map(destino => (
            <option key={destino} value={destino}>{destino}</option>
          ))}
        </select>
      </div>

      {/* Estado Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CircleDot className="h-5 w-5 text-gray-500" />
        </div>
        <select
          value={filters.estado}
          onChange={(e) => handleChange('estado', e.target.value as EstadoSemaforo | '')}
          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="verde">🟢 Verde - Sin problemas</option>
          <option value="amarillo">🟡 Amarillo - Advertencia</option>
          <option value="rojo">🔴 Rojo - Problemas</option>
        </select>
      </div>
    </div>
  );
};