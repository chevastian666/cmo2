/**
 * Bitácora Operacional - Sistema de registro diario del Centro de Monitoreo
 * Diseño tipo log book para avisos y eventos importantes
 * By Cheva
 */

import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, Plus, Download, Calendar, Clock, User, AlertTriangle, Info, XCircle, MessageSquare, Filter, Megaphone, Shield, Activity, UserCheck, Pin} from 'lucide-react'
import { Card, CardContent, CardHeader} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Badge} from '@/components/ui/badge'
import { Textarea} from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Label} from '@/components/ui/label'
import { ScrollArea} from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback} from '@/components/ui/avatar'
import { Skeleton, SkeletonText} from '@/components/ui/skeleton'
import { motion, AnimatePresence} from 'framer-motion'
import { useUserInfo} from '@/hooks/useAuth'
import { notificationService} from '@/services/shared/notification.service'
import { exportToCSV} from '@/utils/export'
import { cn} from '@/utils/utils'
import type { Novedad} from '../types'
// Tipos de entrada para la bitácora
const TIPOS_BITACORA = {
  aviso: { label: 'Aviso General', icon: Megaphone, color: 'text-blue-400 bg-blue-900/20' },
  evento: { label: 'Evento Operacional', icon: Activity, color: 'text-green-400 bg-green-900/20' },
  alerta: { label: 'Alerta Importante', icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-900/20' },
  incidente: { label: 'Incidente', icon: XCircle, color: 'text-red-400 bg-red-900/20' },
  cambio_turno: { label: 'Cambio de Turno', icon: UserCheck, color: 'text-purple-400 bg-purple-900/20' },
  mantenimiento: { label: 'Mantenimiento', icon: Shield, color: 'text-orange-400 bg-orange-900/20' }
} as const
export const BitacoraOperacional: React.FC = () => {
  const [showNuevaEntrada, setShowNuevaEntrada] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [entradaSeleccionada, setEntradaSeleccionada] = useState<Novedad | null>(null)
  const [fechaSeleccionada] = useState(new Date())
  const userInfo = useUserInfo()
    useEffect(() => {
    fetchNovedades()
  }, [])
  // Agrupar entradas por fecha
  const entradasPorFecha = useMemo(() => {
    const filtered = novedades.filter(n => {
      if (filtroTipo !== 'todos' && n.tipoNovedad !== filtroTipo) return false
      if (filtroBusqueda && !n.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
      return true
    })
    const grouped = filtered.reduce((acc, novedad) => {
      const fecha = new Date(novedad.fecha).toLocaleDateString('es-UY')
      if (!acc[fecha]) acc[fecha] = []
      acc[fecha].push(novedad)
      return acc
    }, {} as Record<string, Novedad[]>)
    // Ordenar por fecha más reciente
    return Object.entries(grouped).sort(([a], [b]) => {
      const dateA = new Date(a.split('/').reverse().join('-'))
      const dateB = new Date(b.split('/').reverse().join('-'))
      return dateB.getTime() - dateA.getTime()
    })
  }, [novedades])
  const handleCrearEntrada = async (data: unknown) => {
    try {
      await crearNovedad({
        ...data,
        fecha: new Date(),
        puntoOperacion: userInfo.office || 'CMO Central',
        tipoNovedad: data.tipo
      })
      setShowNuevaEntrada(false)
      notificationService.success('Entrada registrada', 'La entrada se ha agregado a la bitácora')
    } catch (error) {
      notificationService.error('Error', 'No se pudo registrar la entrada')
    }
  }
  const handleExportar = () => {
    const datos = novedades.map(n => ({
      Fecha: new Date(n.fecha).toLocaleString('es-UY'),
      Tipo: n.tipoNovedad,
      Descripción: n.descripcion,
      Usuario: n.creadoPor.nombre,
      'Punto Operación': n.puntoOperacion,
      Estado: n.estado
    }))
    exportToCSV(datos, `bitacora_${new Date().toISOString().split('T')[0]}`)
    notificationService.success('Exportación completada', 'La bitácora ha sido exportada')
  }
  return (<div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Bitácora Operacional</h1>
                <p className="text-sm text-gray-400">Centro de Monitoreo de Operaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportar}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                onClick={() => setShowNuevaEntrada(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros */}
          <div className="lg:col-span-1 space-y-4">
            {/* Info del Usuario */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gray-800">
                    <AvatarFallback className="text-gray-400">
                      {userInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{userInfo.name}</p>
                    <p className="text-xs text-gray-400">{userInfo.role} • {userInfo.office}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filtros */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-400">Buscar</Label>
                  <Input
                    placeholder="Buscar en bitácora..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-400">Tipo de entrada</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las entradas</SelectItem>
                      {Object.entries(TIPOS_BITACORA).map(([key, tipo]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <tipo.icon className="h-4 w-4" />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas Rápidas */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <h3 className="text-sm font-medium text-white">Resumen del Día</h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton variant="text" width="80px" height="12px" />
                        <Skeleton variant="text" width="30px" height="14px" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Total entradas</span>
                      <span className="text-sm font-medium text-white">
                        {novedades.filter(n => 
                          new Date(n.fecha).toDateString() === new Date().toDateString()
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Alertas activas</span>
                      <span className="text-sm font-medium text-yellow-400">
                        {novedades.filter(n => n.tipoNovedad === 'alerta' && n.estado === 'activa').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Pendientes</span>
                      <span className="text-sm font-medium text-orange-400">
                        {novedades.filter(n => n.estado === 'activa').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Entradas */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6">
                {loading ? (
                  // Skeleton Loader
                  <>
                    {Array.from({ length: 2 }).map((_, dateIndex) => (
                      <div key={dateIndex} className="space-y-4">
                        {/* Skeleton de fecha */}
                        <div className="flex items-center gap-4 sticky top-0 bg-gray-950 py-2 z-10">
                          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-lg">
                            <Skeleton variant="circular" width="16px" height="16px" />
                            <Skeleton variant="text" width="100px" height="14px" />
                          </div>
                          <div className="flex-1 h-px bg-gray-800" />
                        </div>
                        
                        {/* Skeleton de entradas */}
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, entryIndex) => (
                            <Card key={entryIndex} className="bg-gray-900 border-gray-800">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex flex-col items-center">
                                    <Skeleton variant="circular" width="16px" height="16px" />
                                    <Skeleton variant="text" width="40px" height="12px" className="mt-1" />
                                  </div>
                                  
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Skeleton variant="rounded" width="32px" height="32px" />
                                      <Skeleton variant="rounded" width="100px" height="20px" />
                                      <Skeleton variant="rounded" width="80px" height="20px" />
                                    </div>
                                    
                                    <SkeletonText lines={2} />
                                    
                                    <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-center gap-2">
                                        <Skeleton variant="circular" width="12px" height="12px" />
                                        <Skeleton variant="text" width="120px" height="12px" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : entradasPorFecha.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No hay entradas en la bitácora</p>
                    </CardContent>
                  </Card>
                ) : (entradasPorFecha.map(([fecha, entradas]) => (<div key={fecha} className="space-y-4">
                      {/* Separador de Fecha */}
                      <div className="flex items-center gap-4 sticky top-0 bg-gray-950 py-2 z-10">
                        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-lg">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-white">{fecha}</span>
                        </div>
                        <div className="flex-1 h-px bg-gray-800" />
                      </div>

                      {/* Entradas del día */}
                      <div className="space-y-3">
                        {entradas.map((entrada) => {
                          const tipoConfig = TIPOS_BITACORA[entrada.tipoNovedad as keyof typeof TIPOS_BITACORA] || TIPOS_BITACORA.evento
                          const Icon = tipoConfig.icon
                          return (
                            <motion.div
                              key={entrada.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group"
                            >
                              <Card 
                                className={cn(
                                  "bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer",
                                  entrada.destacado && "border-l-4 border-l-yellow-500"
                                )}
                                onClick={() => setEntradaSeleccionada(entrada)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    {/* Hora */}
                                    <div className="flex flex-col items-center text-gray-500">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-xs mt-1">
                                        {new Date(entrada.fechaCreacion).toLocaleTimeString('es-UY', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={cn("p-1.5 rounded", tipoConfig.color)}>
                                            <Icon className="h-4 w-4" />
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {tipoConfig.label}
                                          </Badge>
                                          {entrada.puntoOperacion && (
                                            <Badge variant="secondary" className="text-xs">
                                              {entrada.puntoOperacion}
                                            </Badge>
                                          )}
                                        </div>
                                        {entrada.estado === 'activa' && (
                                          <Badge className="bg-green-900/20 text-green-400 border-green-800">
                                            Activa
                                          </Badge>
                                        )}
                                      </div>

                                      <p className="text-white text-sm leading-relaxed">
                                        {entrada.descripcion}
                                      </p>

                                      <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                          <User className="h-3 w-3" />
                                          <span>{entrada.creadoPor.nombre}</span>
                                        </div>
                                        
                                        {entrada.seguimientos && entrada.seguimientos.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <MessageSquare className="h-3 w-3" />
                                            <span>{entrada.seguimientos.length}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modal Nueva Entrada */}
      <Dialog open={showNuevaEntrada} onOpenChange={setShowNuevaEntrada}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva Entrada en Bitácora</DialogTitle>
            <DialogDescription className="text-gray-400">
              Registra un evento, aviso o incidente en la bitácora operacional
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleCrearEntrada({
              tipo: formData.get('tipo'),
              descripcion: formData.get('descripcion'),
              destacado: formData.get('destacado') === 'on'
            })
          }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de entrada</Label>
                  <Select name="tipo" defaultValue="evento" required>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_BITACORA).map(([key, tipo]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <tipo.icon className="h-4 w-4" />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="destacado"
                      className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <Pin className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Marcar como importante</span>
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Describe el evento, aviso o situación..."
                  className="mt-1 bg-gray-800 border-gray-700 min-h-[120px]"
                  required
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">
                  <Info className="h-3 w-3 inline mr-1" />
                  La entrada se registrará con tu nombre y la hora actual. 
                  Asegúrate de incluir toda la información relevante.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNuevaEntrada(false)}
                className="bg-gray-800 border-gray-700"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Registrar Entrada
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle de Entrada */}
      <AnimatePresence>
        {entradaSeleccionada && (<Dialog open={!!entradaSeleccionada} onOpenChange={() => setEntradaSeleccionada(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-white">Detalle de Entrada</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-gray-400">
                      <Calendar className="h-5 w-5" />
                      <p className="text-xs mt-1">
                        {new Date(entradaSeleccionada.fecha).toLocaleDateString('es-UY')}
                      </p>
                      <p className="text-xs">
                        {new Date(entradaSeleccionada.fechaCreacion).toLocaleTimeString('es-UY')}
                      </p>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const tipo = TIPOS_BITACORA[entradaSeleccionada.tipoNovedad as keyof typeof TIPOS_BITACORA]
                          const Icon = tipo?.icon || Activity
                          return (
                            <>
                              <div className={cn("p-1.5 rounded", tipo?.color)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium text-white">{tipo?.label}</span>
                            </>
                          )
                        })()}
                        <Badge variant="outline">{entradaSeleccionada.puntoOperacion}</Badge>
                      </div>
                      
                      <p className="text-white">{entradaSeleccionada.descripcion}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{entradaSeleccionada.creadoPor.nombre}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seguimientos */}
                {entradaSeleccionada.seguimientos && entradaSeleccionada.seguimientos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Seguimientos</h4>
                    <div className="space-y-2">
                      {entradaSeleccionada.seguimientos.map(seg => (
                        <div key={seg.id} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-sm text-white">{seg.comentario}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {seg.usuario.nombre} • {new Date(seg.fecha).toLocaleString('es-UY')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agregar seguimiento */}
                {entradaSeleccionada.estado === 'activa' && (<form onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const comentario = formData.get('comentario') as string
                    if (comentario) {
                      await agregarSeguimiento(entradaSeleccionada.id, comentario)
                      setEntradaSeleccionada(null)
                      notificationService.success('Seguimiento agregado', 'El comentario ha sido registrado')
                    }
                  }}>
                    <div className="space-y-2">
                      <Label>Agregar seguimiento</Label>
                      <Textarea
                        name="comentario"
                        placeholder="Escribe un comentario o actualización..."
                        className="bg-gray-800 border-gray-700"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}