 
/**
 * Reusable Skeleton Loaders for CMO Dashboard
 * By Cheva
 */

import React from 'react';
import { Skeleton} from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader} from '@/components/ui/Card';

// Table Skeleton Loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, columns = 4 
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4 p-4 border-b border-gray-700">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card Skeleton Loader
export const CardSkeleton: React.FC<{ showHeader?: boolean }> = ({ showHeader = true }) => {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
};

// Form Skeleton Loader
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
      ))}
      <div className="flex space-x-4 pt-4">
        <Skeleton className="h-10 w-32" /> {/* Submit button */}
        <Skeleton className="h-10 w-24" /> {/* Cancel button */}
      </div>
    </div>
  );
};

// List Skeleton Loader
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={`item-${i}`} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" /> {/* Action button */}
        </div>
      ))}
    </div>
  );
};

// Stats Grid Skeleton
export const StatsGridSkeleton: React.FC<{ items?: number }> = ({ items = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={`stat-${i}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Detail Page Skeleton
export const DetailPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`header-stat-${i}`} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={3} columns={3} />
        </CardContent>
      </Card>
    </div>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = "300px" }) => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between w-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`y-${i}`} className="h-3 w-full" />
            ))}
          </div>
          
          {/* Chart bars/lines */}
          <div className="ml-12 h-full flex items-end space-x-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`bar-${i}`} className="flex-1 flex flex-col justify-end">
                <Skeleton 
                  className="w-full" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              </div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-0 flex justify-between mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`x-${i}`} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Modal Skeleton
export const ModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <FormSkeleton fields={3} />
    </div>
  );
};

// Search Result Skeleton
export const SearchResultSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={`result-${i}`} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Widget Skeleton (for dashboard)
export const WidgetSkeleton: React.FC<{ type?: 'kpi' | 'chart' | 'list' | 'map' }> = ({ 
  type = 'kpi' 
}) => {
  switch (type) {
    case 'chart':
      return <ChartSkeleton height="200px" />;
    
    case 'list':
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <ListSkeleton items={3} />
          </CardContent>
        </Card>
      );
    
    case 'map':
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded" />
          </CardContent>
        </Card>
      );
    
    case 'kpi':
    default:
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      );
  }
};