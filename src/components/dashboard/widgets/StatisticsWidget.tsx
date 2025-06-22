/**
 * Widget de estadísticas para el dashboard
 * By Cheva
 */

import React from 'react';
// No lucide-react icons currently used
import { cn} from '../../../utils/utils';
import { motion} from 'framer-motion';

interface Stat {
  label: string;
  value: number;
  total: number;
  color: string;
}

export const StatisticsWidget: React.FC = () => {
  const stats: Stat[] = [
    {
      label: 'Precintos Activos',
      value: 127,
      total: 200,
      color: 'bg-blue-500'
    },
    {
      label: 'En Tránsito',
      value: 45,
      total: 127,
      color: 'bg-green-500'
    },
    {
      label: 'Alertas Resueltas',
      value: 89,
      total: 95,
      color: 'bg-yellow-500'
    },
    {
      label: 'Cumplimiento',
      value: 94,
      total: 100,
      color: 'bg-purple-500'
    }
  ];

  return (<div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          >
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white mb-2">
              {stat.value}
              <span className="text-sm text-gray-500 font-normal">/{stat.total}</span>
            </p>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stat.value / stat.total) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                className={cn('h-full rounded-full', stat.color)}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((stat.value / stat.total) * 100)}%
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* Resumen */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Eficiencia General</span>
          <span className="text-green-400 font-medium">92.5%</span>
        </div>
      </div>
    </div>
  );
};