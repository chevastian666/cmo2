import React, { useState } from 'react';
import { Search, Filter, Battery, MapPin, Calendar, X } from 'lucide-react';
import { PrecintoStatus, PrecintoStatusText } from '../types';
import type { PrecintoFilters as PrecintoFiltersType } from '../types';

interface PrecintoFiltersProps {
  filters: PrecintoFiltersType;
  onFiltersChange: (filters: PrecintoFiltersType) => void;
  empresas: string[];
  ubicaciones: string[];
}

export const PrecintoFilters: React.FC<PrecintoFiltersProps> = ({
  filters,
  onFiltersChange,
  empresas,
  ubicaciones
}) => {
  console.log('PrecintoFilters: Rendering with', { filters, empresasCount: empresas.length, ubicacionesCount: ubicaciones.length });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleChange = (key: keyof PrecintoFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setShowAdvancedFilters(false);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
      {/* Main search and toggle */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, Serie, NQR, Teléfono o Empresa..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 bg-gray-700 text-base text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-sm rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 text-base text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
          {/* Status filter */}
          <div>
            <label className="block text-base font-medium text-gray-400 mb-2">
              Estado
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos</option>
              {Object.entries(PrecintoStatusText).map(([key, text]) => (
                <option key={key} value={key}>{text}</option>
              ))}
            </select>
          </div>

          {/* Empresa filter */}
          <div>
            <label className="block text-base font-medium text-gray-400 mb-2">
              Empresa
            </label>
            <select
              value={filters.empresa || ''}
              onChange={(e) => handleChange('empresa', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-base text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todas</option>
              {empresas.map(empresa => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>

          {/* Ubicación filter */}
          <div>
            <label className="block text-base font-medium text-gray-400 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Buscar ubicación..."
              value={filters.ubicacion || ''}
              onChange={(e) => handleChange('ubicacion', e.target.value)}
              list="ubicaciones-list"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <datalist id="ubicaciones-list">
              {ubicaciones.map(ubicacion => (
                <option key={ubicacion} value={ubicacion} />
              ))}
            </datalist>
          </div>

          {/* Battery low filter */}
          <div>
            <label className="block text-base font-medium text-gray-400 mb-2">
              <Battery className="inline h-4 w-4 mr-1" />
              Filtros especiales
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.bateriaBaja || false}
                  onChange={(e) => handleChange('bateriaBaja', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                Batería baja (&lt; 20%)
              </label>
            </div>
          </div>

          {/* Date range filter */}
          <div className="lg:col-span-2">
            <label className="block text-base font-medium text-gray-400 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Rango de fechas (activación)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fechaDesde || ''}
                onChange={(e) => handleChange('fechaDesde', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 self-center">a</span>
              <input
                type="date"
                value={filters.fechaHasta || ''}
                onChange={(e) => handleChange('fechaHasta', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};