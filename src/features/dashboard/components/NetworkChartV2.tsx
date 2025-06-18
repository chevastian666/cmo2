import React from 'react';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface NetworkChartProps {
  data: Array<{
    timestamp: number;
    cantidad?: number;
    value?: number;
  }>;
  title: string;
  color?: string;
  type?: 'line' | 'area';
}

export const NetworkChartV2: React.FC<NetworkChartProps> = ({
  data,
  title,
  color = '#3B82F6',
  type = 'line'
}) => {
  // Determine which field to use
  const dataKey = data[0]?.cantidad !== undefined ? "cantidad" : "value";

  const chartConfig = {
    [dataKey]: {
      label: dataKey === "cantidad" ? "Cantidad" : "Valor",
      color: color,
    },
  } satisfies ChartConfig;

  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    time: format(new Date(item.timestamp * 1000), 'HH:mm'),
    fullDate: format(new Date(item.timestamp * 1000), 'PPpp'),
  }));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400">
          Últimas {data.length} lecturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart
                data={formattedData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      className="bg-gray-900 border-gray-700"
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                          />
                          <span className="text-gray-300">{chartConfig[name as keyof typeof chartConfig]?.label}:</span>
                          <span className="font-bold text-white">{value}</span>
                        </div>
                      )}
                      labelFormatter={(label, payload) => (
                        <div className="text-xs text-gray-400">
                          {payload?.[0]?.payload?.fullDate || label}
                        </div>
                      )}
                    />
                  }
                />
                <defs>
                  <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey={dataKey}
                  type="monotone"
                  fill={`url(#fill${dataKey})`}
                  fillOpacity={0.4}
                  stroke={color}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={formattedData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      className="bg-gray-900 border-gray-700"
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                          />
                          <span className="text-gray-300">{chartConfig[name as keyof typeof chartConfig]?.label}:</span>
                          <span className="font-bold text-white">{value}</span>
                        </div>
                      )}
                      labelFormatter={(label, payload) => (
                        <div className="text-xs text-gray-400">
                          {payload?.[0]?.payload?.fullDate || label}
                        </div>
                      )}
                    />
                  }
                />
                <Line
                  dataKey={dataKey}
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};