/**
 * Widget de actividad reciente para el dashboard
 * By Cheva
 */

import React from 'react';
import {_Clock, _Package, _Truck, Shield, AlertCircle} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  type: 'precinto' | 'transito' | 'alerta' | 'sistema';
  action: string;
  description: string;
  time: Date;
  user?: string;
}

export const ActivityWidget: React.FC = () => {
  // Datos de ejemplo - en producción vendría del store
  const activities: Activity[] = [
    {
      id: '1',
      type: 'precinto',
      action: 'Activado',
      description: 'Precinto PRE-2024-001 activado',
      time: new Date(Date.now() - 5 * 60000),
      user: 'Juan Pérez'
    },
    {
      id: '2',
      type: 'transito',
      action: 'Iniciado',
      description: 'Tránsito TR-2024-042 hacia Aduana Central',
      time: new Date(Date.now() - 15 * 60000)
    },
    {
      id: '3',
      type: 'alerta',
      action: 'Generada',
      description: 'Temperatura fuera de rango en PRE-2024-003',
      time: new Date(Date.now() - 30 * 60000)
    },
    {
      id: '4',
      type: 'sistema',
      action: 'Actualización',
      description: 'Sistema actualizado a v2.1.0',
      time: new Date(Date.now() - 60 * 60000)
    },
    {
      id: '5',
      type: 'precinto',
      action: 'Desactivado',
      description: 'Precinto PRE-2024-005 llegó a destino',
      time: new Date(Date.now() - 90 * 60000)
    }
  ];

  const iconMap = {
    precinto: <Package className="h-4 w-4" />,
    transito: <Truck className="h-4 w-4" />,
    alerta: <AlertCircle className="h-4 w-4" />,
    sistema: <Shield className="h-4 w-4" />
  };

  const colorMap = {
    precinto: 'text-blue-400 bg-blue-500/10',
    transito: 'text-green-400 bg-green-500/10',
    alerta: 'text-red-400 bg-red-500/10',
    sistema: 'text-purple-400 bg-purple-500/10'
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} horas`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days} días`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-1 overflow-auto">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icono */}
              <div className={cn(
                'p-1.5 rounded mt-0.5',
                colorMap[activity.type]
              )}>
                {iconMap[activity.type]}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.action}</span>
                      {' - '}
                      <span className="text-gray-400">{activity.description}</span>
                    </p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Por {activity.user}
                      </p>
                    )}
                  </div>
                  
                  {/* Tiempo */}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {getRelativeTime(activity.time)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <button className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors">
          Ver toda la actividad →
        </button>
      </div>
    </div>
  );
};