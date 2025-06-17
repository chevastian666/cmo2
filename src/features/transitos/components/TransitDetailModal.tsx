import React from 'react';
import { X, Truck, User, Building, MapPin, Package, Clock, AlertTriangle, Phone } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { TransitStatus } from './TransitStatus';
import type { Transito } from '../types';

interface TransitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transito: Transito;
}

export const TransitDetailModal: React.FC<TransitDetailModalProps> = ({
  isOpen,
  onClose,
  transito
}) => {
  if (!isOpen) return null;

  const progressPercentage = transito.progreso || 0;

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
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2 sm:space-x-3 max-w-[calc(100%-3rem)]">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  Detalle del Tránsito - DUA {transito.dua}
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
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Estado y Progreso */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Estado del Tránsito
                    </h3>
                    <TransitStatus estado={transito.estado} />
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{transito.origen}</span>
                    <span>{progressPercentage}%</span>
                    <span>{transito.destino}</span>
                  </div>
                </div>

                {/* Información General */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Información General
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">DUA</p>
                      <p className="text-white font-medium">{transito.dua}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Precinto</p>
                      <p className="text-white font-mono">{transito.precinto}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fecha de Salida</p>
                      <p className="text-white">{new Date(transito.fechaSalida).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">ETA</p>
                      <p className="text-white">
                        {transito.eta ? new Date(transito.eta).toLocaleString() : 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Matrícula</p>
                      <p className="text-white">{transito.matricula}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Encargado</p>
                      <p className="text-white">{transito.encargado}</p>
                    </div>
                  </div>
                </div>

                {/* Conductor */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Información del Conductor
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                    <User className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{transito.chofer}</p>
                      {transito.telefonoConductor && (
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {transito.telefonoConductor}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Empresa */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Empresa
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                    <Building className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{transito.empresa}</p>
                    </div>
                  </div>
                </div>

                {/* Ruta */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Ruta
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-xs text-gray-400">Origen</p>
                          <p className="text-white">{transito.origen}</p>
                        </div>
                      </div>
                      <div className="flex-1 mx-4 border-t border-dashed border-gray-600" />
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Destino</p>
                          <p className="text-white">{transito.destino}</p>
                        </div>
                        <MapPin className="h-5 w-5 text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertas */}
                {transito.alertas && transito.alertas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Alertas Activas
                    </h3>
                    <div className="space-y-2">
                      {transito.alertas.map((alerta, index) => (
                        <div key={index} className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-300">{alerta}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {transito.observaciones && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Observaciones
                    </h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-300">{transito.observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Última actualización: {new Date().toLocaleString()}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};