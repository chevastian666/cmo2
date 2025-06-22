/**
 * D3 Visualizations Demo Page
 * Showcase of all interactive D3.js charts
 * By Cheva
 */

import React, { useState } from 'react'
import { D3VisualizationWidget} from '../../../components/charts/d3/D3VisualizationWidget'
import { InteractiveLineChart, ActivityHeatmap, NetworkGraph, InteractiveTreemap} from '../../../components/charts/d3'
import type { TimeSeriesData, HeatmapData, NetworkData, TreemapNode} from '../../../components/charts/d3'
export const D3VisualizationsDemo: React.FC = () => {
  const [selectedData, setSelectedData] = useState<unknown>(_null)
  // Generate sample data
  const timeSeriesData: TimeSeriesData[] = Array.from({ length: 30 }, (__, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (30 - i))
    return {
      date,
      value: Math.floor(Math.random() * 200) + 100 + Math.sin(i * 0.2) * 50,
      category: ['Transitos', 'Precintos', 'Alertas'][Math.floor(Math.random() * 3)],
      metadata: {
        empresa: ['ACME Corp', 'Global Logistics', 'Fast Shipping'][Math.floor(Math.random() * 3)],
        tipo: ['Import', 'Export', 'Transit'][Math.floor(Math.random() * 3)]
      }
    }
  })
  const heatmapData: HeatmapData[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmapData.push({
        day,
        hour,
        value: Math.floor(Math.random() * 80) + (hour >= 8 && hour <= 18 ? 40 : 10),
        label: `${Math.floor(Math.random() * 50)} transacciones`
      })
    }
  }

  const networkData: NetworkData = {
    nodes: [
      { id: 'MVD', label: 'Puerto MVD', value: 120, group: 'Puerto', metadata: { pais: 'Uruguay' } },
      { id: 'BA', label: 'Puerto BA', value: 100, group: 'Puerto', metadata: { pais: 'Argentina' } },
      { id: 'SP', label: 'Santos', value: 90, group: 'Puerto', metadata: { pais: 'Brasil' } },
      { id: 'TERM1', label: 'Terminal 1', value: 60, group: 'Terminal', metadata: { capacidad: '1000 TEU' } },
      { id: 'TERM2', label: 'Terminal 2', value: 55, group: 'Terminal', metadata: { capacidad: '800 TEU' } },
      { id: 'DEP1', label: 'Depósito A', value: 40, group: 'Depósito', metadata: { zona: 'Norte' } },
      { id: 'DEP2', label: 'Depósito B', value: 35, group: 'Depósito', metadata: { zona: 'Sur' } },
      { id: 'CLI1', label: 'Cliente Alpha', value: 25, group: 'Cliente', metadata: { tipo: 'Importador' } },
      { id: 'CLI2', label: 'Cliente Beta', value: 20, group: 'Cliente', metadata: { tipo: 'Exportador' } }
    ],
    links: [
      { source: 'MVD', target: 'TERM1', value: 50, label: 'Ruta Principal' },
      { source: 'MVD', target: 'TERM2', value: 40, label: 'Ruta Secundaria' },
      { source: 'BA', target: 'TERM1', value: 35, label: 'Internacional' },
      { source: 'SP', target: 'TERM2', value: 30, label: 'Internacional' },
      { source: 'TERM1', target: 'DEP1', value: 45, label: 'Distribución' },
      { source: 'TERM1', target: 'DEP2', value: 25, label: 'Distribución' },
      { source: 'TERM2', target: 'DEP1', value: 20, label: 'Distribución' },
      { source: 'DEP1', target: 'CLI1', value: 30, label: 'Entrega Final' },
      { source: 'DEP1', target: 'CLI2', value: 25, label: 'Entrega Final' },
      { source: 'DEP2', target: 'CLI2', value: 15, label: 'Entrega Final' }
    ]
  }
  const treemapData: TreemapNode = {
    name: 'Sistema CMO',
    value: 0,
    children: [
      {
        name: 'Importaciones',
        value: 0,
        category: 'Import',
        children: [
          { name: 'Contenedores', value: 150, category: 'Import', metadata: { tipo: 'FCL' } },
          { name: 'Carga Suelta', value: 95, category: 'Import', metadata: { tipo: 'LCL' } },
          { name: 'Refrigerado', value: 60, category: 'Import', metadata: { tipo: 'REEFER' } },
          { name: 'Peligrosa', value: 25, category: 'Import', metadata: { tipo: 'DG' } }
        ]
      },
      {
        name: 'Exportaciones',
        value: 0,
        category: 'Export',
        children: [
          { name: 'Productos Agrícolas', value: 120, category: 'Export', metadata: { sector: 'Agro' } },
          { name: 'Carne', value: 85, category: 'Export', metadata: { sector: 'Ganadero' } },
          { name: 'Lácteos', value: 55, category: 'Export', metadata: { sector: 'Ganadero' } },
          { name: 'Manufacturas', value: 40, category: 'Export', metadata: { sector: 'Industrial' } }
        ]
      },
      {
        name: 'Tránsitos',
        value: 0,
        category: 'Transit',
        children: [
          { name: 'Paraguay', value: 90, category: 'Transit', metadata: { destino: 'Asunción' } },
          { name: 'Argentina Interior', value: 70, category: 'Transit', metadata: { destino: 'Córdoba' } },
          { name: 'Brasil Sur', value: 45, category: 'Transit', metadata: { destino: 'Porto Alegre' } }
        ]
      },
      {
        name: 'Servicios',
        value: 0,
        category: 'Services',
        children: [
          { name: 'Almacenaje', value: 65, category: 'Services', metadata: { tipo: 'Warehouse' } },
          { name: 'Inspecciones', value: 35, category: 'Services', metadata: { tipo: 'Control' } },
          { name: 'Consolidación', value: 25, category: 'Services', metadata: { tipo: 'LCL' } }
        ]
      }
    ]
  }
  const handleDataPointClick = (data: unknown) => {
    setSelectedData(_data)
    console.log('Data point clicked:', data)
  }
  const handleZoomChange = (domain: [Date, Date]) => {
    console.log('Zoom changed:', domain)
  }
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            D3.js Interactive Visualizations
          </h1>
          <p className="text-gray-400">
            Demonstración de visualizaciones interactivas para el sistema CMO
          </p>
        </div>

        {/* Combined Widget Demo */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Widget Combinado (Cambia entre tipos)
          </h2>
          <D3VisualizationWidget
            type="line"
            data={_null} // Use generated data
            title="Visualización Interactiva Combinada"
            onDataPointClick={_handleDataPointClick}
            onZoomChange={_handleZoomChange}
            onNodeClick={_handleDataPointClick}
            onLinkClick={_handleDataPointClick}
          />
        </div>

        {/* Individual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                📈 Gráfico de Líneas con Zoom
              </h3>
              <p className="text-sm text-gray-400">
                Histórico de transacciones con zoom y pan
              </p>
            </div>
            <div className="p-4">
              <div className="h-80">
                <InteractiveLineChart
                  data={_timeSeriesData}
                  onDataPointClick={_handleDataPointClick}
                  onZoomChange={_handleZoomChange}
                />
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                🔥 Mapa de Calor
              </h3>
              <p className="text-sm text-gray-400">
                Actividad por hora y día de la semana
              </p>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ActivityHeatmap
                  data={_heatmapData}
                  onCellClick={_handleDataPointClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Network Graph */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                🕸️ Gráfico de Red
              </h3>
              <p className="text-sm text-gray-400">
                Conexiones entre puertos, terminales y clientes
              </p>
            </div>
            <div className="p-4">
              <div className="h-96">
                <NetworkGraph
                  data={_networkData}
                  onNodeClick={_handleDataPointClick}
                  onLinkClick={_handleDataPointClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Treemap */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                🗂️ Treemap Interactivo
              </h3>
              <p className="text-sm text-gray-400">
                Distribución jerárquica de transacciones por tipo
              </p>
            </div>
            <div className="p-4">
              <div className="h-96">
                <InteractiveTreemap
                  data={_treemapData}
                  onNodeClick={_handleDataPointClick}
                  enableDrillDown={_true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Data Panel */}
        {selectedData && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                📋 Datos Seleccionados
              </h3>
            </div>
            <div className="p-4">
              <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-auto">
                {JSON.stringify(s_electedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              ✨ Características Implementadas
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Gráfico de Líneas</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Zoom y pan interactivo</li>
                  <li>• Tooltips con información detallada</li>
                  <li>• Animaciones suaves</li>
                  <li>• Botón de reset del zoom</li>
                  <li>• Gradientes y efectos visuales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Mapa de Calor</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Escala de colores secuencial</li>
                  <li>• Leyenda de intensidad</li>
                  <li>• Estadísticas en tiempo real</li>
                  <li>• Hover effects</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Gráfico de Red</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Simulación física de fuerzas</li>
                  <li>• Drag and drop de nodos</li>
                  <li>• Zoom y pan</li>
                  <li>• Highlighting de conexiones</li>
                  <li>• Leyenda y controles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Treemap</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Drill-down interactivo</li>
                  <li>• Breadcrumbs de navegación</li>
                  <li>• Etiquetas adaptativas</li>
                  <li>• Estadísticas por nivel</li>
                  <li>• Colores por categoría</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}