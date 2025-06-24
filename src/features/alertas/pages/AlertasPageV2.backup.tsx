/**
 * Página de Alertas - Versión 2.0 con nuevas implementaciones
 * Incluye: shadcn/ui, Framer Motion, Zustand mejorado, Design Tokens
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { useAlertasStore } from '../../../store/hooks/useAlertas'
import { AlertTriangle, Shield, TrendingUp, Clock, Users, History, Bell, BellOff, RefreshCw, User, XCircle, CheckCircle2, AlertCircle, Zap} from 'lucide-react'
import { Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Progress} from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { 
  PageTransition, AnimatedHeader, AnimatedSection, AnimatedGrid} from '@/components/animations/PageTransitions'
import { AnimatedCard, AnimatedButton, AnimatedBadge, AnimatedSkeleton, AnimatedDiv} from '@/components/animations/AnimatedComponents'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/utils/utils'
import type { Alerta} from '@/types'
import { fadeInUp } from '@/components/animations/AnimationPresets'
import { HistorialAlertasCriticasModal} from '../components/HistorialAlertasCriticasModal'
import { VerificarAlertaModalV2} from '../components/VerificarAlertaModalV2'
import { VerificarButton, VerificadoBadge} from '../components/VerificarButton'
// KPI Card mejorado con animaciones
const KPICard: React.FC<{
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  trend?: number
  subtitle?: string
  onClick?: () => void
}> = ({ title, value, icon, color, trend, subtitle, onClick }) => (
  <AnimatedCard 
    className={cn("relative overflow-hidden cursor-pointer", onClick && "hover:shadow-lg")}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg", color)}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {icon}
        </motion.div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div>
          <motion.div 
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend !== undefined && (
          <AnimatedBadge 
            variant={trend > 0 ? "danger" : "success"}
            className="mb-1"
          >
            {trend > 0 ? '+' : ''}{Math.abs(trend)}%
          </AnimatedBadge>
        )}
      </div>
    </CardContent>
    
    {/* Animated background pattern */}
    <motion.div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${color.replace('/10', '')} 0%, transparent 70%)`
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.05, 0.1, 0.05]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </AnimatedCard>
)
// Alert Row Component con animaciones mejoradas
const AlertRow: React.FC<{
  alerta: Alerta
  onVerificar: (alerta: Alerta) => void
  index: number
}> = ({ alerta, onVerificar, index }) => {
  const getSeveridadInfo = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return { color: 'danger', icon: <XCircle className="h-4 w-4" />, pulse: true }
      case 'alta':
        return { color: 'warning', icon: <AlertTriangle className="h-4 w-4" /> }
      case 'media':
        return { color: 'primary', icon: <AlertCircle className="h-4 w-4" /> }
      case 'baja':
        return { color: 'gray', icon: <Bell className="h-4 w-4" /> }
      default:
        return { color: 'gray', icon: <Bell className="h-4 w-4" /> }
    }
  }
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      violacion: 'Violación de Precinto',
      bateria_baja: 'Batería Baja',
      fuera_de_ruta: 'Fuera de Ruta',
      temperatura: 'Temperatura Anormal',
      sin_signal: 'Sin Señal',
      intrusion: 'Intrusión Detectada'
    }
    return labels[tipo] || tipo
  }
  const severidadInfo = getSeveridadInfo(alerta.severidad)
  const isNew = new Date().getTime() - new Date(alerta.fecha).getTime() < 300000; // 5 min

  return (
    <motion.tr
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      className={cn(
        "border-b border-gray-700 transition-all duration-200 group",
        alerta.atendida ? "opacity-60" : "hover:bg-gray-800/50",
        severidadInfo.pulse && !alerta.atendida && "bg-red-900/10"
      )}
      whileHover={{ x: 3 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn(
              "w-2 h-2 rounded-full",
              alerta.atendida ? 'bg-gray-500' : 
              alerta.severidad === 'critica' ? 'bg-red-500' :
              alerta.severidad === 'alta' ? 'bg-orange-500' :
              alerta.severidad === 'media' ? 'bg-blue-500' : 'bg-gray-400'
            )}
            animate={!alerta.atendida && severidadInfo.pulse ? {
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
          <div>
            <p className="font-medium text-white flex items-center gap-2">
              {getTipoLabel(alerta.tipo)}
              {isNew && !alerta.atendida && (
                <AnimatedBadge variant="primary" className="text-xs">
                  NUEVA
                </AnimatedBadge>
              )}
            </p>
            <p className="text-sm text-gray-400">
              Precinto: {alerta.precintoId}
            </p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <AnimatedBadge 
          variant={severidadInfo.color as unknown}
          className="flex items-center gap-1"
          pulse={severidadInfo.pulse && !alerta.atendida}
        >
          {severidadInfo.icon}
          {alerta.severidad.toUpperCase()}
        </AnimatedBadge>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
        <div className="text-sm">
          <p>{new Date(alerta.fecha).toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            Hace {Math.floor((new Date().getTime() - new Date(alerta.fecha).getTime()) / 60000)} min
          </p>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-300 max-w-xs truncate">
          {alerta.descripcion}
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
              variant="gradient"
              size="md"
            />
          ) : (
            <VerificadoBadge
              verificadoPor={alerta.verificadoPor}
              fecha={alerta.fechaVerificacion}
              size="md"
            />
          )}
        </div>
      </td>
    </motion.tr>
  )
}
// Statistics Card Component
const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number
  total: number
  color: string
}> = ({ icon, _label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <AnimatedDiv className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", color)}>
            {icon}
          </div>
          <span className="text-sm text-gray-400">{_label}</span>
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% del total</p>
    </AnimatedDiv>
  )
}
const AlertasPageV2: React.FC = () => {
  const { alertas, alertasActivas, loading, _error, filter, actions } = useAlertasStore()
  const { fetchAlertas, fetchAlertasActivas, atenderAlerta } = actions
  
  const [showHistorialModal, setShowHistorialModal] = useState(false)
  const [showVerificarModal, setShowVerificarModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null)
    useEffect(() => {
    fetchAlertas()
    fetchAlertasActivas()
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      fetchAlertasActivas()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchAlertas, fetchAlertasActivas])
  // Estadísticas calculadas
  const stats = React.useMemo(() => {
    const criticas = alertasActivas.filter(a => a.severidad === 'critica').length
    const altas = alertasActivas.filter(a => a.severidad === 'alta').length
    const medias = alertasActivas.filter(a => a.severidad === 'media').length
    const bajas = alertasActivas.filter(a => a.severidad === 'baja').length
    return {
      total: alertas.length,
      activas: alertasActivas.length,
      atendidas: alertas.filter(a => a.atendida).length,
      criticas,
      altas,
      medias,
      bajas,
      tasaResolucion: alertas.length > 0 
        ? Math.round((alertas.filter(a => a.atendida).length / alertas.length) * 100)
        : 0,
      porTipo: {
        violacion: alertasActivas.filter(a => a.tipo === 'violacion').length,
        bateria_baja: alertasActivas.filter(a => a.tipo === 'bateria_baja').length,
        fuera_de_ruta: alertasActivas.filter(a => a.tipo === 'fuera_de_ruta').length,
        temperatura: alertasActivas.filter(a => a.tipo === 'temperatura').length,
        sin_signal: alertasActivas.filter(a => a.tipo === 'sin_signal').length,
        intrusion: alertasActivas.filter(a => a.tipo === 'intrusion').length,
      }
    }
  }, [alertas, alertasActivas])
  // Filtrar alertas según tab y búsqueda
  const filteredAlertas = React.useMemo(() => {
    let filtered = [...alertas]
    // Filtro por tab
    switch (selectedTab) {
      case 'activas':
        filtered = filtered.filter(a => !a.atendida)
        break
      case 'criticas':
        filtered = filtered.filter(a => a.severidad === 'critica' && !a.atendida)
        break
      case 'asignadas':
        filtered = filtered.filter(a => a.asignadoA && !a.atendida)
        break
      case 'resueltas':
        filtered = filtered.filter(a => a.atendida)
        break
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.precintoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtros adicionales del store
    if (filter.tipo) {
      filtered = filtered.filter(a => a.tipo === filter.tipo)
    }
    if (filter.severidad) {
      filtered = filtered.filter(a => a.severidad === filter.severidad)
    }
    
    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    return filtered
  }, [alertas, selectedTab, searchTerm, filter])
  const handleVerificarAlerta = (alerta: Alerta) => {
    setSelectedAlerta(alerta)
    setShowVerificarModal(true)
  }
  const handleVerificarSuccess = async () => {
    if (selectedAlerta) {
      await atenderAlerta(selectedAlerta.id)
      setShowVerificarModal(false)
      setSelectedAlerta(null)
      fetchAlertasActivas()
    }
  }
  return (<PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Centro de Gestión de Alarmas"
          subtitle="Monitoreo y gestión centralizada de todas las alarmas del sistema"
          icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
          action={
            <AnimatedButton
              variant="danger"
              onClick={() => setShowHistorialModal(true)}
              className="flex items-center gap-2"
            >
              <History className="h-5 w-5" />
              Historial de Críticas
            </AnimatedButton>
          }
        />

        {/* KPIs principales */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Alertas Activas"
              value={stats.activas}
              icon={<Bell className="h-5 w-5" />}
              color="bg-red-500/10 text-red-400"
              subtitle={`${stats.criticas} críticas`}
              trend={stats.activas > 0 ? 15 : 0}
              onClick={() => setSelectedTab('activas')}
            />
            <KPICard
              title="Alertas Críticas"
              value={stats.criticas}
              icon={<Zap className="h-5 w-5" />}
              color="bg-orange-500/10 text-orange-400"
              subtitle="Requieren atención inmediata"
              onClick={() => setSelectedTab('criticas')}
            />
            <KPICard
              title="Tasa de Resolución"
              value={`${stats.tasaResolucion}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-green-500/10 text-green-400"
              subtitle={`${stats.atendidas} resueltas`}
              trend={-8}
            />
            <KPICard
              title="Tiempo Promedio"
              value="12m"
              icon={<Clock className="h-5 w-5" />}
              color="bg-blue-500/10 text-blue-400"
              subtitle="De respuesta"
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Estadísticas por tipo */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo</CardTitle>
              <CardDescription>Alertas activas clasificadas por tipo de incidencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  icon={<Shield className="h-4 w-4" />}
                  label="Violación"
                  value={stats.porTipo.violacion}
                  total={stats.activas}
                  color="bg-red-500/20 text-red-400"
                />
                <StatCard
                  icon={<Zap className="h-4 w-4" />}
                  label="Batería Baja"
                  value={stats.porTipo.bateria_baja}
                  total={stats.activas}
                  color="bg-yellow-500/20 text-yellow-400"
                />
                <StatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Fuera de Ruta"
                  value={stats.porTipo.fuera_de_ruta}
                  total={stats.activas}
                  color="bg-purple-500/20 text-purple-400"
                />
                <StatCard
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Temperatura"
                  value={stats.porTipo.temperatura}
                  total={stats.activas}
                  color="bg-orange-500/20 text-orange-400"
                />
                <StatCard
                  icon={<BellOff className="h-4 w-4" />}
                  label="Sin Señal"
                  value={stats.porTipo.sin_signal}
                  total={stats.activas}
                  color="bg-gray-500/20 text-gray-400"
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Intrusión"
                  value={stats.porTipo.intrusion}
                  total={stats.activas}
                  color="bg-indigo-500/20 text-indigo-400"
                />
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Tabla con tabs */}
        <AnimatedSection delay={0.3}>
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle>Lista de Alertas</CardTitle>
                  <CardDescription>
                    {filteredAlertas.length} alertas encontradas
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-gray-800 border-gray-700"
                    // icon={<Filter className="h-4 w-4 text-gray-400" />}
                  />
                  
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      fetchAlertas()
                      fetchAlertasActivas()
                    }}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </AnimatedButton>
                </div>
              </div>
            </CardHeader>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                <TabsTrigger value="todas">
                  Todas ({alertas.length})
                </TabsTrigger>
                <TabsTrigger value="activas" className="data-[state=active]:bg-red-900/20">
                  Activas ({stats.activas})
                </TabsTrigger>
                <TabsTrigger value="criticas" className="data-[state=active]:bg-orange-900/20">
                  Críticas ({stats.criticas})
                </TabsTrigger>
                <TabsTrigger value="asignadas" className="data-[state=active]:bg-blue-900/20">
                  Asignadas
                </TabsTrigger>
                <TabsTrigger value="resueltas" className="data-[state=active]:bg-green-900/20">
                  Resueltas ({stats.atendidas})
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
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8">
                            <div className="space-y-3">
                              {[1, 2, 3, 4, 5].map(i => (
                                <AnimatedSkeleton key={i} className="h-16 w-full" />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ) : filteredAlertas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center gap-2"
                            >
                              <Bell className="h-12 w-12 text-gray-600" />
                              <p>No se encontraron alertas</p>
                            </motion.div>
                          </td>
                        </tr>
                      ) : (<AnimatePresence mode="popLayout">
                          {filteredAlertas.map((alerta, index) => (
                            <AlertRow
                              key={alerta.id}
                              alerta={alerta}
                              onVerificar={handleVerificarAlerta}
                              index={index}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </AnimatedSection>
      </div>

      {/* Modal de historial */}
      <HistorialAlertasCriticasModal
        isOpen={showHistorialModal}
        onClose={() => setShowHistorialModal(false)}
      />

      {/* Modal de verificar */}
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
    </PageTransition>
  )
}
export default AlertasPageV2