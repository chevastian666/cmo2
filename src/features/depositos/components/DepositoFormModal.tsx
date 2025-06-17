import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { DEPOSITO_TIPOS, DEPOSITO_ZONAS } from '../types';
import type { Deposito } from '../types';

interface DepositoFormModalProps {
  deposito: Deposito | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Deposito>) => void;
}

export const DepositoFormModal: React.FC<DepositoFormModalProps> = ({
  deposito,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    alias: '',
    lat: '',
    lng: '',
    padre: '',
    tipo: '',
    zona: '',
    empresa: '',
    capacidad: 50,
    estado: 'activo' as const,
    telefono: '',
    direccion: '',
    horaApertura: '',
    horaCierre: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deposito) {
      setFormData({
        codigo: deposito.codigo.toString(),
        nombre: deposito.nombre,
        alias: deposito.alias,
        lat: deposito.lat.toString(),
        lng: deposito.lng.toString(),
        padre: deposito.padre,
        tipo: deposito.tipo,
        zona: deposito.zona,
        empresa: deposito.empresa || '',
        capacidad: deposito.capacidad,
        estado: deposito.estado,
        telefono: deposito.telefono || '',
        direccion: deposito.direccion || '',
        horaApertura: deposito.horaApertura || '',
        horaCierre: deposito.horaCierre || ''
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        alias: '',
        lat: '',
        lng: '',
        padre: '',
        tipo: '',
        zona: '',
        empresa: '',
        capacidad: 50,
        estado: 'activo',
        telefono: '',
        direccion: '',
        horaApertura: '',
        horaCierre: ''
      });
    }
    setErrors({});
  }, [deposito]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo) newErrors.codigo = 'El código es requerido';
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.alias) newErrors.alias = 'El alias es requerido';
    if (!formData.lat) newErrors.lat = 'La latitud es requerida';
    if (!formData.lng) newErrors.lng = 'La longitud es requerida';
    if (!formData.padre) newErrors.padre = 'El padre es requerido';
    if (!formData.tipo) newErrors.tipo = 'El tipo es requerido';
    if (!formData.zona) newErrors.zona = 'La zona es requerida';

    // Validate numeric fields
    if (formData.lat && isNaN(parseFloat(formData.lat))) {
      newErrors.lat = 'La latitud debe ser un número válido';
    }
    if (formData.lng && isNaN(parseFloat(formData.lng))) {
      newErrors.lng = 'La longitud debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const data: Partial<Deposito> = {
      codigo: parseInt(formData.codigo),
      nombre: formData.nombre,
      alias: formData.alias,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      padre: formData.padre,
      tipo: formData.tipo,
      zona: formData.zona,
      empresa: formData.empresa || undefined,
      capacidad: formData.capacidad,
      estado: formData.estado,
      telefono: formData.telefono || undefined,
      direccion: formData.direccion || undefined,
      horaApertura: formData.horaApertura || undefined,
      horaCierre: formData.horaCierre || undefined
    };

    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">
                {deposito ? 'Editar Depósito' : 'Agregar Depósito'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Código *
                </label>
                <input
                  type="number"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-400">{errors.codigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Alias *
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.alias && (
                  <p className="mt-1 text-sm text-red-400">{errors.alias}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre del Depósito *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-400">{errors.nombre}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Latitud *
                  </label>
                  <input
                    type="text"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Ej: -34.903127"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.lat && (
                    <p className="mt-1 text-sm text-red-400">{errors.lat}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Longitud *
                  </label>
                  <input
                    type="text"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Ej: -56.212387"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.lng && (
                    <p className="mt-1 text-sm text-red-400">{errors.lng}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Clasificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    {DEPOSITO_TIPOS.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.tipo && (
                    <p className="mt-1 text-sm text-red-400">{errors.tipo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Zona *
                  </label>
                  <select
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar zona</option>
                    {DEPOSITO_ZONAS.map(zona => (
                      <option key={zona} value={zona}>{zona}</option>
                    ))}
                  </select>
                  {errors.zona && (
                    <p className="mt-1 text-sm text-red-400">{errors.zona}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ubicación Padre *
                  </label>
                  <select
                    value={formData.padre}
                    onChange={(e) => setFormData({ ...formData, padre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar padre</option>
                    {DEPOSITO_ZONAS.map(zona => (
                      <option key={zona} value={zona}>{zona}</option>
                    ))}
                  </select>
                  {errors.padre && (
                    <p className="mt-1 text-sm text-red-400">{errors.padre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Schedule */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Contacto y Horario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'activo' | 'inactivo' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Hora de Apertura
                  </label>
                  <input
                    type="time"
                    value={formData.horaApertura}
                    onChange={(e) => setFormData({ ...formData, horaApertura: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Hora de Cierre
                  </label>
                  <input
                    type="time"
                    value={formData.horaCierre}
                    onChange={(e) => setFormData({ ...formData, horaCierre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Capacidad</h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Capacidad actual (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12 text-center">
                    {formData.capacidad}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      formData.capacidad >= 80 ? 'bg-red-500' :
                      formData.capacidad >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${formData.capacidad}%` }}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {deposito ? 'Guardar Cambios' : 'Agregar Depósito'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};