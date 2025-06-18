/**
 * Simple Analytics Page
 * No D3 dependencies - just UI
 * By Cheva
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';

const SimpleAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Flujos de Datos</h1>
          <p className="text-gray-400 mt-1">
            Visualización interactiva de flujos logísticos y operacionales
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Flujos Activos', value: '127', change: '+12%', color: 'blue' },
          { label: 'Volumen Total', value: '45,382', change: '+8%', color: 'green' },
          { label: 'Eficiencia', value: '94.3%', change: '-2%', color: 'yellow' },
          { label: 'Alertas Resueltas', value: '89%', change: '+5%', color: 'purple' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs mt-1 text-${stat.color}-500`}>{stat.change} vs mes anterior</p>
                </div>
                <div className={`p-3 bg-${stat.color}-500/10 rounded-lg`}>
                  <TrendingUp className={`h-6 w-6 text-${stat.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500">
              Los gráficos Sankey se cargarán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAnalytics;