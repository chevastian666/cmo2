import React from 'react';
import { cn } from '../../utils/utils';

type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  progress?: number; // For progress variant
  rows?: number; // For skeleton variant
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  className,
  progress = 0,
  rows = 3
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-4',
      spinner: 'w-6 h-6',
      dot: 'w-2 h-2',
      text: 'text-sm'
    },
    md: {
      container: 'py-8',
      spinner: 'w-8 h-8',
      dot: 'w-3 h-3',
      text: 'text-base'
    },
    lg: {
      container: 'py-12',
      spinner: 'w-12 h-12',
      dot: 'w-4 h-4',
      text: 'text-lg'
    },
    xl: {
      container: 'py-16',
      spinner: 'w-16 h-16',
      dot: 'w-5 h-5',
      text: 'text-xl'
    }
  };

  const styles = sizeStyles[size];

  const renderSpinner = () => (
    <svg 
      className={cn(styles.spinner, 'animate-spin text-blue-500')}
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            styles.dot,
            'bg-blue-500 rounded-full animate-pulse'
          )}
          style={{
            animationDelay: `${i * 150}ms`
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="relative">
      <div className={cn(styles.spinner, 'bg-blue-500 rounded-full animate-ping absolute')} />
      <div className={cn(styles.spinner, 'bg-blue-500 rounded-full')} />
    </div>
  );

  const renderSkeleton = () => (
    <div className="w-full max-w-md space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${100 - i * 15}%` }} />
          {i === 0 && (
            <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
          )}
        </div>
      ))}
    </div>
  );

  const renderProgress = () => (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Cargando...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      case 'progress':
        return renderProgress();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      styles.container,
      className
    )}>
      {renderLoader()}
      
      {text && (
        <p className={cn('text-gray-400 mt-4', styles.text)}>
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  variant?: LoadingVariant;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  variant = 'spinner',
  fullScreen = false,
  className
}) => {
  if (!visible) return null;

  return (
    <div className={cn(
      'absolute inset-0 bg-gray-900/80 backdrop-blur-sm',
      'flex items-center justify-center z-50',
      fullScreen && 'fixed',
      className
    )}>
      <LoadingState variant={variant} text={text} size="lg" />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  return (
    <div
      className={cn(
        'bg-gray-700',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '20px' : variant === 'circular' ? '40px' : '100px')
      }}
    />
  );
};