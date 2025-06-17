import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Truck, 
  User, 
  MapPin, 
  Clock, 
  Package, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Battery,
  Wifi,
  Navigation,
  Calendar,
  Activity,
  Shield,
  Route,
  Gauge,
  MessageSquare,
  FileText,
  Hash,
  Camera,
  Maximize2,
  Download,
  Play,
  Pause,
  Link2
} from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  InfoRow,
  InfoGrid,
  InfoSection,
  Badge,
  BadgeGroup,
  AlertsPanel
} from '../../../components/ui';
import { cn } from '../../../utils/utils';

declare global {
  interface Window {
    google: any;
    initDashboardTransitoMap: () => void;
  }
}

export interface TransitoDashboard {
  id: string;
  numeroViaje: string;
  numeroMovimiento: string;
  dua: string;
  matricula: string;
  chofer: string;
  choferCI: string;
  origen: string;
  destino: string;
  fechaSalida: Date;
  eta: Date;
  estado: 'en_ruta' | 'detenido' | 'completado';
  precintoId: string;
  precintoNumero: string;
  eslinga_larga: boolean;
  eslinga_corta: boolean;
  observaciones?: string;
  alertas?: string[];
  ubicacionActual?: {
    lat: number;
    lng: number;
  };
  progreso: number;
  fotoPrecintado?: string;
  bateria?: number;
  temperatura?: number;
}

interface TransitoDetailModalProps {
  transitoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TransitoDetailModal: React.FC<TransitoDetailModalProps> = ({
  transitoId,
  isOpen,
  onClose
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(100); // 0-100 representing journey progress
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [transito, setTransito] = useState<TransitoDashboard | null>(null);

  // Fetch transit data based on transitoId
  useEffect(() => {
    if (isOpen && transitoId) {
      // In a real app, this would fetch from API
      // For now, we'll create mock data
      const mockTransito: TransitoDashboard = {
        id: transitoId,
        numeroViaje: '7581856',
        numeroMovimiento: '1234',
        dua: '788553',
        matricula: 'STP1234',
        chofer: 'Juan Pérez',
        choferCI: '1.234.567-8',
        origen: 'Montevideo',
        destino: 'Rivera',
        fechaSalida: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        eta: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        estado: 'en_ruta',
        precintoId: 'BT20240001',
        precintoNumero: '234',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'Transporte de carga refrigerada. Temperatura controlada.',
        alertas: [],
        ubicacionActual: { lat: -32.5228, lng: -55.7658 },
        progreso: 60,
        fotoPrecintado: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        bateria: 85,
        temperatura: -18
      };
      setTransito(mockTransito);
      setTimelinePosition(mockTransito.progreso);
    }
  }, [isOpen, transitoId]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Initialize map when modal opens
      if (transito?.ubicacionActual && window.google) {
        initializeMap();
      } else if (transito?.ubicacionActual && !window.google) {
        loadGoogleMapsScript();
      }
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose, transito]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&callback=initDashboardTransitoMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapError(true);
    
    (window as any).initDashboardTransitoMap = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !transito?.ubicacionActual) return;

    try {
      const mapOptions = {
        center: { lat: transito.ubicacionActual.lat, lng: transito.ubicacionActual.lng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#1a1a1a" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#1a1a1a" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#8a8a8a" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#2a2a2a" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#0a0a0a" }]
          }
        ]
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add marker for current location
      markerRef.current = new window.google.maps.Marker({
        position: { lat: transito.ubicacionActual.lat, lng: transito.ubicacionActual.lng },
        map: mapInstanceRef.current,
        title: `Precinto ${transito.precintoNumero}`,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        }
      });

      // Draw route path (simulated)
      drawRoutePath();
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const drawRoutePath = () => {
    if (!mapInstanceRef.current || !window.google || !transito?.ubicacionActual) return;

    // Simulate a route path (in real app, this would come from actual route data)
    const routeCoordinates = generateRouteCoordinates(
      { lat: -34.9011, lng: -56.1645 }, // Example origin (Montevideo)
      transito.ubicacionActual,
      transito.progreso
    );

    // Draw the completed portion of the route
    const completedPath = new window.google.maps.Polyline({
      path: routeCoordinates.slice(0, Math.floor(routeCoordinates.length * (timelinePosition / 100))),
      geodesic: true,
      strokeColor: '#10B981',
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: mapInstanceRef.current
    });

    // Draw the remaining portion of the route
    const remainingPath = new window.google.maps.Polyline({
      path: routeCoordinates.slice(Math.floor(routeCoordinates.length * (timelinePosition / 100))),
      geodesic: true,
      strokeColor: '#6B7280',
      strokeOpacity: 0.6,
      strokeWeight: 4,
      map: mapInstanceRef.current
    });
  };

  const generateRouteCoordinates = (origin: {lat: number, lng: number}, current: {lat: number, lng: number}, progress: number) => {
    // Generate a curved path between origin and destination
    const points = [];
    const numPoints = 20;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = origin.lat + (current.lat - origin.lat) * t + (Math.sin(t * Math.PI) * 0.1);
      const lng = origin.lng + (current.lng - origin.lng) * t;
      points.push({ lat, lng });
    }
    
    return points;
  };

