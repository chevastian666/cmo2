/**
 * Notification Center Component
 * Complete notification history and management interface
 * By Cheva
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence} from 'framer-motion';
import { 
  Bell, BellOff, Search, Filter, X, Settings, Maximize2, Minimize2} from 'lucide-react';
import type { 
  Notification, NotificationFilter, NotificationGroup, NotificationStats, } from '../../types/notifications';
import { NotificationItem} from './NotificationItem';
import { NotificationGroupItem} from './NotificationGroupItem';
import { NotificationFilters} from './NotificationFilters';
import { QuickActions} from './QuickActions';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  // onToggle removed - unused
  notifications: Notification[];
  groups?: NotificationGroup[];
  stats?: NotificationStats;
  onNotificationAction: (notificationId: string, action: string, payload?: unknown) => void;
  onBulkAction: (notificationIds: string[], action: string) => void;
  onFilterChange: (filter: NotificationFilter) => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen, onClose, onToggle, notifications, groups = [], stats, onNotificationAction, onBulkAction, onFilterChange, className = ''
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.metadata.source.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filter.types?.length) {
      filtered = filtered.filter(n => filter.types!.includes(n.type));
    }

    if (filter.priorities?.length) {
      filtered = filtered.filter(n => filter.priorities!.includes(n.priority));
    }

    if (filter.statuses?.length) {
      filtered = filtered.filter(n => filter.statuses!.includes(n.status));
    }

    if (filter.unreadOnly) {
      filtered = filtered.filter(n => n.status === 'unread');
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(n => n.timestamp >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter(n => n.timestamp <= filter.dateTo!);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, searchQuery, filter]);

  // Filter groups similarly
  const filteredGroups = useMemo(() => {
    if (viewMode !== 'grouped') return [];
    
    return groups.filter(group => {
      if (filter.types?.length && !filter.types.includes(group.type)) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return group.label.toLowerCase().includes(query) ||
               group.notifications.some(n => 
                 n.title.toLowerCase().includes(query) ||
                 n.message.toLowerCase().includes(query)
               );
      }
      
      return true;
    });
  }, [groups, viewMode, filter, searchQuery]);

  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<NotificationFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  // Handle notification selection
  const handleNotificationSelect = (notificationId: string, selected: boolean) => {
    const newSelection = new Set(selectedNotifications);
    if (selected) {
      newSelection.add(notificationId);
    } else {
      newSelection.delete(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedNotifications.size > 0) {
      onBulkAction(Array.from(selectedNotifications), action);
      setSelectedNotifications(new Set());
    }
  };

  // Handle notification action
  const handleNotificationAction = (notificationId: string, action: string, payload?: unknown) => {
    onNotificationAction(notificationId, action, payload);
    // Remove from selection if it was selected
    if (selectedNotifications.has(notificationId)) {
      const newSelection = new Set(selectedNotifications);
      newSelection.delete(notificationId);
      setSelectedNotifications(newSelection);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Notification Center Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`absolute right-0 top-0 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col ${
          isExpanded ? 'w-full max-w-6xl' : 'w-full max-w-md'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                Centro de Notificaciones
              </h2>
              {stats && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.unread} nuevas
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={isExpanded ? 'Contraer' : 'Expandir'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 transition-colors ${
                  showFilters ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                title="Filtros"
              >
                <Filter className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'grouped' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grupos
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-gray-800 rounded p-2">
                <div className="text-white font-medium">{stats.total}</div>
                <div className="text-gray-400">Total</div>
              </div>
              <div className="bg-blue-900 rounded p-2">
                <div className="text-blue-300 font-medium">{stats.unread}</div>
                <div className="text-blue-400">Sin Leer</div>
              </div>
              <div className="bg-red-900 rounded p-2">
                <div className="text-red-300 font-medium">{stats.critical}</div>
                <div className="text-red-400">Críticas</div>
              </div>
              <div className="bg-green-900 rounded p-2">
                <div className="text-green-300 font-medium">{stats.acknowledged}</div>
                <div className="text-green-400">Confirmadas</div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between bg-blue-900 rounded-lg p-2"
            >
              <span className="text-blue-300 text-sm">
                {selectedNotifications.size} seleccionadas
              </span>
              <QuickActions
                onAction={handleBulkAction}
                compact={true}
              />
            </motion.div>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex-shrink-0 border-b border-gray-700 overflow-hidden"
            >
              <NotificationFilters
                filter={filter}
                onFilterChange={handleFilterChange}
                stats={stats}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* List Header */}
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400">
                  {filteredNotifications.length} notificaciones
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange({ unreadOnly: !filter.unreadOnly })}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    filter.unreadOnly 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Solo sin leer
                </button>
              </div>
            </div>
          </div>

          {/* Notification Items */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {viewMode === 'list' ? (// List View
                filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isSelected={selectedNotifications.has(notification.id)}
                      onSelect={(selected) => handleNotificationSelect(notification.id, selected)}
                      onAction={(action, payload) => handleNotificationAction(notification.id, action, payload)}
                      expanded={isExpanded}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="text-center">
                      <BellOff className="w-8 h-8 mx-auto mb-2" />
                      <p>No hay notificaciones</p>
                    </div>
                  </div>
                )
              ) : (// Grouped View
                filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <NotificationGroupItem
                      key={group.id}
                      group={group}
                      selectedNotifications={selectedNotifications}
                      onSelect={handleNotificationSelect}
                      onAction={handleNotificationAction}
                      expanded={isExpanded}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="text-center">
                      <BellOff className="w-8 h-8 mx-auto mb-2" />
                      <p>No hay grupos de notificaciones</p>
                    </div>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.open('/notifications/settings', '_blank')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Configuración</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('mark-all-read')}
                className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Marcar todo como leído
              </button>
              
              <button
                onClick={() => handleBulkAction('clear-all')}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};