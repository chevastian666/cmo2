import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  InfoSection,
  Badge
} from '../../../components/ui';
import { cn } from '../../../utils/utils';
import { notificationService } from '../../../services/shared/notification.service';
import type { TipoDocumento } from '../types';
import { TIPOS_DOCUMENTO } from '../types';

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormData {
  tipo: TipoDocumento;
  numeroDUA?: string;
  fechaDocumento: string;
  descripcion: string;
  palabrasClave: string;
  empresa?: string;
  destacado: boolean;
  confidencial: boolean;
  archivo: File;
}

export const SubirDocumentoModal: React.FC<SubirDocumentoModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Partial<FormData>>({
    tipo: 'DUA',
    destacado: false,
    confidencial: false,
    fechaDocumento: new Date().toISOString().split('T')[0]
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors({ ...errors, archivo: 'Solo se permiten archivos PDF' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrors({ ...errors, archivo: 'El archivo no puede superar los 10MB' });
        return;
      }
      setArchivo(file);
      setErrors({ ...errors, archivo: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo) newErrors.tipo = 'El tipo de documento es requerido';
    if (!formData.fechaDocumento) newErrors.fechaDocumento = 'La fecha es requerida';
    if (!formData.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!archivo) newErrors.archivo = 'Debe seleccionar un archivo PDF';

    if (formData.tipo === 'DUA' && !formData.numeroDUA?.trim()) {
      newErrors.numeroDUA = 'El número de DUA es requerido para este tipo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData as FormData,
        archivo: archivo!
      });
      notificationService.success('Documento subido', 'El documento se ha guardado correctamente');
      onClose();
    } catch (error) {
      notificationService.error('Error al subir documento', 'Por favor intente nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tipo: 'DUA',
      destacado: false,
      confidencial: false,
      fechaDocumento: new Date().toISOString().split('T')[0]
    });
    setArchivo(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-hidden bg-gray-900">
          {/* Header */}
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-white">
                  Subir Nuevo Documento
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

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de documento *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoDocumento })}
                  className={cn(
                    "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.tipo ? "border-red-500" : "border-gray-700"
                  )}
                  disabled={loading}
                >
                  {Object.entries(TIPOS_DOCUMENTO).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                {errors.tipo && <p className="text-red-400 text-sm mt-1">{errors.tipo}</p>}
              </div>

              {/* Número de DUA */}
              {formData.tipo === 'DUA' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de DUA *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroDUA || ''}
                    onChange={(e) => setFormData({ ...formData, numeroDUA: e.target.value })}
                    placeholder="Ej: 2024/123456"
                    className={cn(
                      "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                      errors.numeroDUA ? "border-red-500" : "border-gray-700"
                    )}
                    disabled={loading}
                  />
                  {errors.numeroDUA && <p className="text-red-400 text-sm mt-1">{errors.numeroDUA}</p>}
                </div>
              )}

              {/* Fecha del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha del documento *
                </label>
                <input
                  type="date"
                  value={formData.fechaDocumento || ''}
                  onChange={(e) => setFormData({ ...formData, fechaDocumento: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.fechaDocumento ? "border-red-500" : "border-gray-700"
                  )}
                  disabled={loading}
                />
                {errors.fechaDocumento && <p className="text-red-400 text-sm mt-1">{errors.fechaDocumento}</p>}
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={formData.empresa || ''}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Nombre de la empresa"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción breve *
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve descripción del contenido del documento"
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.descripcion ? "border-red-500" : "border-gray-700"
                  )}
                  disabled={loading}
                />
                {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
              </div>

              {/* Palabras clave */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Palabras clave (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.palabrasClave || ''}
                  onChange={(e) => setFormData({ ...formData, palabrasClave: e.target.value })}
                  placeholder="autorización, importación, contenedor"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Las palabras clave ayudan a encontrar el documento más fácilmente
                </p>
              </div>

              {/* Archivo PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Archivo PDF *
                </label>
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center",
                  errors.archivo ? "border-red-500 bg-red-900/10" : "border-gray-700 bg-gray-800/50",
                  "hover:border-blue-500 transition-colors"
                )}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  
                  {archivo ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto" />
                      <p className="text-white font-medium">{archivo.name}</p>
                      <p className="text-sm text-gray-400">
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        disabled={loading}
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        disabled={loading}
                      >
                        Seleccionar archivo PDF
                      </button>
                      <p className="text-sm text-gray-400">
                        Máximo 10MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.archivo && <p className="text-red-400 text-sm mt-1">{errors.archivo}</p>}
              </div>

              {/* Opciones adicionales */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.destacado || false}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-gray-300">Marcar como destacado</span>
                  <Badge variant="yellow" className="text-xs">⭐</Badge>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.confidencial || false}
                    onChange={(e) => setFormData({ ...formData, confidencial: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-gray-300">Documento confidencial</span>
                  <Badge variant="red" className="text-xs">🔒</Badge>
                </label>
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              disabled={loading}
            >
              Limpiar
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                  loading 
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir documento
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};