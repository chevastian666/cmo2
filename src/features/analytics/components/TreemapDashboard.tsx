/**
 * Treemap Dashboard
 * Interactive treemap visualizations for CMO data
 * By Cheva
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {_BarChart3, Info, Download, Maximize2, Grid3X3, _Package, _Truck, _AlertTriangle, _Building} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PrecintosTreemap } from './treemap/PrecintosTreemap';
import { TransitosTreemap } from './treemap/TransitosTreemap';
import { AlertasTreemap } from './treemap/AlertasTreemap';
import { OperationalTreemap } from './treemap/OperationalTreemap';
import { toast } from '@/hooks/use-toast';

export const TreemapDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('precintos');
  const [fullscreenView, setFullscreenView] = useState<string | null>(null);

  const handleExport = () => {
    toast({
      title: 'Exportando visualización',
      description: 'Se generará un archivo SVG de alta resolución.'
    });
  };

  const tabInfo = {
    precintos: {
      title: 'Distribución de Precintos',
      description: 'Visualización jerárquica de precintos por empresa, tipo y estado.',
      icon: Package
    },
    transitos: {
      title: 'Análisis de Tránsitos',
      description: 'Mapa de rutas y estados de tránsitos con análisis temporal.',
      icon: Truck
    },
    alertas: {
      title: 'Mapa de Alertas',
      description: 'Distribución de alertas por severidad, tipo y estado de resolución.',
      icon: AlertTriangle
    },
    operational: {
      title: 'Vista Operacional',
      description: 'Análisis integral de operaciones con múltiples dimensiones.',
      icon: Building
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Grid3X3 className="h-8 w-8 text-blue-500" />
            Treemaps Interactivos
          </h1>
          <p className="text-gray-400 mt-1">
            Visualización jerárquica con zoom infinito para análisis profundo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Cómo usar los treemaps:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Click en cualquier rectángulo para hacer zoom</li>
              <li>• Click derecho para ver detalles adicionales</li>
              <li>• Usa la rueda del mouse para zoom manual</li>
              <li>• Click en el fondo para restablecer la vista</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="precintos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Precintos
            </TabsTrigger>
            <TabsTrigger value="transitos" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Tránsitos
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="operational" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Operacional
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {Object.entries(tabInfo).map(([key, info]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{info.title}</h2>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <p className="text-sm">{info.description}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullscreenView(key)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {key === 'precintos' && <PrecintosTreemap />}
                {key === 'transitos' && <TransitosTreemap />}
                {key === 'alertas' && <AlertasTreemap />}
                {key === 'operational' && <OperationalTreemap />}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </motion.div>

      {/* Fullscreen Dialog */}
      <Dialog open={!!fullscreenView} onOpenChange={() => setFullscreenView(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {fullscreenView && tabInfo[fullscreenView as keyof typeof tabInfo].title}
            </DialogTitle>
            <DialogDescription>
              {fullscreenView && tabInfo[fullscreenView as keyof typeof tabInfo].description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {fullscreenView === 'precintos' && <PrecintosTreemap />}
            {fullscreenView === 'transitos' && <TransitosTreemap />}
            {fullscreenView === 'alertas' && <AlertasTreemap />}
            {fullscreenView === 'operational' && <OperationalTreemap />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};