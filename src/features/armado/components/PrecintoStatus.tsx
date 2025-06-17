import React from 'react';
import { Battery, Radio, MapPin, Lock, LockOpen, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatTimeAgo, formatDateTime } from '../../../utils/formatters';
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

  const getBatteryIcon = (level: number) => {
    return (
      <div className="relative">
        <Battery className={cn('h-6 w-6', getBatteryColor(level))} />
        {level < 20 && (
          <AlertTriangle className="h-3 w-3 text-red-400 absolute -top-1 -right-1" />
        )}
      </div>
    );
  };

  const getEslingaStatus = () => {
    switch (precinto.eslinga.estado) {
      case 'cerrada':
        return {
          icon: <Lock className="h-5 w-5" />,
          text: 'Cerrada',
          color: 'text-green-400',
          bg: 'bg-green-900/20'
        };
      case 'abierta':
        return {
          icon: <LockOpen className="h-5 w-5" />,
          text: 'Abierta',
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20'
        };
      case 'violada':
        return {
          icon: <ShieldAlert className="h-5 w-5" />,
          text: 'Violada',
          color: 'text-red-400',
          bg: 'bg-red-900/20'
        };
    }
  };

  const timeSinceLastReport = Date.now() / 1000 - precinto.fechaUltimaLectura;
  const isOldReport = timeSinceLastReport > 3600; // More than 1 hour
  const eslingaStatus = getEslingaStatus();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          Estado del Precinto
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Código:</span>
          <span className="text-lg font-mono font-bold text-white">
            {precinto.codigo}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Battery Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Batería</span>
            {getBatteryIcon(precinto.bateria)}
          </div>
          <div>
            <p className={cn('text-2xl font-bold', getBatteryColor(precinto.bateria))}>
              {precinto.bateria}%
            </p>
            {precinto.bateria < 20 && (
              <p className="text-xs text-red-400 mt-1">Nivel crítico</p>
            )}
          </div>
        </div>

        {/* GPS Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">GPS</span>
            <Radio className={cn(
              'h-6 w-6',
              precinto.gps.activo ? 'text-green-400' : 'text-red-400'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-2xl font-bold',
              precinto.gps.activo ? 'text-green-400' : 'text-red-400'
            )}>
              {precinto.gps.activo ? 'Activo' : 'Inactivo'}
            </p>
            {precinto.gps.satelites !== undefined && (
              <p className="text-xs text-gray-400 mt-1">
                {precinto.gps.satelites} satélites
              </p>
            )}
          </div>
        </div>

        {/* Eslinga Status */}
        <div className={cn('rounded-lg p-4', eslingaStatus.bg)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Eslinga</span>
            <div className={eslingaStatus.color}>
              {eslingaStatus.icon}
            </div>
          </div>
          <div>
            <p className={cn('text-2xl font-bold', eslingaStatus.color)}>
              {eslingaStatus.text}
            </p>
            {precinto.eslinga.estado === 'violada' && (
              <p className="text-xs text-red-400 mt-1">¡Alerta!</p>
            )}
          </div>
        </div>

        {/* Last Report */}
        <div className={cn(
          'rounded-lg p-4',
          isOldReport ? 'bg-orange-900/20' : 'bg-gray-700'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Último Reporte</span>
            <Clock className={cn(
              'h-6 w-6',
              isOldReport ? 'text-orange-400' : 'text-gray-400'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-sm font-medium',
              isOldReport ? 'text-orange-400' : 'text-white'
            )}>
              {formatTimeAgo(precinto.fechaUltimaLectura)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(precinto.fechaUltimaLectura)}
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Ubicación Actual</p>
            <p className="text-sm text-gray-400 mt-1">
              {(precinto.ubicacionActual?.direccion || precinto.ubicacion?.direccion) || 
               (precinto.ubicacionActual ? 
                 `${precinto.ubicacionActual.lat.toFixed(6)}, ${precinto.ubicacionActual.lng.toFixed(6)}` :
                 precinto.ubicacion ? 
                 `${precinto.ubicacion.lat.toFixed(6)}, ${precinto.ubicacion.lng.toFixed(6)}` : 
                 'Desconocida')}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-sm">
          <span className="text-gray-400">Tipo:</span>
          <span className="ml-2 text-white font-medium">{precinto.tipo}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Estado:</span>
          <span className="ml-2 text-white font-medium">{precinto.estado}</span>
        </div>
        {precinto.viaje && (
          <div className="text-sm">
            <span className="text-gray-400">Viaje:</span>
            <span className="ml-2 text-white font-medium">{precinto.viaje}</span>
          </div>
        )}
        {precinto.mov && (
          <div className="text-sm">
            <span className="text-gray-400">MOV:</span>
            <span className="ml-2 text-white font-medium">{precinto.mov}</span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {(precinto.bateria < 20 || isOldReport || precinto.eslinga.estado === 'violada') && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="space-y-1">
              {precinto.bateria < 20 && (
                <p className="text-sm text-yellow-400">
                  • Batería baja - Considere reemplazar el precinto
                </p>
              )}
              {isOldReport && (
                <p className="text-sm text-yellow-400">
                  • Sin reportar hace más de 1 hora - Verifique conectividad
                </p>
              )}
              {precinto.eslinga.estado === 'violada' && (
                <p className="text-sm text-yellow-400">
                  • Eslinga violada - Requiere inspección inmediata
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};