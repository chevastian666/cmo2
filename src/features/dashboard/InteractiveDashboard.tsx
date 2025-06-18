/**
 * Dashboard Interactivo con widgets arrastrables
 * By Cheva
 */

import React, { useMemo } from 'react';
import { 
  BarChart3, 
  AlertCircle, 
  Map, 
  Activity, 
  TrendingUp,
  Truck,
  Shield,
  Package
} from 'lucide-react';
import DashboardGrid, { type WidgetConfig } from '../../components/dashboard/DashboardGrid';
import {
  KPIWidget,
  ChartWidget,
  AlertsWidget,
  MapWidget,
  ActivityWidget,
  StatisticsWidget,
  TransitWidget,
  PrecintoStatusWidget
} from '../../components/dashboard/widgets';
import { PageTransition, AnimatedHeader } from '../../components/animations/PageTransitions';
import { usePrecintosStore } from '../../store/store';
import { useTransitosStore } from '../../store/store';
import { useAlertasStore } from '../../store/store';

const InteractiveDashboard: React.FC = () => {
  // Datos de los stores
  const precintos = usePrecintosStore(state => state.precintos);
  const transitos = useTransitosStore(state => state.transitos);
  const alertas = useAlertasStore(state => state.alertas);

  // Calcular KPIs
  const kpis = useMemo(() => ({
    precintosActivos: precintos.filter(p => p.estado === 'ACTIVO').length,
    transitosEnRuta: transitos.filter(t => t.estado === 'EN_TRANSITO').length,
    alertasCriticas: alertas.filter(a => a.severidad === 'CRITICA').length,
    tasaCumplimiento: 94.5
  }), [precintos, transitos, alertas]);

  // Configuración de widgets
  const widgets: WidgetConfig[] = [
    {
      id: 'kpi-precintos',
      type: 'kpi',
      title: 'Precintos Activos',
      minW: 3,
      minH: 2,
      maxH: 3
    },
    {
      id: 'kpi-transitos',
      type: 'kpi',
      title: 'Tránsitos en Ruta',
      minW: 3,
      minH: 2,
      maxH: 3
    },
    {
      id: 'kpi-alertas',
      type: 'kpi',
      title: 'Alertas Críticas',
      minW: 3,
      minH: 2,
      maxH: 3
    },
    {
      id: 'kpi-cumplimiento',
      type: 'kpi',
      title: 'Tasa de Cumplimiento',
      minW: 3,
      minH: 2,
      maxH: 3
    },
    {
      id: 'chart-main',
      type: 'chart',
      title: 'Tendencias',
      minW: 6,
      minH: 4
    },
    {
      id: 'map',
      type: 'map',
      title: 'Mapa en Tiempo Real',
      minW: 6,
      minH: 4
    },
    {
      id: 'alerts',
      type: 'alerts',
      title: 'Alertas Recientes',
      minW: 4,
      minH: 3
    },
    {
      id: 'activity',
      type: 'activity',
      title: 'Actividad Reciente',
      minW: 4,
      minH: 3
    },
    {
      id: 'statistics',
      type: 'statistics',
      title: 'Estadísticas',
      minW: 4,
      minH: 3
    },
    {
      id: 'transits',
      type: 'transits',
      title: 'Tránsitos Activos',
      minW: 4,
      minH: 4
    },
    {
      id: 'precinto-status',
      type: 'precinto-status',
      title: 'Estado de Precintos',
      minW: 4,
      minH: 4
    }
  ];

  // Render de widgets según tipo
  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'kpi':
        switch (widget.id) {
          case 'kpi-precintos':
            return (
              <KPIWidget
                title="Activos"
                value={kpis.precintosActivos}
                change={12}
                trend="up"
                icon={<Shield className="h-6 w-6" />}
                color="blue"
              />
            );
          case 'kpi-transitos':
            return (
              <KPIWidget
                title="En Ruta"
                value={kpis.transitosEnRuta}
                change={-5}
                trend="down"
                icon={<Truck className="h-6 w-6" />}
                color="green"
              />
            );
          case 'kpi-alertas':
            return (
              <KPIWidget
                title="Críticas"
                value={kpis.alertasCriticas}
                change={0}
                trend="neutral"
                icon={<AlertCircle className="h-6 w-6" />}
                color="red"
              />
            );
          case 'kpi-cumplimiento':
            return (
              <KPIWidget
                title="Cumplimiento"
                value={`${kpis.tasaCumplimiento}`}
                unit="%"
                change={2.5}
                trend="up"
                icon={<TrendingUp className="h-6 w-6" />}
                color="purple"
              />
            );
        }
        break;
      
      case 'chart':
        return <ChartWidget widgetId={widget.id} type="area" />;
      
      case 'map':
        return <MapWidget showLegend />;
      
      case 'alerts':
        return <AlertsWidget />;
      
      case 'activity':
        return <ActivityWidget />;
      
      case 'statistics':
        return <StatisticsWidget />;
      
      case 'transits':
        return <TransitWidget />;
      
      case 'precinto-status':
        return <PrecintoStatusWidget />;
      
      default:
        return <div>Widget no encontrado</div>;
    }
  };

  return (
    <PageTransition variant="fade">
      <div className="min-h-screen bg-gray-900 p-6">
        <AnimatedHeader
          title="Dashboard Interactivo"
          subtitle="Centro de Monitoreo de Operaciones"
        />
        
        <div className="mt-6">
          <DashboardGrid
            widgets={widgets}
            renderWidget={renderWidget}
            onLayoutChange={(layouts) => {
              console.log('Layouts cambiados:', layouts);
            }}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default InteractiveDashboard;