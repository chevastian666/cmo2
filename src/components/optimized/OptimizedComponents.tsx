/**
 * Optimized Components with Memoization
 * High-performance components for large datasets
 * By Cheva
 */

import React, { memo, useMemo, useCallback } from 'react';
import { cn } from '@/utils/utils';

// Optimized table row with deep memo
export const OptimizedTableRow = memo<{
  data: Record<string, any>;
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
  }>;
  onClick?: (row: any) => void;
  selected?: boolean;
  className?: string;
}>(({
  data,
  columns,
  onClick,
  selected = false,
  className
}) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(data);
    }
  }, [onClick, data]);

  return (
    <tr
      onClick={handleClick}
      className={cn(
        "border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer",
        selected && "bg-blue-900 hover:bg-blue-800",
        className
      )}
    >
      {columns.map((column) => (
        <td
          key={column.key}
          className="px-4 py-3 text-sm text-gray-300"
          style={{ width: column.width }}
        >
          {column.render
            ? column.render(data[column.key], data)
            : data[column.key]
          }
        </td>
      ))}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for deep equality
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

// Optimized card component
export const OptimizedCard = memo<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}>(({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  className
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className={cn(
              "mt-2 flex items-center text-sm",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Optimized list item
export const OptimizedListItem = memo<{
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  status?: 'active' | 'inactive' | 'pending' | 'error';
  actions?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}>(({
  primary,
  secondary,
  meta,
  status,
  actions,
  onClick,
  selected = false
}) => {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-3 hover:bg-gray-800 transition-colors",
        onClick && "cursor-pointer",
        selected && "bg-blue-900 hover:bg-blue-800"
      )}
    >
      {status && (
        <div className={cn(
          "w-2 h-2 rounded-full mr-3",
          statusColors[status]
        )} />
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {primary}
        </p>
        {secondary && (
          <p className="text-sm text-gray-400 truncate">
            {secondary}
          </p>
        )}
      </div>
      
      {meta && (
        <div className="ml-4 text-sm text-gray-500">
          {meta}
        </div>
      )}
      
      {actions && (
        <div className="ml-4 flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
});

OptimizedListItem.displayName = 'OptimizedListItem';

// Optimized data grid cell
export const OptimizedGridCell = memo<{
  value: any;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
  render?: (value: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}>(({
  value,
  type = 'text',
  format,
  render,
  align = 'left',
  className
}) => {
  const formattedValue = useMemo(() => {
    if (render) return render(value);
    if (format) return format(value);
    
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        return value ? new Date(value).toLocaleString() : '';
      case 'boolean':
        return value ? '✓' : '✗';
      default:
        return value;
    }
  }, [value, type, format, render]);

  return (
    <div className={cn(
      "px-2 py-1",
      align === 'center' && "text-center",
      align === 'right' && "text-right",
      className
    )}>
      {formattedValue}
    </div>
  );
});

OptimizedGridCell.displayName = 'OptimizedGridCell';

// Factory for creating optimized components
export function createOptimizedComponent<P extends object>(
  Component: React.ComponentType<P>,
  compareProps?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, compareProps);
}

// Hook for optimizing render
export function useOptimizedRender<T>(
  data: T,
  dependencies: React.DependencyList = []
): T {
  return useMemo(() => data, [data, ...dependencies]);
}

// Higher order component for optimization
export function withOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    compareProps?: (prevProps: P, nextProps: P) => boolean;
    debounceProps?: Array<keyof P>;
    throttleProps?: Array<keyof P>;
  } = {}
): React.ComponentType<P> {
  const OptimizedComponent = memo(Component, options.compareProps);

  return (props: P) => {
    // Apply debounce/throttle to specific props if needed
    const optimizedProps = { ...props };

    if (options.debounceProps) {
      // Implementation would use useDebouncedValue for specified props
    }

    if (options.throttleProps) {
      // Implementation would use useThrottledValue for specified props
    }

    return <OptimizedComponent {...optimizedProps} />;
  };
}