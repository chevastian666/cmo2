import React from 'react';
import { Map } from 'lucide-react';

export const MapSkeleton: React.FC = () => {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full animate-pulse">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800/90 backdrop-blur p-4 z-10">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-600" />
          <div className="h-5 w-32 bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-full pt-16 bg-gray-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4" />
            <div className="h-4 w-32 bg-gray-800 rounded mx-auto" />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="w-10 h-10 bg-gray-800 rounded-lg" />
          <div className="w-10 h-10 bg-gray-800 rounded-lg" />
          <div className="w-10 h-10 bg-gray-800 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur px-3 py-2 rounded">
          <div className="h-3 w-16 bg-gray-700 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};