import React from 'react';
import { Truck, Clock, MapPin, User } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { ProximoArribo } from '../types';

interface ProximosArribosProps {
  arribos: ProximoArribo[];
}

export const ProximosArribos: React.FC<ProximosArribosProps> = ({ arribos }) => {
  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const getColorSemaforo = (estado: ProximoArribo['estado']) => {
    switch (estado) {
      case 'verde':
        return 'bg-green-500';
      case 'amarillo':
        return 'bg-yellow-500';
      case 'rojo':
        return 'bg-red-500';
    }
  };

  const getColorFondo = (estado: ProximoArribo['estado'], index: number) => {
    if (estado === 'rojo') return 'bg-red-900/20 border-red-800';
    if (estado === 'amarillo' && index < 3) return 'bg-yellow-900/20 border-yellow-800';
    return 'bg-gray-800 border-gray-700';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-900/50 px-6 py-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Truck className="h-6 w-6" />
          Próximos Arribos
        </h2>
      </div>

      {/* Lista de arribos */}
      <div className="flex-1 overflow-hidden">
        {arribos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Truck className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No hay arribos programados</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {arribos.map((arribo, index) => (
              <div
                key={arribo.id}
                className={cn(
                  "px-6 py-4 transition-all duration-500",
                  getColorFondo(arribo.estado, index),
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  {/* Información principal */}
                  <div className="flex items-center gap-6">
                    {/* Semáforo */}
                    <div className="flex items-center justify-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full",
                        getColorSemaforo(arribo.estado),
                        arribo.estado === 'rojo' && "animate-pulse"
                      )} />
                    </div>

                    {/* Datos del camión */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-bold">{arribo.matricula}</h3>
                        {arribo.chofer && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <User className="h-5 w-5" />
                            <span className="text-lg">{arribo.chofer}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-lg text-gray-300">
                        <span>{arribo.origen}</span>
                        <span className="text-gray-600">→</span>
                        <span className="font-medium text-white">{arribo.puntoOperacion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tiempo y distancia */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <Clock className={cn(
                        "h-6 w-6",
                        arribo.minutosRestantes < 30 ? "text-yellow-500" : "text-gray-500"
                      )} />
                      <span className={cn(
                        "text-3xl font-bold font-mono",
                        arribo.minutosRestantes < 30 ? "text-yellow-400" : "text-white"
                      )}>
                        {formatearTiempo(arribo.minutosRestantes)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      ETA: {arribo.horaEstimadaArribo.toLocaleTimeString('es-UY', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {arribo.distanciaKm && (
                      <div className="flex items-center gap-1 justify-end text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{arribo.distanciaKm} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};