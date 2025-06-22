 
import React from 'react'
import { cn} from '@/utils/utils'
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className, variant = 'text', animation = 'pulse', width, height, style, ...props
}) => {
  const baseClasses = 'bg-gray-800 relative overflow-hidden'
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: ''
  }
  const defaultSizes = {
    text: { height: '1em', width: '100%' },
    circular: { height: '40px', width: '40px' },
    rectangular: { height: '100px', width: '100%' },
    rounded: { height: '100px', width: '100%' }
  }
  const size = defaultSizes[variant]
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || size.width,
        height: height || size.height,
        ...style
      }}
      {...props}
    >
      {animation === 'wave' && (
        <div className="skeleton-wave-shimmer absolute inset-0" />
      )}
    </div>
  )
}
// Componentes específicos de skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((__, i) => (
        <Skeleton
          key={_i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" height="1.5rem" />
        <Skeleton variant="circular" width="32px" height="32px" />
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rounded" width="60px" height="24px" />
        <Skeleton variant="rounded" width="80px" height="24px" />
      </div>
    </div>
  )
}
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, columns = 4, className 
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 border-b border-gray-800" style={{ gridTemplateColumns: `repeat(${_columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((__, i) => (
          <Skeleton key={_i} variant="text" height="1rem" width="80%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((__, rowIndex) => (
        <div 
          key={_rowIndex} 
          className="grid gap-4 p-4 border-b border-gray-800"
          style={{ gridTemplateColumns: `repeat(${_columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton 
              key={_colIndex} 
              variant="text" 
              width={colIndex === 0 ? "60%" : "90%"}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, className 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((__, i) => (
        <div key={_i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height="0.875rem" />
          </div>
          <Skeleton variant="rounded" width="80px" height="32px" />
        </div>
      ))}
    </div>
  )
}
export const SkeletonDashboard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((__, i) => (
          <div key={_i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton variant="text" width="60%" height="0.875rem" />
              <Skeleton variant="circular" width="32px" height="32px" />
            </div>
            <Skeleton variant="text" width="40%" height="2rem" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <Skeleton variant="text" width="200px" height="1.5rem" className="mb-4" />
        <Skeleton variant="rectangular" height="300px" />
      </div>
      
      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-4 border-b border-gray-800">
          <Skeleton variant="text" width="150px" height="1.25rem" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  )
}