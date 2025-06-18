/**
 * Torre de Control V2 - Sistema de Monitoreo en Tiempo Real
 * Incluye: shadcn/ui, Framer Motion, Dashboard Interactivo, Zustand mejorado
 * By Cheva
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, User,
  RefreshCw, Filter, ChevronRight, Activity, Monitor, Zap, Radio,
  Gauge, TrendingUp, Shield, Eye, Maximize2, Minimize2, Settings,
  Layout, Save, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  PageTransition, 
  AnimatedHeader, 
  AnimatedSection,
  AnimatedGrid 
} from '@/components/animations/PageTransitions';
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedBadge,
  AnimatedList,
  AnimatedListItem,
  AnimatedSkeleton,
  AnimatedDiv,
  AnimatedSpinner
} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransitosStore, useAlertasStore, usePrecintosStore, useDashboardStore } from '@/store/store';
import { cn } from '@/utils/utils';
import { torreControlService } from '../services/torreControl.service';
import type { TransitoTorreControl, EstadoSemaforo } from '../types';
import type { CongestionAnalysis } from '../../prediccion/types';
import { CongestionPanel } from '../../prediccion';
import { CountdownTimer } from './CountdownTimer';
import { TransitoDetailModal } from './TransitoDetailModal';
import { MapWidget } from './MapWidget';
import { 
  staggerContainer, 
  staggerItem,
  fadeInUp,
  scaleIn,
  pulseVariants,
  alertCriticalVariants
} from '@/components/animations/AnimationPresets';

// Dashboard Grid Layout
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/torre-control.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Components para el Dashboard
const SemaforoWidget: React.FC<{ data: TransitoTorreControl[] }> = ({ data }) => {
  const counts = {
    verde: data.filter(t => t.semaforo === 'verde').length,
    amarillo: data.filter(t => t.semaforo === 'amarillo').length,
    rojo: data.filter(t => t.semaforo === 'rojo').length
  };

  const total = data.length;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-400" />
        Estado Semáforo
      </h3>
      
      <div className="grid grid-cols-3 gap-4 flex-1">
        <motion.div 
          className="bg-green-500/20 rounded-lg p-4 border border-green-500/30"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-green-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {counts.verde}
            </motion.div>
            <p className="text-sm text-gray-400 mt-1">En tiempo</p>
            <Progress value={total > 0 ? (counts.verde / total) * 100 : 0} className="mt-2 h-2" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-yellow-400"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {counts.amarillo}
            </motion.div>
            <p className="text-sm text-gray-400 mt-1">Precaución</p>
            <Progress value={total > 0 ? (counts.amarillo / total) * 100 : 0} className="mt-2 h-2" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-red-500/20 rounded-lg p-4 border border-red-500/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-red-400"
              animate={counts.rojo > 0 ? pulseVariants.animate : {}}
            >
              {counts.rojo}
            </motion.div>
            <p className="text-sm text-gray-400 mt-1">Crítico</p>
            <Progress value={total > 0 ? (counts.rojo / total) * 100 : 0} className="mt-2 h-2" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const LiveFeedWidget: React.FC<{ data: TransitoTorreControl[] }> = ({ data }) => {
  const recentTransitos = data.slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-blue-400" />
        Feed en Vivo
      </h3>
      
      <AnimatedList className="space-y-2 overflow-y-auto flex-1">
        {recentTransitos.map((transito, index) => (
          <AnimatedListItem key={transito.id} index={index}>
            <motion.div 
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    transito.semaforo === 'verde' ? 'bg-green-500' :
                    transito.semaforo === 'amarillo' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  <span className="font-medium">{transito.dua}</span>
                </div>
                <Badge variant={transito.semaforo === 'rojo' ? 'danger' : 'secondary'}>
                  {transito.estado === 1 ? 'En viaje' : transito.estado === 2 ? 'Con novedad' : 'Con alerta'}
                </Badge>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {transito.origen} → {transito.destino}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Hace {Math.floor((new Date().getTime() - new Date(transito.fechaSalida).getTime()) / 60000)} min
              </div>
            </motion.div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  );
};

const MetricsWidget: React.FC<{ data: TransitoTorreControl[] }> = ({ data }) => {
  const metrics = {
    velocidadPromedio: Math.round(data.reduce((acc, t) => acc + (60), 0) / data.length),
    tiempoPromedio: Math.round(data.reduce((acc, t) => acc + (Math.floor((new Date(t.eta).getTime() - new Date(t.fechaSalida).getTime()) / 60000)), 0) / data.length),
    eficiencia: Math.round((data.filter(t => t.semaforo === 'verde').length / data.length) * 100),
    alertasActivas: data.filter(t => t.alertas && t.alertas.length > 0).length
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Gauge className="h-5 w-5 text-blue-400" />
        Métricas en Tiempo Real
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <AnimatedCard className="bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Velocidad Promedio</span>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{metrics.velocidadPromedio} km/h</div>
        </AnimatedCard>

        <AnimatedCard className="bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Tiempo Promedio</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{metrics.tiempoPromedio} min</div>
        </AnimatedCard>

        <AnimatedCard className="bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Eficiencia</span>
            <Activity className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{metrics.eficiencia}%</div>
        </AnimatedCard>

        <AnimatedCard className="bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Alertas Activas</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <motion.div 
            className="text-2xl font-bold mt-2"
            animate={metrics.alertasActivas > 0 ? { color: ['#fff', '#f87171', '#fff'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {metrics.alertasActivas}
          </motion.div>
        </AnimatedCard>
      </div>
    </div>
  );
};

// Main Component
export const TorreControlV2: React.FC = () => {
  const [transitos, setTransitos] = useState<TransitoTorreControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransito, setSelectedTransito] = useState<TransitoTorreControl | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCongestionPanel, setShowCongestionPanel] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'table' | 'both'>('both');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { alertasActivas } = useAlertasStore();
  const { precintosActivos } = usePrecintosStore();
  const { layouts, setLayouts, resetLayouts: resetDashboardLayouts } = useDashboardStore();

  const [filters, setFilters] = useState({
    origen: '',
    destino: '',
    estado: '' as EstadoSemaforo | ''
  });

  // Default layouts for the dashboard
  const defaultLayouts = {
    lg: [
      { i: 'semaforo', x: 0, y: 0, w: 3, h: 4 },
      { i: 'live-feed', x: 3, y: 0, w: 3, h: 4 },
      { i: 'metrics', x: 6, y: 0, w: 3, h: 4 },
      { i: 'congestion', x: 9, y: 0, w: 3, h: 4 },
      { i: 'map', x: 0, y: 4, w: 12, h: 6 }
    ],
    md: [
      { i: 'semaforo', x: 0, y: 0, w: 5, h: 4 },
      { i: 'live-feed', x: 5, y: 0, w: 5, h: 4 },
      { i: 'metrics', x: 0, y: 4, w: 5, h: 3 },
      { i: 'congestion', x: 5, y: 4, w: 5, h: 3 },
      { i: 'map', x: 0, y: 7, w: 10, h: 5 }
    ],
    sm: [
      { i: 'semaforo', x: 0, y: 0, w: 6, h: 4 },
      { i: 'live-feed', x: 0, y: 4, w: 6, h: 4 },
      { i: 'metrics', x: 0, y: 8, w: 6, h: 3 },
      { i: 'congestion', x: 0, y: 11, w: 6, h: 3 },
      { i: 'map', x: 0, y: 14, w: 6, h: 5 }
    ]
  };

  // Fetch data
  const fetchTransitos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await torreControlService.getTransitosEnRuta();
      setTransitos(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching transitos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransitos();
    const interval = setInterval(fetchTransitos, 30000);
    return () => clearInterval(interval);
  }, [fetchTransitos]);

  // Filter data
  const filteredTransitos = React.useMemo(() => {
    let filtered = [...transitos];
    
    if (filters.origen) {
      filtered = filtered.filter(t => 
        t.origen.toLowerCase().includes(filters.origen.toLowerCase())
      );
    }
    
    if (filters.destino) {
      filtered = filtered.filter(t => 
        t.destino.toLowerCase().includes(filters.destino.toLowerCase())
      );
    }
    
    if (filters.estado) {
      filtered = filtered.filter(t => t.semaforo === filters.estado);
    }
    
    return filtered;
  }, [transitos, filters]);

  const handleLayoutChange = (layout: any, newLayouts: any) => {
    if (!isEditMode) return;
    setLayouts(newLayouts);
  };

  const widgets = [
    { id: 'semaforo', component: <SemaforoWidget data={filteredTransitos} /> },
    { id: 'live-feed', component: <LiveFeedWidget data={filteredTransitos} /> },
    { id: 'metrics', component: <MetricsWidget data={filteredTransitos} /> },
    { id: 'map', component: <MapWidget data={filteredTransitos} /> },
    { id: 'congestion', component: showCongestionPanel && <CongestionPanel transitos={filteredTransitos} /> }
  ].filter(w => w.component);

  return (
    <PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Torre de Control"
          subtitle="Monitoreo en tiempo real de tránsitos y operaciones"
          icon={<Monitor className="h-8 w-8 text-blue-500" />}
          action={
            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="outline"
                onClick={fetchTransitos}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Actualizar
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </AnimatedButton>

              <Select value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Solo Dashboard</SelectItem>
                  <SelectItem value="table">Solo Tabla</SelectItem>
                  <SelectItem value="both">Vista Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* KPIs principales */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Tránsitos Activos"
              value={transitos.length}
              icon={<Truck className="h-5 w-5" />}
              color="bg-blue-500/10 text-blue-400"
              subtitle={`${filteredTransitos.filter(t => t.estado === 1).length} en ruta`}
            />
            <KPICard
              title="Estado Crítico"
              value={filteredTransitos.filter(t => t.semaforo === 'rojo').length}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="bg-red-500/10 text-red-400"
              subtitle="Requieren atención"
              pulse={filteredTransitos.filter(t => t.semaforo === 'rojo').length > 0}
            />
            <KPICard
              title="Tiempo Promedio"
              value={`${Math.round(filteredTransitos.reduce((acc, t) => acc + (Math.floor((new Date(t.eta).getTime() - new Date(t.fechaSalida).getTime()) / 60000)), 0) / Math.max(filteredTransitos.length, 1))} min`}
              icon={<Clock className="h-5 w-5" />}
              color="bg-green-500/10 text-green-400"
              subtitle="En ruta"
            />
            <KPICard
              title="Alertas Activas"
              value={alertasActivas.length}
              icon={<Zap className="h-5 w-5" />}
              color="bg-orange-500/10 text-orange-400"
              subtitle="Sistema general"
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Filtrar por origen..."
                      value={filters.origen}
                      onChange={(e) => setFilters(prev => ({ ...prev, origen: e.target.value }))}
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                    />
                    <Input
                      placeholder="Filtrar por destino..."
                      value={filters.destino}
                      onChange={(e) => setFilters(prev => ({ ...prev, destino: e.target.value }))}
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                    />
                    <Select 
                      value={filters.estado} 
                      onValueChange={(v) => setFilters(prev => ({ ...prev, estado: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado semáforo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="verde">Verde</SelectItem>
                        <SelectItem value="amarillo">Amarillo</SelectItem>
                        <SelectItem value="rojo">Rojo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard View */}
        {(selectedView === 'dashboard' || selectedView === 'both') && (
          <AnimatedSection delay={0.2}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dashboard Interactivo</CardTitle>
                    <CardDescription>
                      {isEditMode ? 'Arrastra y redimensiona los widgets' : 'Vista de monitoreo en tiempo real'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-mode" className="text-sm">Modo edición</Label>
                    <Switch
                      id="edit-mode"
                      checked={isEditMode}
                      onCheckedChange={setIsEditMode}
                    />
                    {isEditMode && (
                      <>
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          onClick={() => setLayouts(layouts || defaultLayouts)}
                        >
                          <Save className="h-4 w-4" />
                        </AnimatedButton>
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          onClick={() => resetDashboardLayouts()}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </AnimatedButton>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveGridLayout
                  className="layout"
                  layouts={layouts || defaultLayouts}
                  onLayoutChange={handleLayoutChange}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={60}
                  isDraggable={isEditMode}
                  isResizable={isEditMode}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                >
                  {widgets.map(widget => (
                    <div key={widget.id} className="bg-gray-900 rounded-lg border border-gray-700 p-4 overflow-hidden">
                      {widget.component}
                    </div>
                  ))}
                </ResponsiveGridLayout>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Table View */}
        {(selectedView === 'table' || selectedView === 'both') && (
          <AnimatedSection delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Tránsitos Activos</CardTitle>
                <CardDescription>
                  {filteredTransitos.length} tránsitos encontrados • Última actualización: {lastUpdate.toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          DUA / Precinto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Ruta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tiempo / ETA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8">
                            <div className="flex justify-center">
                              <AnimatedSpinner className="h-8 w-8" />
                            </div>
                          </td>
                        </tr>
                      ) : filteredTransitos.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No se encontraron tránsitos activos
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {filteredTransitos.map((transito, index) => (
                            <TransitoRowV2
                              key={transito.id}
                              transito={transito}
                              index={index}
                              onSelect={setSelectedTransito}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Modal de detalles */}
        {selectedTransito && (
          <TransitoDetailModal
            transito={selectedTransito}
            isOpen={!!selectedTransito}
            onClose={() => setSelectedTransito(null)}
          />
        )}
      </div>
    </PageTransition>
  );
};

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  pulse?: boolean;
}> = ({ title, value, icon, color, subtitle, pulse }) => (
  <AnimatedCard 
    className={cn("relative overflow-hidden", pulse && "animate-pulse")}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg", color)}
          animate={pulse ? alertCriticalVariants.animate : {}}
        >
          {icon}
        </motion.div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </CardContent>
  </AnimatedCard>
);

// Table Row Component
const TransitoRowV2: React.FC<{
  transito: TransitoTorreControl;
  index: number;
  onSelect: (transito: TransitoTorreControl) => void;
}> = ({ transito, index, onSelect }) => {
  const getSemaforoColor = (estado: EstadoSemaforo) => {
    switch (estado) {
      case 'verde': return 'bg-green-500';
      case 'amarillo': return 'bg-yellow-500';
      case 'rojo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.tr
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      className="border-b border-gray-700 hover:bg-gray-800/50 transition-all cursor-pointer"
      onClick={() => onSelect(transito)}
      whileHover={{ x: 5 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn("w-3 h-3 rounded-full", getSemaforoColor(transito.estadoSemaforo))}
            animate={transito.semaforo === 'rojo' ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <AnimatedBadge 
            variant={transito.semaforo === 'rojo' ? 'danger' : 'secondary'}
            pulse={transito.semaforo === 'rojo'}
          >
            {transito.estado}
          </AnimatedBadge>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <p className="font-medium text-white">{transito.dua}</p>
          <p className="text-sm text-gray-400">{transito.precinto}</p>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{transito.origen} → {transito.destino}</span>
        </div>
        {transito.progreso && (
          <Progress value={transito.progreso} className="mt-1 h-2" />
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <CountdownTimer targetTime={transito.eta} />
          <p className="text-xs text-gray-500 mt-1">
            ETA: {new Date(transito.eta).toLocaleTimeString()}
          </p>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{transito.ubicacionActual ? `${transito.ubicacionActual.lat.toFixed(4)}, ${transito.ubicacionActual.lng.toFixed(4)}` : 'En ruta'}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(transito);
          }}
        >
          <Eye className="h-4 w-4" />
        </AnimatedButton>
      </td>
    </motion.tr>
  );
};

export default TorreControlV2;