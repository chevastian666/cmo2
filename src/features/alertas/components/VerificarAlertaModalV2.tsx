/**
 * Modal para Verificar Alerta - Versión con shadcn/ui y opciones de respuesta
 * By Cheva
 */

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, MapPin, Shield, Battery, Radio, Thermometer, Package, Zap, RotateCw, Satellite, Trash2} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Textarea} from '@/components/ui/textarea'
import { Badge} from '@/components/ui/badge'
import { Alert, AlertDescription} from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Label} from '@/components/ui/label'
import { cn} from '@/utils/utils'
import { formatTimeAgo} from '@/utils/formatters'
import { notificationService} from '@/services/shared/notification.service'
import type { Alerta} from '@/types'
interface VerificarAlertaModalProps {
  alerta: Alerta
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Definir las opciones de respuesta por tipo de alerta
const OPCIONES_RESPUESTA: Record<string, Array<{ id: number; descripcion: string }>> = {
  AAR: [
    { id: 1, descripcion: 'En Frontera' },
    { id: 2, descripcion: 'Saturación de cobertura celular (muchos dispositivos en la misma zona)' },
    { id: 3, descripcion: 'Zona sin cobertura celular' },
    { id: 4, descripcion: 'Problema en servidor de homologada' },
    { id: 5, descripcion: 'Otro' }
  ],
  BBJ: [
    { id: 1, descripcion: 'Batería defectuosa' },
    { id: 2, descripcion: 'Dispositivo antiguo' },
    { id: 3, descripcion: 'Uso intensivo' },
    { id: 4, descripcion: 'Otro' }
  ],
  DEM: [
    { id: 1, descripcion: 'Tráfico intenso' },
    { id: 2, descripcion: 'Control aduanero' },
    { id: 3, descripcion: 'Problemas mecánicos' },
    { id: 4, descripcion: 'Condiciones climáticas' },
    { id: 5, descripcion: 'Otro' }
  ],
  DNR: [
    { id: 1, descripcion: 'Porque la ruta trazada está en mal estado' },
    { id: 2, descripcion: 'Por desconocimiento de que existe una ruta prefijada para los tránsitos' },
    { id: 3, descripcion: 'Por reparaciones en la ruta' },
    { id: 4, descripcion: 'Por accidente en la ruta' },
    { id: 5, descripcion: 'Otro' }
  ],
  DTN: [
    { id: 1, descripcion: 'Otro' },
    { id: 2, descripcion: 'Se llama al conductor' },
    { id: 3, descripcion: 'Control de temperatura de carga' },
    { id: 4, descripcion: 'Por problemas mecánicos' },
    { id: 5, descripcion: 'Por accidente' },
    { id: 6, descripcion: 'Por problemas en las cubiertas' },
    { id: 7, descripcion: 'Paró a comprar alimentos' },
    { id: 8, descripcion: 'Para ir al baño o asearse' },
    { id: 9, descripcion: 'Porque no puede circular en la noche' },
    { id: 10, descripcion: 'Paró en la empresa a retirar los papeles' },
    { id: 11, descripcion: 'Paró a aprovisionarse de combustible' },
    { id: 12, descripcion: 'Porque estaba muy cansado para seguir' },
    { id: 13, descripcion: 'Paró a auxiliar a un compañero' },
    { id: 14, descripcion: 'En la balanza por problemas de kilos' },
    { id: 15, descripcion: 'Al límite de la zona geo referenciada' }
  ],
  NPG: [
    { id: 1, descripcion: 'Por error en dispositivo' },
    { id: 2, descripcion: 'Por estar en zona con baja cobertura satelital' },
    { id: 3, descripcion: 'Otro' }
  ],
  NPN: [
    { id: 1, descripcion: 'En Frontera' },
    { id: 2, descripcion: 'Saturación de cobertura celular (muchos dispositivos en la misma zona)' },
    { id: 3, descripcion: 'Zona sin cobertura celular' },
    { id: 4, descripcion: 'Otro' }
  ],
  PTN: [
    { id: 1, descripcion: 'En Origen' },
    { id: 2, descripcion: 'En movimiento' },
    { id: 3, descripcion: 'En destino' },
    { id: 4, descripcion: 'Detenido, se procede a llamar al chofer' },
    { id: 5, descripcion: 'La homologada retiro el precinto antes de finalizarlo o cambiarlo' },
    { id: 6, descripcion: 'Otro' }
  ],
  SNA: [
    { id: 1, descripcion: 'Error de GPS' },
    { id: 2, descripcion: 'Vehículo se retira sin salida Informática' },
    { id: 3, descripcion: 'Otro' }
  ],
  // Mapeo para tipos con nombres descriptivos
  violacion: [
    { id: 1, descripcion: 'En Origen' },
    { id: 2, descripcion: 'En movimiento' },
    { id: 3, descripcion: 'En destino' },
    { id: 4, descripcion: 'Detenido, se procede a llamar al chofer' },
    { id: 5, descripcion: 'La homologada retiro el precinto antes de finalizarlo o cambiarlo' },
    { id: 6, descripcion: 'Otro' }
  ],
  bateria_baja: [
    { id: 1, descripcion: 'Batería defectuosa' },
    { id: 2, descripcion: 'Dispositivo antiguo' },
    { id: 3, descripcion: 'Uso intensivo' },
    { id: 4, descripcion: 'Otro' }
  ],
  fuera_de_ruta: [
    { id: 1, descripcion: 'Porque la ruta trazada está en mal estado' },
    { id: 2, descripcion: 'Por desconocimiento de que existe una ruta prefijada para los tránsitos' },
    { id: 3, descripcion: 'Por reparaciones en la ruta' },
    { id: 4, descripcion: 'Por accidente en la ruta' },
    { id: 5, descripcion: 'Otro' }
  ],
  temperatura: [
    { id: 1, descripcion: 'Control de temperatura de carga' },
    { id: 2, descripcion: 'Falla en el sistema de refrigeración' },
    { id: 3, descripcion: 'Puerta del contenedor abierta' },
    { id: 4, descripcion: 'Otro' }
  ],
  sin_signal: [
    { id: 1, descripcion: 'En Frontera' },
    { id: 2, descripcion: 'Saturación de cobertura celular' },
    { id: 3, descripcion: 'Zona sin cobertura celular' },
    { id: 4, descripcion: 'Otro' }
  ],
  intrusion: [
    { id: 1, descripcion: 'Intento de robo' },
    { id: 2, descripcion: 'Inspección autorizada' },
    { id: 3, descripcion: 'Falsa alarma' },
    { id: 4, descripcion: 'Otro' }
  ]
}
// Comandos rápidos disponibles
const COMANDOS_RAPIDOS = [
  { id: 'despertar', label: 'Despertar', icon: Zap, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'reiniciar', label: 'Reiniciar', icon: RotateCw, color: 'bg-green-600 hover:bg-green-700' },
  { id: 'arreglar_gps', label: 'Arreglar GPS', icon: Satellite, color: 'bg-orange-600 hover:bg-orange-700' },
  { id: 'borrar_memoria', label: 'Borrar Memoria', icon: Trash2, color: 'bg-red-600 hover:bg-red-700' }
]
export const VerificarAlertaModalV2: React.FC<VerificarAlertaModalProps> = ({
  alerta, isOpen, onClose, onSuccess
}) => {
  const [verificando, setVerificando] = useState(false)
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>('')
  const [observaciones, setObservaciones] = useState('')
  const [sendingCommand, setSendingCommand] = useState<string | null>(null)
  const getIcon = (tipo: string) => {
    const iconClass = "h-6 w-6"
    switch (tipo) {
      case 'violacion':
        return <Shield className={iconClass} />
      case 'bateria_baja':
        return <Battery className={iconClass} />
      case 'fuera_de_ruta':
        return <MapPin className={iconClass} />
      case 'temperatura':
        return <Thermometer className={iconClass} />
      case 'sin_signal':
        return <Radio className={iconClass} />
      case 'intrusion':
        return <Package className={iconClass} />
      default:
        return <AlertTriangle className={iconClass} />
    }
  }
  const getSeveridadVariant = (severidad: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severidad) {
      case 'critica': {
  return 'destructive'
      case 'alta': {
  return 'destructive'
      case 'media': {
  return 'default'
      case 'baja': {
  return 'secondary'
      default:
        return 'outline'
    }
  }
  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica': {
  return 'text-red-400 bg-red-900/20'
      case 'alta': {
  return 'text-orange-400 bg-orange-900/20'
      case 'media': {
  return 'text-yellow-400 bg-yellow-900/20'
      case 'baja': {
  return 'text-blue-400 bg-blue-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }
  const handleVerificar = async () => {
    if (alerta.atendida) {
      notificationService.info('Esta alerta ya fue verificada')
      return
    }

    if (!motivoSeleccionado) {
      notificationService.error('Por favor seleccione un motivo de respuesta')
      return
    }

    setVerificando(true)
    try {
      // Aquí iría la llamada a la API real
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API call
      
      notificationService.success(`Alerta ${alerta.precintoId} verificada correctamente`)
      // Log para desarrollo
      console.log('Alerta verificada:', {
        alertaId: alerta.id,
        motivo: motivoSeleccionado,
        observaciones,
        timestamp: new Date().toISOString()
      })
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch {
      notificationService.error('Error al verificar la alerta')
      console.error('Error verifying alert:', _error)
    } finally {
      setVerificando(false)
    }
  }
  const handleSendCommand = async (commandId: string) => {
    try {
      setSendingCommand(commandId)
      // TODO: Implement command sending logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      notificationService.success(`Comando "${commandId}" enviado al precinto ${alerta.precintoId}`)
    } catch {
      notificationService.error('Error al enviar el comando')
    } finally {
      setSendingCommand(null)
    }
  }
  // Obtener las opciones según el tipo de alerta
  const opcionesRespuesta = OPCIONES_RESPUESTA[alerta.tipo] || OPCIONES_RESPUESTA.violacion
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', getSeveridadColor(alerta.severidad))}>
              {getIcon(alerta.tipo)}
            </div>
            <div>
              <DialogTitle>Verificar Alerta</DialogTitle>
              <p className="text-sm text-gray-400">
                {alerta.precintoId}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Tipo de Alerta</p>
                <p className="text-sm font-medium text-white capitalize">
                  {alerta.tipo.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Descripción</p>
                <p className="text-sm text-white">{alerta.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Severidad</p>
                  <Badge 
                    variant={getSeveridadVariant(alerta.severidad)}
                    className={cn(
                      'capitalize',
                      alerta.severidad === 'critica' && 'bg-red-900/20 text-red-400 border-red-800',
                      alerta.severidad === 'alta' && 'bg-orange-900/20 text-orange-400 border-orange-800',
                      alerta.severidad === 'media' && 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
                      alerta.severidad === 'baja' && 'bg-blue-900/20 text-blue-400 border-blue-800'
                    )}
                  >
                    {alerta.severidad}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Estado</p>
                  <Badge 
                    variant={alerta.atendida ? "success" : "destructive"}
                    className={cn(
                      alerta.atendida 
                        ? 'bg-green-900/20 text-green-400 border-green-800' 
                        : 'bg-red-900/20 text-red-400 border-red-800'
                    )}
                  >
                    {alerta.atendida ? 'Atendida' : 'Activa'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{alerta.timestamp ? formatTimeAgo(alerta.timestamp) : formatTimeAgo(alerta.fecha)}</span>
                </div>
                {alerta.ubicacion && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      {alerta.ubicacion.lat.toFixed(4)}, {alerta.ubicacion.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Motivo de Respuesta */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo de Respuesta <span className="text-red-400">*</span>
            </Label>
            <Select
              value={motivoSeleccionado}
              onValueChange={setMotivoSeleccionado}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Seleccione un motivo..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {opcionesRespuesta.map((opcion) => (
                  <SelectItem 
                    key={opcion.id} 
                    value={opcion.id.toString()}
                    className="text-white hover:bg-gray-700"
                  >
                    {opcion.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agregar observaciones adicionales..."
              className="bg-gray-700 border-gray-600 placeholder-gray-400"
              rows={3}
            />
          </div>

          {/* Comandos Rápidos */}
          <div className="space-y-2">
            <Label>Comandos Rápidos</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMANDOS_RAPIDOS.map((comando) => {
                const Icon = comando.icon
                return (<Button
                    key={comando.id}
                    type="button"
                    onClick={() => handleSendCommand(comando.id)}
                    disabled={sendingCommand !== null}
                    className={cn(
                      'justify-start',
                      comando.color,
                      sendingCommand === comando.id && 'opacity-75 cursor-not-allowed'
                    )}
                    size="sm"
                  >
                    {sendingCommand === comando.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Icon className="h-4 w-4 mr-2" />
                    )}
                    {comando.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Warning for critical alerts */}
          {alerta.severidad === 'critica' && (
            <Alert variant="destructive" className="border-red-800 bg-red-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Alerta Crítica:</strong> Esta es una alerta de alta prioridad. Asegúrese de tomar las acciones necesarias.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleVerificar}
              disabled={verificando || alerta.atendida || !motivoSeleccionado}
              className={cn(
                "flex-1",
                alerta.atendida
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed hover:bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {verificando ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {alerta.atendida ? 'Ya Verificada' : 'Verificar Alerta'}
                </>
              )}
            </Button>
            
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}