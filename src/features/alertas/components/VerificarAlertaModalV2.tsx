/**
 * Modal para Verificar Alerta - Versión con shadcn/ui
 * By Cheva
 */

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Shield, 
  Battery, 
  Radio, 
  Thermometer,
  Package,
  User,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';
import { notificationService } from '../../../services/shared/notification.service';
import type { Alerta } from '../../../types';

interface VerificarAlertaModalProps {
  alerta: Alerta;
  isOpen: boolean;
  onClose: () => void;
  onVerificar: (alertaId: string, comentario?: string) => Promise<void>;
}

export const VerificarAlertaModalV2: React.FC<VerificarAlertaModalProps> = ({
  alerta,
  isOpen,
  onClose,
  onVerificar
}) => {
  const [verificando, setVerificando] = useState(false);
  const [comentario, setComentario] = useState('');
  const [showComentario, setShowComentario] = useState(false);

  const getIcon = (tipo: string) => {
    const iconClass = "h-6 w-6";
    switch (tipo) {
      case 'violacion':
        return <Shield className={iconClass} />;
      case 'bateria_baja':
        return <Battery className={iconClass} />;
      case 'fuera_de_ruta':
        return <MapPin className={iconClass} />;
      case 'temperatura':
        return <Thermometer className={iconClass} />;
      case 'sin_signal':
        return <Radio className={iconClass} />;
      case 'intrusion':
        return <Package className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const getSeveridadVariant = (severidad: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severidad) {
      case 'critica':
        return 'destructive';
      case 'alta':
        return 'destructive';
      case 'media':
        return 'default';
      case 'baja':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-400 bg-red-900/20';
      case 'alta':
        return 'text-orange-400 bg-orange-900/20';
      case 'media':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'baja':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleVerificar = async () => {
    if (alerta.atendida) {
      notificationService.info('Esta alerta ya fue verificada');
      return;
    }

    setVerificando(true);
    try {
      await onVerificar(alerta.id, comentario || undefined);
      notificationService.success(`Alerta ${alerta.codigoPrecinto} verificada correctamente`);
      onClose();
    } catch (error) {
      notificationService.error('Error al verificar la alerta');
      console.error('Error verifying alert:', error);
    } finally {
      setVerificando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', getSeveridadColor(alerta.severidad))}>
              {getIcon(alerta.tipo)}
            </div>
            <div>
              <DialogTitle>Verificar Alerta</DialogTitle>
              <p className="text-sm text-gray-400">
                {alerta.codigoPrecinto}
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
                <p className="text-xs text-gray-400 mb-1">Mensaje</p>
                <p className="text-sm text-white">{alerta.mensaje}</p>
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
                  <span>{formatTimeAgo(alerta.timestamp)}</span>
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

          {/* Comment Section */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComentario(!showComentario)}
              className="text-blue-400 hover:text-blue-300 hover:bg-transparent"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showComentario ? 'Ocultar' : 'Agregar'} comentario
            </Button>
            
            {showComentario && (
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agregar un comentario sobre la verificación..."
                className="mt-2 bg-gray-700 border-gray-600 placeholder-gray-400"
                rows={3}
              />
            )}
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
              disabled={verificando || alerta.atendida}
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
  );
};