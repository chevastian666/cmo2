/**
 * CMO - Centro de Monitoreo de Operaciones
 * Sistema de Monitoreo de Precintos Electrónicos - Block Tracker
 * By Cheva
 */

import { useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { LayoutOptimized} from './features/common'
import { Dashboard} from './features/dashboard/components/Dashboard'
import { LoginPage} from './features/auth/LoginPage'
import { LoadingOverlay} from './components/ui/LoadingState'
import { ProtectedRoute} from './components/ProtectedRoute'
import './utils/clearDashboardLayout'
// Lazy load heavy components
// const _ArmadoPage = lazy(() => import('./features/armado').then(m => ({ default: m.ArmadoPage })))
const ArmadoPageV2 = lazy(() => import('./features/armado/pages/ArmadoPageV2'))
const ArmadoWaitingPage = lazy(() => import('./features/armado').then(m => ({ default: m.ArmadoWaitingPage })))
const PrearmadoPage = lazy(() => import('./features/prearmado').then(m => ({ default: m.PrearmadoPage })))
const TransitosPageV2 = lazy(() => import('./features/transitos/pages/TransitosPageV2'))
const PrecintosPage = lazy(() => import('./features/precintos').then(m => ({ default: m.PrecintosPage })))
const ErrorBoundary = lazy(() => import('./features/precintos').then(m => ({ default: m.ErrorBoundary })))
const AlertasPageV2 = lazy(() => import('./features/alertas/pages/AlertasPageV2'))
const DespachantesPage = lazy(() => import('./features/despachantes').then(m => ({ default: m.DespachantesPage })))
const DepositosPage = lazy(() => import('./features/depositos').then(m => ({ default: m.DepositosPage })))
const ZonasDescansoPage = lazy(() => import('./features/zonas-descanso').then(m => ({ default: m.ZonasDescansoPage })))
// const TorreControl = lazy(() => import('./features/torre-control/components/TorreControl').then(m => ({ default: m.TorreControl })))
const TorreControlV2 = lazy(() => import('./features/torre-control/components/TorreControlV2'))
const CentroDocumentacion = lazy(() => import('./features/documentacion').then(m => ({ default: m.CentroDocumentacion })))
// const _LibroNovedadesPageV2 = lazy(() => import('./features/novedades/pages/LibroNovedadesPageV2'))
const BitacoraOperacional = lazy(() => import('./features/novedades').then(m => ({ default: m.BitacoraOperacional })))
const CamionesPage = lazy(() => import('./features/camiones/pages/CamionesPage').then(m => ({ default: m.CamionesPage })))
const DesignTokensDemo = lazy(() => import('./components/ui/DesignTokensDemo').then(m => ({ default: m.DesignTokensDemo })))
const AnimationsDemo = lazy(() => import('./components/animations/AnimationsDemo').then(m => ({ default: m.AnimationsDemo })))
const CamionerosPage = lazy(() => import('./features/camioneros/pages/CamionerosPage').then(m => ({ default: m.CamionerosPage })))
const ModoTVPage = lazy(() => import('./features/modo-tv/pages/ModoTVPage').then(m => ({ default: m.ModoTVPage })))
const RolesPage = lazy(() => import('./features/roles').then(m => ({ default: m.RolesPage })))
const SubPanelesPage = lazy(() => import('./features/sub-paneles').then(m => ({ default: m.SubPanelesPage })))
const ShadcnDemo = lazy(() => import('./components/ui/ShadcnDemo'))
const InteractiveDashboard = lazy(() => import('./features/dashboard/InteractiveDashboard'))
const DashboardTest = lazy(() => import('./features/dashboard/DashboardTest'))
const InteractiveSankeyDashboard = lazy(() => import('./features/analytics/components/InteractiveSankeyDashboard'))
const AnalyticsTest = lazy(() => import('./features/analytics/components/AnalyticsTest'))
const SankeyMinimal = lazy(() => import('./features/analytics/components/SankeyMinimal'))
// const SimpleAnalytics = lazy(() => import('./features/analytics/components/SimpleAnalytics'))
const AnalyticsErrorBoundary = lazy(() => import('./features/analytics/components/AnalyticsErrorBoundary'))
// const TreemapDashboard = lazy(() => import('./features/analytics/components/TreemapDashboard'))
const TreemapDashboardSimple = lazy(() => import('./features/analytics/components/TreemapDashboardSimple'))
const TreemapStatic = lazy(() => import('./features/analytics/components/TreemapStatic'))
const TreemapTest = lazy(() => import('./features/analytics/components/TreemapTest'))
const TreemapFixed = lazy(() => import('./features/analytics/components/TreemapFixed'))
const D3VisualizationsDemo = lazy(() => import('./features/dashboard/pages/D3VisualizationsDemo').then(m => ({ default: m.D3VisualizationsDemo })))
const NotificationSystemDemo = lazy(() => import('./features/notifications/pages/NotificationSystemDemo').then(m => ({ default: m.NotificationSystemDemo })))
const PerformanceDemo = lazy(() => import('./features/performance/pages/PerformanceDemo').then(m => ({ default: m.PerformanceDemo })))
const IntegrationsManagementPage = lazy(() => import('./features/integrations/pages/IntegrationsManagementPage').then(m => ({ default: m.default })))
import { initializeStores, setupAutoRefresh} from './store'
import { useSharedIntegration, useSyncStoreActions} from './hooks/useSharedIntegration'
import { useWebSocket} from './hooks/useWebSocket'
import { notificationService} from './services/shared/notification.service'
import { sharedWebSocketService} from './services/shared/sharedWebSocket.service'
import { _SHARED_CONFIG as SHARED_CONFIG} from './config/shared.config'
import { Toaster} from '@/components/ui/toaster'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
// import TreemapDirect from './features/analytics/components/TreemapDirect'
import './App.css'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: false, // Desactiva reintentos para desarrollo sin API
      refetchOnWindowFocus: false,
    },
  },
})
function App() {
  // Mock authentication functions - in real app these would come from auth service
  const isAuthenticated = true; // Mock authentication state
  const canAccessCMO = () => true; // Mock authorization check

  // Initialize shared services integration
  useSharedIntegration()
  useSyncStoreActions()
  // Initialize WebSocket with authentication
  useWebSocket({
    onConnect: () => {
      console.log('Connected to real-time updates')
    },
    onDisconnect: () => {
      console.log('Disconnected from real-time updates')
    },
    onReconnect: () => {
      console.log('Reconnected to real-time updates')
      notificationService.info('Conexión Restaurada')
    }
  })
  useEffect(() => {
    // Set up notification handlers for real-time events
    const unsubscribers: (() => void)[] = []
    // New alert notifications
    unsubscribers.push(sharedWebSocketService.onAlertNew((data: unknown) => {
        const alertData = data as { alert?: unknown } | unknown
        notificationService.newAlert(typeof alertData === 'object' && alertData && 'alert' in alertData ? alertData.alert : data)
      })
    )
    // Transit delay notifications
    unsubscribers.push(sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, (data: unknown) => {
        const transitData = data as { status?: string; transit?: unknown }
        if (transitData.status === 'delayed' && transitData.transit) {
          notificationService.transitDelayed(transitData.transit)
        }
      })
    )
    // CMO message notifications
    unsubscribers.push(sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.CMO_MESSAGE, (data: unknown) => {
        const messageData = data as { message?: string } | string
        const message = typeof messageData === 'object' && messageData && 'message' in messageData 
          ? messageData.message 
          : String(data)
        notificationService.cmoMessage(message || '')
      })
    )
    // Initialize stores and fetch initial data
    initializeStores()
    // Set up auto-refresh intervals (as fallback)
    const cleanup = setupAutoRefresh()
    return () => {
      unsubscribers.forEach(unsub => unsub())
      cleanup?.()
    }
  }, [])
  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    )
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
    )
  }

  console.log('App: Rendering authenticated user routes')
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/modo-tv" element={
              <Suspense fallback={<LoadingOverlay visible={true} />}>
                <ModoTVPage />
              </Suspense>
            } />
            <Route path="*" element={
              <LayoutOptimized>
                <Suspense fallback={<LoadingOverlay visible={true} />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/armado" element={<ArmadoPageV2 />} />
                    <Route path="/armado/waiting/:transitId" element={<ArmadoWaitingPage />} />
                    <Route path="/prearmado" element={<PrearmadoPage />} />
                    <Route path="/transitos" element={<TransitosPageV2 />} />
                    <Route path="/precintos" element={
                      <ErrorBoundary componentName="PrecintosPage">
                        <PrecintosPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/alertas" element={<AlertasPageV2 />} />
                    <Route path="/despachantes" element={<DespachantesPage />} />
                    <Route path="/depositos" element={<DepositosPage />} />
                    <Route path="/zonas-descanso" element={<ZonasDescansoPage />} />
                    <Route path="/torre-control" element={<TorreControlV2 />} />
                    <Route path="/documentacion" element={<CentroDocumentacion />} />
                    <Route path="/novedades" element={<BitacoraOperacional />} />
                    <Route path="/camiones" element={<CamionesPage />} />
                    <Route path="/camioneros" element={<CamionerosPage />} />
                    <Route path="/roles" element={
                      <ProtectedRoute section="roles" permission="view">
                        <RolesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/sub-paneles" element={
                      <ProtectedRoute section="roles" permission="view">
                        <SubPanelesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/demo" element={<ShadcnDemo />} />
                    <Route path="/design-tokens" element={<DesignTokensDemo />} />
                    <Route path="/animations" element={<AnimationsDemo />} />
                    <Route path="/dashboard-interactive" element={<InteractiveDashboard />} />
                    <Route path="/dashboard-test" element={<DashboardTest />} />
                    <Route path="/analytics" element={
                      <AnalyticsErrorBoundary>
                        <InteractiveSankeyDashboard />
                      </AnalyticsErrorBoundary>
                    } />
                    <Route path="/analytics-test" element={<AnalyticsTest />} />
                    <Route path="/sankey-test" element={<SankeyMinimal />} />
                    <Route path="/treemaps" element={<TreemapFixed />} />
                    <Route path="/treemaps-static" element={<TreemapStatic />} />
                    <Route path="/treemaps-simple" element={<TreemapDashboardSimple />} />
                    <Route path="/treemap-test" element={<TreemapTest />} />
                    <Route path="/d3-visualizations" element={<D3VisualizationsDemo />} />
                    <Route path="/notifications-demo" element={<NotificationSystemDemo />} />
                    <Route path="/performance-demo" element={<PerformanceDemo />} />
                    <Route path="/integrations" element={
                      <GlobalErrorBoundary>
                        <IntegrationsManagementPage />
                      </GlobalErrorBoundary>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </LayoutOptimized>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default App