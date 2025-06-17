import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Calendar, AlertTriangle, MapPin, Shield } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { GroupingOptions } from '../types/virtualization';

interface AlertGroupHeaderProps {
  groupKey: string;
  groupValue: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  groupBy: GroupingOptions['groupBy'];
  style?: React.CSSProperties;
}

export const AlertGroupHeader = memo<AlertGroupHeaderProps>(({
  groupKey,
  groupValue,
  count,
  isExpanded,
  onToggle,
  groupBy,
  style
}) => {
  const getIcon = () => {
    switch (groupBy) {
      case 'timestamp':
        return <Calendar className="h-4 w-4" />;
      case 'severity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'status':
        return <Shield className="h-4 w-4" />;
    }
  };

  const getGroupLabel = () => {
    switch (groupBy) {
      case 'timestamp':
        return formatDateGroup(groupValue);
      case 'severity':
        return formatSeverityGroup(groupValue);
      case 'location':
        return groupValue;
      case 'status':
        return formatStatusGroup(groupValue);
      default:
        return groupValue;
    }
  };

  return (
    <div
      className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-2 cursor-pointer hover:bg-gray-750"
      style={style}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={`group-${groupKey}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          
          <div className="text-gray-400">
            {getIcon()}
          </div>
          
          <span className="font-medium text-white">
            {getGroupLabel()}
          </span>
          
          <span className="text-sm text-gray-500">
            ({count} alerta{count !== 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {groupBy === 'severity' && (
            <div className={cn(
              'h-2 w-2 rounded-full',
              groupValue === 'critical' && 'bg-red-500',
              groupValue === 'high' && 'bg-orange-500',
              groupValue === 'medium' && 'bg-yellow-500',
              groupValue === 'low' && 'bg-green-500'
            )} />
          )}
        </div>
      </div>
    </div>
  );
});

AlertGroupHeader.displayName = 'AlertGroupHeader';

// Helper functions
function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatSeverityGroup(severity: string): string {
  const labels: Record<string, string> = {
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  };
  return labels[severity] || severity;
}

function formatStatusGroup(status: string): string {
  const labels: Record<string, string> = {
    active: 'Activas',
    acknowledged: 'Reconocidas',
    resolved: 'Resueltas'
  };
  return labels[status] || status;
}