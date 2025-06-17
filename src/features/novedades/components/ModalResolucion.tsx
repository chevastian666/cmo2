import React, { useState } from 'react';
import { X, Check, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { Novedad } from '../types';

interface ModalResolucionProps {
  novedad: Novedad | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (novedadId: string, comentario?: string) => Promise<void>;
}

export const ModalResolucion: React.FC<ModalResolucionProps> = ({
  novedad,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !novedad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      await onSubmit(novedad.id, comentario.trim() || undefined);
      setComentario('');
      onClose();
    } catch (err) {
      // Error manejado en el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-lg w-full bg-gray-900">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold text-white">
                  Marcar como Resuelta
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info de la novedad */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Novedad:</p>
                <p className="text-white line-clamp-2">{novedad.descripcion}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {novedad.puntoOperacion} • {novedad.fecha.toLocaleDateString('es-UY')}
                </p>
              </div>

              {/* Comentario opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comentario de resolución (opcional)
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Describa cómo se resolvió la novedad..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puede dejar este campo vacío si no es necesario agregar detalles
                </p>
              </div>

              {/* Confirmación */}
              <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Esta novedad se marcará como resuelta y no podrá ser editada
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Marcar como resuelta
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};