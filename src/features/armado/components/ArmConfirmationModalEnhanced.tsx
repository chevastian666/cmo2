import React from 'react';
import { 
  X, Package, AlertTriangle, CheckCircle, MapPin, Truck, User, 
  Building, CreditCard, Container, Globe, Home
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { Precinto } from '../../../types';

// Import the location names
const UBICACIONES: Record<string, string> = {
  '1': 'Puerto',
  '2': 'ZF Florida',
  '3': 'ZF Libertad',
  '4': 'Aeropuerto',
  '5': 'Chuy',
  '6': 'Rio Branco',
  '7': 'Aceguá',
  '8': 'Rivera',
  '9': 'Artigas',
  '10': 'Salto',
  '11': 'Fray Bentos',
  '12': 'Colonia',
  '13': 'ZF Colonia',
  '14': 'ZF Punta Pereira',
  '15': 'Paysandú',
  '16': 'Nueva Palmira',
  '17': 'ZF Rio Negro',
  '18': 'Bella Union',
  '19': 'ZF Fray Bentos',
  '20': 'ZF Nueva Helvecia',
  '21': "M' Bopicua",
  '22': 'Oficina',
  '23': 'Service',
  '24': 'En Viaje',
  '25': 'Tacuarembo',
  '26': 'Encomienda'
};

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

interface ArmConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  precinto: Precinto | null;
  transito: Partial<TransitoFormData>;
}

export const ArmConfirmationModalEnhanced: React.FC<ArmConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  precinto,
  transito
}) => {
  if (!isOpen || !precinto) return null;

  const hasWarnings = precinto.bateria < 20 || 
                      (Date.now() / 1000 - precinto.fechaUltimaLectura) > 3600 ||
                      precinto.eslinga.estado === 'violada';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-white">
                  Confirmar Armado de Precinto
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {/* Warnings */}
              {hasWarnings && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-400 mb-2">
                        Advertencias del Precinto
                      </p>
                      <ul className="space-y-1 text-sm text-yellow-300">
                        {precinto.bateria < 20 && (
                          <li>• Batería baja: {precinto.bateria}%</li>
                        )}
                        {(Date.now() / 1000 - precinto.fechaUltimaLectura) > 3600 && (
                          <li>• Sin reportar hace más de 1 hora</li>
                        )}
                        {precinto.eslinga.estado === 'violada' && (
                          <li>• Eslinga en estado violado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Precinto Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Información del Precinto
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Código:</span>
                      <span className="font-mono font-bold text-white">{precinto.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">{precinto.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className="text-white">{precinto.estado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Batería:</span>
                      <span className={cn(
                        "font-medium",
                        precinto.bateria < 20 ? "text-red-400" : 
                        precinto.bateria < 50 ? "text-yellow-400" : "text-green-400"
                      )}>
                        {precinto.bateria}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Datos del Viaje */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Datos del Viaje
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Tipo de Viaje</p>
                        <p className="text-sm font-medium text-white">
                          {transito.tipoViaje || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">DUA</p>
                        <p className="text-sm font-medium text-white">
                          {transito.dua || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Precinto ID</p>
                        <p className="text-sm font-medium text-white font-mono">
                          {transito.precintoId || precinto.codigo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos del Vehículo */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Datos del Vehículo
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Matrícula Tractor</p>
                        <p className="text-sm font-medium text-white uppercase">
                          {transito.matricula || 'No especificada'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Matrícula Remolque</p>
                        <p className="text-sm font-medium text-white uppercase">
                          {transito.matriculaRemolque || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">ID Contenedor</p>
                        <p className="text-sm font-medium text-white font-mono">
                          {transito.contenedorId || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos del Conductor */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Datos del Conductor
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Nombre Completo</p>
                        <p className="text-sm font-medium text-white">
                          {transito.nombreConductor || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Teléfono</p>
                        <p className="text-sm font-medium text-white">
                          {transito.telefonoConductor || 'No especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Tipo Documento</p>
                        <p className="text-sm font-medium text-white">
                          {transito.tipoDocumentoConductor || 'CI'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Número</p>
                        <p className="text-sm font-medium text-white">
                          {transito.numeroDocumentoConductor || 'No especificado'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <p className="text-sm font-medium text-white">
                          {transito.origenDocumentoConductor || 'UY'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos de la Empresa */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Datos de la Empresa
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Empresa Principal</p>
                          <p className="text-sm font-medium text-white">
                            {transito.empresa || 'No especificada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">RUT Principal</p>
                          <p className="text-sm font-medium text-white font-mono">
                            {transito.rutEmpresa || 'No especificado'}
                          </p>
                        </div>
                      </div>
                      {transito.empresaSecundaria && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-600">
                          <div>
                            <p className="text-xs text-gray-400">Empresa Secundaria</p>
                            <p className="text-sm font-medium text-white">
                              {transito.empresaSecundaria}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">RUT Secundario</p>
                            <p className="text-sm font-medium text-white font-mono">
                              {transito.rutEmpresaSecundaria || '-'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ruta y Ubicaciones */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ruta y Ubicaciones
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Origen</p>
                        <p className="text-sm font-medium text-white">
                          {UBICACIONES[transito.origen || ''] || transito.origen || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Destino</p>
                        <p className="text-sm font-medium text-white">
                          {UBICACIONES[transito.destino || ''] || transito.destino || 'No especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          <Home className="h-3 w-3 inline mr-1" />
                          Depósito Inicio
                        </p>
                        <p className="text-sm font-medium text-white">
                          {transito.depositoInicio || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          <Home className="h-3 w-3 inline mr-1" />
                          Depósito Destino
                        </p>
                        <p className="text-sm font-medium text-white">
                          {transito.depositoFin || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Información Adicional
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Tipo de Eslinga</p>
                      <p className="text-sm font-medium text-white">
                        {transito.tipoEslinga?.larga && 'Larga'}
                        {transito.tipoEslinga?.larga && transito.tipoEslinga?.corta && ' y '}
                        {transito.tipoEslinga?.corta && 'Corta'}
                        {!transito.tipoEslinga?.larga && !transito.tipoEslinga?.corta && 'No especificado'}
                      </p>
                    </div>
                    
                    {transito.observaciones && (
                      <div className="pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">Observaciones</p>
                        <p className="text-sm text-white">{transito.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Command Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Comando a Ejecutar
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <span className="text-green-400">$</span>
                    <span className="text-white ml-2">
                      precintocommand --activate --nqr={precinto.codigo} --tipo={transito.tipoViaje} 
                      --dua={transito.dua} --matricula={transito.matricula || 'NONE'}
                      --conductor={transito.numeroDocumentoConductor || 'NONE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                ¿Está seguro de que desea armar este precinto?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    "px-6 py-2 rounded-lg font-medium transition-colors",
                    "flex items-center space-x-2",
                    hasWarnings
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirmar Armado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};