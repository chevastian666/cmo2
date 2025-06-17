import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '../../../utils/utils';

export const RealtimeIndicator: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Listen for any store updates
    const handleUpdate = () => {
      setIsActive(true);
      setLastUpdate(new Date());
      
      // Reset indicator after animation
      setTimeout(() => setIsActive(false), 1000);
    };

    // Custom event for any real-time update
    window.addEventListener('realtime-update' as any, handleUpdate);
    
    return () => {
      window.removeEventListener('realtime-update' as any, handleUpdate);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-400">
      <Activity 
        className={cn(
          "h-3 w-3 transition-colors",
          isActive ? "text-green-400" : "text-gray-600"
        )} 
      />
      <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
      {isActive && (
        <span className="text-green-400 animate-pulse">Actualizando...</span>
      )}
    </div>
  );
};