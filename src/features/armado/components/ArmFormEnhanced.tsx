import React, { useEffect } from 'react';
import { 
  Truck, User, Building, MapPin, FileText, Phone, Hash, Package,
  CreditCard, Globe, Home, Container
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { ORIGENES_DESTINOS } from '../../../constants/locations';

// Empresas con RUT (from original system)
const EMPRESAS = [
  { nombre: 'EDELAR SA (BlockTracker)', rut: '211107380011' },
  { nombre: 'FOCUS SRL', rut: '12312312' },
  { nombre: 'KICKNERDS SRL', rut: '217604440011' },
  { nombre: 'JORGE CARRION', rut: '210842450017' },
  { nombre: 'LUIS LAUREIRO', rut: '213868210018' },
  { nombre: 'SELEFYR S.A.', rut: '214613390019' },
  { nombre: 'GUSTAVO JORGE NICOLA', rut: '213595470011' },
  { nombre: 'José María Facal y Cia', rut: '210213950014' },
  { nombre: 'CALVELO PENEN JOSE LUIS', rut: '211028000011' },
  { nombre: 'Jaume y Seré Ltda', rut: '210167570013' },
  { nombre: 'NAVATTA MANZONI CESAR HUGO', rut: '216784640016' },
  { nombre: 'BARAZA VELAZQUEZ JUAN JOSE', rut: '211754980012' },
  { nombre: 'DIAZ BUELA PABLO CESAR', rut: '217376010018' },
  { nombre: 'ALVARO GIOSA', rut: '214415470016' },
  { nombre: 'ADINOLFI SEVERI GUSTAVO ALBERTO', rut: '211917860010' },
  { nombre: 'Montes de Plata', rut: '124121414' },
  { nombre: 'TURCHII SANCHEZ JUAN ALBERTO', rut: '211867340019' },
  { nombre: 'VILAS FERNANDEZ RAMON WALTER', rut: '216986640017' },
  { nombre: 'DEPAULO MARTINEZ MARIELA', rut: '215778490018' },
  { nombre: 'GONZALEZ Y CIA LTDA', rut: '210239830016' }
];

// Depósitos organizados por ubicación
const DEPOSITOS = [
  // Puerto (1)
  { id: '1512', nombre: 'Mitracont cont', ubicacion: '1' },
  { id: '1605', nombre: 'Buquebus Puerto', ubicacion: '1' },
  { id: '1607', nombre: 'Depositos Montevideo', ubicacion: '1' },
  { id: '1617', nombre: 'Zeinal Buquebus', ubicacion: '1' },
  { id: '1630', nombre: 'Obrinel', ubicacion: '1' },
  { id: '1631', nombre: 'Bomport cont', ubicacion: '1' },
  { id: '1669', nombre: 'TCP', ubicacion: '1' },
  { id: '1693', nombre: 'Montecon', ubicacion: '1' },
  { id: '1708', nombre: 'Planir', ubicacion: '1' },
  { id: '1614', nombre: 'Rilcomar', ubicacion: '1' },
  { id: '1923', nombre: 'Rilcomar', ubicacion: '1' },
  { id: '1909', nombre: 'Taminer', ubicacion: '1' },
  { id: '1937', nombre: 'Briasol', ubicacion: '1' },
  { id: '1907', nombre: 'Murchison', ubicacion: '1' },
  { id: '1925', nombre: 'Rincorando', ubicacion: '1' },
  // ZF Florida (2)
  { id: '2001', nombre: 'Deposito ZF Florida 1', ubicacion: '2' },
  // ZF Libertad (3)
  { id: '3001', nombre: 'Deposito ZF Libertad 1', ubicacion: '3' },
  // Otros depósitos
  { id: '1832', nombre: 'URUGUAYAN MARINE SAFETY', ubicacion: '1' },
  { id: '1675', nombre: 'Encatex', ubicacion: '1' },
  { id: '1947', nombre: 'Fadimax', ubicacion: '1' },
  { id: '1635', nombre: 'Bomport Contenedores', ubicacion: '1' },
  { id: '1673', nombre: 'Tebetur', ubicacion: '1' },
];

// Ubicaciones (plid)
const UBICACIONES = [
  { id: '1', nombre: 'Puerto' },
  { id: '2', nombre: 'ZF Florida' },
  { id: '3', nombre: 'ZF Libertad' },
  { id: '4', nombre: 'Aeropuerto' },
  { id: '5', nombre: 'Chuy' },
  { id: '6', nombre: 'Rio Branco' },
  { id: '7', nombre: 'Aceguá' },
  { id: '8', nombre: 'Rivera' },
  { id: '9', nombre: 'Artigas' },
  { id: '10', nombre: 'Salto' },
  { id: '11', nombre: 'Fray Bentos' },
  { id: '12', nombre: 'Colonia' },
  { id: '13', nombre: 'ZF Colonia' },
  { id: '14', nombre: 'ZF Punta Pereira' },
  { id: '15', nombre: 'Paysandú' },
  { id: '16', nombre: 'Nueva Palmira' },
  { id: '17', nombre: 'ZF Rio Negro' },
  { id: '18', nombre: 'Bella Union' },
  { id: '19', nombre: 'ZF Fray Bentos' },
  { id: '20', nombre: 'ZF Nueva Helvecia' },
  { id: '21', nombre: "M' Bopicua" },
  { id: '22', nombre: 'Oficina' },
  { id: '23', nombre: 'Service' },
  { id: '24', nombre: 'En Viaje' },
  { id: '25', nombre: 'Tacuarembo' },
  { id: '26', nombre: 'Encomienda' }
];

// Tipos de documento
const TIPOS_DOCUMENTO = [
  { codigo: 'CI', nombre: 'Cédula de Identidad' },
  { codigo: 'PAS', nombre: 'Pasaporte' },
  { codigo: 'RUT', nombre: 'RUT' },
  { codigo: 'DNI', nombre: 'DNI' },
  { codigo: 'OTRO', nombre: 'Otro' }
];

// Países para origen del documento
const PAISES_DOCUMENTO = [
  { codigo: 'UY', nombre: 'Uruguay' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'BR', nombre: 'Brasil' },
  { codigo: 'PY', nombre: 'Paraguay' },
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'BO', nombre: 'Bolivia' },
  { codigo: 'PE', nombre: 'Perú' },
  { codigo: 'EC', nombre: 'Ecuador' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'VE', nombre: 'Venezuela' }
];

