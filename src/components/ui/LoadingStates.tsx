import React from 'react'
import { cn } from './utils'

// Skeleton Loader
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-200",
      className
    )}
  />
)

// Professional Spinner
export const ProfessionalSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Card Loading State
export const CardSkeleton: React.FC = () => (
  <div className="border border-border rounded-xl p-6 space-y-4 animate-pulse">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
)

// Professional Page Loading
export const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <ProfessionalSpinner size="lg" />
      <p className="text-body-small text-text-muted">Loading your prompts...</p>
    </div>
  </div>
)