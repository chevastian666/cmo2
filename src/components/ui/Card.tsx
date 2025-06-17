import React from 'react';
import { cn } from '../../utils/utils';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  noPadding?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  noPadding = false,
  onClick,
  header,
  footer
}) => {
  const variantStyles = {
    default: 'bg-gray-800 border-gray-700',
    elevated: 'bg-gray-800 border-gray-700 shadow-lg',
    bordered: 'bg-transparent border-gray-600 border-2',
    ghost: 'bg-gray-800/50 border-transparent'
  };

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:border-gray-600',
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className={cn(
          'border-b border-gray-700',
          !noPadding && 'px-6 py-4'
        )}>
          {header}
        </div>
      )}
      
      <div className={!noPadding ? 'p-6' : undefined}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(
          'border-t border-gray-700',
          !noPadding && 'px-6 py-4'
        )}>
          {footer}
        </div>
      )}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  actions
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex-1">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className
}) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-100', className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className
}) => {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('text-gray-300', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
};