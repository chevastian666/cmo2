import React from 'react';
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { TransitoPendiente, Alerta } from '../../../types';

interface KPICardsProps {
  transitos: TransitoPendiente[];
  alertas: Alerta[];
}

export const KPICards: React.FC<KPICardsProps> = ({ transitos, alertas }) => {
  // Calculate transit statistics
  const transitosActivos = transitos.filter(t => t.estado === 'en_proceso').length;
  const transitosEnViaje = transitos.filter(t => t.estado === 'en_proceso').length;
  const transitosPendientesPrecintar = transitos.filter(t => t.estado === 'pendiente').length;
  const transitosPendientesDesprecintar = transitos.filter(t => t.estado === 'precintado').length;
  
  // Calculate alerts by priority
  const alertasCriticas = alertas.filter(a => a.severidad === 'critica' || a.severidad === 'alta').length;
  const alertasMedias = alertas.filter(a => a.severidad === 'media').length;
  const alertasBajas = alertas.filter(a => a.severidad === 'baja').length;
  

  const kpiData = [
    // Transit KPIs
    {
      title: 'Tránsitos Activos',
      value: transitosActivos,
      subtitle: 'En proceso',
      icon: <Truck className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      trend: transitosActivos > 10 ? 'up' : transitosActivos < 5 ? 'down' : 'neutral'
    },
    {
      title: 'En Viaje',
      value: transitosEnViaje,
      subtitle: 'Transportándose',
      icon: <Package className="h-6 w-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      trend: 'neutral'
    },
    {
      title: 'Pendientes Precintar',
      value: transitosPendientesPrecintar,
      subtitle: 'Esperando precinto',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      trend: transitosPendientesPrecintar > 5 ? 'up' : 'neutral'
    },
    {
      title: 'Pendientes Desprecintar',
      value: transitosPendientesDesprecintar,
      subtitle: 'Llegaron a destino',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      trend: 'neutral'
    },
    // Alert KPIs
    {
      title: 'Alertas Críticas',
      value: alertasCriticas,
      subtitle: 'Prioridad alta',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      trend: alertasCriticas > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Alertas Medias',
      value: alertasMedias,
      subtitle: 'Prioridad media',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      trend: alertasMedias > 2 ? 'up' : 'neutral'
    },
    // Additional Alert KPIs
    {
      title: 'Alertas Bajas',
      value: alertasBajas,
      subtitle: 'Prioridad baja',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      trend: 'neutral'
    },
    {
      title: 'Total Alertas',
      value: alertas.length,
      subtitle: 'Todas las prioridades',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/20',
      trend: alertas.length > 10 ? 'up' : 'neutral'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                    <div className={kpi.color}>
                      {kpi.icon}
                    </div>
                  </div>
                  {getTrendIcon(kpi.trend)}
                </div>
                <p className="text-sm text-gray-400 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};