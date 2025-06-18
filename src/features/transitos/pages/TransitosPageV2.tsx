/**
 * Página de Tránsitos - Versión 2.0 con nuevas implementaciones
 * Incluye: shadcn/ui, Framer Motion, Zustand mejorado, Design Tokens
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { Truck, Download, Filter, RefreshCw, MapPin, CheckCircle2, Clock, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
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
  AnimatedDiv
} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransitosStore, useAlertasStore, usePrecintosStore } from '@/store/store';
import { cn } from '@/utils/utils';
import type { Transito } from '../types';
import { exportToExcel } from '@/utils/export';
import { TransitDetailModalEnhanced } from '../components/TransitoDetailModalEnhanced';
import { EditTransitoModalV2 } from '../components/EditTransitoModalV2';
import { fadeInUp, staggerChildren } from '@/components/animations/AnimationPresets';
import { TableSkeleton, StatsGridSkeleton } from '@/components/ui/SkeletonLoaders';

// KPI Card Component con animaciones
const KPICard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}> = ({ title, value, icon, color, subtitle, trend }) => (
  <AnimatedCard 
    className="relative overflow-hidden"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg", color)}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
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
        {trend !== undefined && (
          <AnimatedBadge 
            variant={trend > 0 ? "success" : trend < 0 ? "danger" : "gray"}
            className="mb-1"
          >
            {trend > 0 ? '+' : ''}{trend}%
          </AnimatedBadge>
        )}
      </div>
    </CardContent>
    
    {/* Background decoration */}
    <motion.div
      className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10", color.replace('/10', ''))}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </AnimatedCard>
);

// Progress Bar Component
const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ progress, color = "bg-blue-500" }) => (
  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn("h-full rounded-full", color)}
    />
  </div>
);

