import React from 'react';
import { X, MapPin, Phone, Battery, Wifi, Link2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { PrecintoStatusBadge } from './PrecintoStatusBadge';
import { BatteryIndicator } from './BatteryIndicator';
import { SignalIndicator } from './SignalIndicator';
import type { Precinto } from '../types';

interface PrecintoDetailModalProps {
  precinto: Precinto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrecintoDetailModal: React.FC<PrecintoDetailModalProps> = ({
  precinto,
  isOpen,
  onClose
}) => {
  if (!isOpen || !precinto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Precinto #{precinto.id}
            </h2>
            <p className="text-lg text-gray-400 mt-1">Serie: {precinto.nserie}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Estado</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between">
              <PrecintoStatusBadge status={precinto.status} size="lg" />
              {precinto.status === 3 && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-base">Requiere atención inmediata</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical details */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Información Técnica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Battery className="h-4 w-4" />
                  <span className="text-base">Batería</span>
                </div>
                <BatteryIndicator level={precinto.bateria} size="lg" />
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-base">Señal</span>
                </div>
                <SignalIndicator strength={precinto.signal} size="lg" showValue />
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Link2 className="h-4 w-4" />
                  <span className="text-base">Eslinga</span>
                </div>
                <span className="text-white font-medium">
                  {precinto.eslinga ? 'Conectada' : 'No conectada'}
                </span>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-base">Muestreo</span>
                </div>
                <span className="text-white font-medium">
                  Local: {precinto.muestreoLocal}s / Servidor: {precinto.muestreoServidor}s
                </span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Comunicación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-base">Teléfono Principal</span>
                </div>
                <span className="text-white font-medium">{precinto.telefono}</span>
              </div>
              {precinto.telefono2 && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-base">Teléfono Secundario</span>
                  </div>
                  <span className="text-white font-medium">{precinto.telefono2}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location and assignment */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Asignación</h3>
            <div className="space-y-4">
              {precinto.ubicacion && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-base">Ubicación</span>
                  </div>
                  <span className="text-white font-medium">{precinto.ubicacion}</span>
                </div>
              )}
              {precinto.empresa && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span className="text-base">Empresa</span>
                  </div>
                  <span className="text-white font-medium">{precinto.empresa}</span>
                </div>
              )}
              {precinto.asignadoTransito && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span className="text-base">Tránsito Asignado</span>
                  </div>
                  <span className="text-white font-medium">{precinto.asignadoTransito}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Historial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-base">Fecha Activación</span>
                </div>
                <span className="text-white font-medium">
                  {precinto.fechaActivacion ? new Date(precinto.fechaActivacion).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-base">Último Reporte</span>
                </div>
                <span className="text-white font-medium">
                  {precinto.ultimoReporte || 'Sin reportes'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Identificación</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">NQR:</span>
                <span className="text-white font-mono">{precinto.nqr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono">{precinto.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">N° Serie:</span>
                <span className="text-white font-mono">{precinto.nserie}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};