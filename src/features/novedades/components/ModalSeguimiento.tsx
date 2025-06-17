import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { Novedad } from '../types';

interface ModalSeguimientoProps {
  novedad: Novedad | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (novedadId: string, comentario: string) => Promise<void>;
}

export const ModalSeguimiento: React.FC<ModalSeguimientoProps> = ({
  novedad,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !novedad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comentario.trim()) {
      setError('El comentario es requerido');
      return;
    }

    if (comentario.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit(novedad.id, comentario.trim());
      setComentario('');
      onClose();
    } catch (err) {
      setError('Error al guardar el seguimiento');
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
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-white">
                  Agregar Seguimiento
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

              {/* Comentario */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comentario de seguimiento *
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => {
                    setComentario(e.target.value);
                    setError('');
                  }}
                  rows={4}
                  placeholder="Describa el seguimiento o actualización..."
                  className={cn(
                    "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                    error ? "border-red-500" : "border-gray-700"
                  )}
                  disabled={loading}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {comentario.length} caracteres
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
                  disabled={loading || !comentario.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    loading || !comentario.trim()
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Agregar seguimiento
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