  const updateMarkerPosition = (position: number) => {
    if (!markerRef.current || !mapInstanceRef.current || !transito?.ubicacionActual) return;

    // Calculate position along the route based on timeline position
    const origin = { lat: -34.9011, lng: -56.1645 }; // Example origin
    const lat = origin.lat + (transito.ubicacionActual.lat - origin.lat) * (position / 100);
    const lng = origin.lng + (transito.ubicacionActual.lng - origin.lng) * (position / 100);
    
    const newPosition = new window.google.maps.LatLng(lat, lng);
    markerRef.current.setPosition(newPosition);
    mapInstanceRef.current.panTo(newPosition);

    // Update the route drawing
    drawRoutePath();
  };

  const handleTimelineChange = (value: number) => {
    setTimelinePosition(value);
    
    if (!transito) return;
    
    // Calculate the time based on position
    const totalDuration = transito.eta.getTime() - transito.fechaSalida.getTime();
    const currentDuration = (totalDuration * value) / 100;
    const currentTime = new Date(transito.fechaSalida.getTime() + currentDuration);
    setSelectedTime(currentTime);
    
    // Update marker position
    updateMarkerPosition(value);
  };

  const togglePlayTimeline = () => {
    if (isPlayingTimeline) {
      // Stop playing
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlayingTimeline(false);
    } else {
      // Start playing
      setIsPlayingTimeline(true);
      let currentPos = timelinePosition;
      
      playIntervalRef.current = setInterval(() => {
        currentPos += 2; // Move 2% each interval
        if (currentPos >= 100) {
          currentPos = 0; // Loop back to start
        }
        handleTimelineChange(currentPos);
      }, 100); // Update every 100ms
    }
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen || !transito) return null;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    const duration = transito.eta.getTime() - transito.fechaSalida.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
        <Card variant="elevated" className="pointer-events-auto max-w-4xl w-full max-h-[90vh] overflow-hidden bg-gray-900">
          {/* Header */}
          <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-900/30">
                    <Link2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Precinto {transito.precintoNumero}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-400">{transito.matricula}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-400">ID: {transito.precintoId}</span>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1.5">
                        <Battery className={cn(
                          "h-4 w-4",
                          transito.bateria && transito.bateria >= 60 ? "text-green-400" :
                          transito.bateria && transito.bateria >= 30 ? "text-yellow-400" : "text-red-400"
                        )} />
                        <span className="text-sm text-gray-400">{transito.bateria}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Cerrar (ESC)"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Información del Viaje */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-500" />
                    Información del Viaje
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Origen</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {transito.origen}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destino</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {transito.destino}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salida</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDateTime(transito.fechaSalida)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Llegada Estimada</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(transito.eta)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duración</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          {calculateDuration()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Progreso</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-gray-400" />
                          {transito.progreso}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Progreso del viaje</span>
                      <span className="text-xs text-gray-400">{transito.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 relative overflow-hidden bg-green-500"
                        style={{ width: `${transito.progreso}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Aduanera */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Información Aduanera
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DUA</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                          {transito.dua}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Viaje</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroViaje}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Movimiento</p>
                        <p className="text-white font-mono font-medium flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {transito.numeroMovimiento}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Chofer */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Información del Chofer
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
                      <p className="text-white font-medium">{transito.chofer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CI</p>
                      <p className="text-white font-medium">{transito.choferCI}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Precinto */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Información del Precinto
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código de Precinto</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {transito.precintoId}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Larga</span>
                        <span className={cn(
                          "text-sm font-medium",
                          transito.eslinga_larga ? "text-green-400" : "text-red-400"
                        )}>
                          {transito.eslinga_larga ? '✓ Colocada' : '✗ No colocada'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Eslinga Corta</span>
                        <span className={cn(
                          "text-sm font-medium",
                          transito.eslinga_corta ? "text-green-400" : "text-red-400"
                        )}>
                          {transito.eslinga_corta ? '✓ Colocada' : '✗ No colocada'}
                        </span>
                      </div>
                    </div>

                    {transito.temperatura !== undefined && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Temperatura</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          {transito.temperatura}°C
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Foto del Precintado */}
                {transito.fotoPrecintado && (
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-500" />
                      Foto del Precintado
                    </h3>
                    <div className="relative group">
                      <img 
                        src={transito.fotoPrecintado} 
                        alt="Precinto colocado"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => setShowFullImage(true)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Click para ampliar</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download functionality
                            const link = document.createElement('a');
                            link.href = transito.fotoPrecintado!;
                            link.download = `precinto-${transito.precintoId}.jpg`;
                            link.click();
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {transito.observaciones && (
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Observaciones
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{transito.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Map */}
              <div className="space-y-6">
                {/* Ubicación Actual */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-500" />
                    Ubicación en Tiempo Real
                  </h3>
                  
                  {transito.ubicacionActual ? (
                    <>
                      {/* Coordinates */}
                      <div className="mb-4 bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Coordenadas</span>
                          <code className="text-sm text-gray-300 font-mono">
                            {transito.ubicacionActual.lat.toFixed(6)}, {transito.ubicacionActual.lng.toFixed(6)}
                          </code>
                        </div>
                      </div>
                      
                      {/* Map Container */}
                      <div className="relative rounded-lg overflow-hidden border border-gray-700">
                        {!mapError ? (
                          <div 
                            ref={mapRef} 
                            className="w-full h-[400px] bg-gray-900"
                          >
                            {/* Loading placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-400">Cargando mapa...</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-[400px] bg-gray-900 flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                              <p className="text-gray-400">No se pudo cargar el mapa</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Ubicación: {transito.ubicacionActual.lat.toFixed(4)}, {transito.ubicacionActual.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Timeline Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-700">
                          <div className="space-y-3">
                            {/* Time display */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Hora simulada:</span>
                              <span className="text-white font-medium">
                                {selectedTime.toLocaleString('es-UY', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {/* Timeline slider */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={togglePlayTimeline}
                                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                  title={isPlayingTimeline ? 'Pausar' : 'Reproducir'}
                                >
                                  {isPlayingTimeline ? (
                                    <Pause className="h-4 w-4 text-white" />
                                  ) : (
                                    <Play className="h-4 w-4 text-white" />
                                  )}
                                </button>
                                
                                <div className="flex-1 relative">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={timelinePosition}
                                    onChange={(e) => handleTimelineChange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${timelinePosition}%, #374151 ${timelinePosition}%, #374151 100%)`
                                    }}
                                  />
                                  
                                  {/* Timeline markers */}
                                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                                    <span>Inicio</span>
                                    <span>{Math.round(timelinePosition)}%</span>
                                    <span>Fin</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Journey info */}
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-3 border-t border-gray-800">
                              <div>
                                <p className="text-xs text-gray-500">Distancia recorrida</p>
                                <p className="text-sm text-white font-medium">
                                  {Math.round((timelinePosition / 100) * 450)} km de 450 km
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Tiempo transcurrido</p>
                                <p className="text-sm text-white font-medium">
                                  {Math.floor((timelinePosition / 100) * 5)}h {Math.round(((timelinePosition / 100) * 5 % 1) * 60)}m de 5h 0m
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-900/50 rounded-lg p-8 text-center">
                      <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Sin ubicación disponible</p>
                    </div>
                  )}
                </div>
                
                {/* Additional Stats */}
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Estadísticas del Viaje
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{transito.progreso}%</p>
                      <p className="text-xs text-gray-500 mt-1">Completado</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{calculateDuration()}</p>
                      <p className="text-xs text-gray-500 mt-1">Duración Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Image Modal */}
      {showFullImage && transito.fotoPrecintado && (
        <>
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img 
                src={transito.fotoPrecintado} 
                alt="Precinto colocado - Vista completa"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Precinto {transito.precintoId}</p>
                    <p className="text-sm text-gray-300">Viaje {transito.numeroViaje}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = transito.fotoPrecintado!;
                      link.download = `precinto-${transito.precintoId}-full.jpg`;
                      link.click();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar imagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};