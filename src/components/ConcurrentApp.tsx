import React, { Suspense, useState, useEffect } from 'react';
import { PriorityProvider } from './priority/PriorityProvider';
import { CriticalAlerts } from './alerts/CriticalAlerts';
import { PrecintsGrid } from './dashboard/PrecintsGrid';
import { MapView } from './map/MapView';
import { PerformanceMonitor, ProfiledComponent } from './dashboard/PerformanceMonitor';
import { CriticalAlertsSkeleton } from './alerts/AlertsSkeleton';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { MapSkeleton } from './map/MapSkeleton';

// Mock data generators
const generateMockPrecintos = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `precinto-${i}`,
    code: `PRECINTO-${String(i + 1).padStart(3, '0')}`,
    status: ['active', 'inactive', 'transit', 'alert'][Math.floor(Math.random() * 4)] as any,
    location: ['Buenos Aires', 'Rosario', 'Córdoba', 'Mendoza'][Math.floor(Math.random() * 4)],
    temperature: 15 + Math.random() * 20,
    battery: 20 + Math.random() * 80,
    lastUpdate: new Date(Date.now() - Math.random() * 3600000),
    assignedTo: Math.random() > 0.5 ? `Driver ${Math.floor(Math.random() * 10)}` : undefined
  }));
};

const generateMockLocations = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `location-${i}`,
    precintoId: `PRECINTO-${String(i + 1).padStart(3, '0')}`,
    lat: -34.6037 + (Math.random() - 0.5) * 0.5,
    lng: -58.3816 + (Math.random() - 0.5) * 0.5,
    status: ['active', 'inactive', 'alert'][Math.floor(Math.random() * 3)] as any,
    lastUpdate: new Date(Date.now() - Math.random() * 300000),
    speed: Math.random() > 0.7 ? Math.random() * 100 : 0,
    heading: Math.random() * 360
  }));
};

export const ConcurrentApp: React.FC = () => {
  const [precintos, setPrecintos] = useState(() => generateMockPrecintos(1000));
  const [locations, setLocations] = useState(() => generateMockLocations(1000));
  const [showPerformance, setShowPerformance] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update random precintos
      setPrecintos(prev => {
        const updated = [...prev];
        for (let i = 0; i < 50; i++) {
          const index = Math.floor(Math.random() * updated.length);
          updated[index] = {
            ...updated[index],
            temperature: 15 + Math.random() * 20,
            battery: Math.max(0, updated[index].battery - Math.random() * 0.5),
            lastUpdate: new Date()
          };
        }
        return updated;
      });

      // Update random locations
      setLocations(prev => {
        const updated = [...prev];
        for (let i = 0; i < 100; i++) {
          const index = Math.floor(Math.random() * updated.length);
          const loc = updated[index];
          if (loc.speed > 0) {
            updated[index] = {
              ...loc,
              lat: loc.lat + (Math.random() - 0.5) * 0.001,
              lng: loc.lng + (Math.random() - 0.5) * 0.001,
              lastUpdate: new Date()
            };
          }
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PriorityProvider enableMetrics>
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            CMO - React Concurrent Features Demo
          </h1>
          <p className="text-gray-400">
            Monitoring {precintos.length} electronic seals with intelligent render prioritization
          </p>
          
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            {showPerformance ? 'Hide' : 'Show'} Performance Monitor
          </button>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Alerts - Immediate Priority */}
          <div className="lg:col-span-3">
            <ProfiledComponent id="critical-alerts">
              <Suspense fallback={<CriticalAlertsSkeleton />}>
                <CriticalAlerts />
              </Suspense>
            </ProfiledComponent>
          </div>

          {/* Precintos Grid - Medium Priority */}
          <div className="lg:col-span-2">
            <ProfiledComponent id="precintos-grid">
              <Suspense fallback={<DashboardSkeleton />}>
                <PrecintsGrid precintos={precintos} />
              </Suspense>
            </ProfiledComponent>
          </div>

          {/* Map View - Low Priority */}
          <div className="lg:col-span-1">
            <ProfiledComponent id="map-view">
              <Suspense fallback={<MapSkeleton />}>
                <div className="h-[600px]">
                  <MapView locations={locations} className="h-full" />
                </div>
              </Suspense>
            </ProfiledComponent>
          </div>
        </div>

        {/* Performance Monitor */}
        {showPerformance && <PerformanceMonitor />}

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-xs text-gray-500">
          <p>React {React.version} | Concurrent Features Enabled</p>
          <p>Updates every 5 seconds | {locations.filter(l => l.speed > 0).length} vehicles in movement</p>
        </div>
      </div>
    </PriorityProvider>
  );
};