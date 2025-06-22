/**
 * Página de Precintos - Versión 2.0 con nuevas implementaciones
 * Incluye: shadcn/ui, Framer Motion, Zustand mejorado
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { Plus, Download, Filter, RefreshCw, Shield, AlertCircle } from 'lucide-react'
import { Input} from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader} from '@/components/ui/Card'
import { 
  PageTransition, AnimatedHeader, AnimatedSection, AnimatedGrid} from '@/components/animations/PageTransitions'
import { AnimatedCard, AnimatedButton, AnimatedBadge, AnimatedSkeleton} from '@/components/animations/AnimatedComponents'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/utils/utils'
import { Precinto} from '@/types/precinto'
import { exportToExcel} from '@/utils/export'
// KPI Card Component
const KPICard: React.FC<{
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: number
}> = ({ title, value, icon, color, trend }) => (
  <AnimatedCard className="relative overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription>{title}</CardDescription>
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold">{value}</div>
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
  </AnimatedCard>
)
// Table Row Component with animations
const PrecintoRow: React.FC<{
  precinto: Precinto
  onView: (precinto: Precinto) => void
  index: number
}> = ({ precinto, onView, index }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'success'
      case 'INACTIVO':
        return 'gray'
      case 'EN_TRANSITO':
        return 'primary'
      case 'ALARMA':
        return 'danger'
      default:
        return 'gray'
    }
  }
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            precinto.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-500'
          )} />
          <span className="font-medium">{precinto.codigo}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <AnimatedBadge variant={getEstadoColor(precinto.estado)} pulse={precinto.estado === 'ALARMA'}>
          {precinto.estado}
        </AnimatedBadge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
        {precinto.ubicacion || 'Sin ubicación'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${precinto.bateria || 0}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
              className={cn(
                "h-full rounded-full",
                precinto.bateria > 50 ? 'bg-green-500' :
                precinto.bateria > 20 ? 'bg-yellow-500' : 'bg-red-500'
              )}
            />
          </div>
          <span className="text-sm text-gray-400">{precinto.bateria}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {precinto.temperatura && (
          <div className="flex items-center gap-1">
            <span className="text-sm">{precinto.temperatura}°C</span>
            {(precinto.temperatura < -5 || precinto.temperatura > 40) && (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
        {new Date(precinto.fechaActivacion).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={() => onView(precinto)}
        >
          Ver detalles
        </AnimatedButton>
      </td>
    </motion.tr>
  )
}
const PrecintosPageV2: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [precintos, setPrecintos] = useState<Precinto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [sortBy, setSortBy] = useState('fecha')
  const fetchPrecintos = async () => {
    setLoading(true)
    // Mock data or actual API call
    setLoading(false)
  }

  useEffect(() => {
    fetchPrecintos()
  }, [])
  // Filtrar y ordenar precintos
  const filteredPrecintos = React.useMemo(() => {
    let filtered = [...precintos]
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(p => p.estado === estadoFilter)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'codigo':
          return a.codigo.localeCompare(b.codigo)
        case 'estado':
          return a.estado.localeCompare(b.estado)
        case 'bateria':
          return (b.bateria || 0) - (a.bateria || 0)
        case 'fecha':
        default:
          return new Date(b.fechaActivacion).getTime() - new Date(a.fechaActivacion).getTime()
      }
    })
    return filtered
  }, [precintos, searchTerm, estadoFilter, sortBy])
  // KPIs
  const kpis = React.useMemo(() => ({
    total: precintos.length,
    activos: precintosActivos.length,
    conAlertas: getPrecintosConAlertas().length,
    bajaBateria: getPrecintosBajaBateria().length
  }), [])
  const handleExport = () => {
    exportToExcel(filteredPrecintos, 'precintos')
  }
  const handleViewPrecinto = (precinto: Precinto) => {
    // Implementar vista de detalle o modal
    console.log('Ver precinto:', precinto)
  }
  return (<PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Gestión de Precintos"
          subtitle="Monitoreo y control de precintos electrónicos"
        />

        {/* KPIs */}
        <AnimatedSection delay={0.1}>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Precintos"
              value={kpis.total}
              icon={<Shield className="h-5 w-5" />}
              color="bg-blue-500/10 text-blue-400"
            />
            <KPICard
              title="Activos"
              value={kpis.activos}
              icon={<Shield className="h-5 w-5" />}
              color="bg-green-500/10 text-green-400"
              trend={12}
            />
            <KPICard
              title="Con Alertas"
              value={kpis.conAlertas}
              icon={<AlertCircle className="h-5 w-5" />}
              color="bg-red-500/10 text-red-400"
              trend={-5}
            />
            <KPICard
              title="Batería Baja"
              value={kpis.bajaBateria}
              icon={<Shield className="h-5 w-5" />}
              color="bg-yellow-500/10 text-yellow-400"
            />
          </AnimatedGrid>
        </AnimatedSection>

        {/* Controles */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por código o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                    icon={<Filter className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ACTIVO">Activos</SelectItem>
                      <SelectItem value="INACTIVO">Inactivos</SelectItem>
                      <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                      <SelectItem value="ALARMA">Con Alarma</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fecha">Fecha</SelectItem>
                      <SelectItem value="codigo">Código</SelectItem>
                      <SelectItem value="estado">Estado</SelectItem>
                      <SelectItem value="bateria">Batería</SelectItem>
                    </SelectContent>
                  </Select>

                  <AnimatedButton
                    variant="outline"
                    onClick={() => {}}
                    disabled={false}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </AnimatedButton>

                  <AnimatedButton
                    variant="outline"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </AnimatedButton>

                  <AnimatedButton variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Precinto
                  </AnimatedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Tabla */}
        <AnimatedSection delay={0.3}>
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
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Batería
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Temperatura
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Activación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8">
                          <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                              <AnimatedSkeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : filteredPrecintos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No se encontraron precintos
                        </td>
                      </tr>
                    ) : (<AnimatePresence mode="popLayout">
                        {filteredPrecintos.map((precinto, index) => (
                          <PrecintoRow
                            key={precinto.id}
                            precinto={precinto}
                            onView={handleViewPrecinto}
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
    </PageTransition>
  )
}
export default PrecintosPageV2