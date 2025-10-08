import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Star, Users, TrendingUp } from 'lucide-react';
import { successVotes } from '../../lib/api';
import { useApp } from '../../contexts/AppContext';

interface SuccessVotingPanelProps {
  promptId: string;
  initialSuccessRate?: number;
  initialVoteCount?: number;
}

export function SuccessVotingPanel({
  promptId,
  initialSuccessRate = 0,
  initialVoteCount = 0
}: SuccessVotingPanelProps) {
  const { state } = useApp();
  const [userVote, setUserVote] = useState<number | null>(null);
  const [successRate, setSuccessRate] = useState(initialSuccessRate);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's existing vote and current stats
  useEffect(() => {
    const loadVoteData = async () => {
      if (!state.user) return;

      try {
        // Load user's vote
        const { data: voteData } = await successVotes.getUserVote(promptId);
        if (voteData) {
          setUserVote(voteData.voteValue);
        }

        // Load current stats
        const { data: statsData } = await successVotes.getPromptStats(promptId);
        if (statsData) {
          setSuccessRate(statsData.successRate);
          setVoteCount(statsData.voteCount);
        }
      } catch (err) {
        console.error('Error loading vote data:', err);
      }
    };

    loadVoteData();
  }, [promptId, state.user]);

  const handleVote = async (voteValue: number) => {
    if (!state.user) return;

    setIsVoting(true);
    setError(null);

    try {
      const { data, error } = await successVotes.submitVote(promptId, voteValue);

      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setUserVote(voteValue);

        // Reload stats after voting
        const { data: statsData } = await successVotes.getPromptStats(promptId);
        if (statsData) {
          setSuccessRate(statsData.successRate);
          setVoteCount(statsData.voteCount);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => handleVote(star)}
        disabled={isVoting || !state.user}
        className={`text-2xl transition-colors ${
          userVote && star <= userVote
            ? 'text-yellow-400 hover:text-yellow-500'
            : 'text-gray-300 hover:text-yellow-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
      >
        ★
      </button>
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Success Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Rate Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-green-600">
              {successRate.toFixed(1)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">out of 5</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="text-sm">
            {successRate >= 4 ? 'Excellent' :
             successRate >= 3 ? 'Good' :
             successRate >= 2 ? 'Fair' : 'Needs Work'}
          </Badge>
        </div>

        {/* Voting Interface */}
        {state.user ? (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              {userVote ? 'Update your rating:' : 'Rate this prompt:'}
            </div>

            <div className="flex items-center gap-1">
              {renderStars()}
            </div>

            {userVote && (
              <div className="text-sm text-muted-foreground">
                You rated this prompt {userVote} star{userVote !== 1 ? 's' : ''}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
            <div className="font-medium mb-1">Want to rate this prompt?</div>
            <div>Sign in to share your feedback and help others find the best prompts.</div>
          </div>
        )}

        {/* Success Rate Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Success Rate</span>
            <span>{Math.round((successRate / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(successRate / 5) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}