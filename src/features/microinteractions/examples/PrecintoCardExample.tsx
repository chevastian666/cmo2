import React from 'react';
import { Package } from 'lucide-react';
import { BreathingPrecinto } from '../components/BreathingPrecinto';
import { useASMRSound } from '../services/soundService';
import { cn } from '../../../utils/utils';

interface PrecintoData {
  id: string;
  codigo: string;
  estado: 'activo' | 'alerta' | 'critico';
  ubicacion: string;
}

export const PrecintoCardExample: React.FC<{ precinto: PrecintoData }> = ({ precinto }) => {
  const { playHover, playSuccess } = useASMRSound();

  const getStatus = (estado: string): 'normal' | 'alert' | 'critical' => {
    switch (estado) {
      case 'activo': return 'normal';
      case 'alerta': return 'alert';
      case 'critico': return 'critical';
      default: return 'normal';
    }
  };

  const statusColors = {
    activo: 'border-green-500 bg-green-900/20',
    alerta: 'border-yellow-500 bg-yellow-900/20',
    critico: 'border-red-500 bg-red-900/20'
  };

  return (
    <BreathingPrecinto 
      status={getStatus(precinto.estado)}
      className="w-full"
    >
      <div
        className={cn(
          'p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer',
          statusColors[precinto.estado],
          'hover:shadow-lg hover:scale-[1.02]'
        )}
        onMouseEnter={() => playHover()}
        onClick={() => playSuccess()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-white" />
            <div>
              <h3 className="font-semibold text-white">{precinto.codigo}</h3>
              <p className="text-sm text-gray-400">{precinto.ubicacion}</p>
            </div>
          </div>
          <div className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            precinto.estado === 'activo' && 'bg-green-600 text-white',
            precinto.estado === 'alerta' && 'bg-yellow-600 text-white',
            precinto.estado === 'critico' && 'bg-red-600 text-white'
          )}>
            {precinto.estado.toUpperCase()}
          </div>
        </div>
      </div>
    </BreathingPrecinto>
  );
};