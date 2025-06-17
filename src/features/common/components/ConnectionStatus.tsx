import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { sharedWebSocketService } from '../../../services/shared/sharedWebSocket.service';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
      case 'reconnecting':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4" />;
      case 'reconnecting':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'reconnecting':
        return 'Reconectando...';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn('flex items-center space-x-1', getStatusColor())}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {status === 'disconnected' && (
        <button
          onClick={() => sharedWebSocketService.connect()}
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};