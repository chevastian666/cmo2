/**
 * Widget de precintos pendientes para el dashboard
 * By Cheva
 */

import React from 'react';
import { Package, Lock, Unlock, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { motion } from 'framer-motion';
import { usePrecintosStore } from '../../../store/store';
import { AnimatedBadge } from '../../animations/AnimatedComponents';

export const PendingPrecintosWidget: React.FC = () => {
  const precintos = usePrecintosStore(state => state.precintos);
  
  // Calcular pendientes basado en el estado
  // Estado 0 = Disponible, Estado 1 = En Tránsito, Estado 4 = Finalizado
  const pendientesPrecintar = precintos.filter(p => 
    p.estado === 0 // Disponibles para precintar
  ).length;
  
  const pendientesDesprecintar = precintos.filter(p => 
    p.estado === 4 // Finalizados pendientes de desprecintar
  ).length;

  const totalPendientes = pendientesPrecintar + pendientesDesprecintar;

  return (
    <div className="h-full flex flex-col">
      {/* Header con total */}
      <div className="mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Operaciones Pendientes
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Requieren atención inmediata
            </p>
          </div>
          {totalPendientes > 0 && (
            <AnimatedBadge variant="warning" pulse>
              {totalPendientes}
            </AnimatedBadge>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 space-y-4">
        {/* Pendientes de Precintar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'p-4 rounded-lg border transition-all',
            pendientesPrecintar > 0 
              ? 'bg-yellow-900/20 border-yellow-800 hover:bg-yellow-900/30' 
              : 'bg-gray-800/50 border-gray-700'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                pendientesPrecintar > 0 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-700 text-gray-400'
              )}>
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">
                  Pendientes Precintar
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Listos para activación
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                'text-2xl font-bold',
                pendientesPrecintar > 0 ? 'text-yellow-400' : 'text-gray-500'
              )}>
                {pendientesPrecintar}
              </p>
            </div>
          </div>
          
          {pendientesPrecintar > 0 && (
            <div className="mt-3 pt-3 border-t border-yellow-800/50">
              <button className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                <span>Ver lista completa</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Pendientes de Desprecintar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'p-4 rounded-lg border transition-all',
            pendientesDesprecintar > 0 
              ? 'bg-orange-900/20 border-orange-800 hover:bg-orange-900/30' 
              : 'bg-gray-800/50 border-gray-700'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                pendientesDesprecintar > 0 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'bg-gray-700 text-gray-400'
              )}>
                <Unlock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">
                  Pendientes Desprecintar
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Viajes completados
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                'text-2xl font-bold',
                pendientesDesprecintar > 0 ? 'text-orange-400' : 'text-gray-500'
              )}>
                {pendientesDesprecintar}
              </p>
            </div>
          </div>
          
          {pendientesDesprecintar > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-800/50">
              <button className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                <span>Ver lista completa</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer con tiempo de actualización */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Actualizado hace 2 minutos</span>
        </div>
      </div>
    </div>
  );
};