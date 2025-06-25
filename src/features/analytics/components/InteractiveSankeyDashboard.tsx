/**
 * Interactive Sankey Dashboard
 * Complete analytics dashboard with multiple Sankey visualizations
 * By Cheva
 */

import React, { useState } from 'react'
import { motion} from 'framer-motion'
import { Download, Maximize2, Info, TrendingUp, RefreshCw} from 'lucide-react'
import { Card, CardContent} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import {
  Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/Tabs'
import { LogisticsFlowChart} from './LogisticsFlowChart'
import { PrecintoLifecycleFlow} from './PrecintoLifecycleFlow'
import { AlertFlowAnalysis} from './AlertFlowAnalysis'
import { CustomFlowBuilder} from './CustomFlowBuilder'
import { DatePickerWithRange} from '@/components/ui/date-picker-range'
import { toast} from '@/hooks/use-toast'
const InteractiveSankeyDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('logistics')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
    toast({
      title: 'Datos actualizados',
      description: 'Los gráficos han sido actualizados con los datos más recientes.'
    })
  }
  const handleExportAll = () => {
    toast({
      title: 'Exportando dashboard',
      description: 'Se generará un PDF con todos los gráficos.'
    })
  }
  const chartInfo = {
    logistics: {
      title: 'Flujos Logísticos',
      description: 'Visualiza el flujo de tránsitos entre diferentes puntos de origen y destino, mostrando volúmenes y eficiencias.'
    },
    lifecycle: {
      title: 'Ciclo de Vida de Precintos',
      description: 'Muestra el flujo de precintos a través de sus diferentes estados, desde la creación hasta la desactivación.'
    },
    alerts: {
      title: 'Análisis de Alertas',
      description: 'Rastrea el flujo de alertas desde su origen hasta su resolución, categorizadas por tipo y severidad.'
    },
    custom: {
      title: 'Constructor de Flujos',
      description: 'Crea visualizaciones personalizadas de flujos de datos seleccionando métricas y dimensiones específicas.'
    }
  }
  return (<div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Análisis de Flujos de Datos</h1>
          <p className="text-gray-400 mt-1">
            Visualización interactiva de flujos logísticos y operacionales
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
            className="w-auto"
          />
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Todo
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Flujos Activos</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-green-500 mt-1">+12% vs mes anterior</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Volumen Total</p>
                <p className="text-2xl font-bold">45, 382</p>
                <p className="text-xs text-green-500 mt-1">+8% vs mes anterior</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Eficiencia Promedio</p>
                <p className="text-2xl font-bold">94.3%</p>
                <p className="text-xs text-yellow-500 mt-1">-2% vs mes anterior</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alertas Resueltas</p>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-green-500 mt-1">+5% vs mes anterior</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logistics">Flujos Logísticos</TabsTrigger>
            <TabsTrigger value="lifecycle">Ciclo de Vida</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="logistics" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {chartInfo.logistics.title}
                  </h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{chartInfo.logistics.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenChart('logistics')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <LogisticsFlowChart />
            </TabsContent>

            <TabsContent value="lifecycle" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {chartInfo.lifecycle.title}
                  </h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{chartInfo.lifecycle.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenChart('lifecycle')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <PrecintoLifecycleFlow dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {chartInfo.alerts.title}
                  </h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{chartInfo.alerts.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenChart('alerts')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <AlertFlowAnalysis dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {chartInfo.custom.title}
                  </h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{chartInfo.custom.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenChart('custom')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <CustomFlowBuilder />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      {/* Fullscreen Dialog */}
      <Dialog open={!!fullscreenChart} onOpenChange={() => setFullscreenChart(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {fullscreenChart && chartInfo[fullscreenChart as keyof typeof chartInfo].title}
            </DialogTitle>
            <DialogDescription>
              {fullscreenChart && chartInfo[fullscreenChart as keyof typeof chartInfo].description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {fullscreenChart === 'logistics' && <LogisticsFlowChart />}
            {fullscreenChart === 'lifecycle' && <PrecintoLifecycleFlow dateRange={dateRange} />}
            {fullscreenChart === 'alerts' && <AlertFlowAnalysis dateRange={dateRange} />}
            {fullscreenChart === 'custom' && <CustomFlowBuilder />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default InteractiveSankeyDashboard