import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface SignalIndicatorProps {
  strength?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({ 
  strength, 
  size = 'md',
  showValue = false 
}) => {
  if (strength === undefined) {
    return <WifiOff className={cn(
      size === 'sm' && 'h-4 w-4',
      size === 'md' && 'h-5 w-5',
      size === 'lg' && 'h-6 w-6',
      'text-gray-500'
    )} />;
  }

  const getColor = () => {
    if (strength >= 75) return 'text-green-500';
    if (strength >= 50) return 'text-yellow-500';
    if (strength >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center gap-1">
      <Wifi className={cn(sizeClasses[size], getColor())} />
      {showValue && (
        <span className={cn(
          'font-medium',
          getColor(),
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {strength}%
        </span>
      )}
    </div>
  );
};