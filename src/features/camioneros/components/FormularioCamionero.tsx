import React, { useState } from 'react';
import { X, User, Phone, Flag, AlertCircle } from 'lucide-react';
import { useCamionerosStore } from '../../../store/camionerosStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { NACIONALIDADES, TIPOS_DOCUMENTO } from '../types';
import type { Nacionalidad } from '../types';

interface FormularioCamioneroProps {
  onClose: () => void;
}

export const FormularioCamionero: React.FC<FormularioCamioneroProps> = ({ onClose }) => {
  const userInfo = useUserInfo();
  const { createCamionero } = useCamionerosStore();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    tipoDocumento: 'CI' as keyof typeof TIPOS_DOCUMENTO,
    nacionalidad: 'Uruguay' as Nacionalidad,
    paisOrigen: '',
    telefonoUruguayo: '',
    telefonoPais: '',
    comentario: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }
    
    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es obligatorio';
    }
    
    if (formData.nacionalidad === 'Otro' && !formData.paisOrigen.trim()) {
      newErrors.paisOrigen = 'Debe especificar el país';
    }
    
    if (!formData.telefonoUruguayo && !formData.telefonoPais) {
      newErrors.telefono = 'Debe proporcionar al menos un teléfono de contacto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await createCamionero({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        documento: formData.documento.trim(),
        tipoDocumento: formData.tipoDocumento,
        nacionalidad: formData.nacionalidad,
        paisOrigen: formData.nacionalidad === 'Otro' ? formData.paisOrigen.trim() : formData.nacionalidad,
        telefonoUruguayo: formData.telefonoUruguayo.trim(),
        telefonoPais: formData.telefonoPais.trim(),
        comentario: formData.comentario.trim(),
        creadoPor: {
          id: userInfo.id,
          nombre: userInfo.name
        }
      });
      
      onClose();
    } catch (error) {
      setErrors({ general: 'Error al registrar el camionero' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Registrar Camionero
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

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Juan"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Ej: Pérez"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.apellido && (
                <p className="mt-1 text-sm text-red-500">{errors.apellido}</p>
              )}
            </div>
          </div>

          {/* Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tipo de documento *
              </label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {Object.entries(TIPOS_DOCUMENTO).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Número de documento *
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                placeholder="Ej: 12345678"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.documento && (
                <p className="mt-1 text-sm text-red-500">{errors.documento}</p>
              )}
            </div>
          </div>

          {/* Nacionalidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nacionalidad *
              </label>
              <select
                value={formData.nacionalidad}
                onChange={(e) => handleChange('nacionalidad', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {Object.entries(NACIONALIDADES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {formData.nacionalidad === 'Otro' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Especificar país *
                </label>
                <input
                  type="text"
                  value={formData.paisOrigen}
                  onChange={(e) => handleChange('paisOrigen', e.target.value)}
                  placeholder="Ej: Perú"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {errors.paisOrigen && (
                  <p className="mt-1 text-sm text-red-500">{errors.paisOrigen}</p>
                )}
              </div>
            )}
          </div>

          {/* Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono uruguayo
                </span>
              </label>
              <input
                type="tel"
                value={formData.telefonoUruguayo}
                onChange={(e) => handleChange('telefonoUruguayo', e.target.value)}
                placeholder="Ej: 099123456"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <span className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Teléfono del país de origen
                </span>
              </label>
              <input
                type="tel"
                value={formData.telefonoPais}
                onChange={(e) => handleChange('telefonoPais', e.target.value)}
                placeholder="Ej: +541123456789"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {errors.telefono && (
            <p className="text-sm text-red-500">{errors.telefono}</p>
          )}

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Comentarios / Observaciones (opcional)
            </label>
            <textarea
              value={formData.comentario}
              onChange={(e) => handleChange('comentario', e.target.value)}
              placeholder="Ej: Chofer de confianza, siempre puntual..."
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