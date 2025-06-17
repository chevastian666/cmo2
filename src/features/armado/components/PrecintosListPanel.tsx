import React, { useState } from 'react';
import { Package, RefreshCw, Search, Battery, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatTimeAgo } from '../../../utils/formatters';

interface PrecintoListItem {
  nqr: string;
  battery: number;
  lastReport: number;
  location?: string;
  status?: string;
}

interface PrecintosListPanelProps {
  precintos: PrecintoListItem[];
  onSelect: (precinto: PrecintoListItem) => void;
  onRefresh: () => void;
}

export const PrecintosListPanel: React.FC<PrecintosListPanelProps> = ({
  precintos,
  onSelect,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPrecintos = precintos.filter(p => 
    p.nqr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'text-red-400';
    if (level < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getTimeColor = (timestamp: number) => {
    const hoursSince = (Date.now() / 1000 - timestamp) / 3600;
    if (hoursSince > 2) return 'text-red-400';
    if (hoursSince > 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Precintos Pendientes
          </h3>
          <button
            onClick={handleRefresh}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-700 transition-colors",
              isRefreshing && "animate-spin"
            )}
            title="Actualizar lista"
          >
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por NQR o ubicación..."
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPrecintos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              {searchTerm ? 'No se encontraron precintos' : 'No hay precintos pendientes'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredPrecintos.map((precinto) => {
              const hoursSinceReport = (Date.now() / 1000 - precinto.lastReport) / 3600;
              const hasWarnings = precinto.battery < 20 || hoursSinceReport > 1;

              return (
                <button
                  key={precinto.nqr}
                  onClick={() => onSelect(precinto)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-gray-700/50 transition-colors",
                    "focus:outline-none focus:bg-gray-700/50",
                    hasWarnings && "bg-yellow-900/10"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium text-white">
                          {precinto.nqr}
                        </span>
                        {hasWarnings && (
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      {precinto.location && (
                        <p className="text-sm text-gray-400 mt-1">
                          {precinto.location}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Battery className={cn("h-3 w-3", getBatteryColor(precinto.battery))} />
                          <span className={cn("text-xs", getBatteryColor(precinto.battery))}>
                            {precinto.battery}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className={cn("h-3 w-3", getTimeColor(precinto.lastReport))} />
                          <span className={cn("text-xs", getTimeColor(precinto.lastReport))}>
                            {formatTimeAgo(precinto.lastReport)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {precinto.status && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        precinto.status === 'ready' 
                          ? "bg-green-900/20 text-green-400"
                          : "bg-gray-700 text-gray-400"
                      )}>
                        {precinto.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-gray-900/50">
        <p className="text-xs text-gray-400 text-center">
          {filteredPrecintos.length} de {precintos.length} precintos
        </p>
      </div>
    </div>
  );
};