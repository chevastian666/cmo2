import React from 'react';
import { Battery, Radio, MapPin, Lock, LockOpen, ShieldAlert, Clock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatTimeAgo } from '../../../utils/formatters';
import type { Precinto } from '../../../types';

interface PrecintoStatusProps {
  precinto: Precinto;
}

export const PrecintoStatus: React.FC<PrecintoStatusProps> = ({ precinto }) => {
  const getBatteryColor = (level: number) => {
    if (level < 20) return 'text-red-400';
    if (level < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getEslingaStatus = () => {
    switch (precinto.eslinga.estado) {
      case 'cerrada':
        return {
          icon: <Lock className="h-4 w-4" />,
          text: 'Cerrada',
          color: 'text-green-400'
        };
      case 'abierta':
        return {
          icon: <LockOpen className="h-4 w-4" />,
          text: 'Abierta',
          color: 'text-yellow-400'
        };
      case 'violada':
        return {
          icon: <ShieldAlert className="h-4 w-4" />,
          text: 'Violada',
          color: 'text-red-400'
        };
    }
  };

  const timeSinceLastReport = Date.now() / 1000 - precinto.fechaUltimaLectura;
  const isOldReport = timeSinceLastReport > 3600; // More than 1 hour
  const eslingaStatus = getEslingaStatus();
  const hasWarnings = precinto.bateria < 20 || isOldReport || precinto.eslinga.estado === 'violada';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Estado del Precinto
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Código:</span>
          <span className="text-lg font-mono font-bold text-white">
            {precinto.codigo}
          </span>
        </div>
      </div>

      {/* Compact Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Battery */}
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Batería</span>
            <Battery className={cn('h-4 w-4', getBatteryColor(precinto.bateria))} />
          </div>
          <p className={cn('text-lg font-bold', getBatteryColor(precinto.bateria))}>
            {precinto.bateria}%
          </p>
        </div>

        {/* GPS */}
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">GPS</span>
            <Radio className={cn(
              'h-4 w-4',
              precinto.gps.activo ? 'text-green-400' : 'text-red-400'
            )} />
          </div>
          <p className={cn(
            'text-lg font-bold',
            precinto.gps.activo ? 'text-green-400' : 'text-red-400'
          )}>
            {precinto.gps.activo ? 'Activo' : 'Inactivo'}
          </p>
        </div>

        {/* Eslinga */}
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Eslinga</span>
            <div className={eslingaStatus.color}>
              {eslingaStatus.icon}
            </div>
          </div>
          <p className={cn('text-lg font-bold', eslingaStatus.color)}>
            {eslingaStatus.text}
          </p>
        </div>

        {/* Last Report */}
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Último Rep.</span>
            <Clock className={cn(
              'h-4 w-4',
              isOldReport ? 'text-orange-400' : 'text-gray-400'
            )} />
          </div>
          <p className={cn(
            'text-sm font-medium',
            isOldReport ? 'text-orange-400' : 'text-white'
          )}>
            {formatTimeAgo(precinto.fechaUltimaLectura)}
          </p>
        </div>
      </div>

      {/* Location - Compact */}
      <div className="mt-3 p-3 bg-gray-700 rounded flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">
            {(precinto.ubicacionActual?.direccion || precinto.ubicacion?.direccion) || 
             'Ubicación desconocida'}
          </p>
        </div>
      </div>

      {/* Warnings - Compact */}
      {hasWarnings && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-800 rounded flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-400 space-y-0.5">
            {precinto.bateria < 20 && (
              <p>• Batería baja ({precinto.bateria}%)</p>
            )}
            {isOldReport && (
              <p>• Sin reportar hace más de 1 hora</p>
            )}
            {precinto.eslinga.estado === 'violada' && (
              <p>• Eslinga violada - Inspección requerida</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};