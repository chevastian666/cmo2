import React, { useState } from 'react';
import { 
  Map, 
  Filter, 
  Layers, 
  Search,
  X,
  Building2,
  Truck
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { DESPACHANTES } from '../../../constants/locations';

export interface MapFilters {
  searchTerm: string;
  selectedDespachante: string;
  showRoutes: boolean;
  showAlerts: boolean;
  showInactive: boolean;
}

interface MapHeaderProps {
  title?: string;
  subtitle?: string;
  onFilterChange?: (filters: MapFilters) => void;
  onLayerToggle?: (layer: string) => void;
  activeLayers?: string[];
  availableDespachantes?: string[];
  className?: string;
}

const defaultFilters: MapFilters = {
  searchTerm: '',
  selectedDespachante: '',
  showRoutes: true,
  showAlerts: true,
  showInactive: false
};

const MapHeader: React.FC<MapHeaderProps> = ({
  title = 'Mapa de Tránsitos',
  subtitle = 'Monitoreo en tiempo real',
  onFilterChange,
  onLayerToggle,
  activeLayers = ['routes', 'alerts'],
  availableDespachantes = DESPACHANTES.slice(0, 6),
  className
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);

  const handleFilterChange = (key: keyof MapFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedDespachante || !filters.showInactive;

  return (
    <div className={cn("bg-gray-900 border-b border-gray-800", className)}>
      <div className="px-4 py-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Buscar matrícula..."
                className="pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                showFilters ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              )}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Layers Toggle */}
            <button
              onClick={() => onLayerToggle?.('layers')}
              className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Despachante Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Filtrar por Despachante
                </label>
                <select
                  value={filters.selectedDespachante}
                  onChange={(e) => handleFilterChange('selectedDespachante', e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los despachantes</option>
                  {availableDespachantes.map(desp => (
                    <option key={desp} value={desp}>{desp}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showRoutes}
                    onChange={(e) => handleFilterChange('showRoutes', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Mostrar rutas proyectadas</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showAlerts}
                    onChange={(e) => handleFilterChange('showAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Mostrar alertas</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showInactive}
                    onChange={(e) => handleFilterChange('showInactive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Mostrar inactivos</span>
                </label>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">Filtros activos:</span>
                  {filters.searchTerm && (
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                      Búsqueda: {filters.searchTerm}
                    </span>
                  )}
                  {filters.selectedDespachante && (
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {filters.selectedDespachante}
                    </span>
                  )}
                  {!filters.showInactive && (
                    <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                      Solo activos
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-green-500" />
            <span className="text-gray-400">En ruta: <span className="text-white font-medium">24</span></span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-gray-400">Alertas: <span className="text-red-400 font-medium">3</span></span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            <span className="text-gray-400">Demorados: <span className="text-yellow-400 font-medium">7</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MapHeader };