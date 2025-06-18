import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { notificationService } from '../../../services/shared/notification.service';
import { transitosService } from '../services/transitos.service';
import type { Transito } from '../types';

interface EditTransitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transito: Transito | null;
  onSuccess?: () => void;
}

export const EditTransitoModalV2: React.FC<EditTransitoModalProps> = ({
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

  if (!transito) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle>Editar Tránsito</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transit Info Display */}
          <Card className="bg-gray-900 border-gray-700">
            <div className="p-4 space-y-3">
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
          </Card>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dua">DUA</Label>
              <Input
                type="text"
                id="dua"
                value={formData.dua}
                onChange={(e) => setFormData({ ...formData, dua: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Ingrese el DUA"
                required
                aria-label="DUA del tránsito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                type="text"
                id="destino"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Ingrese el destino"
                required
                aria-label="Destino del tránsito"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};