import React, { memo, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Clock, User, CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { Alert } from '../types/alerts';

interface AlertListItemProps {
  alert: Alert;
  index: number;
  style: React.CSSProperties;
  onClick?: () => void;
  isHighlighted?: boolean;
  isScrolling?: boolean;
  onHeightChange?: (height: number) => void;
}

const severityConfig = {
  low: {
    bg: 'bg-green-900/20',
    border: 'border-green-600',
    icon: 'text-green-500',
    label: 'Baja'
  },
  medium: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-600',
    icon: 'text-yellow-500',
    label: 'Media'
  },
  high: {
    bg: 'bg-orange-900/20',
    border: 'border-orange-600',
    icon: 'text-orange-500',
    label: 'Alta'
  },
  critical: {
    bg: 'bg-red-900/20',
    border: 'border-red-600',
    icon: 'text-red-500',
    label: 'Crítica'
  }
};

const statusConfig = {
  active: {
    icon: Circle,
    color: 'text-red-500',
    label: 'Activa'
  },
  acknowledged: {
    icon: CheckCircle,
    color: 'text-yellow-500',
    label: 'Reconocida'
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-500',
    label: 'Resuelta'
  }
};

export const AlertListItem = memo<AlertListItemProps>(({
  alert,
  index,
  style,
  onClick,
  isHighlighted,
  isScrolling,
  onHeightChange
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const config = severityConfig[alert.severity];
  const StatusIcon = statusConfig[alert.status].icon;

  // Measure height on mount and updates
  useEffect(() => {
    if (itemRef.current && onHeightChange) {
      const height = itemRef.current.getBoundingClientRect().height;
      onHeightChange(height);
    }
  }, [alert, onHeightChange]);

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} hr`;
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        'px-4 py-3 border-l-4 cursor-pointer transition-all duration-200',
        config.bg,
        config.border,
        'hover:bg-gray-800/50',
        isHighlighted && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900',
        isScrolling && 'pointer-events-none'
      )}
      style={style}
      onClick={onClick}
      role="listitem"
      aria-posinset={index + 1}
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div className={cn('mt-0.5', config.icon)}>
          <AlertTriangle className="h-5 w-5" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white">
                {alert.precintoId}
              </span>
              {alert.vehicleId && (
                <span className="text-sm text-gray-400">
                  • {alert.vehicleId}
                </span>
              )}
              <span className={cn('text-xs px-2 py-0.5 rounded', config.bg, config.border)}>
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-4 w-4', statusConfig[alert.status].color)} />
              <span className="text-xs text-gray-500">
                {formatTime(alert.timestamp)}
              </span>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
            {alert.message}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[200px]">
                {alert.location.address}
              </span>
            </div>
            
            {alert.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{alert.assignedTo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.alert.id === nextProps.alert.id &&
    prevProps.alert.status === nextProps.alert.status &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isScrolling === nextProps.isScrolling &&
    prevProps.style.transform === nextProps.style.transform
  );
});

AlertListItem.displayName = 'AlertListItem';