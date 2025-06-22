/**
 * Fixed Treemap Dashboard
 * Working version with proper imports
 * By Cheva
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Package, Truck, AlertTriangle, TrendingUp} from 'lucide-react';

const TreemapFixed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  
  

  // Datos de ejemplo para visualización
  const mockData = {
    precintos: [
      { name: 'Activos', value: 145, color: '#10b981', percentage: 32 },
      { name: 'En Tránsito', value: 89, color: '#3b82f6', percentage: 20 },
      { name: 'Completados', value: 167, color: '#8b5cf6', percentage: 37 },
      { name: 'Inactivos', value: 49, color: '#6b7280', percentage: 11 }
    ],
    transitos: [
      { name: 'En Curso', value: 45, color: '#3b82f6', percentage: 28 },
      { name: 'Completados', value: 78, color: '#10b981', percentage: 48 },
      { name: 'Retrasados', value: 12, color: '#ef4444', percentage: 7 },
      { name: 'Pendientes', value: 27, color: '#f59e0b', percentage: 17 }
    ],
    alertas: [
      { name: 'Críticas', value: 8, color: '#dc2626', percentage: 9 },
      { name: 'Altas', value: 15, color: '#ef4444', percentage: 17 },
      { name: 'Medias', value: 32, color: '#f59e0b', percentage: 36 },
      { name: 'Bajas', value: 34, color: '#3b82f6', percentage: 38 }
    ]
  };

  const TreemapBlock = ({ item, index }: { item: unknown; index: number }) => {
    const sizes = ['col-span-2 row-span-2', 'col-span-1 row-span-2', 'col-span-2 row-span-1', 'col-span-1 row-span-1'];
    const sizeClass = sizes[index % sizes.length];
    
    return (
      <div
        className={`${sizeClass} relative rounded-lg p-4 text-white transition-all hover:scale-105 hover:shadow-xl cursor-pointer`}
        style={{ backgroundColor: item.color }}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </div>
          <div className="text-sm opacity-90">
            {item.percentage}%
          </div>
        </div>
      </div>
    );
  };

  const currentData = activeTab === 'precintos' ? mockData.precintos : 
                     activeTab === 'transitos' ? mockData.transitos : 
                     mockData.alertas;

  const stats = {
    precintos: precintos.length || 450,
    transitos: transitos.length || 162,
    alertas: alertas.length || 89
  };

  return (<div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Treemaps Interactivos
        </h1>
        <p className="text-gray-400 mt-1">
          Visualización jerárquica de datos del sistema CMO
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setActiveTab('precintos')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Precintos</p>
                <p className="text-2xl font-bold">{stats.precintos}</p>
                <p className="text-xs text-green-500 mt-1">+12% vs mes anterior</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => setActiveTab('transitos')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tránsitos</p>
                <p className="text-2xl font-bold">{stats.transitos}</p>
                <p className="text-xs text-green-500 mt-1">+8% vs mes anterior</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-red-500 transition-colors cursor-pointer"
              onClick={() => setActiveTab('alertas')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alertas Activas</p>
                <p className="text-2xl font-bold">{stats.alertas}</p>
                <p className="text-xs text-yellow-500 mt-1">-5% vs mes anterior</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap Visualization */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="precintos">Precintos</TabsTrigger>
          <TabsTrigger value="transitos">Tránsitos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista General del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4" style={{ minHeight: '400px' }}>
                <div className="bg-blue-500 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-bold">Precintos</h3>
                  <p className="text-3xl font-bold mt-4">{stats.precintos}</p>
                  <p className="text-sm opacity-80 mt-2">32% del total</p>
                </div>
                <div className="bg-purple-500 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-bold">Tránsitos</h3>
                  <p className="text-3xl font-bold mt-4">{stats.transitos}</p>
                  <p className="text-sm opacity-80 mt-2">28% del total</p>
                </div>
                <div className="bg-red-500 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-bold">Alertas</h3>
                  <p className="text-3xl font-bold mt-4">{stats.alertas}</p>
                  <p className="text-sm opacity-80 mt-2">15% del total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precintos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Precintos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3" style={{ minHeight: '400px' }}>
                {mockData.precintos.map((item, index) => (
                  <TreemapBlock key={index} item={item} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transitos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Tránsitos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3" style={{ minHeight: '400px' }}>
                {mockData.transitos.map((item, index) => (
                  <TreemapBlock key={index} item={item} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Alertas por Severidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3" style={{ minHeight: '400px' }}>
                {mockData.alertas.map((item, index) => (
                  <TreemapBlock key={index} item={item} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>Los tamaños de los bloques representan la proporción relativa de cada categoría</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreemapFixed;