import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { AlertaTV } from '../types';
import { TIPOS_ALERTA_TV } from '../types';

interface AlertasActivasProps {
  alertas: AlertaTV[];
}

export const AlertasActivas: React.FC<AlertasActivasProps> = ({ alertas }) => {
  const getColorNivel = (nivel: AlertaTV['nivel']) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-900/50 border-red-700 text-red-300';
      case 'alto':
        return 'bg-orange-900/50 border-orange-700 text-orange-300';
      case 'medio':
        return 'bg-yellow-900/50 border-yellow-700 text-yellow-300';
      case 'bajo':
        return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };

  const formatearTiempoTranscurrido = (fecha: Date): string => {
    const ahora = new Date();
    const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
    
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas}h`;
    
    return `Hace ${Math.floor(horas / 24)}d`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-red-900/50 px-6 py-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          Alertas Activas
          {alertas.length > 0 && (
            <span className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {alertas.length}
            </span>
          )}
        </h2>
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto">
        {alertas.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-lg text-gray-500">Sin alertas activas</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {alertas.map((alerta, index) => {
              const tipoInfo = TIPOS_ALERTA_TV[alerta.tipo];
              return (
                <div
                  key={alerta.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    getColorNivel(alerta.nivel),
                    "animate-slide-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header de alerta */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tipoInfo.icono}</span>
                      <div>
                        <h4 className="font-semibold text-lg">{tipoInfo.texto}</h4>
                        <p className="text-sm opacity-75">
                          Tránsito: {alerta.transitoAfectado}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm opacity-75">
                      <Clock className="h-4 w-4" />
                      <span>{formatearTiempoTranscurrido(alerta.hora)}</span>
                    </div>
                  </div>
                  
                  {/* Descripción */}
                  <p className="text-sm leading-relaxed">
                    {alerta.descripcion}
                  </p>
                  
                  {/* Indicador de criticidad */}
                  {alerta.nivel === 'critico' && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Requiere atención inmediata
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};