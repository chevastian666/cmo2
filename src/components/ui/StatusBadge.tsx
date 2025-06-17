import React from 'react';
import { cn } from '../../utils/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  outline?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
  pulse = false,
  outline = false
}) => {
  const variantStyles = {
    default: outline 
      ? 'border-gray-500 text-gray-300 bg-transparent'
      : 'bg-gray-600 text-gray-100 border-gray-600',
    success: outline
      ? 'border-green-500 text-green-400 bg-transparent'
      : 'bg-green-500 text-white border-green-500',
    warning: outline
      ? 'border-yellow-500 text-yellow-400 bg-transparent'
      : 'bg-yellow-500 text-gray-900 border-yellow-500',
    danger: outline
      ? 'border-red-500 text-red-400 bg-transparent'
      : 'bg-red-500 text-white border-red-500',
    info: outline
      ? 'border-blue-500 text-blue-400 bg-transparent'
      : 'bg-blue-500 text-white border-blue-500',
    secondary: outline
      ? 'border-purple-500 text-purple-400 bg-transparent'
      : 'bg-purple-500 text-white border-purple-500'
  };

  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {icon && (
        <span className={cn(iconSizes[size], 'flex-shrink-0')}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};