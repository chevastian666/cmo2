import React from 'react';
import { Battery, BatteryLow } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface BatteryIndicatorProps {
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ 
  level, 
  size = 'md',
  showPercentage = true 
}) => {
  if (level === undefined) {
    return <span className="text-gray-500">-</span>;
  }

  const getColor = () => {
    if (level >= 60) return 'text-green-500';
    if (level >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const Icon = level < 20 ? BatteryLow : Battery;

  return (
    <div className="flex items-center gap-1">
      <Icon className={cn(sizeClasses[size], getColor())} />
      {showPercentage && (
        <span className={cn(
          'font-medium',
          getColor(),
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {level}%
        </span>
      )}
    </div>
  );
};