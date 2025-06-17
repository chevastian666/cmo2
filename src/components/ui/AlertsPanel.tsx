import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../utils/utils';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Alert {
  id: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  timestamp: Date | string;
  source?: string;
  status?: 'active' | 'acknowledged' | 'resolved';
  metadata?: Record<string, any>;
}

interface AlertsPanelProps {
  alerts: Alert[];
  className?: string;
  maxHeight?: string;
  onAlertClick?: (alert: Alert) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  showHeader?: boolean;
  title?: string;
  emptyMessage?: string;
  variant?: 'default' | 'compact';
  groupByPriority?: boolean;
  enableSound?: boolean;
  enableVisualPulse?: boolean;
}

interface AlertGroup {
  severity: AlertSeverity;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  alerts: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  className,
  maxHeight = '400px',
  onAlertClick,
  onAlertAcknowledge,
  showHeader = true,
  title = 'Alertas Activas',
  emptyMessage = 'No hay alertas activas',
  variant = 'default',
  groupByPriority = true,
  enableSound = false,
  enableVisualPulse = false
}) => {
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());

  // Detectar nuevas alertas
  useEffect(() => {
    const currentAlertIds = new Set(alerts.map(a => a.id));
    const newIds = new Set<string>();

    currentAlertIds.forEach(id => {
      if (!previousAlertIds.has(id)) {
        newIds.add(id);
      }
    });

    if (newIds.size > 0) {
      setNewAlertIds(newIds);
      
      // Detectar si hay alertas críticas nuevas
      const hasCriticalAlert = alerts.some(
        alert => newIds.has(alert.id) && (alert.severity === 'critical' || alert.severity === 'high')
      );

      if (hasCriticalAlert) {
        // Efecto visual de pulso
        if (enableVisualPulse) {
          document.body.classList.add('critical-alert-pulse');
          setTimeout(() => {
            document.body.classList.remove('critical-alert-pulse');
          }, 3000);
        }

        // Reproducir sonido (si está habilitado)
        if (enableSound && typeof window !== 'undefined' && 'Audio' in window) {
          try {
            const audio = new Audio('/sounds/alert.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('No se pudo reproducir el sonido:', e));
          } catch (e) {
            console.log('Error al crear audio:', e);
          }
        }
      }

      // Limpiar animación después de 3 segundos
      setTimeout(() => {
        setNewAlertIds(new Set());
      }, 3000);
    }

    setPreviousAlertIds(currentAlertIds);
  }, [alerts, enableSound, enableVisualPulse]);

  // Agrupar alertas por severidad
  const groupedAlerts = useMemo(() => {
    if (!groupByPriority) return null;

    const groups: AlertGroup[] = [
      {
        severity: 'critical',
        title: 'Críticas',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        alerts: []
      },
      {
        severity: 'medium',
        title: 'Medias',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500',
        icon: <Bell className="h-5 w-5 text-yellow-500" />,
        alerts: []
      },
      {
        severity: 'info',
        title: 'Información',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500',
        icon: <Info className="h-5 w-5 text-gray-500" />,
        alerts: []
      }
    ];

    // Clasificar alertas en grupos
    alerts.forEach(alert => {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        groups[0].alerts.push(alert);
      } else if (alert.severity === 'medium' || alert.severity === 'low') {
        groups[1].alerts.push(alert);
      } else {
        groups[2].alerts.push(alert);
      }
    });

    // Filtrar grupos vacíos
    return groups.filter(group => group.alerts.length > 0);
  }, [alerts, groupByPriority]);

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      critical: 'border-red-500 bg-red-500/10',
      high: 'border-orange-500 bg-orange-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10',
      info: 'border-gray-500 bg-gray-500/10'
    };
    return colors[severity];
  };

  const getSeverityBadgeVariant = (severity: AlertSeverity): 'danger' | 'warning' | 'info' | 'default' => {
    const variants = {
      critical: 'danger' as const,
      high: 'danger' as const,
      medium: 'warning' as const,
      low: 'info' as const,
      info: 'default' as const
    };
    return variants[severity];
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return date.toLocaleDateString();
  };

  const toggleGroup = (severity: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(severity)) {
      newCollapsed.delete(severity);
    } else {
      newCollapsed.add(severity);
    }
    setCollapsedGroups(newCollapsed);
  };

  const renderAlert = (alert: Alert) => {
    const isNew = newAlertIds.has(alert.id);
    
    return (
      <div
        key={alert.id}
        className={cn(
          'transition-all cursor-pointer',
          'hover:bg-gray-700/50',
          variant === 'default' && 'rounded-lg border-l-4 p-3',
          variant === 'compact' && 'px-4 py-2',
          getSeverityColor(alert.severity),
          isNew && 'animate-slide-in',
          isNew && alert.severity === 'critical' && 'animate-pulse'
        )}
        onClick={() => onAlertClick?.(alert)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                'font-medium text-gray-100 truncate',
                variant === 'compact' && 'text-sm'
              )}>
                {alert.title}
              </h4>
              <StatusBadge
                variant={getSeverityBadgeVariant(alert.severity)}
                size="sm"
              >
                {alert.severity.toUpperCase()}
              </StatusBadge>
              {isNew && (
                <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full animate-pulse">
                  NUEVA
                </span>
              )}
            </div>
            
            {alert.description && variant === 'default' && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {alert.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-500">
                {formatTimestamp(alert.timestamp)}
              </span>
              {alert.source && (
                <span className="text-xs text-gray-500">
                  {alert.source}
                </span>
              )}
              {alert.status && alert.status !== 'active' && (
                <StatusBadge variant="default" size="xs">
                  {alert.status === 'acknowledged' ? 'Reconocida' : 'Resuelta'}
                </StatusBadge>
              )}
            </div>
          </div>
          
          {/* Botón de marcar como atendida */}
          {alert.status === 'active' && onAlertAcknowledge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAlertAcknowledge(alert.id);
              }}
              className="flex-shrink-0 p-2 hover:bg-gray-600 rounded-lg transition-colors"
              title="Marcar como atendida"
            >
              <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500" />
            </button>
          )}
          
          {variant === 'default' && !onAlertAcknowledge && (
            <svg 
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-gray-800 rounded-lg', className)}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              {title}
              {alerts.some(a => a.severity === 'critical') && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </span>
            {alerts.length > 0 && (
              <span className="text-sm font-normal text-gray-400">
                {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
              </span>
            )}
          </h3>
        </div>
      )}
      
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {alerts.length === 0 ? (
          <EmptyState
            message={emptyMessage}
            icon="alert"
            className="py-8"
          />
        ) : groupByPriority && groupedAlerts ? (
          <div className="divide-y divide-gray-700">
            {groupedAlerts.map((group) => (
              <div key={group.severity} className="p-2">
                <button
                  onClick={() => toggleGroup(group.severity)}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <span className={cn('font-medium', group.color)}>
                      {group.title} ({group.alerts.length})
                    </span>
                  </div>
                  {collapsedGroups.has(group.severity) ? (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {!collapsedGroups.has(group.severity) && (
                  <div className="mt-2 space-y-1">
                    {group.alerts.map(renderAlert)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            'divide-y divide-gray-700',
            variant === 'compact' ? 'space-y-0' : 'space-y-1 p-2'
          )}>
            {alerts.map(renderAlert)}
          </div>
        )}
      </div>
    </div>
  );
};