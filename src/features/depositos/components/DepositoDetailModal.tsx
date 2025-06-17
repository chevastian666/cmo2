import React from 'react';
import { X, MapPin, Phone, Clock, Building2, Package, Activity, ExternalLink } from 'lucide-react';
import type { Deposito } from '../types';
import { cn } from '../../../utils/utils';

interface DepositoDetailModalProps {
  deposito: Deposito;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const DepositoDetailModal: React.FC<DepositoDetailModalProps> = ({
  deposito,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen) return null;

  const getCapacidadColor = (capacidad: number) => {
    if (capacidad >= 80) return 'text-red-400';
    if (capacidad >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCapacidadBgColor = (capacidad: number) => {
    if (capacidad >= 80) return 'bg-red-500';
    if (capacidad >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-white">{deposito.nombre}</h2>
                <p className="text-sm text-gray-400">Código: {deposito.codigo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Alias</p>
                <p className="text-white">{deposito.alias}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Tipo</p>
                <p className="text-white">{deposito.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Zona</p>
                <p className="text-white">{deposito.zona}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Padre</p>
                <p className="text-white">{deposito.padre}</p>
              </div>
              {deposito.empresa && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Empresa</p>
                  <p className="text-white">{deposito.empresa}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 mb-1">Estado</p>
                <span className={cn(
                  "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                  deposito.estado === 'activo'
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}>
                  {deposito.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            {(deposito.direccion || deposito.telefono) && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-white mb-3">Información de Contacto</h3>
                <div className="space-y-2">
                  {deposito.direccion && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{deposito.direccion}</span>
                    </div>
                  )}
                  {deposito.telefono && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{deposito.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <a
                      href={`https://www.google.com/maps?q=${deposito.lat},${deposito.lng}&z=17&hl=es`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Ver en Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Operating Hours */}
            {(deposito.horaApertura && deposito.horaCierre) && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-white mb-3">Horario de Operación</h3>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{deposito.horaApertura} - {deposito.horaCierre}</span>
                </div>
              </div>
            )}

            {/* Capacity */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Capacidad</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Ocupación actual</span>
                    <span className={cn("font-medium", getCapacidadColor(deposito.capacidad))}>
                      {deposito.capacidad}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all",
                        getCapacidadBgColor(deposito.capacidad)
                      )}
                      style={{ width: `${deposito.capacidad}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">Actividad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Tránsitos Activos</p>
                      <p className="text-2xl font-bold text-white">{deposito.transitosActivos}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                {deposito.precintosActivos !== undefined && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Precintos Activos</p>
                        <p className="text-2xl font-bold text-white">{deposito.precintosActivos}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};