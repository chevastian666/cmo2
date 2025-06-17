import React, { useDeferredValue, useTransition, memo, Suspense, useState } from 'react';
import { Map, Navigation, Truck, AlertCircle } from 'lucide-react';
import { MapSkeleton } from './MapSkeleton';
import { PriorityBoundary } from '../priority/withPriority';

interface Location {
  id: string;
  precintoId: string;
  lat: number;
  lng: number;
  status: 'active' | 'inactive' | 'alert';
  lastUpdate: Date;
  speed?: number;
  heading?: number;
}

// Lazy load the actual map component
const LazyMapRenderer = React.lazy(() => import('./MapRenderer'));

interface MapMarkerProps {
  location: Location;
  onClick?: (location: Location) => void;
}

const MapMarker: React.FC<MapMarkerProps> = memo(({ location, onClick }) => {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    alert: 'bg-red-500'
  };

  return (
    <div
      className="relative cursor-pointer transform transition-transform hover:scale-110"
      onClick={() => onClick?.(location)}
      title={`${location.precintoId} - ${location.status}`}
    >
      <div className={`w-3 h-3 rounded-full ${statusColors[location.status]} animate-pulse`} />
      {location.status === 'alert' && (
        <div className="absolute -top-1 -right-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
      )}
    </div>
  );
});

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  isUpdating: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onCenter, isUpdating }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <button
        onClick={onZoomIn}
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isUpdating}
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isUpdating}
      >
        -
      </button>
      <button
        onClick={onCenter}
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isUpdating}
      >
        <Navigation className="h-4 w-4" />
      </button>
    </div>
  );
};

interface MapViewProps {
  locations: Location[];
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ locations, className }) => {
  // Use deferred value for map updates to keep UI responsive
  const deferredLocations = useDeferredValue(locations);
  const [isPending, startTransition] = useTransition();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [mapCenter, setMapCenter] = useState({ lat: -34.6037, lng: -58.3816 });

  // Check if we're showing stale data
  const isStale = locations !== deferredLocations;

  const handleLocationClick = (location: Location) => {
    startTransition(() => {
      setSelectedLocation(location);
      setMapCenter({ lat: location.lat, lng: location.lng });
    });
  };

  const handleZoomIn = () => {
    startTransition(() => {
      setMapZoom(prev => Math.min(prev + 1, 18));
    });
  };

  const handleZoomOut = () => {
    startTransition(() => {
      setMapZoom(prev => Math.max(prev - 1, 1));
    });
  };

  const handleCenter = () => {
    startTransition(() => {
      if (deferredLocations.length > 0) {
        const avgLat = deferredLocations.reduce((sum, loc) => sum + loc.lat, 0) / deferredLocations.length;
        const avgLng = deferredLocations.reduce((sum, loc) => sum + loc.lng, 0) / deferredLocations.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    });
  };

  return (
    <PriorityBoundary priority="low" fallback={<MapSkeleton />}>
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gray-800/90 backdrop-blur p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-white">Live Tracking Map</h3>
              <span className="text-sm text-gray-400">
                {deferredLocations.length} precintos
              </span>
            </div>
            {(isPending || isStale) && (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-500 border-t-transparent" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div 
          className="relative h-full pt-16"
          style={{ 
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 300ms ease-in-out'
          }}
        >
          <Suspense fallback={<MapSkeleton />}>
            <LazyMapRenderer
              locations={deferredLocations}
              zoom={mapZoom}
              center={mapCenter}
              onLocationClick={handleLocationClick}
            />
          </Suspense>

          {/* Map Controls */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenter={handleCenter}
            isUpdating={isPending}
          />

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur p-4 rounded-lg z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {selectedLocation.precintoId}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Status: <span className={`capitalize ${
                      selectedLocation.status === 'active' ? 'text-green-400' :
                      selectedLocation.status === 'alert' ? 'text-red-400' : 'text-gray-400'
                    }`}>{selectedLocation.status}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last update: {new Date(selectedLocation.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur px-3 py-2 rounded text-xs text-gray-400">
          <div>Active: {deferredLocations.filter(l => l.status === 'active').length}</div>
          <div>Alerts: {deferredLocations.filter(l => l.status === 'alert').length}</div>
        </div>
      </div>
    </PriorityBoundary>
  );
};