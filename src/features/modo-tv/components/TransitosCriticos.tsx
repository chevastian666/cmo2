import React from 'react';
import { AlertOctagon, Truck, Clock, Phone } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { TransitoCritico } from '../types';

interface TransitosCriticosProps {
  criticos: TransitoCritico[];
}

export const TransitosCriticos: React.FC<TransitosCriticosProps> = ({ criticos }) => {
  const getColorNivel = (nivel: TransitoCritico['nivel']) => {
    switch (nivel) {
      case 'critico':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-600',
          text: 'text-red-400',
          badge: 'bg-red-600 text-white'
        };
      case 'alto':
        return {
          bg: 'bg-orange-900/30',
          border: 'border-orange-600',
          text: 'text-orange-400',
          badge: 'bg-orange-600 text-white'
        };
      case 'medio':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-600',
          text: 'text-yellow-400',
          badge: 'bg-yellow-600 text-black'
        };
      case 'bajo':
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-700',
          text: 'text-gray-400',
          badge: 'bg-gray-600 text-white'
        };
    }
  };

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `${horas}h ${minutos % 60}m`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-orange-900/50 px-6 py-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <AlertOctagon className="h-6 w-6 text-orange-400" />
          Tránsitos Críticos
        </h2>
      </div>

      {/* Lista de críticos */}
      <div className="flex-1 overflow-y-auto p-4">
        {criticos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertOctagon className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-lg text-gray-500">Sin tránsitos críticos</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {criticos.map((critico, index) => {
              const colores = getColorNivel(critico.nivel);
              return (
                <div
                  key={critico.id}
                  className={cn(
                    "p-5 rounded-lg border-2 transition-all duration-500",
                    colores.bg,
                    colores.border,
                    critico.nivel === 'critico' && "animate-pulse-border",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Truck className={cn("h-7 w-7", colores.text)} />
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {critico.matricula}
                        </h3>
                        {critico.chofer && (
                          <p className="text-sm text-gray-400">{critico.chofer}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-bold uppercase",
                      colores.badge
                    )}>
                      {critico.nivel}
                    </span>
                  </div>

                  {/* Ruta */}
                  <div className="text-sm text-gray-300 mb-3">
                    {critico.origen} → {critico.destino}
                  </div>

                  {/* Problema */}
                  <div className={cn(
                    "p-3 rounded-lg bg-black/30 border",
                    colores.border
                  )}>
                    <p className={cn("font-semibold text-lg mb-1", colores.text)}>
                      {critico.problema}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>En problema hace {formatearTiempo(critico.tiempoEnProblema)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acción requerida */}
                  {critico.accionRequerida && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Acción requerida:</span>
                      <div className="flex items-center gap-2">
                        {critico.nivel === 'critico' && (
                          <Phone className="h-5 w-5 text-red-400 animate-bounce" />
                        )}
                        <span className={cn(
                          "font-semibold",
                          critico.nivel === 'critico' ? 'text-red-400' : 'text-yellow-400'
                        )}>
                          {critico.accionRequerida}
                        </span>
                      </div>
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