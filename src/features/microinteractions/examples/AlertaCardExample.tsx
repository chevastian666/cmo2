import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BloomingAlert } from '../components/BloomingAlert';
import { useASMRSound } from '../services/soundService';
import { cn } from '../../../utils/utils';

interface AlertData {
  id: string;
  tipo: 'normal' | 'alerta' | 'critico';
  mensaje: string;
  timestamp: Date;
}

export const AlertaCardExample: React.FC<{ alerta: AlertData; isNew?: boolean }> = ({ 
  alerta, 
  isNew = false 
}) => {
  const [showBloom, setShowBloom] = useState(isNew);
  const { playNotification, playOpen } = useASMRSound();

  const handleClick = () => {
    playOpen();
    // Handle alert click
  };

  const alertColors = {
    normal: 'border-green-500 bg-green-900/20',
    alerta: 'border-yellow-500 bg-yellow-900/20', 
    critico: 'border-red-500 bg-red-900/20'
  };

  const alertIcons = {
    normal: 'text-green-400',
    alerta: 'text-yellow-400',
    critico: 'text-red-400'
  };

  if (showBloom) {
    return (
      <BloomingAlert
        status={alerta.tipo === 'normal' ? 'normal' : alerta.tipo === 'alerta' ? 'alert' : 'critical'}
        onBloomComplete={() => {
          setShowBloom(false);
          playNotification();
        }}
        className="w-full"
      >
        <AlertCard alerta={alerta} onClick={handleClick} />
      </BloomingAlert>
    );
  }

  return <AlertCard alerta={alerta} onClick={handleClick} />;
};

const AlertCard: React.FC<{ alerta: AlertData; onClick: () => void }> = ({ alerta, onClick }) => {
  const alertColors = {
    normal: 'border-green-500 bg-green-900/20',
    alerta: 'border-yellow-500 bg-yellow-900/20',
    critico: 'border-red-500 bg-red-900/20'
  };

  const alertIcons = {
    normal: 'text-green-400',
    alerta: 'text-yellow-400',
    critico: 'text-red-400'
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer',
        alertColors[alerta.tipo],
        'hover:shadow-lg hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn('h-5 w-5 mt-0.5', alertIcons[alerta.tipo])} />
        <div className="flex-1">
          <p className="text-white font-medium">{alerta.mensaje}</p>
          <p className="text-xs text-gray-400 mt-1">
            {alerta.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};