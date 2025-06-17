import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

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

export const NetworkChart: React.FC<NetworkChartProps> = ({
  data,
  title,
  color = '#3B82F6',
  type = 'line'
}) => {

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => format(new Date(tick * 1000), 'HH:mm')}
                stroke="#9CA3AF"
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem'
                }}
                labelFormatter={(label) => format(new Date(label * 1000), 'PPpp')}
              />
              <Area
                type="monotone"
                dataKey={data[0]?.cantidad !== undefined ? "cantidad" : "value"}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => format(new Date(tick * 1000), 'HH:mm')}
                stroke="#9CA3AF"
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem'
                }}
                labelFormatter={(label) => format(new Date(label * 1000), 'PPpp')}
              />
              <Line
                type="monotone"
                dataKey={data[0]?.cantidad !== undefined ? "cantidad" : "value"}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};