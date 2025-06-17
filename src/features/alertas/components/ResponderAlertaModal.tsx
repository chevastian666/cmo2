import React, { useState, useEffect } from 'react';
import { X, Send, Zap, RotateCw, Satellite, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { Alerta } from '../../../types';
import { TIPOS_ALERTA } from '../../../types/monitoring';
import { notificationService } from '../../../services/shared/notification.service';

interface ResponderAlertaModalProps {
  alerta: Alerta | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (alertaId: string, motivoId: number, motivoDescripcion: string, observaciones?: string) => Promise<void>;
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
  ]
};

// Comandos rápidos disponibles
const COMANDOS_RAPIDOS = [
  { id: 'despertar', label: 'Despertar', icon: Zap, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'reiniciar', label: 'Reiniciar', icon: RotateCw, color: 'bg-green-600 hover:bg-green-700' },
  { id: 'arreglar_gps', label: 'Arreglar GPS', icon: Satellite, color: 'bg-orange-600 hover:bg-orange-700' },
  { id: 'borrar_memoria', label: 'Borrar Memoria', icon: Trash2, color: 'bg-red-600 hover:bg-red-700' }
];

export const ResponderAlertaModal: React.FC<ResponderAlertaModalProps> = ({
  alerta,
  isOpen,
  onClose,
  onRespond
}) => {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCommand, setSendingCommand] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMotivoSeleccionado(0);
      setObservaciones('');
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alerta || motivoSeleccionado === 0) {
      notificationService.error('Por favor seleccione un motivo de respuesta');
      return;
    }

    const opcionesAlerta = OPCIONES_RESPUESTA[alerta.tipo] || [];
    const motivoDescripcion = opcionesAlerta.find(o => o.id === motivoSeleccionado)?.descripcion || '';

    try {
      setLoading(true);
      await onRespond(alerta.id, motivoSeleccionado, motivoDescripcion, observaciones);
      onClose();
    } catch (error) {
      notificationService.error('Error al responder la alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCommand = async (commandId: string) => {
    if (!alerta) return;

    try {
      setSendingCommand(commandId);
      // TODO: Implement command sending logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      notificationService.success(`Comando "${commandId}" enviado al precinto ${alerta.codigoPrecinto}`);
    } catch (error) {
      notificationService.error('Error al enviar el comando');
    } finally {
      setSendingCommand(null);
    }
  };

  if (!isOpen || !alerta) return null;

  const opcionesRespuesta = OPCIONES_RESPUESTA[alerta.tipo] || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-white">Responder Alerta</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {alerta.tipo} - {TIPOS_ALERTA[alerta.tipo as keyof typeof TIPOS_ALERTA]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Alert Info */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Precinto:</span>
                  <span className="text-white font-medium">{alerta.codigoPrecinto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mensaje:</span>
                  <span className="text-white">{alerta.mensaje}</span>
                </div>
              </div>

              {/* Motivo de Respuesta */}
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo de Respuesta <span className="text-red-400">*</span>
                </label>
                <select
                  id="motivo"
                  value={motivoSeleccionado}
                  onChange={(e) => setMotivoSeleccionado(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Seleccione un motivo...</option>
                  {opcionesRespuesta.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ingrese observaciones adicionales..."
                />
              </div>

              {/* Comandos Rápidos */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Comandos Rápidos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COMANDOS_RAPIDOS.map((comando) => {
                    const Icon = comando.icon;
                    return (
                      <button
                        key={comando.id}
                        type="button"
                        onClick={() => handleSendCommand(comando.id)}
                        disabled={sendingCommand !== null}
                        className={cn(
                          'px-3 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium',
                          comando.color,
                          sendingCommand === comando.id && 'opacity-75 cursor-not-allowed'
                        )}
                      >
                        {sendingCommand === comando.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        <span>{comando.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || motivoSeleccionado === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Respondiendo...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Responder Alerta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};