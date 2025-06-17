import React, { memo } from 'react';

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

interface MapRendererProps {
  locations: Location[];
  zoom: number;
  center: { lat: number; lng: number };
  onLocationClick?: (location: Location) => void;
}

// This is a placeholder for the actual map implementation
// In production, you would use Leaflet, Mapbox, or Google Maps
const MapRenderer: React.FC<MapRendererProps> = memo(({ 
  locations, 
  zoom, 
  center, 
  onLocationClick 
}) => {
  // Simulate heavy map rendering
  const calculateMapBounds = () => {
    if (locations.length === 0) return null;
    
    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  };

  const bounds = calculateMapBounds();

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* Map Canvas Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        {/* Grid overlay to simulate map tiles */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Render location markers */}
        <svg className="absolute inset-0 w-full h-full">
          {locations.map(location => {
            // Simple projection for demo
            const x = ((location.lng - (bounds?.minLng || -180)) / 
                      ((bounds?.maxLng || 180) - (bounds?.minLng || -180))) * 100;
            const y = ((location.lat - (bounds?.minLat || -90)) / 
                      ((bounds?.maxLat || 90) - (bounds?.minLat || -90))) * 100;
            
            const color = location.status === 'active' ? '#22c55e' :
                         location.status === 'alert' ? '#ef4444' : '#6b7280';
            
            return (
              <g key={location.id}>
                {/* Connection lines for moving vehicles */}
                {location.speed && location.speed > 0 && (
                  <line
                    x1={`${x}%`}
                    y1={`${100 - y}%`}
                    x2={`${x + 2}%`}
                    y2={`${100 - y - 2}%`}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}
                
                {/* Location marker */}
                <circle
                  cx={`${x}%`}
                  cy={`${100 - y}%`}
                  r={zoom / 2}
                  fill={color}
                  stroke="white"
                  strokeWidth="1"
                  className="cursor-pointer hover:r-8 transition-all"
                  onClick={() => onLocationClick?.(location)}
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.6;1"
                    dur={location.status === 'alert' ? "1s" : "3s"}
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Label on hover */}
                <text
                  x={`${x}%`}
                  y={`${100 - y - 2}%`}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  className="pointer-events-none opacity-0 hover:opacity-100"
                >
                  {location.precintoId}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Map Attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-600">
        Map Data © CMO System
      </div>
    </div>
  );
});

MapRenderer.displayName = 'MapRenderer';

export default MapRenderer;