// Table Row Component con animaciones mejoradas
const TransitoRow: React.FC<{
  transito: Transito;
  onView: (transito: Transito) => void;
  onEdit: (transito: Transito) => void;
  onViewMap: (transito: Transito) => void;
  onMarkDesprecintado: (transito: Transito) => void;
  index: number;
}> = ({ transito, onView, onEdit, onViewMap, onMarkDesprecintado, index }) => {
  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'EN_TRANSITO':
        return { color: 'primary', icon: <Truck className="h-3 w-3" />, label: 'En Tránsito' };
      case 'COMPLETADO':
        return { color: 'success', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Completado' };
      case 'PENDIENTE':
        return { color: 'warning', icon: <Clock className="h-3 w-3" />, label: 'Pendiente' };
      case 'ALERTA':
        return { color: 'danger', icon: <AlertTriangle className="h-3 w-3" />, label: 'Alerta' };
      default:
        return { color: 'gray', icon: <Package className="h-3 w-3" />, label: estado };
    }
  };

  const estadoInfo = getEstadoInfo(transito.estado);
  const progress = transito.progreso || 0;

  return (
    <motion.tr
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      className="border-b border-gray-700 hover:bg-gray-800/50 transition-all duration-200 group"
      whileHover={{ x: 5 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn(
              "w-2 h-2 rounded-full",
              transito.estado === 'EN_TRANSITO' ? 'bg-blue-500' : 
              transito.estado === 'COMPLETADO' ? 'bg-green-500' : 'bg-gray-500'
            )}
            animate={{
              scale: transito.estado === 'EN_TRANSITO' ? [1, 1.5, 1] : 1,
              opacity: transito.estado === 'EN_TRANSITO' ? [1, 0.5, 1] : 1
            }}
            transition={{
              duration: 2,
              repeat: transito.estado === 'EN_TRANSITO' ? Infinity : 0
            }}
          />
          <div>
            <p className="font-medium text-white">{transito.dua}</p>
            <p className="text-sm text-gray-400">{transito.precinto}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <AnimatedBadge 
          variant={estadoInfo.color as any}
          className="flex items-center gap-1"
        >
          {estadoInfo.icon}
          {estadoInfo.label}
        </AnimatedBadge>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-gray-300">{transito.origen}</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-300">{transito.destino}</span>
          </div>
          <ProgressBar progress={progress} color={progress > 75 ? "bg-green-500" : progress > 50 ? "bg-yellow-500" : "bg-blue-500"} />
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <p className="text-sm font-medium">{transito.empresa}</p>
          <p className="text-xs text-gray-400">{transito.encargado}</p>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
        <div className="text-sm">
          <p>{new Date(transito.fechaSalida).toLocaleDateString()}</p>
          {transito.eta && (
            <p className="text-xs">ETA: {new Date(transito.eta).toLocaleDateString()}</p>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => onView(transito)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Ver
          </AnimatedButton>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => onViewMap(transito)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MapPin className="h-4 w-4" />
          </AnimatedButton>
          {transito.estado === 'EN_TRANSITO' && (
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => onMarkDesprecintado(transito)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle2 className="h-4 w-4" />
            </AnimatedButton>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

const TransitosPageV2: React.FC = () => {
  const {
    transitos,
    loading,
    fetchTransitos,
    transitosEnCurso,
    transitosCompletados,
    transitosPendientes,
    markDesprecintado
  } = useTransitosStore();

  const { alertasActivas } = useAlertasStore();
  const { precintosActivos } = usePrecintosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');
  const [dateRange, setDateRange] = useState({ desde: '', hasta: '' });
  const [selectedTransito, setSelectedTransito] = useState<Transito | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTransitos();
  }, [fetchTransitos]);

  // Filtrar y ordenar tránsitos
  const filteredTransitos = React.useMemo(() => {
    let filtered = [...transitos];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.dua.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.precinto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destino.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(t => t.estado === estadoFilter);
    }

    // Filtro por rango de fechas
    if (dateRange.desde) {
      filtered = filtered.filter(t => new Date(t.fechaSalida) >= new Date(dateRange.desde));
    }
    if (dateRange.hasta) {
      filtered = filtered.filter(t => new Date(t.fechaSalida) <= new Date(dateRange.hasta));
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dua':
          return a.dua.localeCompare(b.dua);
        case 'estado':
          return a.estado.localeCompare(b.estado);
        case 'origen':
          return a.origen.localeCompare(b.origen);
        case 'fecha':
        default:
          return new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime();
      }
    });

    return filtered;
  }, [transitos, searchTerm, estadoFilter, sortBy, dateRange]);

  // KPIs calculados
  const kpis = React.useMemo(() => {
    const totalValue = transitos.reduce((sum, t) => sum + (t.valorCarga || 0), 0);
    const avgProgress = transitosEnCurso.reduce((sum, t) => sum + (t.progreso || 0), 0) / (transitosEnCurso.length || 1);
    const onTimeRate = transitosCompletados.filter(t => {
      if (!t.eta || !t.fechaLlegada) return true;
      return new Date(t.fechaLlegada) <= new Date(t.eta);
    }).length / (transitosCompletados.length || 1) * 100;

    return {
      enCurso: transitosEnCurso.length,
      completados: transitosCompletados.length,
      pendientes: transitosPendientes.length,
      conAlertas: transitos.filter(t => t.estado === 'ALERTA').length,
      totalValue,
      avgProgress: Math.round(avgProgress),
      onTimeRate: Math.round(onTimeRate)
    };
  }, [transitos, transitosEnCurso, transitosCompletados, transitosPendientes]);

  const handleExport = () => {
    exportToExcel(filteredTransitos, 'transitos');
  };

  const handleViewTransito = (transito: Transito) => {
    setSelectedTransito(transito);
    setShowDetailModal(true);
  };

  const handleEditTransito = (transito: Transito) => {
    setSelectedTransito(transito);
    setShowEditModal(true);
  };

  const handleViewMap = (transito: Transito) => {
    window.open(`/map/${transito.id}`, '_blank');
  };

  const handleMarkDesprecintado = async (transito: Transito) => {
    await markDesprecintado(transito.id);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Gestión de Tránsitos"
          subtitle="Monitoreo y control de tránsitos aduaneros"
          icon={<Truck className="h-8 w-8 text-blue-500" />}
        />

        {/* KPIs */}
        <AnimatedSection delay={0.1}>
          {loading ? (
            <StatsGridSkeleton items={4} />
          ) : (
            <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="En Curso"
                value={kpis.enCurso}
                icon={<Truck className="h-5 w-5" />}
                color="bg-blue-500/10 text-blue-400"
                subtitle={`${kpis.avgProgress}% promedio`}
                trend={15}
              />
              <KPICard
                title="Completados"
                value={kpis.completados}
                icon={<CheckCircle2 className="h-5 w-5" />}
                color="bg-green-500/10 text-green-400"
                subtitle={`${kpis.onTimeRate}% a tiempo`}
                trend={8}
              />
              <KPICard
                title="Pendientes"
                value={kpis.pendientes}
                icon={<Clock className="h-5 w-5" />}
                color="bg-yellow-500/10 text-yellow-400"
                subtitle="Por iniciar"
                trend={-3}
              />
              <KPICard
                title="Con Alertas"
                value={kpis.conAlertas}
                icon={<AlertTriangle className="h-5 w-5" />}
                color="bg-red-500/10 text-red-400"
                subtitle="Requieren atención"
                trend={-12}
              />
            </AnimatedGrid>
          )}
        </AnimatedSection>

        {/* Stats adicionales */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedDiv className="text-center">
                  <p className="text-sm text-gray-400">Valor Total de Carga</p>
                  <p className="text-2xl font-bold text-white">
                    ${kpis.totalValue.toLocaleString()}
                  </p>
                </AnimatedDiv>
                <AnimatedDiv className="text-center" delay={0.1}>
                  <p className="text-sm text-gray-400">Precintos Activos</p>
                  <p className="text-2xl font-bold text-white">{precintosActivos.length}</p>
                </AnimatedDiv>
                <AnimatedDiv className="text-center" delay={0.2}>
                  <p className="text-sm text-gray-400">Alertas Activas</p>
                  <p className="text-2xl font-bold text-white">{alertasActivas.length}</p>
                </AnimatedDiv>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Controles y Filtros */}
        <AnimatedSection delay={0.3}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Buscar por DUA, precinto, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border-gray-700 flex-1"
                    icon={<Filter className="h-4 w-4 text-gray-400" />}
                  />
                  
                  <Input
                    type="date"
                    placeholder="Desde"
                    value={dateRange.desde}
                    onChange={(e) => setDateRange(prev => ({ ...prev, desde: e.target.value }))}
                    className="bg-gray-800 border-gray-700 w-full sm:w-40"
                  />
                  
                  <Input
                    type="date"
                    placeholder="Hasta"
                    value={dateRange.hasta}
                    onChange={(e) => setDateRange(prev => ({ ...prev, hasta: e.target.value }))}
                    className="bg-gray-800 border-gray-700 w-full sm:w-40"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                      <SelectItem value="COMPLETADO">Completados</SelectItem>
                      <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                      <SelectItem value="ALERTA">Con Alerta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fecha">Fecha</SelectItem>
                      <SelectItem value="dua">DUA</SelectItem>
                      <SelectItem value="estado">Estado</SelectItem>
                      <SelectItem value="origen">Origen</SelectItem>
                    </SelectContent>
                  </Select>

                  <AnimatedButton
                    variant="outline"
                    onClick={() => fetchTransitos()}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </AnimatedButton>

                  <AnimatedButton
                    variant="outline"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </AnimatedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Tabla */}
        <AnimatedSection delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tránsitos</CardTitle>
              <CardDescription>
                {filteredTransitos.length} tránsitos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        DUA / Precinto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ruta / Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <TableSkeleton rows={5} columns={6} />
                        </td>
                      </tr>
                    ) : filteredTransitos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-2"
                          >
                            <Truck className="h-12 w-12 text-gray-600" />
                            <p>No se encontraron tránsitos</p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredTransitos.map((transito, index) => (
                          <TransitoRow
                            key={transito.id}
                            transito={transito}
                            onView={handleViewTransito}
                            onEdit={handleEditTransito}
                            onViewMap={handleViewMap}
                            onMarkDesprecintado={handleMarkDesprecintado}
                            index={index}
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
      </div>

      {/* Modals */}
      {selectedTransito && (
        <>
          <TransitDetailModalEnhanced
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTransito(null);
            }}
            transito={selectedTransito}
          />
          <EditTransitoModalV2
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTransito(null);
            }}
            transito={selectedTransito}
            onSuccess={() => fetchTransitos()}
          />
        </>
      )}
    </PageTransition>
  );
};

export default TransitosPageV2;