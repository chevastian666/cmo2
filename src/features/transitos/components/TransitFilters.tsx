import React from 'react';
import { Search, Calendar, Building, MapPin, Filter } from 'lucide-react';
import { ORIGENES_DESTINOS } from '../../../constants/locations';
import type { Transito } from '../types';

interface FiltersState {
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  precinto: string;
  empresa: string;
  origen: string;
  destino: string;
  searchText: string;
}

interface TransitFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  transitos: Transito[];
}

export const TransitFilters: React.FC<TransitFiltersProps> = ({ filters, onChange, transitos }) => {
  // Get unique empresas from transitos
  const empresas = Array.from(new Set(transitos.map(t => t.empresa))).sort();

  const handleChange = (field: keyof FiltersState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    onChange({
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      precinto: '',
      empresa: '',
      origen: '',
      destino: '',
      searchText: ''
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          Filtros
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Buscar (DUA, Precinto, Empresa)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => handleChange('searchText', e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="en_viaje">En Viaje</option>
            <option value="desprecintado">Desprecintado</option>
            <option value="con_alerta">Con Alerta</option>
          </select>
        </div>

        {/* Precinto */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Precinto
          </label>
          <input
            type="text"
            value={filters.precinto}
            onChange={(e) => handleChange('precinto', e.target.value)}
            placeholder="Código..."
            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Fecha Desde */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Fecha Desde
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleChange('fechaDesde', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Fecha Hasta
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleChange('fechaHasta', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Empresa
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filters.empresa}
              onChange={(e) => handleChange('empresa', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {empresas.map(empresa => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Origen */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Origen
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filters.origen}
              onChange={(e) => handleChange('origen', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {ORIGENES_DESTINOS.map(lugar => (
                <option key={lugar} value={lugar}>{lugar}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Destino */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Destino
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filters.destino}
              onChange={(e) => handleChange('destino', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {ORIGENES_DESTINOS.map(lugar => (
                <option key={lugar} value={lugar}>{lugar}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};