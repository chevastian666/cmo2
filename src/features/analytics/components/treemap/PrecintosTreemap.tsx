/**
 * Precintos Treemap Component
 * Hierarchical visualization of precintos by company and status
 * By Cheva
 */

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, Package, TrendingUp } from 'lucide-react'
import { InteractiveTreemap} from '@/components/charts/treemap/InteractiveTreemap'
import { transformPrecintosByCompany, createHierarchy} from '@/components/charts/treemap/utils/dataTransformers'
export const PrecintosTreemap: React.FC = () => {
  // Mock data - in production, replace with real data from store or API
  const precintos: any[] = []
  
  const [groupBy, setGroupBy] = useState<'company' | 'type' | 'status'>('company')
  const treemapData = useMemo(() => {
    if (!precintos.length) {
      return {
        name: 'Precintos',
        children: [
          {
            name: 'Sin datos',
            value: 1,
            color: '#6b7280'
          }
        ]
      }
    }

    switch (groupBy) {
      case 'company':
        return transformPrecintosByCompany(precintos)
      case 'type':
        return createHierarchy(precintos, ['tipo', 'estado'])
      case 'status':
        return createHierarchy(precintos, ['estado', 'tipo'])
      default:
        return transformPrecintosByCompany(precintos)
    }
  }, [precintos, groupBy])
  const stats = useMemo(() => {
    const total = precintos.length
    const active = precintos.filter(p => p.estado === 'en_transito').length
    const companies = new Set(precintos.map(p => p.empresa || 'Sin Empresa')).size
    return { total, active, companies }
  }, [precintos])
  return (<div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Precintos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En Tránsito</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Empresas</p>
                <p className="text-2xl font-bold">{stats.companies}</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Distribución de Precintos</CardTitle>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'company' | 'type' | 'status')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Por Empresa</SelectItem>
                <SelectItem value="type">Por Tipo</SelectItem>
                <SelectItem value="status">Por Estado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <InteractiveTreemap
            data={treemapData}
            width={900}
            height={600}
            title={`Agrupado por ${groupBy === 'company' ? 'Empresa' : groupBy === 'type' ? 'Tipo' : 'Estado'}`}
            subtitle="Click para hacer zoom • Click derecho para detalles"
            showBreadcrumb={true}
            showTooltip={true}
            animated={true}
            onNodeClick={(node, event) => {
              console.log('Node clicked:', node)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}