interface TransitoFormData {
  // Datos del viaje
  precintoId: string;
  tipoViaje: 'Tránsito' | 'GEX' | 'Monitoreo externo' | '';
  dua: string;
  
  // Datos del vehículo
  matricula: string;
  matriculaRemolque: string;
  contenedorId: string;
  
  // Datos del conductor
  nombreConductor: string;
  tipoDocumentoConductor: string;
  numeroDocumentoConductor: string;
  origenDocumentoConductor: string;
  telefonoConductor: string;
  
  // Datos de la empresa
  empresa: string;
  rutEmpresa: string;
  empresaSecundaria?: string;
  rutEmpresaSecundaria?: string;
  
  // Ruta y ubicaciones
  origen: string;
  destino: string;
  depositoInicio: string;
  depositoFin: string;
  
  // Eslinga y observaciones
  tipoEslinga: {
    larga: boolean;
    corta: boolean;
  };
  observaciones: string;
}

interface ArmFormProps {
  data: Partial<TransitoFormData>;
  onChange: (field: string, value: any) => void;
  disabled?: boolean;
  precintoId?: string;
}

export const ArmFormEnhanced: React.FC<ArmFormProps> = ({ data, onChange, disabled = false, precintoId }) => {
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
    if (data.rutEmpresa && data.rutEmpresa.length >= 11) {
      const empresa = EMPRESAS.find(e => e.rut === data.rutEmpresa);
      if (empresa && data.empresa !== empresa.nombre) {
        onChange('empresa', empresa.nombre);
      }
    }
  }, [data.rutEmpresa]);

  // Filter depositos based on selected ubicacion
  const getDepositosByUbicacion = (ubicacionId: string) => {
    if (!ubicacionId) return DEPOSITOS;
    return DEPOSITOS.filter(d => d.ubicacion === ubicacionId);
  };

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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
      {/* Sección 1: Datos del Viaje */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          Datos del Viaje
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Tipo de Viaje *
            </label>
            <select
              value={data.tipoViaje || ''}
              onChange={handleInputChange('tipoViaje')}
              disabled={disabled}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            >
              <option value="">Seleccionar tipo...</option>
              <option value="Tránsito">Tránsito</option>
              <option value="GEX">GEX</option>
              <option value="Monitoreo externo">Monitoreo externo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              DUA *
            </label>
            <input
              type="text"
              value={data.dua || ''}
              onChange={handleInputChange('dua')}
              disabled={disabled}
              placeholder="Ej: 2024-123456"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Precinto ID
            </label>
            <input
              type="text"
              value={data.precintoId || ''}
              onChange={handleInputChange('precintoId')}
              disabled={disabled || !!precintoId}
              placeholder="Se autocompleta al buscar"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400 font-mono",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Datos del Vehículo */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-500" />
          Datos del Vehículo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Matrícula Tractor *
            </label>
            <input
              type="text"
              value={data.matricula || ''}
              onChange={handleInputChange('matricula')}
              disabled={disabled}
              placeholder="ABC 1234"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400 uppercase",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Matrícula Remolque
            </label>
            <input
              type="text"
              value={data.matriculaRemolque || ''}
              onChange={handleInputChange('matriculaRemolque')}
              disabled={disabled}
              placeholder="DEF 5678"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400 uppercase",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              <Container className="h-3 w-3 inline mr-1" />
              ID Contenedor
            </label>
            <input
              type="text"
              value={data.contenedorId || ''}
              onChange={handleInputChange('contenedorId')}
              disabled={disabled}
              placeholder="ABCD1234567"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400 uppercase font-mono",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Datos del Conductor */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Datos del Conductor
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Tipo Documento *
              </label>
              <select
                value={data.tipoDocumentoConductor || 'CI'}
                onChange={handleInputChange('tipoDocumentoConductor')}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                required
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo.codigo} value={tipo.codigo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                <Globe className="h-3 w-3 inline mr-1" />
                País
              </label>
              <select
                value={data.origenDocumentoConductor || 'UY'}
                onChange={handleInputChange('origenDocumentoConductor')}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {PAISES_DOCUMENTO.map((pais) => (
                  <option key={pais.codigo} value={pais.codigo}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              value={data.numeroDocumentoConductor || ''}
              onChange={handleInputChange('numeroDocumentoConductor')}
              disabled={disabled}
              placeholder="12345678"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={data.nombreConductor || ''}
              onChange={handleInputChange('nombreConductor')}
              disabled={disabled}
              placeholder="Juan Pérez García"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              <Phone className="h-3 w-3 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              value={data.telefonoConductor || ''}
              onChange={handleInputChange('telefonoConductor')}
              disabled={disabled}
              placeholder="099 123 456"
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>
        </div>
      </div>

      {/* Sección 4: Datos de la Empresa */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-500" />
          Datos de la Empresa
        </h2>
        
        <div className="space-y-4">
          {/* Empresa Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Empresa Principal *
              </label>
              <select
                value={data.empresa || ''}
                onChange={handleInputChange('empresa')}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
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

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                RUT Principal *
              </label>
              <input
                type="text"
                value={data.rutEmpresa || ''}
                onChange={handleInputChange('rutEmpresa')}
                disabled={disabled}
                placeholder="211234567890"
                maxLength={12}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white placeholder-gray-400 font-mono",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                required
              />
            </div>
          </div>

          {/* Empresa Secundaria (Opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Empresa Secundaria
              </label>
              <select
                value={data.empresaSecundaria || ''}
                onChange={handleInputChange('empresaSecundaria')}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <option value="">Sin empresa secundaria...</option>
                {EMPRESAS.map((empresa) => (
                  <option key={empresa.rut} value={empresa.nombre}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                RUT Secundario
              </label>
              <input
                type="text"
                value={data.rutEmpresaSecundaria || ''}
                onChange={handleInputChange('rutEmpresaSecundaria')}
                disabled={disabled}
                placeholder="211234567890"
                maxLength={12}
                className={cn(
                  "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                  "text-sm text-white placeholder-gray-400 font-mono",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 5: Ruta y Ubicaciones */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          Ruta y Ubicaciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origen y Destino */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Ubicación de Origen *
            </label>
            <select
              value={data.origen || ''}
              onChange={handleInputChange('origen')}
              disabled={disabled}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            >
              <option value="">Seleccionar ubicación...</option>
              {UBICACIONES.map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Ubicación de Destino *
            </label>
            <select
              value={data.destino || ''}
              onChange={handleInputChange('destino')}
              disabled={disabled}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            >
              <option value="">Seleccionar ubicación...</option>
              {UBICACIONES.map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Depósitos */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              <Home className="h-3 w-3 inline mr-1" />
              Depósito de Inicio
            </label>
            <select
              value={data.depositoInicio || ''}
              onChange={handleInputChange('depositoInicio')}
              disabled={disabled || !data.origen}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <option value="">Sin depósito específico...</option>
              {getDepositosByUbicacion(data.origen || '').map((deposito) => (
                <option key={deposito.id} value={deposito.id}>
                  {deposito.id} - {deposito.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              <Home className="h-3 w-3 inline mr-1" />
              Depósito de Destino *
            </label>
            <select
              value={data.depositoFin || ''}
              onChange={handleInputChange('depositoFin')}
              disabled={disabled || !data.destino}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            >
              <option value="">Seleccionar depósito...</option>
              {getDepositosByUbicacion(data.destino || '').map((deposito) => (
                <option key={deposito.id} value={deposito.id}>
                  {deposito.id} - {deposito.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sección 6: Eslinga y Observaciones */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Información Adicional
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Tipo de Eslinga *
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.tipoEslinga?.larga || false}
                  onChange={handleCheckboxChange('larga')}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Eslinga Larga</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.tipoEslinga?.corta || false}
                  onChange={handleCheckboxChange('corta')}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Eslinga Corta</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Observaciones
            </label>
            <textarea
              value={data.observaciones || ''}
              onChange={handleInputChange('observaciones')}
              disabled={disabled}
              placeholder="Observaciones adicionales..."
              rows={3}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded",
                "text-sm text-white placeholder-gray-400",
                "focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "resize-none"
              )}
            />
          </div>
        </div>
      </div>

      {/* Required fields note */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
        * Campos obligatorios
      </div>
    </div>
  );
};