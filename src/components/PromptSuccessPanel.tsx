import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Star, Users, TrendingUp } from 'lucide-react';
import { successVotes } from '../lib/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface PromptSuccessPanelProps {
  averageRating: number;
  totalVotes: number;
  successRate: number;
  commonUseCases: string[];
  improvementSuggestions: string[];
  promptId: string;
}

export function PromptSuccessPanel({
  averageRating,
  totalVotes,
  successRate,
  commonUseCases,
  improvementSuggestions,
  promptId
}: PromptSuccessPanelProps) {
  const { state } = useApp();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState(averageRating);
  const [currentVotes, setCurrentVotes] = useState(totalVotes);
  const [currentSuccessRate, setCurrentSuccessRate] = useState(successRate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Load user's existing vote on mount
  useEffect(() => {
    const loadUserVote = async () => {
      if (!state.user) return;

      try {
        const { data: voteData } = await successVotes.getUserVote(promptId);
        if (voteData) {
          setUserRating(voteData.voteValue);
          setHasVoted(true);
        }
      } catch (err) {
        console.error('Error loading user vote:', err);
      }
    };

    loadUserVote();
  }, [promptId, state.user]);

  const handleRatingSubmit = async () => {
    if (!state.user || !userRating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await successVotes.submitVote(promptId, userRating);

      if (error) {
        toast.error('Failed to submit rating');
        return;
      }

      if (data) {
        setHasVoted(true);
        // Refresh stats
        const { data: statsData } = await successVotes.getPromptStats(promptId);
        if (statsData) {
          setCurrentRating(statsData.successRate);
          setCurrentVotes(statsData.voteCount);
          setCurrentSuccessRate((statsData.successRate / 5) * 100);
        }
        toast.success('Thank you for your feedback!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (interactive: boolean = false) => {
    const rating = interactive ? userRating : currentRating;
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={interactive ? () => setUserRating(star) : undefined}
        disabled={!interactive || isSubmitting}
        className={`text-2xl transition-colors ${
          rating && star <= rating
            ? 'text-yellow-400 hover:text-yellow-500'
            : 'text-gray-300 hover:text-yellow-400'
        } ${interactive ? 'cursor-pointer' : 'cursor-default'} disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`${star} star${star !== 1 ? 's' : ''}`}
        aria-label={`${star} star rating`}
      >
        ★
      </button>
    ));
  };

  const getPerformanceBadge = () => {
    if (currentSuccessRate >= 80) return { text: 'Excellent', variant: 'default' as const };
    if (currentSuccessRate >= 60) return { text: 'Good', variant: 'secondary' as const };
    return { text: 'Needs Work', variant: 'outline' as const };
  };

  const badge = getPerformanceBadge();

  return (
    <div className="space-y-6">
      {/* Top Card: Success Rate and User Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Success Rate and User Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-green-600">
                {currentRating.toFixed(1)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">out of 5</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{currentVotes} vote{currentVotes !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <Badge variant={badge.variant}>{badge.text}</Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Success Rate</span>
              <span>{Math.round(currentSuccessRate)}%</span>
            </div>
            <Progress value={currentSuccessRate} className="h-2" />
          </div>

          {/* Rating Input for logged-in users */}
          {state.user ? (
            <div className="space-y-3">
              <div className="text-sm font-medium">
                {hasVoted ? 'Your rating:' : 'Rate this prompt:'}
              </div>
              <div className="flex items-center gap-1">
                {renderStars(true)}
              </div>
              {hasVoted && userRating && (
                <div className="text-sm text-muted-foreground">
                  You rated this prompt {userRating} star{userRating !== 1 ? 's' : ''}
                </div>
              )}
              {!hasVoted && userRating && (
                <Button
                  onClick={handleRatingSubmit}
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              <div className="font-medium mb-1">Want to rate this prompt?</div>
              <div>Sign in to share your feedback and help others find the best prompts.</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Middle Card: Community Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Insights
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how this prompt performs across different use cases and get improvement suggestions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Use Cases */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Common Use Cases</h4>
              {commonUseCases.length > 0 ? (
                <div className="space-y-2">
                  {commonUseCases.map((useCase, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No use cases reported yet
                </div>
              )}
            </div>

            {/* Improvement Suggestions */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Improvement Suggestions</h4>
              {improvementSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No suggestions yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Caption */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Your feedback helps the community find the best prompts for their needs.</p>
      </div>
    </div>
  );
}