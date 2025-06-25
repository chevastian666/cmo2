/**
 * Widget de gráfico para el dashboard
 * By Cheva
 */

import React from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts'
import { useDashboardStore} from '../../../store/dashboardStore'
import { D3VisualizationWidget} from '../../charts/d3/D3VisualizationWidget'
interface ChartWidgetProps {
  widgetId: string
  type?: 'line' | 'bar' | 'area' | 'pie' | 'd3-line' | 'd3-heatmap' | 'd3-network' | 'd3-treemap'
  data?: unknown[]
  dataKey?: string
  xAxisKey?: string
  colors?: string[]
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  widgetId, type = 'line', data: defaultData, dataKey = 'value', xAxisKey = 'name', colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
}) => {
  const widgetSettings = useDashboardStore(state => state.widgetSettings[widgetId])
  // Datos de ejemplo si no se proporcionan
  const chartData = defaultData || [
    { name: 'Lun', value: 400, value2: 240 },
    { name: 'Mar', value: 300, value2: 139 },
    { name: 'Mie', value: 200, value2: 380 },
    { name: 'Jue', value: 278, value2: 390 },
    { name: 'Vie', value: 189, value2: 480 },
    { name: 'Sab', value: 239, value2: 380 },
    { name: 'Dom', value: 349, value2: 430 }
  ]
  const pieData = [
    { name: 'Activos', value: 400 },
    { name: 'En Tránsito', value: 300 },
    { name: 'Completados', value: 300 },
    { name: 'Alertas', value: 200 }
  ]
  const chartType = (widgetSettings as { chartType?: string })?.chartType || type
  const renderChart = () => {
    // Handle D3 visualizations
    if (chartType.startsWith('d3-')) {
      const d3Type = chartType.replace('d3-', '') as 'line' | 'heatmap' | 'network' | 'treemap'
      return (
        <D3VisualizationWidget
          type={d3Type}
          data={chartData} // Use generated data
          config={{ colors }}
          title={`D3.js ${d3Type.charAt(0).toUpperCase() + d3Type.slice(1)} Chart`}
        />
      )
    }
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke={colors[1]}
              strokeWidth={2}
              dot={{ fill: colors[1], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="value2" fill={colors[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="value2"
              stroke={colors[1]}
              fill={colors[1]}
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      case 'pie':
        return (<PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius="80%"
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: '#9CA3AF' }}
            />
          </PieChart>
        )
      default:
        return null
    }
  }
  return (
    <div className="h-full w-full">
      {chartType.startsWith('d3-') ? (
        renderChart()
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  )
}