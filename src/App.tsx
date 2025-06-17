/**
 * CMO - Centro de Monitoreo de Operaciones
 * Sistema de Monitoreo de Precintos Electrónicos - Block Tracker
 * By Cheva
 */

import { useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, LayoutOptimized } from './features/common';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { LoginPage } from './features/auth/LoginPage';
import { LoadingOverlay } from './components/ui/LoadingState';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load heavy components
const ArmadoPage = lazy(() => import('./features/armado').then(m => ({ default: m.ArmadoPage })));
const ArmadoWaitingPage = lazy(() => import('./features/armado').then(m => ({ default: m.ArmadoWaitingPage })));
const PrearmadoPage = lazy(() => import('./features/prearmado').then(m => ({ default: m.PrearmadoPage })));
const TransitosPage = lazy(() => import('./features/transitos').then(m => ({ default: m.TransitosPage })));
const PrecintosPage = lazy(() => import('./features/precintos').then(m => ({ default: m.PrecintosPage })));
const ErrorBoundary = lazy(() => import('./features/precintos').then(m => ({ default: m.ErrorBoundary })));
const AlertasPage = lazy(() => import('./features/alertas').then(m => ({ default: m.AlertasPage })));
const DespachantesPage = lazy(() => import('./features/despachantes').then(m => ({ default: m.DespachantesPage })));
const DepositosPage = lazy(() => import('./features/depositos').then(m => ({ default: m.DepositosPage })));
const ZonasDescansoPage = lazy(() => import('./features/zonas-descanso').then(m => ({ default: m.ZonasDescansoPage })));
const TorreControl = lazy(() => import('./features/torre-control/components/TorreControl').then(m => ({ default: m.TorreControl })));
const CentroDocumentacion = lazy(() => import('./features/documentacion').then(m => ({ default: m.CentroDocumentacion })));
const LibroNovedades = lazy(() => import('./features/novedades').then(m => ({ default: m.LibroNovedades })));
const CamionesPage = lazy(() => import('./features/camiones/pages/CamionesPage').then(m => ({ default: m.CamionesPage })));
const CamionerosPage = lazy(() => import('./features/camioneros/pages/CamionerosPage').then(m => ({ default: m.CamionerosPage })));
const ModoTVPage = lazy(() => import('./features/modo-tv/pages/ModoTVPage').then(m => ({ default: m.ModoTVPage })));
const RolesPage = lazy(() => import('./features/roles').then(m => ({ default: m.RolesPage })));
import { initializeStores, setupAutoRefresh } from './store';
import { useSharedIntegration, useSyncStoreActions } from './hooks/useSharedIntegration';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import { notificationService } from './services/shared/notification.service';
import { sharedWebSocketService } from './services/shared/sharedWebSocket.service';
import { SHARED_CONFIG } from './config/shared.config';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: false, // Desactiva reintentos para desarrollo sin API
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, canAccessCMO } = useAuth();
  
  // Initialize shared services integration
  useSharedIntegration();
  useSyncStoreActions();
  
  // Initialize WebSocket with authentication
  const { isConnected } = useWebSocket({
    onConnect: () => {
      console.log('Connected to real-time updates');
    },
    onDisconnect: () => {
      console.log('Disconnected from real-time updates');
    },
    onReconnect: () => {
      console.log('Reconnected to real-time updates');
      notificationService.info('Conexión Restaurada', 'La conexión en tiempo real ha sido restaurada');
    }
  });
  
  useEffect(() => {
    // Set up notification handlers for real-time events
    const unsubscribers: (() => void)[] = [];
    
    // New alert notifications
    unsubscribers.push(
      sharedWebSocketService.onAlertNew((data) => {
        notificationService.newAlert(data.alert || data);
      })
    );
    
    // Transit delay notifications
    unsubscribers.push(
      sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, (data) => {
        if (data.status === 'delayed') {
          notificationService.transitDelayed(data.transit);
        }
      })
    );
    
    // CMO message notifications
    unsubscribers.push(
      sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.CMO_MESSAGE, (data) => {
        notificationService.cmoMessage(data.message || data);
      })
    );
    
    // Initialize stores and fetch initial data
    initializeStores();
    
    // Set up auto-refresh intervals (as fallback)
    const cleanup = setupAutoRefresh();
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
      cleanup?.();
    };
  }, []);
  
  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }
  
  // Check authorization for CMO panel
  if (!canAccessCMO()) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LayoutOptimized>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-red-400 mb-4">Acceso Denegado</h1>
                <p className="text-lg text-gray-400">No tienes permisos para acceder al Centro de Monitoreo de Operaciones.</p>
                <p className="text-base text-gray-500 mt-2">Contacta a tu administrador si crees que esto es un error.</p>
              </div>
            </div>
          </LayoutOptimized>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  console.log('App: Rendering authenticated user routes');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/modo-tv" element={
            <Suspense fallback={<LoadingOverlay />}>
              <ModoTVPage />
            </Suspense>
          } />
          <Route path="*" element={
            <LayoutOptimized>
              <Suspense fallback={<LoadingOverlay />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/armado" element={<ArmadoPage />} />
                  <Route path="/armado/waiting/:transitId" element={<ArmadoWaitingPage />} />
                  <Route path="/prearmado" element={<PrearmadoPage />} />
                  <Route path="/transitos" element={<TransitosPage />} />
                  <Route path="/precintos" element={
                    <ErrorBoundary componentName="PrecintosPage">
                      <PrecintosPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/alertas" element={<AlertasPage />} />
                  <Route path="/despachantes" element={<DespachantesPage />} />
                  <Route path="/depositos" element={<DepositosPage />} />
                  <Route path="/zonas-descanso" element={<ZonasDescansoPage />} />
                  <Route path="/torre-control" element={<TorreControl />} />
                  <Route path="/documentacion" element={<CentroDocumentacion />} />
                  <Route path="/novedades" element={<LibroNovedades />} />
                  <Route path="/camiones" element={<CamionesPage />} />
                  <Route path="/camioneros" element={<CamionerosPage />} />
                  <Route path="/roles" element={
                    <ProtectedRoute section="roles" permission="view">
                      <RolesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </LayoutOptimized>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;