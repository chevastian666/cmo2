import React from 'react';
import { AlertTriangle, TrendingUp, Truck, Clock } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { CongestionAnalysis } from '../types';

interface CongestionAlertProps {
  congestion: CongestionAnalysis;
  onClick?: () => void;
  compact?: boolean;
}

export const CongestionAlert: React.FC<CongestionAlertProps> = ({ 
  congestion, 
  onClick,
  compact = false 
}) => {
  const getSeverityStyles = () => {
    switch (congestion.severidad) {
      case 'critica':
        return {
          bg: 'bg-red-900/20',
          border: 'border-red-600',
          icon: 'text-red-500',
          text: 'text-red-400',
          pulse: 'animate-pulse'
        };
      case 'alta':
        return {
          bg: 'bg-orange-900/20',
          border: 'border-orange-600',
          icon: 'text-orange-500',
          text: 'text-orange-400',
          pulse: 'animate-pulse-slow'
        };
      case 'media':
        return {
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-600',
          icon: 'text-yellow-500',
          text: 'text-yellow-400',
          pulse: ''
        };
      default:
        return {
          bg: 'bg-blue-900/20',
          border: 'border-blue-600',
          icon: 'text-blue-500',
          text: 'text-blue-400',
          pulse: ''
        };
    }
  };

  const styles = getSeverityStyles();
  const timeRange = `${congestion.ventanaInicio.toLocaleTimeString('es-UY', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${congestion.ventanaFin.toLocaleTimeString('es-UY', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
          styles.bg,
          styles.border,
          styles.pulse,
          "hover:scale-105 cursor-pointer"
        )}
      >
        <AlertTriangle className={cn("h-4 w-4", styles.icon)} />
        <div className="text-left">
          <p className={cn("text-sm font-medium", styles.text)}>
            {congestion.destino}
          </p>
          <p className="text-xs text-gray-400">
            {congestion.cantidadCamiones} camiones • {timeRange}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border transition-all",
        styles.bg,
        styles.border,
        styles.pulse,
        onClick && "hover:scale-[1.02] cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", styles.bg)}>
            <TrendingUp className={cn("h-5 w-5", styles.icon)} />
          </div>
          <div>
            <h4 className={cn("font-semibold text-lg", styles.text)}>
              Congestión en {congestion.destino}
            </h4>
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {timeRange}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold", styles.text)}>
            {congestion.cantidadCamiones}
          </p>
          <p className="text-xs text-gray-400">camiones</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-400 font-medium">Camiones aproximándose:</p>
        <div className="grid grid-cols-2 gap-2">
          {congestion.camiones.slice(0, 4).map(camion => (
            <div key={camion.id} className="flex items-center gap-2 text-sm">
              <Truck className="h-3 w-3 text-gray-500" />
              <span className="text-gray-300">{camion.matricula}</span>
              <span className="text-gray-500">
                {camion.eta.toLocaleTimeString('es-UY', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          ))}
        </div>
        {congestion.camiones.length > 4 && (
          <p className="text-xs text-gray-500 italic">
            y {congestion.camiones.length - 4} más...
          </p>
        )}
      </div>
    </div>
  );
};