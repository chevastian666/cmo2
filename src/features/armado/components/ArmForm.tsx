import React, { useEffect } from 'react';
import { Truck, User, Building, MapPin, FileText, Phone, Hash, Package } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { ORIGENES_DESTINOS } from '../../../constants/locations';

// Empresas con RUT
const EMPRESAS = [
  { nombre: 'Transportes del Sur S.A.', rut: '211234567890' },
  { nombre: 'Logística Oriental S.R.L.', rut: '212345678901' },
  { nombre: 'Cargas del Norte S.A.', rut: '213456789012' },
  { nombre: 'Transporte Internacional Uruguay', rut: '214567890123' },
  { nombre: 'Rutas del Este S.A.', rut: '215678901234' },
  { nombre: 'Camiones del Oeste Ltda.', rut: '216789012345' },
  { nombre: 'Fletes Nacionales S.A.', rut: '217890123456' },
  { nombre: 'Transportadora Central', rut: '218901234567' },
  { nombre: 'Logística Integral Uruguay', rut: '219012345678' },
  { nombre: 'Express Cargo S.R.L.', rut: '210123456789' }
];

interface TransitoFormData {
  matricula: string;
  nombreConductor: string;
  telefonoConductor: string;
  empresa: string;
  rutEmpresa: string;
  origen: string;
  destino: string;
  tipoEslinga: {
    larga: boolean;
    corta: boolean;
  };
  precintoId: string;
  observaciones: string;
}

interface ArmFormProps {
  data: Partial<TransitoFormData>;
  onChange: (field: string, value: any) => void;
  disabled?: boolean;
  precintoId?: string;
}

export const ArmForm: React.FC<ArmFormProps> = ({ data, onChange, disabled = false, precintoId }) => {
  // Auto-complete precinto ID when provided
  useEffect(() => {
    if (precintoId && data.precintoId !== precintoId) {
      onChange('precintoId', precintoId);
    }
  }, [precintoId]);

  // Auto-complete RUT when empresa is selected
  useEffect(() => {
    if (data.empresa) {
      const empresa = EMPRESAS.find(e => e.nombre === data.empresa);
      if (empresa && data.rutEmpresa !== empresa.rut) {
        onChange('rutEmpresa', empresa.rut);
      }
    }
  }, [data.empresa]);

  // Auto-complete empresa when RUT is entered
  useEffect(() => {
    if (data.rutEmpresa && data.rutEmpresa.length === 12) {
      const empresa = EMPRESAS.find(e => e.rut === data.rutEmpresa);
      if (empresa && data.empresa !== empresa.nombre) {
        onChange('empresa', empresa.nombre);
      }
    }
  }, [data.rutEmpresa]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(field, value);
  };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('tipoEslinga', {
      ...data.tipoEslinga,
      [field]: e.target.checked
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Truck className="h-5 w-5 text-blue-500" />
        Datos del Tránsito
      </h2>

      <div className="space-y-6">
        {/* Vehículo y Conductor */}
        <div>
          <h3 className="text-base font-medium text-gray-400 uppercase tracking-wider mb-4">
            Vehículo y Conductor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Matrícula del Camión *
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={data.matricula || ''}
                  onChange={handleInputChange('matricula')}
                  disabled={disabled}
                  placeholder="UY-1234"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Nombre del Conductor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={data.nombreConductor || ''}
                  onChange={handleInputChange('nombreConductor')}
                  disabled={disabled}
                  placeholder="Juan Pérez"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Teléfono del Conductor *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={data.telefonoConductor || ''}
                  onChange={handleInputChange('telefonoConductor')}
                  disabled={disabled}
                  placeholder="099 123 456"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <h3 className="text-base font-medium text-gray-400 uppercase tracking-wider mb-4">
            Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Empresa *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={data.empresa || ''}
                  onChange={handleInputChange('empresa')}
                  disabled={disabled}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                >
                  <option value="">Seleccionar empresa...</option>
                  {EMPRESAS.map((empresa) => (
                    <option key={empresa.rut} value={empresa.nombre}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                RUT de la Empresa *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={data.rutEmpresa || ''}
                  onChange={handleInputChange('rutEmpresa')}
                  disabled={disabled}
                  placeholder="211234567890"
                  maxLength={12}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400 font-mono",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ruta */}
        <div>
          <h3 className="text-base font-medium text-gray-400 uppercase tracking-wider mb-4">
            Ruta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Origen *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={data.origen || ''}
                  onChange={handleInputChange('origen')}
                  disabled={disabled}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                >
                  <option value="">Seleccionar origen...</option>
                  {ORIGENES_DESTINOS.map((lugar) => (
                    <option key={lugar} value={lugar}>
                      {lugar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Destino *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={data.destino || ''}
                  onChange={handleInputChange('destino')}
                  disabled={disabled}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  required
                >
                  <option value="">Seleccionar destino...</option>
                  {ORIGENES_DESTINOS.map((lugar) => (
                    <option key={lugar} value={lugar}>
                      {lugar}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Precinto y Eslinga */}
        <div>
          <h3 className="text-base font-medium text-gray-400 uppercase tracking-wider mb-4">
            Precinto y Eslinga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Precinto ID
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={data.precintoId || ''}
                  onChange={handleInputChange('precintoId')}
                  disabled={disabled || !!precintoId}
                  placeholder="Se autocompleta al buscar"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400 font-mono",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-1">
                Tipo de Eslinga
              </label>
              <div className="flex space-x-6 mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.tipoEslinga?.larga || false}
                    onChange={handleCheckboxChange('larga')}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-300">Larga</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.tipoEslinga?.corta || false}
                    onChange={handleCheckboxChange('corta')}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-300">Corta</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-base font-medium text-gray-300 mb-1">
            Observaciones
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              value={data.observaciones || ''}
              onChange={handleInputChange('observaciones')}
              disabled={disabled}
              placeholder="Observaciones adicionales..."
              rows={3}
              className={cn(
                "w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "resize-none"
              )}
            />
          </div>
        </div>
      </div>

      {/* Required fields note */}
      <div className="mt-6 text-sm text-gray-400">
        * Campos obligatorios
      </div>
    </div>
  );
};