/**
 * Depósitos Page V2 - Gestión de depósitos aduaneros
 * Incluye: shadcn/ui, Framer Motion, Animaciones, Zustand mejorado
 * By Cheva
 */

import React, { useState, useMemo } from 'react';
import {Plus, Search,Filter, Download, Building2,MapPin,Phone,Clock,Package,TrendingUp, AlertCircle, Edit2, Eye,X, ChevronDown, ChevronUp,Building,Hash,Users, Activity,Calendar, Zap, Map, Info} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Card, CardContent,CardDescription, CardHeader, CardTitle} from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  AnimatedDiv,
  AnimatedSpinner,
  AnimatedSkeleton
} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useDepositosStore } from '@/store/useDepositosStore';
import { exportToCSV } from '@/utils/export';
import { cn } from '@/utils/utils';
import type { Deposito, DepositoFilters, DEPOSITO_TIPOS, DEPOSITO_ZONAS } from '../types';
import { DepositoDetailModal } from '../components/DepositoDetailModal';
import { DepositoFormModal } from '../components/DepositoFormModal';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import type { MapMarker } from '@/components/maps/InteractiveMap';
import {staggerContainer, staggerItem, fadeInUp, scaleIn, slideInRight} from '@/components/animations/AnimationPresets';

export const DepositosPageV2: React.FC = () => {
  const {depositos, loading, addDeposito, updateDeposito} = useDepositosStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeposito, setSelectedDeposito] = useState<Deposito | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState<Deposito | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedView, setSelectedView] = useState<'grid' | 'table' | 'map'>('table');
  const [filters, setFilters] = useState<DepositoFilters>({
    tipo: '',
    zona: '',
    padre: ''
  });

  const filteredDepositos = useMemo(() => {
    return depositos.filter(deposito => {
      const matchesSearch = searchTerm === '' || 
        deposito.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposito.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposito.codigo.toString().includes(searchTerm);
        
      const matchesTipo = !filters.tipo || deposito.tipo === filters.tipo;
      const matchesZona = !filters.zona || deposito.zona === filters.zona;
      const matchesPadre = !filters.padre || deposito.padre === filters.padre;
      
      return matchesSearch && matchesTipo && matchesZona && matchesPadre;
    });
  }, [depositos, searchTerm, filters]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const stats = useMemo(() => {
    const totalTransitos = depositos.reduce((acc, d) => acc + d.transitosActivos, 0);
    const activeDepositos = depositos.filter(d => d.estado === 'activo').length;
    const totalCapacity = depositos.reduce((acc, d) => acc + d.capacidad, 0);
    const avgOccupancy = totalCapacity > 0 ? (totalTransitos / totalCapacity) * 100 : 0;

    return {
      total: depositos.length,
      active: activeDepositos,
      transitos: totalTransitos,
      avgOccupancy: Math.round(avgOccupancy)
    };
  }, [depositos]);

  const handleExport = () => {
    const data = filteredDepositos.map(d => ({
      Código: d.codigo,
      Nombre: d.nombre,
      Alias: d.alias,
      Ubicación: `${d.lat}, ${d.lng}`,
      Padre: d.padre,
      Tipo: d.tipo,
      Zona: d.zona,
      Empresa: d.empresa || '-',
      'Tránsitos Activos': d.transitosActivos,
      Estado: d.estado
    }));
    exportToCSV(data, 'depositos');
  };

  const handleView = (deposito: Deposito) => {
    setSelectedDeposito(deposito);
    setShowDetail(true);
  };

  const handleEdit = (deposito: Deposito) => {
    setEditingDeposito(deposito);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingDeposito(null);
    setShowForm(true);
  };

  const handleSave = (_data: Partial<Deposito>) => {
    if (editingDeposito) {
      updateDeposito(editingDeposito.id, data);
    } else {
      addDeposito(data as Omit<Deposito, 'id'>);
    }
    setShowForm(false);
  };

  const toggleRowExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setFilters({ tipo: '', zona: '', padre: '' });
    setSearchTerm('');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Depósitos"
          subtitle="Gestión y monitoreo de depósitos aduaneros"
          icon={<Building2 className="h-8 w-8 text-blue-500" />}
          action={
            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="outline"
                onClick={handleExport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </AnimatedButton>
              <AnimatedButton
                onClick={handleAdd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Depósito
              </AnimatedButton>
            </div>
          }
        />

        {/* Stats Cards */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Depósitos"
              value={stats.total}
              icon={<Building2 className="h-5 w-5" />}
              color="text-blue-400"
              trend={`${stats.active} activos`}
            />
            <StatsCard
              title="Tránsitos Activos"
              value={stats.transitos}
              icon={<Package className="h-5 w-5" />}
              color="text-green-400"
              trend="En tiempo real"
            />
            <StatsCard
              title="Ocupación Promedio"
              value={`${stats.avgOccupancy}%`}
              icon={<Activity className="h-5 w-5" />}
              color="text-orange-400"
              trend="De capacidad total"
            />
            <StatsCard
              title="Zonas Activas"
              value={new Set(depositos.map(d => d.zona)).size}
              icon={<Map className="h-5 w-5" />}
              color="text-purple-400"
              trend="Zonas únicas"
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Search and Filters */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por código, nombre o alias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedView} onValueChange={(v: unknown) => setSelectedView(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Tabla</SelectItem>
                      <SelectItem value="grid">Grilla</SelectItem>
                      <SelectItem value="map">Mapa</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <AnimatedButton
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 px-1.5 py-0.5 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </AnimatedButton>
                </div>
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select 
                          value={filters.tipo} 
                          onValueChange={(v) => setFilters(prev => ({ ...prev, tipo: v }))}
                        >
                          <SelectTrigger id="tipo" className="mt-1">
                            <SelectValue placeholder="Todos los tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos los tipos</SelectItem>
                            <SelectItem value="Terminal Portuaria">Terminal Portuaria</SelectItem>
                            <SelectItem value="Zona Franca">Zona Franca</SelectItem>
                            <SelectItem value="Depósito Privado">Depósito Privado</SelectItem>
                            <SelectItem value="Control Integrado">Control Integrado</SelectItem>
                            <SelectItem value="Puerto">Puerto</SelectItem>
                            <SelectItem value="Aeropuerto">Aeropuerto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="zona">Zona</Label>
                        <Select 
                          value={filters.zona} 
                          onValueChange={(v) => setFilters(prev => ({ ...prev, zona: v }))}
                        >
                          <SelectTrigger id="zona" className="mt-1">
                            <SelectValue placeholder="Todas las zonas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas las zonas</SelectItem>
                            <SelectItem value="Puerto">Puerto</SelectItem>
                            <SelectItem value="ZF Florida">ZF Florida</SelectItem>
                            <SelectItem value="ZF Libertad">ZF Libertad</SelectItem>
                            <SelectItem value="Aeropuerto">Aeropuerto</SelectItem>
                            <SelectItem value="Chuy">Chuy</SelectItem>
                            <SelectItem value="Rivera">Rivera</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="padre">Padre</Label>
                        <Select 
                          value={filters.padre} 
                          onValueChange={(v) => setFilters(prev => ({ ...prev, padre: v }))}
                        >
                          <SelectTrigger id="padre" className="mt-1">
                            <SelectValue placeholder="Todos los padres" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos los padres</SelectItem>
                            {Array.from(new Set(depositos.map(d => d.padre))).map(padre => (
                              <SelectItem key={padre} value={padre}>{padre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {activeFiltersCount > 0 && (
                      <div className="mt-4 flex justify-end">
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Limpiar filtros
                        </AnimatedButton>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Content based on selected view */}
        <AnimatedSection delay={0.3}>
          {selectedView === 'table' && (
            <DepositosTable
              depositos={filteredDepositos}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              expandedRows={expandedRows}
              onToggleExpand={toggleRowExpand}
            />
          )}
          
          {selectedView === 'grid' && (
            <DepositosGrid
              depositos={filteredDepositos}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
            />
          )}
          
          {selectedView === 'map' && (
            <DepositosMap
              depositos={filteredDepositos}
              loading={loading}
              onView={handleView}
            />
          )}
        </AnimatedSection>

        {/* Modals */}
        {showDetail && selectedDeposito && (
          <DepositoDetailModal
            deposito={selectedDeposito}
            isOpen={showDetail}
            onClose={() => setShowDetail(false)}
            onEdit={() => {
              setShowDetail(false);
              handleEdit(selectedDeposito);
            }}
          />
        )}

        {showForm && (
          <DepositoFormModal
            deposito={editingDeposito}
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </PageTransition>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <AnimatedCard whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <motion.div 
          className={cn("p-2 rounded-lg bg-gray-800", color)}
          whileHover={{ rotate: 15 }}
        >
          {icon}
        </motion.div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {trend && (
        <p className="text-sm text-gray-500 mt-1">{trend}</p>
      )}
    </CardContent>
  </AnimatedCard>
);

// Table Component
const DepositosTable: React.FC<{
  depositos: Deposito[];
  loading: boolean;
  onView: (deposito: Deposito) => void;
  onEdit: (deposito: Deposito) => void;
  expandedRows: Set<string>;
  onToggleExpand: (id: string) => void;
}> = ({ depositos, loading, onView, onEdit, expandedRows, onToggleExpand }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <AnimatedSpinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (depositos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No se encontraron depósitos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nombre / Alias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo / Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tránsitos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {depositos.map((deposito, index) => (
                  <React.Fragment key={deposito.id}>
                    <motion.tr
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => onToggleExpand(deposito.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: expandedRows.has(deposito.id) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="mr-2"
                          >
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </motion.div>
                          <span className="font-mono text-sm">{deposito.codigo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{deposito.nombre}</p>
                          <p className="text-sm text-gray-400">{deposito.alias}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {deposito.tipo}
                          </Badge>
                          <p className="text-sm text-gray-400 mt-1">{deposito.zona}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{deposito.transitosActivos}</span>
                          {deposito.transitosActivos > 0 && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Progress 
                            value={(deposito.transitosActivos / deposito.capacidad) * 100} 
                            className="w-20 h-2"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {deposito.transitosActivos}/{deposito.capacidad}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AnimatedBadge
                          variant={deposito.estado === 'activo' ? 'success' : 'secondary'}
                          pulse={deposito.estado === 'activo'}
                        >
                          {deposito.estado}
                        </AnimatedBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(deposito)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="h-4 w-4" />
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(deposito)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedRows.has(deposito.id) && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={7} className="px-6 py-4 bg-gray-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Ubicación</p>
                                <p className="text-sm flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {deposito.lat.toFixed(6)}, {deposito.lng.toFixed(6)}
                                </p>
                              </div>
                              {deposito.telefono && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase mb-1">Teléfono</p>
                                  <p className="text-sm flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    {deposito.telefono}
                                  </p>
                                </div>
                              )}
                              {deposito.horaApertura && deposito.horaCierre && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase mb-1">Horario</p>
                                  <p className="text-sm flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    {deposito.horaApertura} - {deposito.horaCierre}
                                  </p>
                                </div>
                              )}
                              {deposito.empresa && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase mb-1">Empresa</p>
                                  <p className="text-sm">{deposito.empresa}</p>
                                </div>
                              )}
                              {deposito.direccion && (
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-500 uppercase mb-1">Dirección</p>
                                  <p className="text-sm">{deposito.direccion}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Grid Component
const DepositosGrid: React.FC<{
  depositos: Deposito[];
  loading: boolean;
  onView: (deposito: Deposito) => void;
  onEdit: (deposito: Deposito) => void;
}> = ({ depositos, loading, onView, onEdit }) => {
  if (loading) {
    return (
      <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <AnimatedSkeleton key={i} className="h-64" />
        ))}
      </AnimatedGrid>
    );
  }

  return (
    <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {depositos.map((deposito, index) => (
        <AnimatedCard
          key={deposito.id}
          variants={staggerItem}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() => onView(deposito)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  {deposito.codigo}
                </CardTitle>
                <CardDescription className="mt-1">{deposito.alias}</CardDescription>
              </div>
              <AnimatedBadge
                variant={deposito.estado === 'activo' ? 'success' : 'secondary'}
                pulse={deposito.estado === 'activo'}
              >
                {deposito.estado}
              </AnimatedBadge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white line-clamp-2">{deposito.nombre}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Tipo</p>
                <p className="font-medium">{deposito.tipo}</p>
              </div>
              <div>
                <p className="text-gray-500">Zona</p>
                <p className="font-medium">{deposito.zona}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Ocupación</span>
                <span className="text-sm font-medium">
                  {deposito.transitosActivos}/{deposito.capacidad}
                </span>
              </div>
              <Progress 
                value={(deposito.transitosActivos / deposito.capacidad) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{deposito.padre}</span>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(deposito)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="h-4 w-4" />
                </AnimatedButton>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      ))}
    </AnimatedGrid>
  );
};

// Map Component
const DepositosMap: React.FC<{
  depositos: Deposito[];
  loading: boolean;
  onView: (deposito: Deposito) => void;
}> = ({ depositos, loading, onView }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <AnimatedSpinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert depositos to map markers
  const markers: MapMarker[] = depositos.map(deposito => ({
    id: deposito.id,
    position: { lat: deposito.lat, lng: deposito.lng },
    title: deposito.nombre,
    type: 'deposito',
    color: deposito.estado === 'activo' ? '#10B981' : '#6B7280',
    data: {
      codigo: deposito.codigo,
      alias: deposito.alias,
      tipo: deposito.tipo,
      zona: deposito.zona,
      transitosActivos: deposito.transitosActivos,
      capacidad: deposito.capacidad,
      estado: deposito.estado,
      telefono: deposito.telefono,
      direccion: deposito.direccion,
      empresa: deposito.empresa
    }
  }));

  return (
    <InteractiveMap
      markers={markers}
      height="600px"
      showControls={true}
      showLegend={true}
      showSearch={true}
      onMarkerClick={(marker) => {
        const deposito = depositos.find(d => d.id === marker.id);
        if (deposito) onView(deposito);
      }}
    />
  );
};

export default DepositosPageV2;