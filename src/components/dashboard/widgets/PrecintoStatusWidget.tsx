/**
 * Widget de estado de precintos para el dashboard
 * By Cheva
 */

import React from 'react';
import { Shield, Battery, Thermometer, Signal } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { motion } from 'framer-motion';
import { usePrecintosStore } from '../../../store/store';

export const PrecintoStatusWidget: React.FC = () => {
  const precintos = usePrecintosStore(state => state.precintos);
  
  // Estadísticas de precintos
  const stats = {
    total: precintos.length,
    activos: precintos.filter(p => p.estado === 'ACTIVO').length,
    enTransito: precintos.filter(p => p.estado === 'EN_TRANSITO').length,
    inactivos: precintos.filter(p => p.estado === 'INACTIVO').length,
    conAlertas: precintos.filter(p => p.alertas && p.alertas.length > 0).length,
    bateriaBaja: precintos.filter(p => p.bateria && p.bateria < 20).length
  };

  const statusItems = [
    {
      label: 'Activos',
      value: stats.activos,
      icon: <Shield className="h-4 w-4" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'En Tránsito',
      value: stats.enTransito,
      icon: <Signal className="h-4 w-4" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Con Alertas',
      value: stats.conAlertas,
      icon: <Thermometer className="h-4 w-4" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Batería Baja',
      value: stats.bateriaBaja,
      icon: <Battery className="h-4 w-4" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    }
  ];

  // Precintos críticos (con alertas o batería baja)
  const precintoCriticos = precintos
    .filter(p => 
      (p.alertas && p.alertas.length > 0) || 
      (p.bateria && p.bateria < 20)
    )
    .slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      {/* Estadísticas Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {statusItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 rounded-lg p-2 border border-gray-700"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'p-1.5 rounded',
                item.bgColor,
                item.color
              )}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Precintos Críticos */}
      {precintoCriticos.length > 0 && (
        <>
          <div className="text-xs text-gray-400 mb-2">Requieren atención:</div>
          <div className="flex-1 space-y-2 overflow-auto">
            {precintoCriticos.map((precinto, index) => (
              <motion.div
                key={precinto.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded p-2 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {precinto.codigo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {precinto.bateria && precinto.bateria < 20 && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          {precinto.bateria}%
                        </span>
                      )}
                      {precinto.alertas && precinto.alertas.length > 0 && (
                        <span className="text-xs text-yellow-400">
                          {precinto.alertas.length} alertas
                        </span>
                      )}
                    </div>
                  </div>
                  <Shield className={cn(
                    'h-4 w-4',
                    precinto.estado === 'ACTIVO' ? 'text-green-400' : 'text-gray-500'
                  )} />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
      
      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Precintos</span>
          <span className="text-white font-medium">{stats.total}</span>
        </div>
      </div>
    </div>
  );
};