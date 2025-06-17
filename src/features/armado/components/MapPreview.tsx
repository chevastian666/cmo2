import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, X } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface MapPreviewProps {
  lat: number;
  lng: number;
  title?: string;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const MapPreview: React.FC<MapPreviewProps> = ({ 
  lat, 
  lng, 
  title = 'Ubicación',
  height = '300px' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    // Update marker position when coordinates change
    if (mapInstanceRef.current && markerRef.current) {
      const newPosition = new window.google.maps.LatLng(lat, lng);
      markerRef.current.setPosition(newPosition);
      mapInstanceRef.current.panTo(newPosition);
    }
  }, [lat, lng]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapError(true);
    
    window.initMap = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#746855" }]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#d59563" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#38414e" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#212a37" }]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9ca5b3" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#17263c" }]
          }
        ]
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: title,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #333; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${title}</h3>
            <p style="margin: 0; font-size: 14px;">Lat: ${lat.toFixed(6)}</p>
            <p style="margin: 0; font-size: 14px;">Lng: ${lng.toFixed(6)}</p>
          </div>
        `
      });

      markerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (mapError) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Ubicación del Precinto
          </h3>
        </div>
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Error al cargar el mapa</p>
          <p className="text-sm text-gray-500 mt-2">
            Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "bg-gray-800 rounded-lg border border-gray-700",
        isFullscreen && "fixed inset-0 z-50 m-4"
      )}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Ubicación del Precinto
            </h3>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <X className="h-5 w-5 text-gray-400" />
              ) : (
                <Maximize2 className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full"
          style={{ height: isFullscreen ? 'calc(100% - 73px)' : height }}
        />
        
        {/* Fallback coordinates display */}
        <div className="p-3 border-t border-gray-700 bg-gray-900/50">
          <p className="text-xs text-gray-400 text-center">
            Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </>
  );
};