/**
 * Zonas de Descanso Page V2 - Información de áreas autorizadas para camioneros
 * Incluye: shadcn/ui, Framer Motion, Animaciones, Zustand mejorado
 * By Cheva
 */

import React, { useState, useMemo } from 'react';
import {MapPin, Search, Navigation, ExternalLink, Map, ChevronDown, ChevronRight,Truck, Info,Clock,Filter, Download, Star, Coffee, Fuel} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Card, CardContent,CardDescription, CardHeader, CardTitle} from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PageTransition, 
  AnimatedHeader, 
  AnimatedSection,
  AnimatedGrid 
} from '@/components/animations/PageTransitions';
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedBadge,
  AnimatedList,
  AnimatedListItem,
  AnimatedDiv,
  AnimatedSpinner
} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/utils';
import { zonasDescansoData } from '../data/zonasDescansoData';
import type { RutaZonas, ZonaDescanso } from '../data/zonasDescansoData';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import type { MapMarker, MapRoute } from '@/components/maps/InteractiveMap';
import {staggerContainer, staggerItem, fadeInUp, scaleIn, slideInRight} from '@/components/animations/AnimationPresets';

export const ZonasDescansoPageV2: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('list');
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set(['Ruta 1']));
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);

  // Filter zones based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return zonasDescansoData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return zonasDescansoData.map(rutaData => {
      const filteredZonas = rutaData.zonas.filter(zona => 
        zona.ubicacion.toLowerCase().includes(lowerSearchTerm) ||
        rutaData.ruta.toLowerCase().includes(lowerSearchTerm)
      );

      return {
        ...rutaData,
        zonas: filteredZonas
      };
    }).filter(rutaData => rutaData.zonas.length > 0);
  }, [searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalZonas = zonasDescansoData.reduce((sum, ruta) => sum + ruta.zonas.length, 0);
    const filteredZonas = filteredData.reduce((sum, ruta) => sum + ruta.zonas.length, 0);
    const totalRutas = zonasDescansoData.length;
    const departamentos = new Set(
      zonasDescansoData.flatMap(ruta => 
        ruta.zonas.map(zona => {
          const parts = zona.ubicacion.split(',');
          return parts[parts.length - 1]?.trim() || '';
        })
      )
    ).size;

    return {
      totalZonas,
      filteredZonas,
      totalRutas,
      departamentos
    };
  }, [filteredData]);

  const toggleRoute = (ruta: string) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(ruta)) {
      newExpanded.delete(ruta);
    } else {
      newExpanded.add(ruta);
    }
    setExpandedRoutes(newExpanded);
  };

  const exportData = () => {
    const _data = zonasDescansoData.flatMap(ruta => 
      ruta.zonas.map(zona => ({
        Ruta: ruta.ruta,
        Ubicación: zona.ubicacion,
        'Link Maps': zona.maps
      }))
    );
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zonas-descanso.csv';
    a.click();
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <AnimatedHeader
          title="Zonas de descanso para camioneros"
          subtitle="Áreas autorizadas por la Dirección Nacional de Aduanas del Uruguay"
          icon={<MapPin className="h-8 w-8 text-blue-500" />}
          action={
            <AnimatedButton
              variant="outline"
              onClick={exportData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </AnimatedButton>
          }
        />

        {/* Stats Cards */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Zonas"
              value={stats.totalZonas}
              icon={<MapPin className="h-5 w-5" />}
              color="text-blue-400"
              subtitle="Áreas autorizadas"
            />
            <StatsCard
              title="Rutas Cubiertas"
              value={stats.totalRutas}
              icon={<Navigation className="h-5 w-5" />}
              color="text-green-400"
              subtitle="Rutas nacionales"
            />
            <StatsCard
              title="Departamentos"
              value={stats.departamentos}
              icon={<Map className="h-5 w-5" />}
              color="text-purple-400"
              subtitle="Con zonas de descanso"
            />
            <StatsCard
              title="Disponibilidad"
              value="24/7"
              icon={<Clock className="h-5 w-5" />}
              color="text-orange-400"
              subtitle="Acceso permanente"
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Info Alert */}
        <AnimatedSection delay={0.15}>
          <Alert className="border-blue-600 bg-blue-900/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Información importante</AlertTitle>
            <AlertDescription>
              Estas zonas están autorizadas para el descanso de camioneros que transportan mercaderías 
              bajo control aduanero. Se recomienda verificar las condiciones actuales antes de detenerse.
            </AlertDescription>
          </Alert>
        </AnimatedSection>

        {/* Search and View Toggle */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por ruta, ubicación o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <AnimatedButton
                    variant={selectedView === 'list' ? 'default' : 'outline'}
                    onClick={() => setSelectedView('list')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Lista
                  </AnimatedButton>
                  <AnimatedButton
                    variant={selectedView === 'map' ? 'default' : 'outline'}
                    onClick={() => setSelectedView('map')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mapa
                  </AnimatedButton>
                </div>
              </div>
              
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between"
                >
                  <p className="text-sm text-gray-400">
                    Mostrando {stats.filteredZonas} de {stats.totalZonas} zonas
                  </p>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar búsqueda
                  </AnimatedButton>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Content based on view */}
        <AnimatedSection delay={0.3}>
          {selectedView === 'list' ? (
            <RutasListView 
              data={filteredData}
              expandedRoutes={expandedRoutes}
              onToggleRoute={toggleRoute}
              highlightedZone={highlightedZone}
              onHighlightZone={setHighlightedZone}
              searchTerm={searchTerm}
            />
          ) : (
            <MapView data={filteredData} />
          )}
        </AnimatedSection>
      </div>
    </PageTransition>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <AnimatedCard whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg bg-gray-800", color)}
          whileHover={{ rotate: 15 }}
        >
          {icon}
        </motion.div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </CardContent>
  </AnimatedCard>
);

// List View Component
const RutasListView: React.FC<{
  data: RutaZonas[];
  expandedRoutes: Set<string>;
  onToggleRoute: (ruta: string) => void;
  highlightedZone: string | null;
  onHighlightZone: (zone: string | null) => void;
  searchTerm: string;
}> = ({ data, expandedRoutes, onToggleRoute, highlightedZone, onHighlightZone, searchTerm }) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            No se encontraron zonas de descanso que coincidan con "{searchTerm}"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {data.map((rutaData, index) => (
        <motion.div key={rutaData.ruta} variants={staggerItem}>
          <AnimatedCard 
            className="overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => onToggleRoute(rutaData.ruta)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: expandedRoutes.has(rutaData.ruta) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </motion.div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Navigation className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{rutaData.ruta}</h3>
                      <p className="text-sm text-gray-400">
                        {rutaData.zonas.length} {rutaData.zonas.length === 1 ? 'zona' : 'zonas'} de descanso
                      </p>
                    </div>
                  </div>
                </div>
                <AnimatedBadge variant="secondary">
                  {rutaData.zonas.length} paradas
                </AnimatedBadge>
              </div>
            </div>

            <AnimatePresence>
              {expandedRoutes.has(rutaData.ruta) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Separator />
                  <div className="p-4">
                    <AnimatedList className="space-y-3">
                      {rutaData.zonas.map((zona, zoneIndex) => (
                        <AnimatedListItem
                          key={zona.ubicacion}
                          index={zoneIndex}
                          onMouseEnter={() => onHighlightZone(zona.ubicacion)}
                          onMouseLeave={() => onHighlightZone(null)}
                        >
                          <motion.div
                            className={cn(
                              "p-4 bg-gray-800/50 rounded-lg border transition-all",
                              highlightedZone === zona.ubicacion
                                ? "border-blue-500 bg-gray-800"
                                : "border-gray-700"
                            )}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={cn(
                                  "p-2 rounded-lg mt-1",
                                  highlightedZone === zona.ubicacion
                                    ? "bg-blue-600/30"
                                    : "bg-gray-700"
                                )}>
                                  <MapPin className={cn(
                                    "h-4 w-4",
                                    highlightedZone === zona.ubicacion
                                      ? "text-blue-400"
                                      : "text-gray-400"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-medium">
                                    {zona.ubicacion}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {zona.ubicacion.toLowerCase().includes('ancap') && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Fuel className="mr-1 h-3 w-3" />
                                        Combustible
                                      </Badge>
                                    )}
                                    {zona.ubicacion.toLowerCase().includes('parador') && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Coffee className="mr-1 h-3 w-3" />
                                        Servicios
                                      </Badge>
                                    )}
                                    {zona.ubicacion.toLowerCase().includes('balanza') && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Truck className="mr-1 h-3 w-3" />
                                        Balanza
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(zona.maps, '_blank');
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </AnimatedButton>
                            </div>
                          </motion.div>
                        </AnimatedListItem>
                      ))}
                    </AnimatedList>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedCard>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Map View Component
const MapView: React.FC<{ data: RutaZonas[] }> = ({ data }) => {
  const allZones = data.flatMap(ruta => 
    ruta.zonas.map(zona => ({ ...zona, ruta: ruta.ruta }))
  );

  // Function to extract coordinates from Google Maps URL
  const extractCoordinates = (mapsUrl: string, ubicacion: string): { lat: number; lng: number } | null => {
    try {
      // Try to extract from query parameter
      const queryMatch = mapsUrl.match(/query=([^,]+),([^,&]+)/);
      if (queryMatch) {
        const lat = parseFloat(queryMatch[1]);
        const lng = parseFloat(queryMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // Extract approximate coordinates based on known locations
      const locationMap: Record<string, { lat: number; lng: number }> = {
        'San José': { lat: -34.3375, lng: -56.7139 },
        'Colonia Valdense': { lat: -34.3392, lng: -57.2342 },
        'Florencio Sánchez': { lat: -33.8731, lng: -57.3892 },
        'José Enrique Rodó': { lat: -33.6944, lng: -57.5425 },
        'Fray Bentos': { lat: -33.1264, lng: -58.3181 },
        'Young': { lat: -32.6972, lng: -57.6331 },
        'Paysandú': { lat: -32.3214, lng: -58.0756 },
        'Salto': { lat: -31.3833, lng: -57.9667 },
        'Rivera': { lat: -30.9053, lng: -55.5508 },
        'Artigas': { lat: -30.4000, lng: -56.4667 },
        'Chuy': { lat: -33.6975, lng: -53.4594 },
        'Colonia': { lat: -34.4626, lng: -57.8400 }
      };
      
      // Find matching location
      for (const [location, coords] of Object.entries(locationMap)) {
        if (mapsUrl.includes(location) || ubicacion.includes(location)) {
          return coords;
        }
      }
      
      // Default to center of Uruguay
      return { lat: -32.5228, lng: -55.7658 };
    } catch (_error) {
      console.error('Error extracting coordinates:', _error);
      return null;
    }
  };

  // Convert zones to map markers
  const markers: MapMarker[] = allZones.map((zona, index) => {
    const coords = extractCoordinates(zona.maps, zona.ubicacion);
    const hasAncap = zona.ubicacion.toLowerCase().includes('ancap');
    const hasParador = zona.ubicacion.toLowerCase().includes('parador');
    const hasBalanza = zona.ubicacion.toLowerCase().includes('balanza');
    
    return {
      id: `zona-${index}`,
      position: coords || { lat: -32.5228, lng: -55.7658 },
      title: zona.ubicacion,
      type: 'zona',
      color: hasAncap ? '#10B981' : hasParador ? '#F59E0B' : '#3B82F6',
      data: {
        ruta: zona.ruta,
        ubicacion: zona.ubicacion,
        mapsUrl: zona.maps,
        servicios: {
          combustible: hasAncap,
          servicios: hasParador,
          balanza: hasBalanza
        }
      }
    };
  });

  // Create routes for major highways
  const routes: MapRoute[] = [
    {
      id: 'ruta-1',
      name: 'Ruta 1',
      path: [
        { lat: -34.9011, lng: -56.1645 }, // Montevideo
        { lat: -34.3375, lng: -56.7139 }, // San José
        { lat: -34.3392, lng: -57.2342 }, // Colonia Valdense
        { lat: -34.4626, lng: -57.8400 }  // Colonia
      ],
      color: '#3B82F6',
      strokeWeight: 3
    },
    {
      id: 'ruta-3',
      name: 'Ruta 3',
      path: [
        { lat: -34.9011, lng: -56.1645 }, // Montevideo
        { lat: -34.3375, lng: -56.7139 }, // San José
        { lat: -32.3214, lng: -58.0756 }, // Paysandú
        { lat: -31.3833, lng: -57.9667 }, // Salto
        { lat: -30.4000, lng: -56.4667 }  // Artigas
      ],
      color: '#10B981',
      strokeWeight: 3
    },
    {
      id: 'ruta-5',
      name: 'Ruta 5',
      path: [
        { lat: -34.9011, lng: -56.1645 }, // Montevideo
        { lat: -33.2524, lng: -56.0244 }, // Florida
        { lat: -32.3714, lng: -55.2383 }, // Durazno
        { lat: -31.7333, lng: -55.9833 }, // Tacuarembó
        { lat: -30.9053, lng: -55.5508 }  // Rivera
      ],
      color: '#8B5CF6',
      strokeWeight: 3
    }
  ];

  return (
    <InteractiveMap
      markers={markers}
      routes={routes}
      height="600px"
      showControls={true}
      showLegend={true}
      showSearch={true}
      onMarkerClick={(marker) => {
        if (marker.data?.mapsUrl) {
          window.open(marker.data.mapsUrl, 'blank');
        }
      }}
    />
  );
};

export default ZonasDescansoPageV2;