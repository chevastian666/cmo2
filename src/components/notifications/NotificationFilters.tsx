/**
 * Notification Filters Component
 * Advanced filtering interface for notifications
 * By Cheva
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, X } from 'lucide-react';
import type { 
  NotificationFilter, 
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationStatus
} from '../../types/notifications';

interface NotificationFiltersProps {
  filter: NotificationFilter;
  onFilterChange: (filter: Partial<NotificationFilter>) => void;
  stats?: NotificationStats;
}

const typeOptions: { key: NotificationType; label: string; icon: string }[] = [
  { key: 'alert', label: 'Alertas', icon: '🚨' },
  { key: 'transit', label: 'Tránsitos', icon: '🚛' },
  { key: 'precinto', label: 'Precintos', icon: '🔒' },
  { key: 'system', label: 'Sistema', icon: '⚙️' },
  { key: 'user', label: 'Usuario', icon: '👤' },
  { key: 'maintenance', label: 'Mantenimiento', icon: '🔧' }
];

const priorityOptions: { key: NotificationPriority; label: string; color: string }[] = [
  { key: 'critical', label: 'Crítica', color: 'bg-red-600' },
  { key: 'high', label: 'Alta', color: 'bg-yellow-600' },
  { key: 'normal', label: 'Normal', color: 'bg-blue-600' },
  { key: 'low', label: 'Baja', color: 'bg-gray-600' }
];

const statusOptions: { key: NotificationStatus; label: string; color: string }[] = [
  { key: 'unread', label: 'Sin leer', color: 'bg-blue-600' },
  { key: 'read', label: 'Leído', color: 'bg-gray-600' },
  { key: 'acknowledged', label: 'Confirmado', color: 'bg-green-600' },
  { key: 'snoozed', label: 'Pospuesto', color: 'bg-yellow-600' },
  { key: 'escalated', label: 'Escalado', color: 'bg-red-600' },
  { key: 'dismissed', label: 'Descartado', color: 'bg-gray-500' }
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  onFilterChange,
  stats
}) => {
  const clearFilters = () => {
    onFilterChange({
      types: undefined,
      priorities: undefined,
      statuses: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      search: undefined,
      unreadOnly: false
    });
  };

  const hasActiveFilters = Boolean(
    filter.types?.length ||
    filter.priorities?.length ||
    filter.statuses?.length ||
    filter.dateFrom ||
    filter.dateTo ||
    filter.search ||
    filter.unreadOnly
  );

  const toggleArrayFilter = <T extends string>(
    filterKey: 'types' | 'priorities' | 'statuses',
    value: T
  ) => {
    const currentArray = (filter[filterKey] as T[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onFilterChange({
      [filterKey]: newArray.length > 0 ? newArray : undefined
    });
  };

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="p-4 bg-gray-800 space-y-4"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <h3 className="font-medium text-white">Filtros</h3>
          {hasActiveFilters && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              Activo
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Desde:</label>
          <input
            type="date"
            value={filter.dateFrom ? filter.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFilterChange({
                dateFrom: e.target.value ? new Date(e.target.value) : undefined
              })
            }
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Hasta:</label>
          <input
            type="date"
            value={filter.dateTo ? filter.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFilterChange({
                dateTo: e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined
              })
            }
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Types Filter */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Tipos:</label>
        <div className="flex flex-wrap gap-1">
          {typeOptions.map(({ key, label, icon }) => {
            const isSelected = filter.types?.includes(key);
            const count = stats?.byType[key] || 0;
            
            return (
              <button
                key={key}
                onClick={() => toggleArrayFilter('types', key)}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {count > 0 && (
                  <span className="ml-1 bg-gray-600 text-gray-300 px-1 rounded">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priorities Filter */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Prioridades:</label>
        <div className="flex flex-wrap gap-1">
          {priorityOptions.map(({ key, label, color }) => {
            const isSelected = filter.priorities?.includes(key);
            const count = stats?.byPriority[key] || 0;
            
            return (
              <button
                key={key}
                onClick={() => toggleArrayFilter('priorities', key)}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                  isSelected
                    ? `${color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className="ml-1 bg-gray-600 text-gray-300 px-1 rounded">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Estados:</label>
        <div className="flex flex-wrap gap-1">
          {statusOptions.map(({ key, label, color }) => {
            const isSelected = filter.statuses?.includes(key);
            const count = stats?.byStatus[key] || 0;
            
            return (
              <button
                key={key}
                onClick={() => toggleArrayFilter('statuses', key)}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                  isSelected
                    ? `${color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className="ml-1 bg-gray-600 text-gray-300 px-1 rounded">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Filtros rápidos:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ 
              types: ['alert'], 
              priorities: ['critical', 'high'] 
            })}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            🚨 Alertas Críticas
          </button>
          
          <button
            onClick={() => onFilterChange({ 
              statuses: ['unread'] 
            })}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            📬 Sin Leer
          </button>
          
          <button
            onClick={() => onFilterChange({ 
              dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            })}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            📅 Últimas 24h
          </button>
          
          <button
            onClick={() => onFilterChange({ 
              types: ['transit'], 
              statuses: ['unread', 'read'] 
            })}
            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            🚛 Tránsitos Activos
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Filtros activos: {[
              filter.types?.length && `${filter.types.length} tipos`,
              filter.priorities?.length && `${filter.priorities.length} prioridades`,
              filter.statuses?.length && `${filter.statuses.length} estados`,
              filter.dateFrom && 'fecha desde',
              filter.dateTo && 'fecha hasta',
              filter.unreadOnly && 'solo sin leer'
            ].filter(Boolean).join(', ')}
          </div>
        </div>
      )}
    </motion.div>
  );
};