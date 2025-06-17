import React, { useState, useEffect } from 'react';
import { BarChart, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui';
import { congestionAnalyzer } from '../utils/congestionAnalyzer';
import { cn } from '../../../utils/utils';
import type { TransitoTorreControl } from '../../torre-control/types';
import type { ProyeccionPorHora } from '../types';

interface ProyeccionTimelineProps {
  transitos: TransitoTorreControl[];
  className?: string;
  destinosDestacados?: string[];
}

export const ProyeccionTimeline: React.FC<ProyeccionTimelineProps> = ({
  transitos,
  className,
  destinosDestacados = ['TCP', 'Montecon']
}) => {
  const [proyeccion, setProyeccion] = useState<ProyeccionPorHora[]>([]);
  const [maxCamiones, setMaxCamiones] = useState(0);

  useEffect(() => {
    const data = congestionAnalyzer.generarProyeccionPorHora(transitos);
    setProyeccion(data);
    
    // Calcular máximo para escala
    const max = Math.max(...data.flatMap(p => 
      p.destinos.map(d => d.cantidad)
    ), 0);
    setMaxCamiones(max || 10);
  }, [transitos]);

  const getBarHeight = (cantidad: number) => {
    return `${(cantidad / maxCamiones) * 100}%`;
  };

  const getBarColor = (cantidad: number) => {
    if (cantidad >= 8) return 'bg-red-500';
    if (cantidad >= 5) return 'bg-orange-500';
    if (cantidad >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Proyección de Carga Operativa
              </h3>
              <p className="text-sm text-gray-400">
                Próximos 60 minutos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-400">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-gray-400">Media</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-400">Alta</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-400">Crítica</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {proyeccion.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No hay datos de proyección disponibles</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline por hora */}
            {proyeccion.map((hora, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">{hora.hora}</span>
                </div>

                {/* Gráfico de barras por destino */}
                <div className="grid grid-cols-1 gap-2">
                  {destinosDestacados.map(destinoNombre => {
                    const destino = hora.destinos.find(d => d.nombre === destinoNombre);
                    const cantidad = destino?.cantidad || 0;
                    
                    return (
                      <div key={destinoNombre} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-400 text-right">
                          {destinoNombre}
                        </div>
                        <div className="flex-1 relative h-8 bg-gray-800 rounded-lg overflow-hidden">
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 transition-all duration-500",
                              getBarColor(cantidad)
                            )}
                            style={{ width: getBarHeight(cantidad) }}
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-white relative z-10">
                              {cantidad > 0 ? `${cantidad} camiones` : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Resumen total */}
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                {destinosDestacados.map(destino => {
                  const total = proyeccion.reduce((sum, hora) => {
                    const destinoData = hora.destinos.find(d => d.nombre === destino);
                    return sum + (destinoData?.cantidad || 0);
                  }, 0);

                  return (
                    <div key={destino} className="text-center">
                      <p className="text-2xl font-bold text-white">{total}</p>
                      <p className="text-sm text-gray-400">Total {destino}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};