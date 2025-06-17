import React from 'react';
import { CheckCircle, Truck, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface TransitStatusProps {
  estado: 'en_viaje' | 'desprecintado' | 'con_alerta';
}

export const TransitStatus: React.FC<TransitStatusProps> = ({ estado }) => {
  const getStatusConfig = () => {
    switch (estado) {
      case 'en_viaje':
        return {
          icon: <Truck className="h-4 w-4" />,
          text: 'En Viaje',
          color: 'text-blue-400',
          bg: 'bg-blue-900/20'
        };
      case 'desprecintado':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Desprecintado',
          color: 'text-green-400',
          bg: 'bg-green-900/20'
        };
      case 'con_alerta':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Con Alerta',
          color: 'text-red-400',
          bg: 'bg-red-900/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
      config.color,
      config.bg
    )}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};