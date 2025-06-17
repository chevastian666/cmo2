import React from 'react';
import { X, Filter } from 'lucide-react';
import { DEPOSITO_TIPOS, DEPOSITO_ZONAS } from '../types';
import type { DepositoFilters as Filters } from '../types';

interface DepositoFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export const DepositoFilters: React.FC<DepositoFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const handleReset = () => {
    onFiltersChange({
      tipo: '',
      zona: '',
      padre: ''
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tipo
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => onFiltersChange({ ...filters, tipo: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {DEPOSITO_TIPOS.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Zona */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Zona
          </label>
          <select
            value={filters.zona}
            onChange={(e) => onFiltersChange({ ...filters, zona: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {DEPOSITO_ZONAS.map(zona => (
              <option key={zona} value={zona}>{zona}</option>
            ))}
          </select>
        </div>

        {/* Padre */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Padre
          </label>
          <select
            value={filters.padre}
            onChange={(e) => onFiltersChange({ ...filters, padre: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {DEPOSITO_ZONAS.map(zona => (
              <option key={zona} value={zona}>{zona}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          Limpiar filtros
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};