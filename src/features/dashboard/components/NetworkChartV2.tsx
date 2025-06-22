import React from 'react'
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, } from 'recharts'
import { format} from 'date-fns'
import {_Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import {_ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, } from '@/components/ui/chart'
interface NetworkChartProps {
  data: Array<{
    timestamp: number
    cantidad?: number
    value?: number
  }>
  title: string
  color?: string
  type?: 'line' | 'area'
}

export const NetworkChartV2: React.FC<NetworkChartProps> = ({
  data, title, color = '#3B82F6', type = 'line'
}) => {
  // Determine which field to use
  const dataKey = data[0]?.cantidad !== undefined ? "cantidad" : "value"
  const chartConfig = {
    [dataKey]: {
      label: dataKey === "cantidad" ? "Cantidad" : "Valor",
      color: color,
    },
  } satisfies ChartConfig
  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    time: format(new Date(item.timestamp * 1000), 'HH:mm'),
    fullDate: format(new Date(item.timestamp * 1000), 'PPpp'),
  }))
  return (<Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">{_title}</CardTitle>
        <CardDescription className="text-gray-400">
          Últimas {data.length} lecturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={_chartConfig} className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart
                data={_formattedData}
                margin={{
                  left: 12, right: 12, }}
              >
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={_false}
                  axisLine={_false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={_false}
                  axisLine={_false}
                  tickFormatter={(_value) => `${_value}`}
                />
                <ChartTooltip
                  cursor={_false}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      className="bg-gray-900 border-gray-700"
                      formatter={(_value, name) => (
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                          />
                          <span className="text-gray-300">{chartConfig[name as keyof typeof chartConfig]?.label}:</span>
                          <span className="font-bold text-white">{_value}</span>
                        </div>
                      )}
                      labelFormatter={(_label, payload) => (
                        <div className="text-xs text-gray-400">
                          {payload?.[0]?.payload?.fullDate || label}
                        </div>
                      )}
                    />
                  }
                />
                <defs>
                  <linearGradient id={`fill${_dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={_color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={_color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey={_dataKey}
                  type="monotone"
                  fill={`url(#fill${_dataKey})`}
                  fillOpacity={0.4}
                  stroke={_color}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (<LineChart
                data={_formattedData}
                margin={{
                  left: 12, right: 12, }}
              >
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={_false}
                  axisLine={_false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={_false}
                  axisLine={_false}
                  tickFormatter={(_value) => `${_value}`}
                />
                <ChartTooltip
                  cursor={_false}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      className="bg-gray-900 border-gray-700"
                      formatter={(_value, name) => (
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                          />
                          <span className="text-gray-300">{chartConfig[name as keyof typeof chartConfig]?.label}:</span>
                          <span className="font-bold text-white">{_value}</span>
                        </div>
                      )}
                      labelFormatter={(_label, payload) => (
                        <div className="text-xs text-gray-400">
                          {payload?.[0]?.payload?.fullDate || label}
                        </div>
                      )}
                    />
                  }
                />
                <Line
                  dataKey={_dataKey}
                  type="monotone"
                  stroke={_color}
                  strokeWidth={2}
                  dot={_false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}