import React, { useTransition, useState, memo, useDeferredValue } from 'react';
import { Package, Search, Filter, RefreshCw } from 'lucide-react';
import { PriorityBoundary } from '../priority/withPriority';
import { DashboardSkeleton } from './DashboardSkeleton';

interface Precinto {
  id: string;
  code: string;
  status: 'active' | 'inactive' | 'transit' | 'alert';
  location: string;
  temperature: number;
  battery: number;
  lastUpdate: Date;
  assignedTo?: string;
}

const PrecintoCard: React.FC<{ precinto: Precinto }> = memo(({ precinto }) => {
  const statusColors = {
    active: 'border-green-600 bg-green-900/20',
    inactive: 'border-gray-600 bg-gray-900/20',
    transit: 'border-blue-600 bg-blue-900/20',
    alert: 'border-red-600 bg-red-900/20'
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    transit: 'In Transit',
    alert: 'Alert'
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${statusColors[precinto.status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-400" />
          <h4 className="font-semibold text-white">{precinto.code}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          precinto.status === 'active' ? 'bg-green-600' :
          precinto.status === 'alert' ? 'bg-red-600' :
          precinto.status === 'transit' ? 'bg-blue-600' : 'bg-gray-600'
        } text-white`}>
          {statusLabels[precinto.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Location:</span>
          <span className="text-gray-200">{precinto.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Temperature:</span>
          <span className={`${precinto.temperature > 30 ? 'text-red-400' : 'text-gray-200'}`}>
            {precinto.temperature}°C
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Battery:</span>
          <span className={`${precinto.battery < 20 ? 'text-red-400' : 'text-gray-200'}`}>
            {precinto.battery}%
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        Last update: {new Date(precinto.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
});

interface PrecintsGridProps {
  precintos: Precinto[];
}

export const PrecintsGrid: React.FC<PrecintsGridProps> = ({ precintos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  
  // Use deferred value for search to keep input responsive
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredPrecintos = precintos.filter(precinto => {
    const matchesSearch = precinto.code.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
                         precinto.location.toLowerCase().includes(deferredSearchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || precinto.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchTerm(e.target.value);
    });
  };

  const handleFilterChange = (status: string) => {
    startTransition(() => {
      setFilterStatus(status);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      // Trigger data refresh
      console.log('Refreshing precintos data...');
    });
  };

  return (
    <PriorityBoundary priority="medium" fallback={<DashboardSkeleton />}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-500" />
            Precintos Monitor
            <span className="text-sm font-normal text-gray-400">
              ({filteredPrecintos.length} of {precintos.length})
            </span>
          </h2>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by code or location..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'transit', 'alert'].map(status => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-300 ${
            isPending ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {filteredPrecintos.map(precinto => (
            <PrecintoCard key={precinto.id} precinto={precinto} />
          ))}
        </div>

        {/* Empty state */}
        {filteredPrecintos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No precintos found matching your criteria</p>
          </div>
        )}
      </div>
    </PriorityBoundary>
  );
};