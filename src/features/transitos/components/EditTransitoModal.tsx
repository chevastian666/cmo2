import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { notificationService } from '../../../services/shared/notification.service';
import { transitosService } from '../services/transitos.service';
import type { Transito } from '../types';

interface EditTransitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transito: Transito | null;
  onSuccess?: () => void;
}

export const EditTransitoModal: React.FC<EditTransitoModalProps> = ({
  isOpen,
  onClose,
  transito,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    dua: '',
    destino: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transito) {
      setFormData({
        dua: transito.dua || '',
        destino: transito.destino || ''
      });
    }
  }, [transito]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transito) return;

    try {
      setLoading(true);
      
      // Call the update service
      await transitosService.updateTransito(transito.id, {
        dua: formData.dua,
        destino: formData.destino
      });

      notificationService.success(
        'Tránsito Actualizado',
        `El tránsito ${formData.dua} ha sido actualizado exitosamente`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      notificationService.error(
        'Error',
        'No se pudo actualizar el tránsito. Por favor intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!transito || !isOpen) return null;

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
              <h2 className="text-xl font-semibold text-white">Editar Tránsito</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <form id="edit-transito-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Transit Info Display */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">Información del Viaje</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Precinto:</span>
                    <span className="ml-2 text-white font-mono">{transito.precinto}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Estado:</span>
                    <span className="ml-2 text-white">{transito.estado}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Origen:</span>
                    <span className="ml-2 text-white">{transito.origen}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fecha Salida:</span>
                    <span className="ml-2 text-white">
                      {new Date(transito.fechaSalida).toLocaleDateString('es-UY')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Empresa:</span>
                    <span className="ml-2 text-white">{transito.empresa}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ETA:</span>
                    <span className="ml-2 text-white">
                      {transito.eta ? new Date(transito.eta).toLocaleDateString('es-UY') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="dua" className="block text-sm font-medium text-gray-300 mb-2">
                    DUA
                  </label>
                  <input
                    type="text"
                    id="dua"
                    value={formData.dua}
                    onChange={(e) => setFormData({ ...formData, dua: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el DUA"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="destino" className="block text-sm font-medium text-gray-300 mb-2">
                    Destino
                  </label>
                  <input
                    type="text"
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el destino"
                    required
                  />
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
                type="submit"
                form="edit-transito-form"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};