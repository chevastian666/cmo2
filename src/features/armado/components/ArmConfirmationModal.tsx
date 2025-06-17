import React from 'react';
import { X, Package, AlertTriangle, CheckCircle, MapPin, Truck, User } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { Precinto } from '../../../types';

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

interface ArmConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  precinto: Precinto | null;
  transito: Partial<TransitoFormData>;
}

export const ArmConfirmationModal: React.FC<ArmConfirmationModalProps> = ({
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
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
            <div className="p-6 overflow-y-auto max-h-[60vh]">
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

                {/* Transit Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Datos del Tránsito
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    {/* Vehicle */}
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Vehículo</p>
                        <p className="text-white">
                          {transito.matricula || 'No especificada'}
                        </p>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Conductor</p>
                        <p className="text-white">
                          {transito.nombreConductor || 'No especificado'} 
                          {transito.telefonoConductor && ` - Tel: ${transito.telefonoConductor}`}
                        </p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Ruta</p>
                        <p className="text-white">
                          {transito.origen || 'Origen'} → {transito.destino || 'Destino'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-gray-600 space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Empresa</p>
                        <p className="text-white">{transito.empresa || 'No especificada'}</p>
                        {transito.rutEmpresa && (
                          <p className="text-sm text-gray-400">RUT: {transito.rutEmpresa}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Tipo de Eslinga</p>
                        <p className="text-white">
                          {transito.tipoEslinga?.larga && 'Larga'}
                          {transito.tipoEslinga?.larga && transito.tipoEslinga?.corta && ' y '}
                          {transito.tipoEslinga?.corta && 'Corta'}
                          {!transito.tipoEslinga?.larga && !transito.tipoEslinga?.corta && 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {transito.observaciones && (
                      <div className="pt-3 border-t border-gray-600">
                        <p className="text-sm text-gray-400 mb-1">Observaciones</p>
                        <p className="text-white text-sm">{transito.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Command Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Comando a Ejecutar
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    <span className="text-green-400">$</span>
                    <span className="text-white ml-2">
                      precintocommand --activate --nqr={precinto.codigo} --matricula={transito.matricula || 'NONE'}
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