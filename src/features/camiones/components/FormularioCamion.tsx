import React, { useState } from 'react';
import { X, Truck, Camera, AlertCircle } from 'lucide-react';
import { useCamionesStore } from '../../../store/camionesStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { ESTADOS_CAMION } from '../types';
import type { EstadoCamion } from '../types';

interface FormularioCamionProps {
  onClose: () => void;
}

export const FormularioCamion: React.FC<FormularioCamionProps> = ({ onClose }) => {
  const userInfo = useUserInfo();
  const { createCamion } = useCamionesStore();
  
  const [formData, setFormData] = useState({
    matricula: '',
    observaciones: '',
    estado: 'normal' as EstadoCamion,
    foto: null as File | null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('foto', file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.matricula.trim()) {
      newErrors.matricula = 'La matrícula es obligatoria';
    } else if (formData.matricula.length < 6) {
      newErrors.matricula = 'La matrícula debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await createCamion({
        matricula: formData.matricula.toUpperCase().trim(),
        observaciones: formData.observaciones.trim(),
        estado: formData.estado,
        creadoPor: {
          id: userInfo.id,
          nombre: userInfo.name
        }
      });
      
      onClose();
    } catch (error) {
      setErrors({ general: 'Error al registrar el camión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-500" />
            Registrar Camión
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-500">{errors.general}</p>
            </div>
          )}

          {/* Matrícula */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Matrícula *
            </label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) => handleChange('matricula', e.target.value)}
              placeholder="Ej: ABC 1234"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {errors.matricula && (
              <p className="mt-1 text-sm text-red-500">{errors.matricula}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Estado inicial
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {Object.entries(ESTADOS_CAMION).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fotografía (opcional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:border-gray-600 cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                <span className="text-sm">
                  {formData.foto ? formData.foto.name : 'Seleccionar imagen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Ej: Camión refrigerado, mantenimiento al día..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};