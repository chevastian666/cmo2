import React from 'react'
import { Package, AlertTriangle, CheckCircle, MapPin, Truck, User} from 'lucide-react'
import { cn} from '@/lib/utils'
import { Button} from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import type { Precinto} from '../../../types'
interface TransitoFormData {
  matricula: string
  nombreConductor: string
  telefonoConductor: string
  empresa: string
  rutEmpresa: string
  origen: string
  destino: string
  tipoEslinga: {
    larga: boolean
    corta: boolean
  }
  precintoId: string
  observaciones: string
}

interface ArmConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  precinto: Precinto | null
  transito: Partial<TransitoFormData>
}

export const ArmConfirmationModal: React.FC<ArmConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, precinto, transito
}) => {
  if (!precinto) return null
  const hasWarnings = precinto.bateria < 20 || 
                      (Date.now() / 1000 - precinto.fechaUltimaLectura) > 3600 ||
                      precinto.eslinga.estado === 'violada'
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-500" />
            <div>
              <DialogTitle>Confirmar Armado de Precinto</DialogTitle>
              <DialogDescription>
                Revise la información antes de confirmar el armado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warnings */}
          {hasWarnings && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Advertencias del Precinto</AlertTitle>
              <AlertDescription>
                <ul className="space-y-1 text-sm mt-2">
                  {precinto.bateria < 20 && (
                    <li>• Batería baja: {precinto.bateria}%</li>
                  )}
                  {(Date.now() / 1000 - precinto.fechaUltimaLectura) > 3600 && (
                    <li>• Sin reportar hace más de 1 hora</li>
                  )}
                  {precinto.eslinga.estado === 'violada' && (
                    <li>• Eslinga en estado violado</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Precinto Info */}
          <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Información del Precinto
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Código:</span>
                      <span className="font-mono font-bold text-white">{precinto.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">{precinto.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className="text-white">{precinto.estado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Batería:</span>
                      <span className={cn(
                        "font-medium",
                        precinto.bateria < 20 ? "text-red-400" : 
                        precinto.bateria < 50 ? "text-yellow-400" : "text-green-400"
                      )}>
                        {precinto.bateria}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transit Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Datos del Tránsito
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    {/* Vehicle */}
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Vehículo</p>
                        <p className="text-white">
                          {transito.matricula || 'No especificada'}
                        </p>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Conductor</p>
                        <p className="text-white">
                          {transito.nombreConductor || 'No especificado'} 
                          {transito.telefonoConductor && ` - Tel: ${transito.telefonoConductor}`}
                        </p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Ruta</p>
                        <p className="text-white">
                          {transito.origen || 'Origen'} → {transito.destino || 'Destino'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-gray-600 space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Empresa</p>
                        <p className="text-white">{transito.empresa || 'No especificada'}</p>
                        {transito.rutEmpresa && (
                          <p className="text-sm text-gray-400">RUT: {transito.rutEmpresa}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Tipo de Eslinga</p>
                        <p className="text-white">
                          {transito.tipoEslinga?.larga && 'Larga'}
                          {transito.tipoEslinga?.larga && transito.tipoEslinga?.corta && ' y '}
                          {transito.tipoEslinga?.corta && 'Corta'}
                          {!transito.tipoEslinga?.larga && !transito.tipoEslinga?.corta && 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {transito.observaciones && (
                      <div className="pt-3 border-t border-gray-600">
                        <p className="text-sm text-gray-400 mb-1">Observaciones</p>
                        <p className="text-white text-sm">{transito.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Command Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Comando a Ejecutar
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    <span className="text-green-400">$</span>
                    <span className="text-white ml-2">
                      precintocommand --activate --nqr={precinto.codigo} --matricula={transito.matricula || 'NONE'}
                    </span>
              </div>
          </div>

        </div>

        <DialogFooter>
          <p className="text-sm text-muted-foreground mr-auto">
            ¿Está seguro de que desea armar este precinto?
          </p>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant={hasWarnings ? "destructive" : "default"}
            onClick={onConfirm}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmar Armado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}