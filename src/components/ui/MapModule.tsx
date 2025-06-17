import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/utils';
import { Card } from './Card';
import { MapHeader, TruckIcon, TruckIconDetailed, RouteLine, AnimatedRouteLine } from './map';
import type { MapFilters } from './map/MapHeader';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'waypoint' | 'alert' | 'vehicle';
  label?: string;
  status?: 'active' | 'inactive' | 'alert' | 'critical' | 'warning';
  metadata?: Record<string, any>;
  direction?: number;
}

export interface MapRoute {
  id: string;
  points: Array<{ lat: number; lng: number }>;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'animated';
  animated?: boolean;
}

interface MapModuleProps {
  markers?: MapMarker[];
  routes?: MapRoute[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  variant?: 'default' | 'fullscreen' | 'compact';
  useDetailedIcons?: boolean;
}

export const MapModule: React.FC<MapModuleProps> = ({
  markers = [],
  routes = [],
  center = { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  zoom = 10,
  className,
  height = '400px',
  showControls = true,
  showLegend = true,
  onMarkerClick,
  variant = 'default',
  useDetailedIcons = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    searchTerm: '',
    selectedDespachante: '',
    showRoutes: true,
    showAlerts: true,
    showInactive: false
  });

  // Filter markers based on current filters
  const filteredMarkers = useMemo(() => {
    return markers.filter(marker => {
      // Filter by search term (license plate)
      if (filters.searchTerm && marker.label) {
        if (!marker.label.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Filter by despachante
      if (filters.selectedDespachante && marker.metadata?.despachante) {
        if (marker.metadata.despachante !== filters.selectedDespachante) {
          return false;
        }
      }

      // Filter alerts
      if (!filters.showAlerts && (marker.type === 'alert' || marker.status === 'alert' || marker.status === 'critical')) {
        return false;
      }

      // Filter inactive
      if (!filters.showInactive && marker.status === 'inactive') {
        return false;
      }

      return true;
    });
  }, [markers, filters]);

  // Filter routes based on showRoutes filter
  const filteredRoutes = useMemo(() => {
    return filters.showRoutes ? routes : [];
  }, [routes, filters.showRoutes]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker.id);
    onMarkerClick?.(marker);
  };

  const handleFilterChange = (newFilters: MapFilters) => {
    setFilters(newFilters);
  };

  const getMarkerStatus = (marker: MapMarker): 'normal' | 'warning' | 'critical' | 'inactive' => {
    if (marker.status === 'inactive') return 'inactive';
    if (marker.status === 'critical' || marker.status === 'alert') return 'critical';
    if (marker.status === 'warning') return 'warning';
    if (marker.type === 'alert') return 'critical';
    return 'normal';
  };

  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #4b5563 1px, transparent 1px),
            linear-gradient(to bottom, #4b5563 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* SVG Container for routes and markers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Routes */}
        {filteredRoutes.map((route) => {
          const RouteComponent = route.animated ? AnimatedRouteLine : RouteLine;
          return (
            <RouteComponent
              key={route.id}
              points={route.points}
              color={route.color}
              style={route.style}
              animated={route.animated}
              showArrows={route.animated}
              opacity={0.7}
            />
          );
        })}
      </svg>
      
      {/* Markers */}
      {filteredMarkers.map((marker) => {
        const TruckComponent = useDetailedIcons ? TruckIconDetailed : TruckIcon;
        const isVehicle = marker.type === 'vehicle';
        
        return (
          <div
            key={marker.id}
            className={cn(
              'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer',
              'transition-all hover:scale-110',
              selectedMarker === marker.id && 'scale-125 z-10'
            )}
            style={{
              left: `${((marker.lng + 180) / 3.6)}%`,
              top: `${((90 - marker.lat) / 1.8)}%`
            }}
            onClick={() => handleMarkerClick(marker)}
          >
            {isVehicle ? (
              <TruckComponent
                status={getMarkerStatus(marker)}
                size="md"
                animated={marker.status === 'critical' || marker.status === 'warning'}
                direction={marker.direction || 0}
              />
            ) : (
              <DefaultMarkerIcon type={marker.type} status={marker.status} />
            )}
            
            {marker.label && (
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs whitespace-nowrap bg-gray-800 px-1 py-0.5 rounded">
                {marker.label}
              </span>
            )}
          </div>
        );
      })}
      
      {/* Center Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 bg-white rounded-full opacity-50" />
      </div>
    </div>
  );

  const mapContent = (
    <>
      <div style={{ height: variant === 'fullscreen' ? '100vh' : height }}>
        <MapPlaceholder />
      </div>
      
      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {variant !== 'fullscreen' && (
            <button 
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg"
              onClick={() => setIsFullscreen(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Legend */}
      {showLegend && markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="text-sm font-medium text-gray-100 mb-2">Leyenda</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TruckIcon status="normal" size="sm" showTrafficLight={false} />
              <span className="text-xs text-gray-400">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckIcon status="warning" size="sm" showTrafficLight={false} />
              <span className="text-xs text-gray-400">Advertencia</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckIcon status="critical" size="sm" showTrafficLight={false} />
              <span className="text-xs text-gray-400">Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckIcon status="inactive" size="sm" showTrafficLight={false} />
              <span className="text-xs text-gray-400">Inactivo</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (variant === 'compact') {
    return (
      <div className={cn('relative rounded-lg overflow-hidden', className)}>
        {mapContent}
      </div>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)} noPadding>
      {/* Map Header */}
      <MapHeader
        title="Mapa de Tránsitos"
        subtitle="Monitoreo en tiempo real"
        onFilterChange={handleFilterChange}
        className="sticky top-0 z-20"
      />
      
      {mapContent}
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <div className="relative w-full h-full">
            <MapModule
              {...{ 
                markers, 
                routes, 
                center, 
                zoom, 
                showControls, 
                showLegend, 
                onMarkerClick,
                useDetailedIcons 
              }}
              variant="fullscreen"
              height="100vh"
            />
            <button
              className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg"
              onClick={() => setIsFullscreen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Default marker icon component
const DefaultMarkerIcon: React.FC<{ 
  type: MapMarker['type']; 
  status?: MapMarker['status'] 
}> = ({ type, status }) => {
  const getColor = () => {
    if (status === 'alert' || status === 'critical') return 'text-red-500';
    if (status === 'warning') return 'text-yellow-500';
    if (status === 'inactive') return 'text-gray-500';
    
    switch (type) {
      case 'origin': return 'text-green-500';
      case 'destination': return 'text-blue-500';
      case 'alert': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'origin':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        );
      case 'destination':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8"/>
          </svg>
        );
    }
  };

  return (
    <span className={cn('block', getColor())}>
      {getIcon()}
    </span>
  );
};