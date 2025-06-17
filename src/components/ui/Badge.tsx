import React from 'react';
import { cn } from '../../utils/utils';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
  rounded = true,
  removable = false,
  onRemove
}) => {
  const variantStyles = {
    primary: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    secondary: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    danger: 'bg-red-500/20 text-red-400 border-red-500/50',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    default: 'bg-gray-700 text-gray-300 border-gray-600'
  };

  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  const dotColors = {
    primary: 'bg-blue-400',
    secondary: 'bg-purple-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400',
    info: 'bg-cyan-400',
    default: 'bg-gray-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
    >
      {dot && (
        <span 
          className={cn(
            'rounded-full animate-pulse',
            dotSizes[size],
            dotColors[variant]
          )} 
        />
      )}
      
      {children}
      
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'ml-1 -mr-1 hover:text-white transition-colors',
            size === 'xs' && 'text-xs',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  max?: number;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className,
  max
}) => {
  const items = React.Children.toArray(children);
  const visibleItems = max ? items.slice(0, max) : items;
  const hiddenCount = max && items.length > max ? items.length - max : 0;

  return (
    <div className={cn('inline-flex items-center gap-1.5 flex-wrap', className)}>
      {visibleItems}
      {hiddenCount > 0 && (
        <Badge variant="default" size="sm">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
};