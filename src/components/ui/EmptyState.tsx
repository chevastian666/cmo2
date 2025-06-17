import React from 'react';
import { cn } from '../../utils/utils';

type EmptyStateIcon = 'default' | 'search' | 'folder' | 'alert' | 'data' | 'error';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: EmptyStateIcon | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'default',
  action,
  className,
  size = 'md'
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-12 h-12',
      title: 'text-base',
      message: 'text-sm'
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16',
      title: 'text-lg',
      message: 'text-base'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20',
      title: 'text-xl',
      message: 'text-lg'
    }
  };

  const styles = sizeStyles[size];

  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const iconMap = {
      default: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      search: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      folder: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      alert: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      data: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      error: (
        <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };

    return iconMap[icon as EmptyStateIcon] || iconMap.default;
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      styles.container,
      className
    )}>
      <div className="text-gray-500 mb-4">
        {getIcon()}
      </div>
      
      {title && (
        <h3 className={cn('font-semibold text-gray-100 mb-2', styles.title)}>
          {title}
        </h3>
      )}
      
      <p className={cn('text-gray-400 max-w-md', styles.message)}>
        {message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg',
            'hover:bg-blue-600 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};