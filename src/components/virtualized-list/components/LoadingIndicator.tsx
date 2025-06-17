import React from 'react';
import { cn } from '../../../utils/utils';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  message,
  className
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-600',
          sizeClasses[size]
        )}>
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </div>
      
      {message && (
        <p className={cn(
          'text-gray-400 animate-pulse',
          size === 'small' && 'text-xs',
          size === 'medium' && 'text-sm',
          size === 'large' && 'text-base'
        )}>
          {message}
        </p>
      )}
    </div>
  );
};