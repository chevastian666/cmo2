import React from 'react';
import { cn } from '../../../utils/utils';

interface TruckIconProps {
  status?: 'normal' | 'warning' | 'critical' | 'inactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  showTrafficLight?: boolean;
  direction?: number; // Rotation angle in degrees
}

export const TruckIcon: React.FC<TruckIconProps> = ({
  status = 'normal',
  size = 'md',
  className,
  animated = false,
  showTrafficLight = true,
  direction = 0
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const trafficLightSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5'
  };

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-green-500';
    }
  };

  const getTrafficLightColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  };

  const shouldAnimate = animated && (status === 'critical' || status === 'warning');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className={cn(
          sizes[size],
          getStatusColor(),
          shouldAnimate && status === 'critical' && 'animate-pulse',
          'transition-all duration-300'
        )}
        style={{ transform: `rotate(${direction}deg)` }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {/* Truck body */}
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>

      {/* Traffic light indicator */}
      {showTrafficLight && (
        <div
          className={cn(
            'absolute -top-1 -right-1',
            trafficLightSizes[size],
            getTrafficLightColor(),
            'rounded-full',
            shouldAnimate && 'animate-pulse',
            'ring-2 ring-gray-900'
          )}
        >
          {status === 'critical' && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
          )}
        </div>
      )}

      {/* Critical status shadow effect */}
      {status === 'critical' && animated && (
        <div
          className={cn(
            'absolute inset-0',
            sizes[size],
            'bg-red-500 opacity-30 blur-md -z-10 animate-pulse'
          )}
        />
      )}
    </div>
  );
};

// Variant with more detailed truck icon
export const TruckIconDetailed: React.FC<TruckIconProps> = ({
  status = 'normal',
  size = 'md',
  className,
  animated = false,
  showTrafficLight = true,
  direction = 0
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return '#ef4444'; // red-500
      case 'warning':
        return '#f59e0b'; // yellow-500
      case 'inactive':
        return '#6b7280'; // gray-500
      default:
        return '#10b981'; // green-500
    }
  };

  const shouldAnimate = animated && (status === 'critical' || status === 'warning');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className={cn(
          sizes[size],
          shouldAnimate && status === 'critical' && 'animate-pulse',
          'transition-all duration-300'
        )}
        style={{ transform: `rotate(${direction}deg)` }}
        viewBox="0 0 100 100"
        fill="none"
      >
        {/* Truck cabin */}
        <rect x="15" y="30" width="50" height="40" fill={getStatusColor()} rx="4" />
        <rect x="65" y="35" width="20" height="35" fill={getStatusColor()} rx="4" />
        
        {/* Windows */}
        <rect x="20" y="35" width="20" height="15" fill="#1f2937" rx="2" />
        <rect x="70" y="40" width="10" height="10" fill="#1f2937" rx="2" />
        
        {/* Wheels */}
        <circle cx="30" cy="75" r="8" fill="#374151" />
        <circle cx="30" cy="75" r="4" fill="#1f2937" />
        <circle cx="70" cy="75" r="8" fill="#374151" />
        <circle cx="70" cy="75" r="4" fill="#1f2937" />
        
        {/* Container lines */}
        <line x1="45" y1="40" x2="45" y2="65" stroke="#1f2937" strokeWidth="2" />
        <line x1="55" y1="40" x2="55" y2="65" stroke="#1f2937" strokeWidth="2" />
        
        {/* Traffic light on truck */}
        {showTrafficLight && (
          <g>
            <rect x="75" y="20" width="10" height="25" fill="#374151" rx="2" />
            <circle cx="80" cy="27" r="3" fill={status === 'critical' || status === 'inactive' ? '#1f2937' : '#ef4444'} />
            <circle cx="80" cy="35" r="3" fill={status === 'warning' ? '#f59e0b' : '#1f2937'} />
            <circle cx="80" cy="43" r="3" fill={status === 'normal' ? '#10b981' : '#1f2937'} />
          </g>
        )}
      </svg>

      {/* Critical status effects */}
      {status === 'critical' && animated && (
        <>
          <div className="absolute inset-0 bg-red-500 opacity-20 blur-lg -z-10 animate-pulse" />
          <div className="absolute -inset-1 bg-red-500 opacity-10 blur-xl -z-20 animate-pulse" />
        </>
      )}
    </div>
  );
};