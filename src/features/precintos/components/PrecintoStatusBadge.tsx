import React from 'react';
import { cn } from '../../../utils/utils';
import { PrecintoStatus, PrecintoStatusText } from '../types';

interface PrecintoStatusBadgeProps {
  status: PrecintoStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const PrecintoStatusBadge: React.FC<PrecintoStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showText = true 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case PrecintoStatus.LISTO:
        return 'bg-green-500 text-white';
      case PrecintoStatus.ARMADO:
        return 'bg-blue-500 text-white';
      case PrecintoStatus.ALARMA:
        return 'bg-red-500 text-white animate-pulse';
      case PrecintoStatus.FIN_MONITOREO:
        return 'bg-gray-500 text-white';
      case PrecintoStatus.ROTO:
        return 'bg-red-600 text-white border-2 border-red-400';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case PrecintoStatus.LISTO:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        );
      case PrecintoStatus.ARMADO:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
        );
      case PrecintoStatus.ALARMA:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"/>
          </svg>
        );
      case PrecintoStatus.FIN_MONITOREO:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case PrecintoStatus.ROTO:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            <path d="M9 9h2v8H9zm4 0h2v8h-2z" opacity="0.7"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg'
  };

  const paddingClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-2'
  };

  const extraClasses = status === PrecintoStatus.ROTO ? 'ring-2 ring-red-400 ring-offset-1 ring-offset-gray-800' : '';

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      getStatusColor(),
      showText ? paddingClasses[size] : 'p-1',
      extraClasses
    )}>
      <div className={cn(sizeClasses[size])}>
        {getStatusIcon()}
      </div>
      {showText && (
        <span className={cn(
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {PrecintoStatusText[status]}
        </span>
      )}
    </div>
  );
};