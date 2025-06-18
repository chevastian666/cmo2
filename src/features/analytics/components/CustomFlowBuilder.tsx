/**
 * Custom Flow Builder Component
 * Allows users to create custom Sankey diagrams
 * By Cheva
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Select, _SelectContent, _SelectItem, _SelectTrigger, _SelectValue} from '@/components/ui/select';
import { Plus, Trash2, Play } from 'lucide-react';
import { SankeyChart } from '@/components/charts/sankey/SankeyChart';
import type { SankeyData, FlowData } from '@/components/charts/types/sankey.types';
import { aggregateFlows } from '@/components/charts/sankey/utils/dataTransformers';
import { toast } from '@/hooks/use-toast';

export const CustomFlowBuilder: React.FC = () => {
  const [flows, setFlows] = useState<FlowData[]>([
    { from: 'Origen A', to: 'Destino 1', value: 100 },
    { from: 'Origen A', to: 'Destino 2', value: 50 },
    { from: 'Origen B', to: 'Destino 1', value: 75 },
    { from: 'Destino 1', to: 'Final', value: 150 },
    { from: 'Destino 2', to: 'Final', value: 50 }
  ]);
  
  const [newFlow, setNewFlow] = useState<FlowData>({
    from: '',
    to: '',
    value: 0
  });

  const [chartData, setChartData] = useState<SankeyData | null>(null);

  const handleAddFlow = () => {
    if (newFlow.from && newFlow.to && newFlow.value > 0) {
      setFlows([...flows, { ...newFlow }]);
      setNewFlow({ from: '', to: '', value: 0 });
      toast({
        title: 'Flujo agregado',
        description: `${newFlow.from} → ${newFlow.to}: ${newFlow.value}`
      });
    }
  };

  const handleRemoveFlow = (index: number) => {
    setFlows(flows.filter((_, i) => i !== index));
  };

  const handleGenerateChart = () => {
    if (flows.length === 0) {
      toast({
        title: 'Error',
        description: 'Agrega al menos un flujo para generar el gráfico',
        variant: 'destructive'
      });
      return;
    }

    const _data = aggregateFlows(flows);
    setChartData(_data);
  };

  // Get unique nodes for suggestions
  const allNodes = Array.from(new Set(
    flows.flatMap(f => [f.from, f.to])
  )).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Flow Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Constructor de Flujos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Flows */}
          <div>
            <Label>Flujos Actuales</Label>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {flows.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay flujos definidos. Agrega uno para comenzar.
                </p>
              ) : (
                flows.map((flow, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                    <span className="flex-1 text-sm">
                      {flow.from} → {flow.to}: <strong>{flow.value}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFlow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Desde</Label>
              <Input
                placeholder="Nodo origen"
                value={newFlow.from}
                onChange={(e) => setNewFlow({ ...newFlow, from: e.target.value })}
                list="from-nodes"
              />
              <datalist id="from-nodes">
                {allNodes.map(node => (
                  <option key={node} value={node} />
                ))}
              </datalist>
            </div>
            
            <div>
              <Label>Hacia</Label>
              <Input
                placeholder="Nodo destino"
                value={newFlow.to}
                onChange={(e) => setNewFlow({ ...newFlow, to: e.target.value })}
                list="to-nodes"
              />
              <datalist id="to-nodes">
                {allNodes.map(node => (
                  <option key={node} value={node} />
                ))}
              </datalist>
            </div>
            
            <div>
              <Label>Valor</Label>
              <Input
                type="number"
                placeholder="0"
                value={newFlow.value}
                onChange={(e) => setNewFlow({ ...newFlow, value: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleAddFlow} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleGenerateChart} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Generar Gráfico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {chartData && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-900 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
              <SankeyChart
                data={chartData}
                width={900}
                height={500}
                margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
                nodeWidth={20}
                nodePadding={20}
                animated={true}
                interactive={true}
                showLabels={true}
                showValues={true}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Predefinidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setFlows([
                  { from: 'Producción', to: 'Almacén', value: 100 },
                  { from: 'Almacén', to: 'Distribución', value: 80 },
                  { from: 'Almacén', to: 'Devoluciones', value: 20 },
                  { from: 'Distribución', to: 'Cliente Final', value: 75 },
                  { from: 'Distribución', to: 'Pérdidas', value: 5 }
                ]);
                toast({ title: 'Plantilla cargada', description: 'Cadena de suministro' });
              }}
            >
              Cadena de Suministro
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setFlows([
                  { from: 'Nuevo', to: 'En Proceso', value: 100 },
                  { from: 'En Proceso', to: 'Revisión', value: 90 },
                  { from: 'En Proceso', to: 'Cancelado', value: 10 },
                  { from: 'Revisión', to: 'Completado', value: 85 },
                  { from: 'Revisión', to: 'En Proceso', value: 5 }
                ]);
                toast({ title: 'Plantilla cargada', description: 'Flujo de trabajo' });
              }}
            >
              Flujo de Trabajo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setFlows([
                  { from: 'Visitante', to: 'Usuario', value: 1000 },
                  { from: 'Usuario', to: 'Cliente', value: 300 },
                  { from: 'Cliente', to: 'Cliente Premium', value: 100 },
                  { from: 'Usuario', to: 'Inactivo', value: 200 },
                  { from: 'Cliente', to: 'Inactivo', value: 50 }
                ]);
                toast({ title: 'Plantilla cargada', description: 'Conversión de usuarios' });
              }}
            >
              Conversión de Usuarios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};