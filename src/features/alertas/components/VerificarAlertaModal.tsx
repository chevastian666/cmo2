/**
 * Modal para Verificar Alerta
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
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
import { cn } from '../../../utils/utils';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';
import { notificationService } from '../../../services/shared/notification.service';
import type { Alerta } from '../../../types';

interface VerificarAlertaModalProps {
  alerta: Alerta;
  isOpen: boolean;
  onClose: () => void;
  onVerificar: (alertaId: string, comentario?: string) => Promise<void>;
}

export const VerificarAlertaModal: React.FC<VerificarAlertaModalProps> = ({
  alerta,
  isOpen,
  onClose,
  onVerificar
}) => {
  const [verificando, setVerificando] = useState(false);
  const [comentario, setComentario] = useState('');
  const [showComentario, setShowComentario] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'violacion':
        return <Shield className="h-6 w-6" />;
      case 'bateria_baja':
        return <Battery className="h-6 w-6" />;
      case 'fuera_de_ruta':
        return <MapPin className="h-6 w-6" />;
      case 'temperatura':
        return <Thermometer className="h-6 w-6" />;
      case 'sin_signal':
        return <Radio className="h-6 w-6" />;
      case 'intrusion':
        return <Package className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', getSeveridadColor(alerta.severidad))}>
                  {getIcon(alerta.tipo)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Verificar Alerta
                  </h3>
                  <p className="text-sm text-gray-400">
                    {alerta.codigoPrecinto}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Alert Details */}
          <div className="p-6">
            {/* Alert Info */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
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
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      getSeveridadColor(alerta.severidad)
                    )}>
                      {alerta.severidad}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Estado</p>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      alerta.atendida 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-red-900/20 text-red-400'
                    )}>
                      {alerta.atendida ? 'Atendida' : 'Activa'}
                    </span>
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
            <div className="mb-4">
              <button
                onClick={() => setShowComentario(!showComentario)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{showComentario ? 'Ocultar' : 'Agregar'} comentario</span>
              </button>
              
              {showComentario && (
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Agregar un comentario sobre la verificación..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Warning for critical alerts */}
            {alerta.severidad === 'critica' && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Alerta Crítica</p>
                    <p className="text-xs text-red-300 mt-1">
                      Esta es una alerta de alta prioridad. Asegúrese de tomar las acciones necesarias.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleVerificar}
                disabled={verificando || alerta.atendida}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  alerta.atendida
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : verificando
                    ? "bg-blue-900/50 text-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {verificando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>{alerta.atendida ? 'Ya Verificada' : 'Verificar Alerta'}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};