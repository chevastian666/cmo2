/**
 * Modal de Comandos para Precintos
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Unlock, 
  RotateCcw, 
  Zap, 
  Clock, 
  Compass, 
  Trash2,
  Send,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { notificationService } from '../../../services/shared/notification.service';
import type { PrecintoActivo } from '../../../types/monitoring';

interface PrecintoCommandsModalProps {
  precinto: PrecintoActivo;
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  dangerous?: boolean;
}

const COMMANDS: Command[] = [
  {
    id: 'abrir',
    name: 'Abrir',
    description: 'Abre el precinto de forma remota',
    icon: Unlock,
    color: 'text-green-400',
    dangerous: true
  },
  {
    id: 'reiniciar',
    name: 'Reiniciar',
    description: 'Reinicia el dispositivo',
    icon: RotateCcw,
    color: 'text-blue-400'
  },
  {
    id: 'despertar',
    name: 'Despertar',
    description: 'Activa el dispositivo del modo ahorro',
    icon: Zap,
    color: 'text-yellow-400'
  },
  {
    id: 'muestreo_30',
    name: 'Muestreo 30 seg',
    description: 'Configura el muestreo cada 30 segundos',
    icon: Clock,
    color: 'text-purple-400'
  },
  {
    id: 'arreglar_gps',
    name: 'Arreglar GPS',
    description: 'Intenta restablecer la conexión GPS',
    icon: Compass,
    color: 'text-orange-400'
  },
  {
    id: 'borrar_memoria',
    name: 'Borrar Memoria',
    description: 'Elimina los datos almacenados en el dispositivo',
    icon: Trash2,
    color: 'text-red-400',
    dangerous: true
  }
];

export const PrecintoCommandsModal: React.FC<PrecintoCommandsModalProps> = ({
  precinto,
  isOpen,
  onClose
}) => {
  const [sendingCommand, setSendingCommand] = useState<string | null>(null);
  const [confirmCommand, setConfirmCommand] = useState<string | null>(null);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleCommand = async (command: Command) => {
    // If command is dangerous, show confirmation
    if (command.dangerous && confirmCommand !== command.id) {
      setConfirmCommand(command.id);
      return;
    }

    setSendingCommand(command.id);
    setConfirmCommand(null);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notificationService.success(
        `Comando "${command.name}" enviado al precinto ${precinto.nqr}`
      );
      
      // Log the command
      console.log('Command sent:', {
        precintoId: precinto.id,
        precintoNQR: precinto.nqr,
        command: command.id,
        timestamp: new Date().toISOString()
      });
      
      onClose();
    } catch (error) {
      notificationService.error(
        `Error al enviar comando: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setSendingCommand(null);
    }
  };

  const cancelConfirmation = () => {
    setConfirmCommand(null);
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
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Comandos de Precinto
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Precinto: {precinto.nqr} - {precinto.nserie}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Device Status */}
          <div className="px-6 py-3 bg-gray-850 border-b border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <span className={cn(
                    "ml-2 font-medium",
                    precinto.estado === 'armado' ? 'text-green-400' : 'text-yellow-400'
                  )}>
                    {precinto.estado}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Batería:</span>
                  <span className={cn(
                    "ml-2 font-medium",
                    precinto.bateria > 50 ? 'text-green-400' : 
                    precinto.bateria > 20 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {precinto.bateria}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Último reporte:</span>
                  <span className="ml-2 text-white">{precinto.ultimoReporte}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commands */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {COMMANDS.map((command) => (
                <div key={command.id}>
                  {confirmCommand === command.id ? (
                    <div className="bg-gray-700 rounded-lg p-4 border-2 border-red-500">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <p className="text-sm font-medium text-white">¿Confirmar comando?</p>
                      </div>
                      <p className="text-xs text-gray-300 mb-3">
                        Esta acción {command.id === 'abrir' ? 'abrirá el precinto' : 'borrará la memoria del dispositivo'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCommand(command)}
                          className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={cancelConfirmation}
                          className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCommand(command)}
                      disabled={sendingCommand !== null}
                      className={cn(
                        "w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-all",
                        "border border-gray-600 hover:border-gray-500",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        sendingCommand === command.id && "animate-pulse"
                      )}
                    >
                      <div className="flex flex-col items-center text-center">
                        <command.icon className={cn("h-8 w-8 mb-2", command.color)} />
                        <h4 className="text-sm font-medium text-white mb-1">
                          {command.name}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {command.description}
                        </p>
                        {sendingCommand === command.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                            <span className="text-xs text-blue-400">Enviando...</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-400 font-medium">Precaución</p>
                  <p className="text-xs text-yellow-300 mt-1">
                    Los comandos se ejecutarán inmediatamente. Algunos comandos como "Abrir" y 
                    "Borrar Memoria" son irreversibles.
                  </p>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};