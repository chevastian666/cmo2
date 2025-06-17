import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/utils';
import { useClipboardStore } from '../../stores/clipboardStore';
import { useClipboard } from '../../hooks/useClipboard';
import type { SmartClipboardProps, ClipboardEntry } from '../../types';
import {
  ClipboardIcon,
  ClockIcon,
  SearchIcon,
  TrashIcon,
  FilterIcon,
  CheckIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const TYPE_COLORS = {
  precinto: 'bg-blue-500',
  alerta: 'bg-red-500',
  reporte: 'bg-green-500',
  datos: 'bg-purple-500',
  custom: 'bg-gray-500'
};

const TYPE_LABELS = {
  precinto: 'Precinto',
  alerta: 'Alerta',
  reporte: 'Reporte',
  datos: 'Datos',
  custom: 'Personalizado',
  all: 'Todos'
};

export const SmartClipboard: React.FC<SmartClipboardProps> = ({
  maxHistory = 50,
  syncEnabled = true,
  position = 'bottom-right',
  hotkeys = true
}) => {
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchQuery,
    selectedType,
    syncStatus,
    setSearchQuery,
    setSelectedType,
    clearHistory,
    removeEntry
  } = useClipboardStore();
  
  const {
    history,
    isOpen,
    setIsOpen,
    copyToClipboard,
    pasteFromHistory
  } = useClipboard();

  // Position classes
  const positionClasses = {
    'top-right': 'top-20 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-20 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Handle entry click
  const handleEntryClick = async (entry: ClipboardEntry) => {
    await pasteFromHistory(entry.id);
    setShowToast({ message: 'Copiado al portapapeles', type: 'success' });
    setTimeout(() => setShowToast(null), 2000);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const timestamp = new Date(date);
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
    return timestamp.toLocaleDateString('es-ES');
  };

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={cn(
          'fixed z-40 w-14 h-14 bg-gray-800 rounded-full shadow-lg flex items-center justify-center',
          'hover:bg-gray-700 transition-colors duration-200',
          positionClasses[position]
        )}
        style={{ bottom: position.includes('bottom') ? '80px' : undefined }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ClipboardIcon className="w-6 h-6 text-white" />
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {history.length}
          </span>
        )}
      </motion.button>

      {/* Clipboard Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'fixed z-50 w-96 max-h-[600px] bg-gray-900 rounded-lg shadow-2xl overflow-hidden',
              positionClasses[position]
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ClipboardIcon className="w-5 h-5" />
                  Portapapeles Inteligente
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en historial..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {(['all', 'precinto', 'alerta', 'reporte', 'datos', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
                      selectedType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    )}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* History List */}
            <div className="overflow-y-auto max-h-[400px]">
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <ClipboardIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay elementos en el historial</p>
                  <p className="text-sm mt-1">Los elementos copiados aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      className="p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleEntryClick(entry)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2',
                          TYPE_COLORS[entry.type]
                        )} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-300">
                              {TYPE_LABELS[entry.type]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-white text-sm truncate">
                            {entry.content}
                          </p>
                          
                          {entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {entry.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {entry.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{entry.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntry(entry.id);
                          }}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="bg-gray-800 p-3 border-t border-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {history.length} / {maxHistory} elementos
                </span>
                
                <div className="flex items-center gap-2">
                  {syncEnabled && (
                    <div className="flex items-center gap-1">
                      {syncStatus === 'syncing' ? (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      ) : syncStatus === 'error' ? (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      <span className="text-xs text-gray-500">Sincronizado</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      if (confirm('¿Limpiar todo el historial?')) {
                        clearHistory();
                      }
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={cn(
              'fixed bottom-20 left-1/2 transform -translate-x-1/2',
              'px-4 py-2 rounded-lg shadow-lg flex items-center gap-2',
              showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {showToast.type === 'success' ? (
              <CheckIcon className="w-5 h-5 text-white" />
            ) : (
              <XMarkIcon className="w-5 h-5 text-white" />
            )}
            <span className="text-white text-sm">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};