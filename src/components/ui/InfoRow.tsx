import React from 'react';
import { cn } from '../../utils/utils';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'highlight' | 'muted';
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  copyable?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  className,
  variant = 'default',
  icon,
  extra,
  copyable = false
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const variantStyles = {
    default: {
      container: 'py-2',
      label: 'text-gray-400',
      value: 'text-gray-100'
    },
    compact: {
      container: 'py-1',
      label: 'text-gray-500 text-sm',
      value: 'text-gray-200 text-sm'
    },
    highlight: {
      container: 'py-2 px-3 bg-blue-500/10 rounded-lg border border-blue-500/20',
      label: 'text-blue-400',
      value: 'text-blue-100 font-medium'
    },
    muted: {
      container: 'py-2',
      label: 'text-gray-500',
      value: 'text-gray-400'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('flex items-center justify-between', styles.container, className)}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span className="text-gray-400 flex-shrink-0">
            {icon}
          </span>
        )}
        <span className={cn('font-medium', styles.label)}>
          {label}:
        </span>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <span className={cn('truncate', styles.value)}>
          {value}
        </span>
        
        {extra && (
          <span className="text-sm text-gray-500">
            {extra}
          </span>
        )}
        
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-300 transition-colors p-1"
            title={copied ? 'Copiado!' : 'Copiar'}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

interface InfoGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const InfoGrid: React.FC<InfoGridProps> = ({
  children,
  className,
  columns = 2
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
};

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('space-y-3', className)}>
      <div 
        className={cn(
          'flex items-center justify-between',
          collapsible && 'cursor-pointer'
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        {collapsible && (
          <svg 
            className={cn('w-5 h-5 text-gray-400 transition-transform', !isOpen && 'rotate-180')}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
      
      {(!collapsible || isOpen) && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};