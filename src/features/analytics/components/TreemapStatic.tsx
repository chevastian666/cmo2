/**
 * Static Treemap Component
 * HTML/CSS based treemap without D3
 * By Cheva
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
const TreemapStatic: React.FC = () => {
  // Mock data for testing

  const total = _data.reduce((s_um, item) => sum + item.value, 0)
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Treemap Estático (Sin D3)</h1>
        <p className="text-gray-400 mt-1">Versión HTML/CSS para pruebas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Precintos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2" style={{ height: '400px' }}>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                return (
                  <div
                    key={index}
                    className="relative rounded-lg p-4 text-white flex flex-col justify-between"
                    style={{
                      backgroundColor: item.color,
                      minHeight: `${percentage * 2}px`
                    }}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm opacity-90">{item.value} unidades</p>
                    </div>
                    <p className="text-xs opacity-75">{percentage.toFixed(1)}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>React Version: {React.version}</p>
            <p>Window Width: {window.innerWidth}px</p>
            <p>Window Height: {window.innerHeight}px</p>
            <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default TreemapStatic