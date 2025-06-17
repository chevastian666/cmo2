import React, { useSyncExternalStore, memo } from 'react';
import { AlertTriangle, AlertCircle, Shield, Bell } from 'lucide-react';
import { cn } from '../../utils/utils';
import { alertStore } from '../../stores/alertStore';
import { PriorityBoundary } from '../priority/withPriority';

interface Alert {
  id: string;
  type: 'violation' | 'tamper' | 'security' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  precintoId: string;
  message: string;
  timestamp: Date;
  location?: { lat: number; lng: number; address: string };
  acknowledged: boolean;
}

const AlertIcon: React.FC<{ type: Alert['type'] }> = memo(({ type }) => {
  const icons = {
    violation: <AlertTriangle className="h-5 w-5" />,
    tamper: <Shield className="h-5 w-5" />,
    security: <AlertCircle className="h-5 w-5" />,
    system: <Bell className="h-5 w-5" />
  };
  return icons[type] || icons.system;
});

const AlertItem: React.FC<{ alert: Alert; onAcknowledge: (id: string) => void }> = memo(({ 
  alert, 
  onAcknowledge 
}) => {
  const severityStyles = {
    critical: 'bg-red-900/50 border-red-600 text-red-100',
    high: 'bg-orange-900/50 border-orange-600 text-orange-100',
    medium: 'bg-yellow-900/50 border-yellow-600 text-yellow-100',
    low: 'bg-blue-900/50 border-blue-600 text-blue-100'
  };

  const iconColors = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500'
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all duration-200',
        severityStyles[alert.severity],
        alert.acknowledged && 'opacity-60',
        !alert.acknowledged && 'animate-pulse-subtle'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', iconColors[alert.severity])}>
            <AlertIcon type={alert.type} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{alert.precintoId}</span>
              <span className="text-xs opacity-75">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{alert.message}</p>
            {alert.location && (
              <p className="text-xs opacity-75 mt-1">
                📍 {alert.location.address}
              </p>
            )}
          </div>
        </div>
        
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return prevProps.alert.id === nextProps.alert.id &&
    prevProps.alert.acknowledged === nextProps.alert.acknowledged;
});

export const CriticalAlerts: React.FC = () => {
  // Use sync external store for immediate updates
  const alerts = useSyncExternalStore(
    alertStore.subscribe,
    alertStore.getSnapshot,
    alertStore.getServerSnapshot
  );

  // Filter only critical and high severity alerts
  const criticalAlerts = alerts.filter(
    alert => alert.severity === 'critical' || alert.severity === 'high'
  );

  const handleAcknowledge = (alertId: string) => {
    alertStore.acknowledgeAlert(alertId);
  };

  return (
    <PriorityBoundary priority="immediate">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Critical Alerts
          </h2>
          <span className="text-sm text-gray-400">
            {criticalAlerts.filter(a => !a.acknowledged).length} active
          </span>
        </div>

        {criticalAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No critical alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
            {criticalAlerts.map(alert => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        )}
      </div>
    </PriorityBoundary>
  );
};

// Add subtle pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);