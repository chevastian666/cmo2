/**
 * Página de Alertas - Versión Optimizada para mejor rendimiento
 * By Cheva
 */

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { AlertTriangle, Shield, TrendingUp, Users, CheckCircle, History, Bell, BellOff, RefreshCw, User, XCircle, CheckCircle2, AlertCircle, Zap, Activity, Search} from 'lucide-react'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge, type BadgeVariant} from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/Tabs'
import { useAlertasStore} from '@/store/store'
import { cn} from '@/utils/utils'
import type { Alerta} from '@/types'
import { VerificarButton, VerificadoBadge} from '../components/VerificarButton'
// Lazy load modals pesados
const HistorialAlertasCriticasModal = lazy(() => 
  import('../components/HistorialAlertasCriticasModal').then(m => ({ 
    default: m.HistorialAlertasCriticasModal 
  }))
)
const VerificarAlertaModalV2 = lazy(() => 
  import('../components/VerificarAlertaModalV2').then(m => ({ 
    default: m.VerificarAlertaModalV2 
  }))
)
// Static helper functions outside component to avoid recreating
const getSeveridadInfo = (severidad: string) => {
  switch (severidad) {
    case 'critica':
      return { color: 'danger', icon: <XCircle className="h-4 w-4" />, pulse: true }
    case 'alta':
      return { color: 'warning', icon: <AlertTriangle className="h-4 w-4" />, pulse: false }
    case 'media':
      return { color: 'secondary', icon: <AlertCircle className="h-4 w-4" />, pulse: false }
    case 'baja':
      return { color: 'default', icon: <Bell className="h-4 w-4" />, pulse: false }
    default:
      return { color: 'default', icon: <Bell className="h-4 w-4" />, pulse: false }
  }
}
const getTipoInfo = (tipo: string) => {
  switch (tipo) {
    case 'violacion':
      return { color: 'destructive', icon: <Shield className="h-5 w-5" /> }
    case 'bateria_baja':
      return { color: 'warning', icon: <Zap className="h-5 w-5" /> }
    case 'fuera_de_ruta':
      return { color: 'secondary', icon: <TrendingUp className="h-5 w-5" /> }
    case 'temperatura':
      return { color: 'warning', icon: <AlertTriangle className="h-5 w-5" /> }
    case 'sin_signal':
      return { color: 'default', icon: <BellOff className="h-5 w-5" /> }
    case 'intrusion':
      return { color: 'destructive', icon: <Users className="h-5 w-5" /> }
    default:
      return { color: 'default', icon: <AlertTriangle className="h-5 w-5" /> }
  }
}
// Helper for search matching
const matchesSearch = (alerta: Alerta, searchTerm: string): boolean => {
  const search = searchTerm.toLowerCase()
  return (
    alerta.precintoId.toLowerCase().includes(search) ||
    alerta.mensaje.toLowerCase().includes(search) ||
    alerta.tipo.toLowerCase().includes(search)
  )
}
// Loading skeleton mejorado
const AlertSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
          <div className="h-3 w-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-1">
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
        <div className="h-3 w-24 bg-gray-800 rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-40 bg-gray-700 rounded"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-8 w-24 bg-gray-700 rounded"></div>
    </td>
  </tr>
)
// KPI Card optimizada con React.memo
const KPICard = React.memo<{
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  trend?: number
  subtitle?: string
  onClick?: () => void
}>(({ title, value, icon, color, trend, subtitle, onClick }) => (
  <Card 
    className={cn("relative overflow-hidden cursor-pointer transition-all hover:shadow-lg", onClick && "hover:scale-[1.02]")}
    onClick={onClick}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend !== undefined && (
          <Badge variant={trend > 0 ? "danger" : "success"} className="mb-1">
            {trend > 0 ? '+' : ''}{Math.abs(trend)}%
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
))
// Alert Row optimizada con memoización mejorada
const AlertRow = React.memo<{
  alerta: Alerta
  onVerificar: (alerta: Alerta) => void
}>(({ alerta, onVerificar }) => {
  const severidadInfo = React.useMemo(() => getSeveridadInfo(alerta.severidad), [alerta.severidad])
  const tipoInfo = React.useMemo(() => getTipoInfo(alerta.tipo), [alerta.tipo])
  const timeAgo = React.useMemo(() => {
    const minutes = Math.floor((new Date().getTime() - new Date(alerta.fecha).getTime()) / 60000)
    return minutes
  }, [alerta.fecha])
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-all duration-200 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            alerta.severidad === 'critica' && !alerta.atendida ? 'bg-red-500 animate-pulse' : 
            alerta.atendida ? 'bg-gray-500' : 'bg-yellow-500'
          )} />
          <div>
            <div className="flex items-center gap-2">
              <div className={cn("p-1 rounded", `bg-${tipoInfo.color}-500/10`)}>
                {tipoInfo.icon}
              </div>
              <span className="font-medium text-white">{alerta.tipo.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              Precinto: {alerta.precintoId}
            </p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge 
          variant={severidadInfo.color as BadgeVariant}
          className="flex items-center gap-1"
        >
          {severidadInfo.icon}
          {alerta.severidad.toUpperCase()}
        </Badge>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
        <div className="text-sm">
          <p>{new Date(alerta.fecha).toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            Hace {timeAgo} min
          </p>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-300 max-w-xs truncate">
          {alerta.mensaje}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {alerta.atendida ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Atendida</span>
          </div>
        ) : alerta.asignadoA ? (
          <div className="flex items-center gap-2 text-blue-400">
            <User className="h-4 w-4" />
            <span className="text-sm">{alerta.asignadoA}</span>
          </div>
        ) : (
          <Badge variant="secondary">Pendiente</Badge>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-end">
          {!alerta.atendida ? (<VerificarButton
              onClick={() => onVerificar(alerta)}
              variant="minimal"
              size="sm"
            />
          ) : (
            <VerificadoBadge
              verificadoPor={alerta.verificadoPor}
              fecha={alerta.fechaVerificacion}
              size="sm"
            />
          )}
        </div>
      </td>
    </tr>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.alerta.id === nextProps.alerta.id &&
    prevProps.alerta.atendida === nextProps.alerta.atendida &&
    prevProps.alerta.asignadoA === nextProps.alerta.asignadoA
  )
})
const AlertasPageV2: React.FC = () => {
  // Optimized store subscriptions
  const alertas = useAlertasStore(state => state.alertas)
  const alertasActivas = useAlertasStore(state => state.alertasActivas)
  const loading = useAlertasStore(state => state.loading)
  const fetchAlertas = useAlertasStore(state => state.fetchAlertas)
  const fetchAlertasActivas = useAlertasStore(state => state.fetchAlertasActivas)
  const atenderAlerta = useAlertasStore(state => state.atenderAlerta)
  const [showHistorialModal, setShowHistorialModal] = useState(false)
  const [showVerificarModal, setShowVerificarModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  // Estado local para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  // Cargar datos solo una vez con loading state
  
    useEffect(() => {
    const loadData = async () => {
      if (!isInitialLoad) return
      try {
        await Promise.all([
          fetchAlertas(),
          fetchAlertasActivas()
        ])
      } finally {
        setIsInitialLoad(false)
      }
    }
    loadData()
  }, [fetchAlertas, fetchAlertasActivas, isInitialLoad])
  // Estadísticas calculadas con memoización optimizada
  const stats = React.useMemo(() => {
    if (!alertas.length && !alertasActivas.length) {
      return {
        total: 0,
        activas: 0,
        atendidas: 0,
        criticas: 0,
        altas: 0,
        medias: 0,
        bajas: 0,
        tasaResolucion: 0,
        porTipo: {
          violacion: 0,
          bateria_baja: 0,
          fuera_de_ruta: 0,
          temperatura: 0,
          sin_signal: 0,
          intrusion: 0,
        }
      }
    }

    // Single pass for all calculations
    let atendidas = 0
    const severidadCounts: Record<string, number> = {}
    const tipoCounts: Record<string, number> = {}
    // Process alertas for atendidas count
    alertas.forEach(a => {
      if (a.atendida) atendidas++
    })
    // Process alertasActivas for counts
    alertasActivas.forEach(a => {
      severidadCounts[a.severidad] = (severidadCounts[a.severidad] || 0) + 1
      tipoCounts[a.tipo] = (tipoCounts[a.tipo] || 0) + 1
    })
    return {
      total: alertas.length,
      activas: alertasActivas.length,
      atendidas,
      criticas: severidadCounts.critica || 0,
      altas: severidadCounts.alta || 0,
      medias: severidadCounts.media || 0,
      bajas: severidadCounts.baja || 0,
      tasaResolucion: alertas.length > 0 ? Math.round((atendidas / alertas.length) * 100) : 0,
      porTipo: {
        violacion: tipoCounts.violacion || 0,
        bateria_baja: tipoCounts.bateria_baja || 0,
        fuera_de_ruta: tipoCounts.fuera_de_ruta || 0,
        temperatura: tipoCounts.temperatura || 0,
        sin_signal: tipoCounts.sin_signal || 0,
        intrusion: tipoCounts.intrusion || 0,
      }
    }
  }, [alertas, alertasActivas])
  // Filtrado optimizado con paginación y single pass
  const { filteredAlertas, totalPages, totalItems } = React.useMemo(() => {
    // Apply filters
    const filtered = alertas.filter(a => {
      // Tab filter
      switch (selectedTab) {
        case 'todas':
          break
        case 'activas':
          if (a.atendida) return false
          break
        case 'criticas':
          if (a.severidad !== 'critica' || a.atendida) return false
          break
        case 'resueltas':
          if (!a.atendida) return false
          break
      }
      
      // Search filter
      if (searchTerm && !matchesSearch(a, searchTerm)) {
        return false
      }
      
      return true
    })
    // Sort only the page we need
    const total = Math.ceil(filtered.length / itemsPerPage)
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    // Sort only the visible portion for better performance
    const sortedPage = filtered
      .sort((a, b) => {
        // Cache date values to avoid repeated parsing
        const dateA = a.timestamp
        const dateB = b.timestamp
        return dateB - dateA
      })
      .slice(start, end)
    return { 
      filteredAlertas: sortedPage, 
      totalPages: total,
      totalItems: filtered.length 
    }
  }, [alertas, selectedTab, searchTerm, currentPage, itemsPerPage])
  const handleVerificarAlerta = useCallback((alerta: Alerta) => {
    setSelectedAlerta(alerta)
    setShowVerificarModal(true)
  }, [])
  const handleVerificarSuccess = useCallback(async () => {
    if (selectedAlerta) {
      await atenderAlerta(selectedAlerta.id)
      setShowVerificarModal(false)
      setSelectedAlerta(null)
      fetchAlertasActivas()
    }
  }, [selectedAlerta, atenderAlerta, fetchAlertasActivas])
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchAlertas(),
      fetchAlertasActivas()
    ])
  }, [fetchAlertas, fetchAlertasActivas])
  // Reset page when changing filters
  
    useEffect(() => {
    setCurrentPage(1)
  }, [selectedTab, searchTerm])
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            Centro de Alertas
          </h1>
          <p className="text-gray-400 mt-1">Monitoreo y gestión de alertas del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-800 border-gray-700"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHistorialModal(true)}
            className="bg-gray-800 border-gray-700"
          >
            <History className="h-4 w-4 mr-2" />
            Historial
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Alertas Activas"
          value={stats.activas}
          icon={<Bell className="h-5 w-5" />}
          color="bg-red-500/10 text-red-400"
          subtitle="Requieren atención"
          trend={stats.activas > 10 ? 15 : -5}
        />
        <KPICard
          title="Críticas"
          value={stats.criticas}
          icon={<XCircle className="h-5 w-5" />}
          color="bg-red-600/10 text-red-500"
          subtitle="Prioridad máxima"
        />
        <KPICard
          title="Tasa Resolución"
          value={`${stats.tasaResolucion}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-green-500/10 text-green-400"
          subtitle="Últimas 24h"
          trend={stats.tasaResolucion > 80 ? -5 : 10}
        />
        <KPICard
          title="Total Procesadas"
          value={stats.total}
          icon={<Activity className="h-5 w-5" />}
          color="bg-blue-500/10 text-blue-400"
          subtitle="Histórico"
        />
      </div>

      {/* Filtros y Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Lista de Alertas</CardTitle>
              <CardDescription>
                {totalItems} alertas encontradas - Mostrando {filteredAlertas.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start bg-gray-800/50 p-0 h-auto rounded-none">
              <TabsTrigger value="todas" className="rounded-none data-[state=active]:bg-gray-700">
                Todas
                <Badge variant="secondary" className="ml-2">{alertas.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="activas" className="rounded-none data-[state=active]:bg-gray-700">
                Activas
                <Badge variant="destructive" className="ml-2">{stats.activas}</Badge>
              </TabsTrigger>
              <TabsTrigger value="criticas" className="rounded-none data-[state=active]:bg-gray-700">
                Críticas
                <Badge variant="destructive" className="ml-2">{stats.criticas}</Badge>
              </TabsTrigger>
              <TabsTrigger value="resueltas" className="rounded-none data-[state=active]:bg-gray-700">
                Resueltas
                <Badge variant="success" className="ml-2">{stats.atendidas}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tipo / Precinto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Severidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loading && isInitialLoad ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <AlertSkeleton key={i} />
                        ))}
                      </>
                    ) : filteredAlertas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Bell className="h-12 w-12 text-gray-600" />
                            <p>No se encontraron alertas</p>
                          </div>
                        </td>
                      </tr>
                    ) : (filteredAlertas.map((alerta, _index) => (
                        <AlertRow
                          key={alerta.id}
                          alerta={alerta}
                          onVerificar={handleVerificarAlerta}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              {totalPages > 1 && (<div className="flex items-center justify-between px-6 py-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-gray-800 border-gray-700"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-gray-800 border-gray-700"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals con lazy loading */}
      <Suspense fallback={null}>
        <HistorialAlertasCriticasModal
          isOpen={showHistorialModal}
          onClose={() => setShowHistorialModal(false)}
        />

        {selectedAlerta && (<VerificarAlertaModalV2
            isOpen={showVerificarModal}
            onClose={() => {
              setShowVerificarModal(false)
              setSelectedAlerta(null)
            }}
            alerta={selectedAlerta}
            onSuccess={handleVerificarSuccess}
          />
        )}
      </Suspense>
    </div>
  )
}
export default AlertasPageV2