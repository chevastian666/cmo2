import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  FileText, 
  Upload, 
  X, 
  Save,
  Paperclip
} from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import { notificationService } from '../../../services/shared/notification.service';
import type { TipoNovedad } from '../types';
import { PUNTOS_OPERACION, TIPOS_NOVEDAD } from '../types';

interface FormularioNovedadProps {
  onSubmit: (data: FormData) => Promise<void>;
  puntoOperacionDefault?: string;
  className?: string;
}

interface FormData {
  fecha: string;
  puntoOperacion: string;
  tipoNovedad: TipoNovedad;
  descripcion: string;
  archivos?: File[];
}

export const FormularioNovedad: React.FC<FormularioNovedadProps> = ({
  onSubmit,
  puntoOperacionDefault = '',
  className
}) => {
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split('T')[0],
    puntoOperacion: puntoOperacionDefault,
    tipoNovedad: 'evento',
    descripcion: ''
  });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isImage && !isPDF) {
        notificationService.error('Archivo inválido', `${file.name} no es una imagen o PDF`);
        return false;
      }
      if (!isValidSize) {
        notificationService.error('Archivo muy grande', `${file.name} supera los 5MB`);
        return false;
      }
      return true;
    });
    
    setArchivos(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.puntoOperacion) {
      newErrors.puntoOperacion = 'Debe seleccionar un punto de operación';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        archivos: archivos.length > 0 ? archivos : undefined
      });
      
      // Limpiar formulario
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        puntoOperacion: puntoOperacionDefault,
        tipoNovedad: 'evento',
        descripcion: ''
      });
      setArchivos([]);
      setErrors({});
      
      notificationService.success('Novedad registrada', 'La novedad se ha guardado correctamente');
    } catch (error) {
      notificationService.error('Error al guardar', 'No se pudo registrar la novedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Nueva Novedad
        </h3>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Punto de operación */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Punto de operación *
            </label>
            <select
              value={formData.puntoOperacion}
              onChange={(e) => setFormData({ ...formData, puntoOperacion: e.target.value })}
              className={cn(
                "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.puntoOperacion ? "border-red-500" : "border-gray-700"
              )}
              disabled={loading}
            >
              <option value="">Seleccionar punto...</option>
              {PUNTOS_OPERACION.map(punto => (
                <option key={punto} value={punto}>{punto}</option>
              ))}
            </select>
            {errors.puntoOperacion && (
              <p className="text-red-400 text-sm mt-1">{errors.puntoOperacion}</p>
            )}
          </div>

          {/* Tipo de novedad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de novedad
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(TIPOS_NOVEDAD).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoNovedad: key as TipoNovedad })}
                  disabled={loading}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    formData.tipoNovedad === key
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                  )}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción detallada *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
              placeholder="Describa la novedad con el mayor detalle posible..."
              className={cn(
                "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.descripcion ? "border-red-500" : "border-gray-700"
              )}
              disabled={loading}
            />
            {errors.descripcion && (
              <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.descripcion.length} caracteres
            </p>
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Paperclip className="inline h-4 w-4 mr-1" />
              Archivos adjuntos (opcional)
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Adjuntar imagen o PDF
            </button>
            
            {archivos.length > 0 && (
              <div className="mt-2 space-y-1">
                {archivos.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300 truncate flex-1">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 p-1 hover:bg-gray-700 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
              loading
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
                <Save className="h-5 w-5" />
                Guardar novedad
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};