import React from 'react';
import { Badge } from './badge';
import { Star } from 'lucide-react';

interface SuccessBadgeProps {
  successRate: number;
  voteCount: number;
  size?: 'sm' | 'md' | 'lg';
  showVotes?: boolean;
}

export function SuccessBadge({
  successRate,
  voteCount,
  size = 'sm',
  showVotes = true
}: SuccessBadgeProps) {
  const getSuccessColor = (rate: number) => {
    if (rate >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 3) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rate >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSuccessLabel = (rate: number) => {
    if (rate >= 4) return 'Excellent';
    if (rate >= 3) return 'Good';
    if (rate >= 2) return 'Fair';
    return 'Needs Work';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const starSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Badge
      variant="outline"
      className={`${getSuccessColor(successRate)} ${sizeClasses[size]} font-medium border`}
    >
      <Star className={`${starSizeClasses[size]} mr-1 fill-current`} />
      <span className="font-semibold">{successRate.toFixed(1)}</span>
      {showVotes && voteCount > 0 && (
        <span className="ml-1 opacity-75">
          ({voteCount})
        </span>
      )}
    </Badge>
  );
}