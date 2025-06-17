import React from 'react';
import { Search, X } from 'lucide-react';

interface ZonasDescansoSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalZonas: number;
  filteredZonas: number;
}

export const ZonasDescansoSearch: React.FC<ZonasDescansoSearchProps> = ({
  searchTerm,
  onSearchChange,
  totalZonas,
  filteredZonas
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por ruta, nombre o ubicación..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {searchTerm && (
        <p className="mt-2 text-sm text-gray-400">
          Mostrando {filteredZonas} de {totalZonas} zonas de descanso
        </p>
      )}
    </div>
  );
};