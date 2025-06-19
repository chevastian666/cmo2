/**
 * Centro de Monitoreo de Tránsitos - Versión 2.0
 * Panel principal para funcionarios del CMO
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { 
  Truck, Download, Filter, RefreshCw, MapPin, CheckCircle2, 
  Clock, AlertTriangle, Package, Search, Calendar, Building2,
  Shield, Route, Timer, Eye, BarChart3, Activity, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransitosStore, useAlertasStore, usePrecintosStore } from '@/store/store';
import { cn } from '@/utils/utils';
import type { Transito } from '../types';
import { exportToExcel } from '@/utils/export';
import { TransitDetailModalEnhanced } from '../components/TransitoDetailModalEnhanced';

// Estado del tránsito con información clara
const getEstadoInfo = (estado: string) => {
  switch (estado) {
    case 'EN_TRANSITO':
      return { 
        color: 'bg-blue-900/20 text-blue-400 border-blue-800', 
        icon: <Truck className="h-4 w-4" />, 
        label: 'En Tránsito',
        dotColor: 'bg-blue-500'
      };
    case 'COMPLETADO':
      return { 
        color: 'bg-green-900/20 text-green-400 border-green-800', 
        icon: <CheckCircle2 className="h-4 w-4" />, 
        label: 'Completado',
        dotColor: 'bg-green-500'
      };
    case 'PENDIENTE':
      return { 
        color: 'bg-yellow-900/20 text-yellow-400 border-yellow-800', 
        icon: <Clock className="h-4 w-4" />, 
        label: 'Pendiente',
        dotColor: 'bg-yellow-500'
      };
    case 'ALERTA':
      return { 
        color: 'bg-red-900/20 text-red-400 border-red-800', 
        icon: <AlertTriangle className="h-4 w-4" />, 
        label: 'Con Alerta',
        dotColor: 'bg-red-500'
      };
    default:
      return { 
        color: 'bg-gray-900/20 text-gray-400 border-gray-800', 
        icon: <Package className="h-4 w-4" />, 
        label: estado,
        dotColor: 'bg-gray-500'
      };
  }
};

// Tarjeta de resumen mejorada
const ResumenCard: React.FC<{
  title: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}> = ({ title, value, total, icon, color, description }) => (
  <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {total && (
              <p className="text-sm text-gray-500">/ {total}</p>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", color)}>
          {icon}
        </div>
      </div>
      {total && (
        <div className="mt-4">
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(value / total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", color.replace('/10', ''))}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round((value / total) * 100)}% del total
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

// Componente de fila de tránsito mejorado
const TransitoCard: React.FC<{
  transito: Transito;
  onView: (transito: Transito) => void;
  onViewMap: (transito: Transito) => void;
}> = ({ transito, onView, onViewMap }) => {
  const estadoInfo = getEstadoInfo(transito.estado);
  const tiempoTranscurrido = React.useMemo(() => {
    const ahora = new Date();
    const salida = new Date(transito.fechaSalida);
    const horas = Math.floor((ahora.getTime() - salida.getTime()) / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (dias > 0) {
      return `${dias}d ${horasRestantes}h`;
    }
    return `${horas}h`;
  }, [transito.fechaSalida]);

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <motion.div 
              className={cn("w-3 h-3 rounded-full mt-1", estadoInfo.dotColor)}
              animate={transito.estado === 'EN_TRANSITO' ? {
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: transito.estado === 'EN_TRANSITO' ? Infinity : 0
              }}
            />
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white text-lg">{transito.dua}</h3>
                <Badge className={estadoInfo.color}>
                  {estadoInfo.icon}
                  <span className="ml-1">{estadoInfo.label}</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-1">Precinto: {transito.precinto}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(transito)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              Detalles
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMap(transito)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información de ruta */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Route className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Ruta</p>
                <p className="text-sm text-gray-300">
                  {transito.origen} → {transito.destino}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Timer className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Tiempo en tránsito</p>
                <p className="text-sm text-gray-300">{tiempoTranscurrido}</p>
              </div>
            </div>
          </div>

          {/* Información de empresa */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Empresa</p>
                <p className="text-sm text-gray-300">{transito.empresa}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Fecha de salida</p>
                <p className="text-sm text-gray-300">
                  {new Date(transito.fechaSalida).toLocaleDateString('es-UY', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso si está en tránsito */}
        {transito.estado === 'EN_TRANSITO' && transito.progreso !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso del viaje</span>
              <span>{transito.progreso}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${transito.progreso}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Información adicional si tiene alertas */}
        {transito.estado === 'ALERTA' && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">Requiere atención inmediata</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TransitosPageV2: React.FC = () => {
  const { 
    transitos, 
    loading, 
    fetchTransitos, 
    transitosEnCurso, 
    transitosCompletados, 
    transitosPendientes 
  } = useTransitosStore();
  
  const { alertasActivas } = useAlertasStore();
  const { precintosActivos } = usePrecintosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [fechaFilter, setFechaFilter] = useState('todos');
  const [selectedTransito, setSelectedTransito] = useState<Transito | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');

  useEffect(() => {
    fetchTransitos();
  }, [fetchTransitos]);

  // Obtener lista única de empresas
  const empresas = React.useMemo(() => {
    const uniqueEmpresas = new Set(transitos.map(t => t.empresa));
    return Array.from(uniqueEmpresas).sort();
  }, [transitos]);

  // Filtrar tránsitos
  const filteredTransitos = React.useMemo(() => {
    let filtered = [...transitos];

    // Filtro por pestaña activa
    switch (activeTab) {
      case 'activos':
        filtered = filtered.filter(t => t.estado === 'EN_TRANSITO');
        break;
      case 'pendientes':
        filtered = filtered.filter(t => t.estado === 'PENDIENTE');
        break;
      case 'completados':
        filtered = filtered.filter(t => t.estado === 'COMPLETADO');
        break;
      case 'alertas':
        filtered = filtered.filter(t => t.estado === 'ALERTA');
        break;
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.dua.toLowerCase().includes(search) ||
        t.precinto.toLowerCase().includes(search) ||
        t.empresa.toLowerCase().includes(search) ||
        t.origen.toLowerCase().includes(search) ||
        t.destino.toLowerCase().includes(search)
      );
    }

    // Filtro por empresa
    if (empresaFilter !== 'todas') {
      filtered = filtered.filter(t => t.empresa === empresaFilter);
    }

    // Filtro por fecha
    const ahora = new Date();
    switch (fechaFilter) {
      case 'hoy':
        filtered = filtered.filter(t => {
          const fecha = new Date(t.fechaSalida);
          return fecha.toDateString() === ahora.toDateString();
        });
        break;
      case 'semana':
        const unaSemanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.fechaSalida) >= unaSemanaAtras);
        break;
      case 'mes':
        const unMesAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.fechaSalida) >= unMesAtras);
        break;
    }

    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());

    return filtered;
  }, [transitos, searchTerm, estadoFilter, empresaFilter, fechaFilter, activeTab]);

  // Estadísticas
  const stats = React.useMemo(() => {
    const alertas = transitos.filter(t => t.estado === 'ALERTA');
    const demorados = transitosEnCurso.filter(t => {
      if (!t.eta) return false;
      return new Date() > new Date(t.eta);
    });

    return {
      total: transitos.length,
      enCurso: transitosEnCurso.length,
      completados: transitosCompletados.length,
      pendientes: transitosPendientes.length,
      conAlertas: alertas.length,
      demorados: demorados.length,
      precintosActivos: precintosActivos.length,
      alertasActivas: alertasActivas.length
    };
  }, [transitos, transitosEnCurso, transitosCompletados, transitosPendientes, precintosActivos, alertasActivas]);

  const handleExport = () => {
    exportToExcel(filteredTransitos, 'transitos');
  };

  const handleViewTransito = (transito: Transito) => {
    setSelectedTransito(transito);
    setShowDetailModal(true);
  };

  const handleViewMap = (transito: Transito) => {
    window.open(`/torre-control?transito=${transito.id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-500" />
            Centro de Monitoreo de Tránsitos
          </h1>
          <p className="text-gray-400 mt-1">
            Seguimiento en tiempo real de todos los viajes precintados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchTransitos()}
            disabled={loading}
            className="bg-gray-800 border-gray-700"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResumenCard
          title="Tránsitos Activos"
          value={stats.enCurso}
          icon={<Truck className="h-6 w-6" />}
          color="bg-blue-500/10 text-blue-400"
          description="En ruta actualmente"
        />
        <ResumenCard
          title="Completados Hoy"
          value={stats.completados}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="bg-green-500/10 text-green-400"
          description="Finalizados exitosamente"
        />
        <ResumenCard
          title="Alertas Activas"
          value={stats.conAlertas}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="bg-red-500/10 text-red-400"
          description="Requieren atención"
        />
        <ResumenCard
          title="Precintos en Uso"
          value={stats.precintosActivos}
          total={stats.total}
          icon={<Shield className="h-6 w-6" />}
          color="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* Panel de información rápida */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pendientes de Salida</p>
                <p className="text-xl font-semibold text-white">{stats.pendientes}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tránsitos Demorados</p>
                <p className="text-xl font-semibold text-white">{stats.demorados}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Tránsitos</p>
                <p className="text-xl font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y pestañas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <TabsList className="bg-gray-800 flex-none">
                <TabsTrigger value="activos" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  En Tránsito
                  <Badge variant="secondary" className="ml-1">{stats.enCurso}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pendientes" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pendientes
                  <Badge variant="secondary" className="ml-1">{stats.pendientes}</Badge>
                </TabsTrigger>
                <TabsTrigger value="alertas" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas
                  <Badge variant="danger" className="ml-1">{stats.conAlertas}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completados" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completados
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por DUA, precinto, empresa, ruta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
                
                <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las empresas</SelectItem>
                    {empresas.map(empresa => (
                      <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={fechaFilter} onValueChange={setFechaFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="semana">Última semana</SelectItem>
                    <SelectItem value="mes">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="activos" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredTransitos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Truck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No hay tránsitos activos en este momento</p>
                  </div>
                ) : (
                  filteredTransitos.map((transito) => (
                    <TransitoCard
                      key={transito.id}
                      transito={transito}
                      onView={handleViewTransito}
                      onViewMap={handleViewMap}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="pendientes" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTransitos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No hay tránsitos pendientes</p>
                  </div>
                ) : (
                  filteredTransitos.map((transito) => (
                    <TransitoCard
                      key={transito.id}
                      transito={transito}
                      onView={handleViewTransito}
                      onViewMap={handleViewMap}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="alertas" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTransitos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No hay tránsitos con alertas activas</p>
                  </div>
                ) : (
                  filteredTransitos.map((transito) => (
                    <TransitoCard
                      key={transito.id}
                      transito={transito}
                      onView={handleViewTransito}
                      onViewMap={handleViewMap}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completados" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTransitos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No hay tránsitos completados con los filtros actuales</p>
                  </div>
                ) : (
                  filteredTransitos.map((transito) => (
                    <TransitoCard
                      key={transito.id}
                      transito={transito}
                      onView={handleViewTransito}
                      onViewMap={handleViewMap}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      {selectedTransito && (
        <TransitDetailModalEnhanced
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransito(null);
          }}
          transito={selectedTransito}
        />
      )}
    </div>
  );
};

export default TransitosPageV2;