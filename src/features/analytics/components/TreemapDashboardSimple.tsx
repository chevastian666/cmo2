/**
 * Simple Treemap Dashboard
 * Simplified version for debugging
 * By Cheva
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { TreemapChart} from '@/components/charts/treemap/TreemapChart'
import { Package, Truck, AlertTriangle } from 'lucide-react'

interface MockPrecinto {
  estado?: string;
}
interface MockTransito {
  estado?: string;
}
interface MockAlerta {
  tipo?: string;
}

const TreemapDashboardSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState('precintos')
  // Transform precintos data
  const precintosData = useMemo(() => {
    // Use mock data if no real data available
    const precintos: MockPrecinto[] = [];
    if (!precintos || precintos.length === 0) {
      return {
        name: 'Precintos',
        children: [
          { name: 'Activos', value: 45 },
          { name: 'En Tránsito', value: 30 },
          { name: 'Completados', value: 85 },
          { name: 'Inactivos', value: 20 }
        ]
      }
    }

    const grouped = new Map<string, number>()
    precintos.forEach(p => {
      const key = p.estado || 'unknown'
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })
    return {
      name: 'Precintos',
      children: Array.from(grouped.entries()).map(([estado, count]) => ({
        name: estado,
        value: count
      }))
    }
  }, [])
  // Transform transitos data
  const transitosData = useMemo(() => {
    // Use mock data if no real data available
    const transitos: MockTransito[] = [];
    if (!transitos || transitos.length === 0) {
      return {
        name: 'Tránsitos',
        children: [
          { name: 'En Curso', value: 25 },
          { name: 'Completados', value: 60 },
          { name: 'Retrasados', value: 15 },
          { name: 'Pendientes', value: 35 }
        ]
      }
    }

    const grouped = new Map<string, number>()
    transitos.forEach(t => {
      const key = t.estado || 'unknown'
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })
    return {
      name: 'Tránsitos',
      children: Array.from(grouped.entries()).map(([estado, count]) => ({
        name: estado,
        value: count
      }))
    }
  }, [])
  // Transform alertas data
  const alertasData = useMemo(() => {
    // Use mock data if no real data available
    const alertas: MockAlerta[] = [];
    if (!alertas || alertas.length === 0) {
      return {
        name: 'Alertas',
        children: [
          { name: 'Críticas', value: 5 },
          { name: 'Altas', value: 12 },
          { name: 'Medias', value: 28 },
          { name: 'Bajas', value: 45 }
        ]
      }
    }

    const grouped = new Map<string, number>()
    alertas.forEach(a => {
      const key = a.tipo || 'unknown'
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })
    return {
      name: 'Alertas',
      children: Array.from(grouped.entries()).map(([tipo, count]) => ({
        name: tipo,
        value: count
      }))
    }
  }, [])
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Treemaps Dashboard</h1>
        <p className="text-gray-400 mt-1">Visualización jerárquica de datos CMO</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="precintos">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Precintos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4">
                {precintosData.children.length > 0 ? (
                  <TreemapChart data={precintosData} width={800} height={500} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    No hay datos de precintos disponibles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transitos">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Tránsitos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4">
                {transitosData.children.length > 0 ? (
                  <TreemapChart data={transitosData} width={800} height={500} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    No hay datos de tránsitos disponibles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Alertas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4">
                {alertasData.children.length > 0 ? (
                  <TreemapChart data={alertasData} width={800} height={500} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    No hay alertas activas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default TreemapDashboardSimple