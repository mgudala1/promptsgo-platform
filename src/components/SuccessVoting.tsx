import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { voteOnPromptSuccess, removeSuccessVote, getPromptSuccessStats, type PromptSuccessStats } from '../lib/successVoting'
import { useApp } from '../contexts/AppContext'
import { toast } from 'sonner'

interface SuccessVotingProps {
  promptId: string
  variant?: 'full' | 'compact' | 'badge-only'
  className?: string
}

export const SuccessVoting: React.FC<SuccessVotingProps> = ({
  promptId,
  variant = 'full',
  className = ''
}) => {
  const { state } = useApp()
  const user = state.user
  const [stats, setStats] = useState<PromptSuccessStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [promptId])

  const loadStats = async () => {
    const data = await getPromptSuccessStats(promptId)
    setStats(data)
  }

  const handleVote = async (voteType: 'success' | 'failure') => {
    if (!user) {
      toast.error('Please sign in to vote on prompts')
      return
    }

    setIsLoading(true)
    try {
      // If user already voted this way, remove vote; otherwise vote
      if (stats?.user_vote === voteType) {
        const result = await removeSuccessVote(promptId)
        if (result.success) {
          toast.success('Vote removed')
          await loadStats()
        } else {
          toast.error(result.error || 'Failed to remove vote')
        }
      } else {
        const result = await voteOnPromptSuccess(promptId, voteType)
        if (result.success) {
          toast.success(`Marked as ${voteType === 'success' ? 'successful' : 'unsuccessful'}`)
          await loadStats()
        } else {
          toast.error(result.error || 'Failed to vote')
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!stats) return null

  const successRate = stats.success_rate
  const totalVotes = stats.total_votes

  // Badge-only variant for cards
  if (variant === 'badge-only') {
    if (totalVotes === 0) return null
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={successRate >= 80 ? "default" : successRate >= 60 ? "secondary" : "destructive"}
              className={`${className}`}
            >
              ✓ {successRate}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{successRate}% success rate ({totalVotes} votes)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {totalVotes > 0 && (
          <Badge variant={successRate >= 80 ? "default" : "secondary"} className="flex items-center gap-1">
            <TrendingUp size={12} />
            {successRate}% success
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{totalVotes} votes</span>
      </div>
    )
  }

  // Full variant for prompt detail pages
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Success Rate Display */}
      {totalVotes > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600 text-lg">
              {successRate}% Success Rate
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Based on {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      )}

      {/* Voting Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant={stats.user_vote === 'success' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('success')}
          disabled={isLoading}
          className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
        >
          <ThumbsUp size={16} />
          Worked Well ({stats.success_votes_count})
        </Button>

        <Button
          variant={stats.user_vote === 'failure' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => handleVote('failure')}
          disabled={isLoading}
          className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
        >
          <ThumbsDown size={16} />
          Didn't Work ({stats.failure_votes_count})
        </Button>

        {!user && (
          <span className="text-xs text-muted-foreground">
            Sign in to vote on prompts
          </span>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Help the community by sharing if this prompt worked for your use case
      </p>
    </div>
  )
}