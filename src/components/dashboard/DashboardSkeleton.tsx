import React from 'react';
import { Package } from 'lucide-react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <div className="h-6 w-32 bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-800 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-800 rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-800 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-20 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <PrecintoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const PrecintoCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-800 bg-gray-900/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-700 rounded" />
          <div className="h-5 w-24 bg-gray-700 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-700 rounded" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 bg-gray-800 rounded" />
            <div className="h-4 w-12 bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="h-3 w-32 bg-gray-800 rounded" />
      </div>
    </div>
  );
};