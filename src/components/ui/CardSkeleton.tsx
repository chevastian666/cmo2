 
import React from 'react'
import { Skeleton} from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader} from '@/components/ui/card'
interface CardSkeletonProps {
  showDescription?: boolean
  showChart?: boolean
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  showDescription = true, showChart = false 
}) => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        {showDescription && <Skeleton className="h-4 w-48 mt-2" />}
      </CardHeader>
      <CardContent>
        {showChart ? (
          <div className="space-y-2">
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton showDescription={_false} />
        <CardSkeleton showDescription={_false} />
        <CardSkeleton showDescription={_false} />
        <CardSkeleton showDescription={_false} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton showChart />
        <CardSkeleton showChart />
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}