/**
 * Libro de Novedades Page V2 - Sistema de registro y seguimiento de novedades
 * Incluye: shadcn/ui, Framer Motion, Animaciones, Zustand mejorado
 * By Cheva
 */

import React, { useState, useEffect, useMemo } from 'react'
import { FileText, Download, Plus, Filter, Search, Calendar, Clock, AlertCircle, CheckCircle, Eye, MessageSquare, Paperclip, User, ChevronRight, X} from 'lucide-react'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Label} from '@/components/ui/label'
import { Separator} from '@/components/ui/separator'
import { Textarea} from '@/components/ui/textarea'
import { Switch} from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { 
  PageTransition, AnimatedHeader, AnimatedSection, AnimatedGrid} from '@/components/animations/PageTransitions'
import { AnimatedCard, AnimatedButton, AnimatedBadge, AnimatedList, AnimatedListItem, AnimatedSpinner} from '@/components/animations/AnimatedComponents'
import { motion, AnimatePresence} from 'framer-motion'
import { useUserInfo } from '@/hooks/useAuth'
import { notificationService} from '@/services/shared/notification.service'
import { exportToCSV} from '@/utils/export'
import { cn} from '@/utils/utils'
import type { Novedad, FiltrosNovedades, TipoNovedad, EstadoNovedad} from '../types'
import { FILTROS_DEFAULT, TIPOS_NOVEDAD, PUNTOS_OPERACION} from '../types'
import { pulseVariants} from '@/components/animations/AnimationPresets'
const STORAGE_KEY_FILTROS = 'cmo_novedadesfiltros'
export const LibroNovedadesPageV2: React.FC = () => {
  console.log('LibroNovedadesPageV2: Componente renderizando')
  const [filtros, setFiltros] = useState<FiltrosNovedades>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FILTROS)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...parsed,
        fecha: parsed.fecha ? new Date(parsed.fecha) : null,
        fechaDesde: parsed.fechaDesde ? new Date(parsed.fechaDesde) : null,
        fechaHasta: parsed.fechaHasta ? new Date(parsed.fechaHasta) : null
      }
    }
    return FILTROS_DEFAULT
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showFormulario, setShowFormulario] = useState(false)
  const [novedadSeguimiento, setNovedadSeguimiento] = useState<Novedad | null>(null)
  const [novedadResolucion, setNovedadResolucion] = useState<Novedad | null>(null)
  const [selectedTab, setSelectedTab] = useState<'todas' | 'activas' | 'resueltas'>('todas')
  const [expandedNovedades, setExpandedNovedades] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [estadisticas, setEstadisticas] = useState<{
    totalDia: number;
    pendientes: number;
    enSeguimiento: number;
    resueltas: number;
    porTipo: Record<string, number>;
  } | null>(null)
  
  const userInfo = useUserInfo()
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor' || userInfo.role === 'encargado'
  
  // Mock functions - replace with actual API calls
  const fetchNovedades = async (_filtros: FiltrosNovedades) => {
    setLoading(true)
    // TODO: Implement actual API call
    setTimeout(() => {
      setNovedades([])
      setEstadisticas({
        totalDia: 0,
        pendientes: 0,
        enSeguimiento: 0,
        resueltas: 0,
        porTipo: { reclamo: 0 }
      })
      setLoading(false)
    }, 500)
  }
  
  const crearNovedad = async (data: unknown) => {
    // TODO: Implement actual API call
    console.log('Creating novedad:', data)
  }
  
  const marcarResuelta = async (novedadId: string, comentario?: string) => {
    // TODO: Implement actual API call
    console.log('Marking as resolved:', novedadId, comentario)
  }
  
  const agregarSeguimiento = async (novedadId: string, comentario: string) => {
    // TODO: Implement actual API call
    console.log('Adding follow-up:', novedadId, comentario)
  }
  // Cargar novedades al montar y cuando cambien los filtros

    useEffect(() => {
    fetchNovedades(filtros)
  }, [filtros])
  // Guardar filtros en localStorage

    useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTROS, JSON.stringify(filtros))
  }, [filtros])
  // Auto-refresh cada minuto

    useEffect(() => {
    const interval = setInterval(() => {
      fetchNovedades(filtros)
    }, 60000)
    return () => clearInterval(interval)
  }, [filtros])
  // Filtrar novedades por tab
  const filteredNovedades = useMemo(() => {
    switch (selectedTab) {
      case 'activas':
        return novedades.filter(n => n.estado === 'activa' || n.estado === 'seguimiento')
      case 'resueltas':
        return novedades.filter(n => n.estado === 'resuelta')
      default:
        return novedades
    }
  }, [novedades, selectedTab])
  const activeFiltersCount = Object.values(filtros).filter(v => 
    v !== '' && v !== false && v !== null && v !== FILTROS_DEFAULT.fecha
  ).length
  const handleExport = () => {
    const data = novedades.map(n => ({
      Fecha: n.fecha.toLocaleDateString('es-UY'),
      'Punto Operación': n.puntoOperacion,
      Tipo: TIPOS_NOVEDAD[n.tipoNovedad].label,
      Descripción: n.descripcion,
      Estado: n.estado,
      'Creado Por': n.creadoPor.nombre,
      Resolución: n.resolucion ? `${n.resolucion.fecha.toLocaleDateString('es-UY')} - ${n.resolucion.usuario.nombre}` : '-'
    }))
    exportToCSV(data, `novedades-${new Date().toISOString().split('T')[0]}`)
  }
  const handleCrearNovedad = async (data: unknown) => {
    await crearNovedad(data)
    setShowFormulario(false)
    notificationService.success('Novedad creada', 'La novedad se ha registrado correctamente')
  }
  const handleMarcarResuelta = async (novedadId: string, comentario?: string) => {
    try {
      await marcarResuelta(novedadId, comentario)
      notificationService.success('Novedad resuelta', 'La novedad se ha marcado como resuelta')
      setNovedadResolucion(null)
    } catch (_error) {
      notificationService.error('Error', 'No se pudo marcar la novedad como resuelta')
    }
  }
  const handleAgregarSeguimiento = async (novedadId: string, comentario: string) => {
    try {
      await agregarSeguimiento(novedadId, comentario)
      notificationService.success('Seguimiento agregado', 'Se ha agregado el seguimiento correctamente')
      setNovedadSeguimiento(null)
    } catch (_error) {
      notificationService.error('Error', 'No se pudo agregar el seguimiento')
    }
  }
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNovedades)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNovedades(newExpanded)
  }
  const clearFilters = () => {
    setFiltros(FILTROS_DEFAULT)
  }
  return (<PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Libro de Novedades"
          subtitle="Registro y seguimiento de eventos operacionales"
          icon={<FileText className="h-8 w-8 text-blue-500" />}
          action={
            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="outline"
                onClick={handleExport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </AnimatedButton>
              {canEdit && (
                <AnimatedButton
                  onClick={() => setShowFormulario(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Novedad
                </AnimatedButton>
              )}
            </div>
          }
        />

        {/* Estadísticas */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total del Día"
              value={estadisticas?.totalDia || 0}
              icon={<Calendar className="h-5 w-5" />}
              color="text-blue-400"
              trend={`${new Date().toLocaleDateString('es-UY')}`}
            />
            <StatsCard
              title="Pendientes"
              value={estadisticas?.pendientes || 0}
              icon={<Clock className="h-5 w-5" />}
              color="text-yellow-400"
              trend="Requieren atención"
              pulse={(estadisticas?.pendientes || 0) > 0}
            />
            <StatsCard
              title="En Seguimiento"
              value={estadisticas?.enSeguimiento || 0}
              icon={<Eye className="h-5 w-5" />}
              color="text-orange-400"
              trend="Con actividad"
            />
            <StatsCard
              title="Resueltas"
              value={estadisticas?.resueltas || 0}
              icon={<CheckCircle className="h-5 w-5" />}
              color="text-green-400"
              trend="Completadas hoy"
            />
            <StatsCard
              title="Reclamos"
              value={estadisticas?.porTipo?.reclamo || 0}
              icon={<AlertCircle className="h-5 w-5" />}
              color="text-red-400"
              trend="Atención prioritaria"
              pulse={(estadisticas?.porTipo?.reclamo || 0) > 0}
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Filtros y Búsqueda */}
        <AnimatedSection delay={0.2}>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar en descripción..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 px-1.5 py-0.5 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </AnimatedButton>
                </div>
              </div>

              {/* Filtros Expandidos */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <FilterPanel 
                      filtros={filtros} 
                      onFiltersChange={setFiltros}
                      onClear={clearFilters}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Tabs y Lista de Novedades */}
        <AnimatedSection delay={0.3}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'todas' | 'activas' | 'resueltas')}>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="todas">
                    Todas ({novedades.length})
                  </TabsTrigger>
                  <TabsTrigger value="activas">
                    Activas ({novedades.filter(n => n.estado !== 'resuelta').length})
                  </TabsTrigger>
                  <TabsTrigger value="resueltas">
                    Resueltas ({estadisticas?.resueltas || 0})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <AnimatedSpinner className="h-8 w-8" />
                </div>
              ) : filteredNovedades.length === 0 ? (
                <EmptyState tab={selectedTab} />
              ) : (<AnimatedList className="space-y-4">
                  {filteredNovedades.map((novedad, index) => (
                    <NovedadItem
                      key={novedad.id}
                      novedad={novedad}
                      index={index}
                      isExpanded={expandedNovedades.has(novedad.id)}
                      onToggleExpand={() => toggleExpanded(novedad.id)}
                      onAddSeguimiento={() => setNovedadSeguimiento(novedad)}
                      onResolve={() => setNovedadResolucion(novedad)}
                      canEdit={canEdit}
                    />
                  ))}
                </AnimatedList>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Modales */}
        <FormularioNovedadModal
          isOpen={showFormulario}
          onClose={() => setShowFormulario(_false)}
          onSubmit={handleCrearNovedad}
          userInfo={userInfo}
        />

        <SeguimientoModal
          novedad={novedadSeguimiento}
          isOpen={!!novedadSeguimiento}
          onClose={() => setNovedadSeguimiento(null)}
          onSubmit={handleAgregarSeguimiento}
        />

        <ResolucionModal
          novedad={novedadResolucion}
          isOpen={!!novedadResolucion}
          onClose={() => setNovedadResolucion(null)}
          onSubmit={handleMarcarResuelta}
        />
      </div>
    </PageTransition>
  )
}
// Stats Card Component
const StatsCard: React.FC<{
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: string
  pulse?: boolean
}> = ({ title, value, icon, color, trend, pulse }) => (
  <AnimatedCard className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
    <CardHeader className="px-6 pb-2 pt-4">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium text-gray-400">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg bg-gray-900", color)}
          whileHover={{ rotate: 15 }}
          animate={pulse ? pulseVariants.animate : {}}
        >
          {icon}
        </motion.div>
      </div>
    </CardHeader>
    <CardContent className="px-6 pt-2">
      <div className="text-3xl font-bold text-white">{value}</div>
      {trend && (
        <p className="text-sm text-gray-500 mt-1">{trend}</p>
      )}
    </CardContent>
  </AnimatedCard>
)
// Filter Panel Component
const FilterPanel: React.FC<{
  filtros: FiltrosNovedades
  onFiltersChange: (filtros: FiltrosNovedades) => void
  onClear: () => void
}> = ({ filtros, onFiltersChange, onClear }) => (<div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="puntoOperacion">Punto de Operación</Label>
        <Select 
          value={filtros.puntoOperacion} 
          onValueChange={(v) => onFiltersChange({ ...filtros, puntoOperacion: v })}
        >
          <SelectTrigger id="puntoOperacion" className="mt-1 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Todos los puntos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los puntos</SelectItem>
            {PUNTOS_OPERACION.map(punto => (
              <SelectItem key={punto} value={punto}>{punto}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tipoNovedad">Tipo de Novedad</Label>
        <Select 
          value={filtros.tipoNovedad} 
          onValueChange={(v) => onFiltersChange({ ...filtros, tipoNovedad: v as TipoNovedad | '' })}
        >
          <SelectTrigger id="tipoNovedad" className="mt-1 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {Object.entries(TIPOS_NOVEDAD).map(([key, tipo]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span>{tipo.icon}</span>
                  {tipo.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select 
          value={filtros.estado} 
          onValueChange={(v) => onFiltersChange({ ...filtros, estado: v as EstadoNovedad | '' })}
        >
          <SelectTrigger id="estado" className="mt-1 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="seguimiento">En Seguimiento</SelectItem>
            <SelectItem value="resuelta">Resuelta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Switch
          id="soloMias"
          checked={filtros.soloMias}
          onCheckedChange={(checked) => onFiltersChange({ ...filtros, soloMias: checked })}
        />
        <Label htmlFor="soloMias">Solo mis novedades</Label>
      </div>
      
      <AnimatedButton
        variant="ghost"
        size="sm"
        onClick={onClear}
      >
        <X className="mr-2 h-4 w-4" />
        Limpiar filtros
      </AnimatedButton>
    </div>
  </div>
)
// Novedad Item Component
const NovedadItem: React.FC<{
  novedad: Novedad
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onAddSeguimiento: () => void
  onResolve: () => void
  canEdit: boolean
}> = ({ novedad, index, isExpanded, onToggleExpand, onAddSeguimiento, onResolve, canEdit }) => {
  const tipo = TIPOS_NOVEDAD[novedad.tipoNovedad]
  return (
    <AnimatedListItem index={index}>
      <AnimatedCard 
        className="overflow-hidden"
        whileHover={{ scale: 1.01 }}
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={onToggleExpand}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              >
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </motion.div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tipo.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{tipo.label}</h4>
                      <p className="text-sm text-gray-400">
                        {novedad.puntoOperacion} • {novedad.fecha.toLocaleDateString('es-UY')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {novedad.archivosAdjuntos && novedad.archivosAdjuntos.length > 0 && (
                      <Badge variant="secondary">
                        <Paperclip className="mr-1 h-3 w-3" />
                        {novedad.archivosAdjuntos.length}
                      </Badge>
                    )}
                    {novedad.seguimientos && novedad.seguimientos.length > 0 && (
                      <Badge variant="secondary">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {novedad.seguimientos.length}
                      </Badge>
                    )}
                    <AnimatedBadge
                      variant={
                        novedad.estado === 'resuelta' ? 'success' :
                        novedad.estado === 'seguimiento' ? 'warning' : 'default'
                      }
                      pulse={novedad.estado !== 'resuelta'}
                    >
                      {novedad.estado}
                    </AnimatedBadge>
                  </div>
                </div>
                
                <p className="text-gray-300 line-clamp-2">{novedad.descripcion}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {novedad.creadoPor.nombre}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {novedad.fechaCreacion.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Separator />
              <div className="p-4 space-y-4">
                {/* Descripción completa */}
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Descripción completa</h5>
                  <p className="text-gray-300 whitespace-pre-wrap">{novedad.descripcion}</p>
                </div>

                {/* Archivos adjuntos */}
                {novedad.archivosAdjuntos && novedad.archivosAdjuntos.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Archivos adjuntos</h5>
                    <div className="flex flex-wrap gap-2">
                      {novedad.archivosAdjuntos.map(archivo => (
                        <a
                          key={archivo.id}
                          href={archivo.url}
                          target="blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{archivo.nombre}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline de seguimientos */}
                {novedad.seguimientos && novedad.seguimientos.length > 0 && (<div>
                    <h5 className="text-sm font-medium text-gray-400 mb-3">Seguimientos</h5>
                    <div className="space-y-3">
                      {novedad.seguimientos.map((seg, idx) => (
                        <motion.div
                          key={seg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-3"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <span>{seg.usuario.nombre}</span>
                              <span>•</span>
                              <span>{seg.fecha.toLocaleString('es-UY')}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{seg.comentario}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolución */}
                {novedad.resolucion && (
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-600">
                    <h5 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Resuelta
                    </h5>
                    <div className="text-sm text-gray-300">
                      <p>Por: {novedad.resolucion.usuario.nombre}</p>
                      <p>Fecha: {novedad.resolucion.fecha.toLocaleString('es-UY')}</p>
                      {novedad.resolucion.comentario && (
                        <p className="mt-2">{novedad.resolucion.comentario}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {canEdit && novedad.estado !== 'resuelta' && (<div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={onAddSeguimiento}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Agregar seguimiento
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={onResolve}
                      className="border-green-600 text-green-400 hover:bg-green-600/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar como resuelta
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedCard>
    </AnimatedListItem>
  )
}
// Empty State Component
const EmptyState: React.FC<{ tab: string }> = ({ tab }) => (
  <div className="py-12 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    </motion.div>
    <p className="text-gray-400">
      {tab === 'activas' ? 'No hay novedades activas' :
       tab === 'resueltas' ? 'No hay novedades resueltas' :
       'No se encontraron novedades'}
    </p>
  </div>
)
// Formulario Modal Component
const FormularioNovedadModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: unknown) => void
  userInfo: {
    id: string
    name: string
    email: string
    role: string
  }
}> = ({ isOpen, onClose, onSubmit, userInfo }) => {
  const [formData, setFormData] = useState({
    fecha: new Date(),
    puntoOperacion: '',
    tipoNovedad: '' as TipoNovedad | '',
    descripcion: '',
    archivos: [] as File[]
  })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.puntoOperacion || !formData.tipoNovedad || !formData.descripcion) {
      notificationService.warning('Campos requeridos', 'Complete todos los campos obligatorios')
      return
    }
    onSubmit({
      ...formData,
      creadoPor: {
        id: userInfo.id,
        nombre: userInfo.name,
        email: userInfo.email,
        rol: userInfo.role
      }
    })
    setFormData({
      fecha: new Date(),
      puntoOperacion: '',
      tipoNovedad: '',
      descripcion: '',
      archivos: []
    })
  }
  return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Novedad</DialogTitle>
          <DialogDescription>
            Registre una nueva novedad en el libro
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="puntoOperacion">Punto de Operación *</Label>
              <Select 
                value={formData.puntoOperacion} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, puntoOperacion: v }))}
              >
                <SelectTrigger id="puntoOperacion" className="mt-1 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccionar punto" />
                </SelectTrigger>
                <SelectContent>
                  {PUNTOS_OPERACION.map(punto => (
                    <SelectItem key={punto} value={punto}>{punto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoNovedad">Tipo de Novedad *</Label>
              <Select 
                value={formData.tipoNovedad} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipoNovedad: v as TipoNovedad }))}
              >
                <SelectTrigger id="tipoNovedad" className="mt-1 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_NOVEDAD).map(([key, tipo]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{tipo.icon}</span>
                        {tipo.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describa la novedad en detalle..."
              className="mt-1 min-h-32"
            />
          </div>

          <div>
            <Label htmlFor="archivos">Archivos adjuntos</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="archivos"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setFormData(prev => ({ ...prev, archivos: files }))
                }}
                className="flex-1"
              />
              {formData.archivos.length > 0 && (
                <Badge variant="secondary">
                  {formData.archivos.length} archivo(s)
                </Badge>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Novedad
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// Seguimiento Modal Component
const SeguimientoModal: React.FC<{
  novedad: Novedad | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (novedadId: string, comentario: string) => void
}> = ({ novedad, isOpen, onClose, onSubmit }) => {
  const [comentario, setComentario] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comentario.trim()) {
      notificationService.warning('Campo requerido', 'Ingrese un comentario')
      return
    }
    if (novedad) {
      onSubmit(novedad.id, comentario)
      setComentario('')
    }
  }
  return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Seguimiento</DialogTitle>
          <DialogDescription>
            Agregue un comentario de seguimiento a esta novedad
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ingrese el comentario de seguimiento..."
              className="mt-1 min-h-24"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Seguimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// Resolución Modal Component
const ResolucionModal: React.FC<{
  novedad: Novedad | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (novedadId: string, comentario?: string) => void
}> = ({ novedad, isOpen, onClose, onSubmit }) => {
  const [comentario, setComentario] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (novedad) {
      onSubmit(novedad.id, comentario || undefined)
      setComentario('')
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como Resuelta</DialogTitle>
          <DialogDescription>
            ¿Está seguro de marcar esta novedad como resuelta?
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comentarioResolucion">Comentario (opcional)</Label>
            <Textarea
              id="comentarioResolucion"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agregue un comentario sobre la resolución..."
              className="mt-1 min-h-24"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como Resuelta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default LibroNovedadesPageV2