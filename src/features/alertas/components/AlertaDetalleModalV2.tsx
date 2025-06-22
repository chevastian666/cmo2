import React, { useState, useEffect } from 'react'
import { User, MessageSquare, CheckCircle, AlertTriangle, Clock, MapPin, Shield, Battery, Radio, Package, Navigation, Pause, Zap, X} from 'lucide-react'
import { cn} from '@/lib/utils'
import { formatDateTime, formatTimeAgo} from '../../../utils/formatters'
import type { AlertaExtendida, Usuario} from '../../../types'
import { TIPOS_ALERTA} from '../../../types/monitoring'
import { usuariosService} from '../../../services/usuarios.service'
// shadcn/ui components
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Label} from '@/components/ui/label'
import { Textarea} from '@/components/ui/textarea'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Badge} from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card'
interface AlertaDetalleModalProps {
  alerta: AlertaExtendida
  isOpen: boolean
  onClose: () => void
  onAsignar: (usuarioId: string, notas?: string) => void
  onComentar: (mensaje: string) => void
  onResolver: (tipo: string, descripcion: string, acciones?: string[]) => void
}

export const AlertaDetalleModalV2: React.FC<AlertaDetalleModalProps> = ({
  alerta, isOpen, onClose, onAsignar, onComentar, onResolver
}) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null)
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false)
  const [mostrarResolucion, setMostrarResolucion] = useState(false)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [notasAsignacion, setNotasAsignacion] = useState('')
  const [tipoResolucion, setTipoResolucion] = useState('resuelta')
  const [descripcionResolucion, setDescripcionResolucion] = useState('')
  const [accionesTomadas, setAccionesTomadas] = useState<string[]>([''])
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios()
    }
  }, [])
  const cargarUsuarios = async () => {
    const [users, currentUser] = await Promise.all([
      usuariosService.getActivos(),
      usuariosService.getCurrentUser()
    ])
    setUsuarios(users)
    setUsuarioActual(currentUser)
  }
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'AAR': {
  return <Clock className="h-6 w-6" />
      case 'BBJ': {
  return <Battery className="h-6 w-6" />
      case 'DEM': {
  return <Pause className="h-6 w-6" />
      case 'DNR': {
  return <Navigation className="h-6 w-6" />
      case 'DTN': {
  return <Shield className="h-6 w-6" />
      case 'NPG': {
  return <Radio className="h-6 w-6" />
      case 'NPN': {
  return <AlertTriangle className="h-6 w-6" />
      case 'PTN': {
  return <Package className="h-6 w-6" />
      case 'SNA': {
  return <Zap className="h-6 w-6" />
      default: return <AlertTriangle className="h-6 w-6" />
    }
  }
  const getSeveridadVariant = (severidad: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severidad) {
      case 'critica': {
  return 'destructive'
      case 'alta': {
  return 'destructive'
      case 'media': {
  return 'secondary'
      case 'baja': {
  return 'outline'
      default: return 'default'
    }
  }
  const handleAsignar = () => {
    if (usuarioSeleccionado) {
      onAsignar(usuarioSeleccionado, notasAsignacion)
      setMostrarAsignacion(false)
      setUsuarioSeleccionado('')
      setNotasAsignacion('')
    }
  }
  const handleComentar = () => {
    if (nuevoComentario.trim()) {
      onComentar(nuevoComentario)
      setNuevoComentario('')
    }
  }
  const handleResolver = () => {
    if (descripcionResolucion.trim()) {
      onResolver(tipoResolucion, descripcionResolucion, accionesTomadas.filter(a => a.trim()))
      setMostrarResolucion(false)
      setDescripcionResolucion('')
      setAccionesTomadas([''])
    }
  }
  const agregarAccion = () => {
    setAccionesTomadas([...accionesTomadas, ''])
  }
  const actualizarAccion = (index: number, valor: string) => {
    const nuevasAcciones = [...accionesTomadas]
    nuevasAcciones[index] = valor
    setAccionesTomadas(nuevasAcciones)
  }
  const eliminarAccion = (index: number) => {
    setAccionesTomadas(accionesTomadas.filter((_, i) => i !== index))
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', 
              alerta.severidad === 'critica' ? 'text-red-400 bg-red-900/20' :
              alerta.severidad === 'alta' ? 'text-orange-400 bg-orange-900/20' :
              alerta.severidad === 'media' ? 'text-yellow-400 bg-yellow-900/20' :
              'text-blue-400 bg-blue-900/20'
            )}>
              {getIcon(alerta.tipo)}
            </div>
            <div>
              <DialogTitle className="text-xl">
                Alerta #{alerta.id} - {alerta.codigoPrecinto}
              </DialogTitle>
              <DialogDescription>
                {formatDateTime(alerta.timestamp)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Alerta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{TIPOS_ALERTA[alerta.tipo as keyof typeof TIPOS_ALERTA] || alerta.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Severidad:</span>
                    <Badge variant={getSeveridadVariant(alerta.severidad)}>
                      {alerta.severidad}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={
                      alerta.resolucion ? 'outline' : 
                      alerta.asignacion ? 'secondary' : 'destructive'
                    }>
                      {alerta.resolucion ? 'Resuelta' : 
                       alerta.asignacion ? 'Asignada' : 'Sin asignar'}
                    </Badge>
                  </div>
                  {alerta.ubicacion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {alerta.ubicacion.lat.toFixed(4)}, {alerta.ubicacion.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Mensaje:</p>
                  <p className="text-sm">{alerta.mensaje}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            {alerta.asignacion ? (
              <Card>
                <CardHeader>
                  <CardTitle>Asignación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <img
                      src={alerta.asignacion.usuarioAsignado.avatar}
                      alt={alerta.asignacion.usuarioAsignado.nombre}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">
                        {alerta.asignacion.usuarioAsignado.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Asignado {formatTimeAgo(alerta.asignacion.timestamp)}
                      </p>
                    </div>
                  </div>
                  {alerta.asignacion.notas && (
                    <p className="mt-3 text-sm bg-muted p-3 rounded">
                      {alerta.asignacion.notas}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : !alerta.resolucion && (
              <Card>
                <CardContent className="pt-6">
                  {mostrarAsignacion ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Asignar a Usuario</h4>
                      <div className="space-y-2">
                        <Label htmlFor="usuario">Usuario</Label>
                        <Select
                          value={usuarioSeleccionado}
                          onValueChange={setUsuarioSeleccionado}
                        >
                          <SelectTrigger id="usuario">
                            <SelectValue placeholder="Seleccionar usuario..." />
                          </SelectTrigger>
                          <SelectContent>
                            {usuarios.map(usuario => (
                              <SelectItem key={usuario.id} value={usuario.id}>
                                {usuario.nombre} - {usuario.rol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notas">Notas de asignación (opcional)</Label>
                        <Textarea
                          id="notas"
                          value={notasAsignacion}
                          onChange={(e) => setNotasAsignacion(e.target.value)}
                          placeholder="Notas de asignación..."
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleAsignar}
                          disabled={!usuarioSeleccionado}
                        >
                          Asignar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setMostrarAsignacion(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (<Button
                      className="w-full"
                      onClick={() => setMostrarAsignacion(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Asignar Usuario
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comentarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {alerta.comentarios.length === 0 ? (
                    <p className="text-muted-foreground">No hay comentarios aún</p>
                  ) : (alerta.comentarios.map((comentario) => (
                      <div key={comentario.id} className="bg-muted rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={comentario.usuario.avatar}
                            alt={comentario.usuario.nombre}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {comentario.usuario.nombre}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatTimeAgo(comentario.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm mt-1">
                              {comentario.mensaje}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Add Comment */}
                {!alerta.resolucion && (<div className="mt-4 flex space-x-2">
                    <Input
                      type="text"
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComentar()}
                      placeholder="Agregar comentario..."
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleComentar}
                      disabled={!nuevoComentario.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Historial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerta.historial.map((evento, index) => (
                    <div key={evento.id} className="flex items-start space-x-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5',
                        index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm">
                          {evento.tipo === 'creada' && 'Alerta creada'}
                          {evento.tipo === 'asignada' && `Asignada a ${evento.usuario?.nombre}`}
                          {evento.tipo === 'comentario' && `Comentario de ${evento.usuario?.nombre}`}
                          {evento.tipo === 'resuelta' && 'Alerta resuelta'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(evento.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resolution */}
            {alerta.resolucion ? (
              <Card>
                <CardHeader>
                  <CardTitle>Resolución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 font-medium">
                        {alerta.resolucion.tipoResolucion.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm">
                      {alerta.resolucion.descripcion}
                    </p>
                    {alerta.resolucion.accionesTomadas && alerta.resolucion.accionesTomadas.length > 0 && (<div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">Acciones tomadas:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {alerta.resolucion.accionesTomadas.map((accion, i) => (
                            <li key={i}>{accion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Resuelto por {alerta.resolucion.resueltoPor.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(alerta.resolucion.timestamp)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : !mostrarResolucion && alerta.asignacion && (<Button
                className="w-full"
                variant="default"
                onClick={() => setMostrarResolucion(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolver Alerta
              </Button>
            )}

            {/* Resolution Form */}
            {mostrarResolucion && (<Card>
                <CardHeader>
                  <CardTitle>Resolver Alerta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-resolucion">Tipo de resolución</Label>
                    <Select
                      value={tipoResolucion}
                      onValueChange={setTipoResolucion}
                    >
                      <SelectTrigger id="tipo-resolucion">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resuelta">Resuelta</SelectItem>
                        <SelectItem value="falsa_alarma">Falsa Alarma</SelectItem>
                        <SelectItem value="duplicada">Duplicada</SelectItem>
                        <SelectItem value="sin_accion">Sin Acción Requerida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={descripcionResolucion}
                      onChange={(e) => setDescripcionResolucion(e.target.value)}
                      placeholder="Descripción de la resolución..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acciones tomadas</Label>
                    {accionesTomadas.map((accion, index) => (<div key={index} className="flex space-x-2">
                        <Input
                          value={accion}
                          onChange={(e) => actualizarAccion(index, e.target.value)}
                          placeholder="Acción tomada..."
                        />
                        {accionesTomadas.length > 1 && (<Button
                            size="icon"
                            variant="ghost"
                            onClick={() => eliminarAccion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={agregarAccion}
                    >
                      + Agregar acción
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={handleResolver}
                      disabled={!descripcionResolucion.trim()}
                    >
                      Resolver
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMostrarResolucion(false)
                        setDescripcionResolucion('')
                        setAccionesTomadas([''])
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerta.tiempoRespuesta && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo de respuesta</p>
                      <p className="text-lg font-medium">
                        {Math.floor(alerta.tiempoRespuesta / 60)} min
                      </p>
                    </div>
                  )}
                  {alerta.tiempoResolucion && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo de resolución</p>
                      <p className="text-lg font-medium">
                        {Math.floor(alerta.tiempoResolucion / 3600)} hrs
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Comentarios</p>
                    <p className="text-lg font-medium">{alerta.comentarios.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}