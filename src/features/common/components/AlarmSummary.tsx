import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlertasActivas } from '../../../store/hooks';
import { cn } from '../../../utils/utils';

interface AlarmCount {
  code: string;
  count: number;
  severity: 'baja' | 'media' | 'alta' | 'critica';
}

export const AlarmSummary: React.FC = () => {
  const { alertas, loading } = useAlertasActivas();
  const navigate = useNavigate();

  const alarmCounts = useMemo(() => {
    if (!alertas || alertas.length === 0) return [];

    // Group alarms by type or code
    const counts = alertas.reduce<Record<string, AlarmCount>>((acc, alerta) => {
      // Try to extract alarm code from precinto code
      let alarmCode = 'UNK';
      
      // Check if the precinto code matches known patterns (PTN, DTN, BBJ, etc.)
      if (alerta.codigoPrecinto) {
        // Common alarm code patterns
        const knownCodes = ['PTN', 'DTN', 'BBJ', 'BT', 'RF'];
        const upperCode = alerta.codigoPrecinto.toUpperCase();
        
        // Find matching code
        const matchedCode = knownCodes.find(code => upperCode.startsWith(code));
        if (matchedCode) {
          alarmCode = matchedCode;
        } else {
          // Default to first 2-3 letters
          alarmCode = upperCode.substring(0, 3).replace(/[0-9]/g, '').trim() || 'UNK';
        }
      }
      
      if (!acc[alarmCode]) {
        acc[alarmCode] = {
          code: alarmCode,
          count: 0,
          severity: alerta.severidad
        };
      }
      
      acc[alarmCode].count++;
      
      // Keep the highest severity for the group
      const severityOrder = ['baja', 'media', 'alta', 'critica'];
      if (severityOrder.indexOf(alerta.severidad) > severityOrder.indexOf(acc[alarmCode].severity)) {
        acc[alarmCode].severity = alerta.severidad;
      }
      
      return acc;
    }, {});

    // Convert to array and sort by severity then by code
    return Object.values(counts).sort((a, b) => {
      const severityOrder = ['critica', 'alta', 'media', 'baja'];
      const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
      if (severityDiff !== 0) return severityDiff;
      return a.code.localeCompare(b.code);
    });
  }, [alertas]);

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-400">
        <div className="animate-pulse">Cargando alertas...</div>
      </div>
    );
  }

  if (alarmCounts.length === 0) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-400">
        <AlertTriangle className="h-3 w-3" />
        <span>Sin alertas</span>
      </div>
    );
  }

  const totalAlarms = alarmCounts.reduce((sum, alarm) => sum + alarm.count, 0);

  const handleClick = () => {
    navigate('/alertas');
  };

  return (
    <div 
      className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
      title={`${totalAlarms} alerta${totalAlarms !== 1 ? 's' : ''} activa${totalAlarms !== 1 ? 's' : ''}`}
      onClick={handleClick}
    >
      <AlertTriangle className={cn(
        "h-4 w-4",
        alarmCounts.some(a => a.severity === 'critica') ? 'text-red-500 animate-pulse' :
        alarmCounts.some(a => a.severity === 'alta') ? 'text-orange-500' :
        alarmCounts.some(a => a.severity === 'media') ? 'text-yellow-500' :
        'text-blue-500'
      )} />
      <div className="flex items-center space-x-1 text-xs">
        {alarmCounts.map((alarm, index) => (
          <React.Fragment key={alarm.code}>
            {index > 0 && <span className="text-gray-500">•</span>}
            <span 
              className={cn(
                "font-medium",
                alarm.severity === 'critica' ? 'text-red-400' :
                alarm.severity === 'alta' ? 'text-orange-400' :
                alarm.severity === 'media' ? 'text-yellow-400' :
                'text-blue-400'
              )}
              title={`${alarm.count} alerta${alarm.count !== 1 ? 's' : ''} de tipo ${alarm.code}`}
            >
              {alarm.count} {alarm.code}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};