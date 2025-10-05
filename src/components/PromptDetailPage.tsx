import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { useApp } from '../contexts/AppContext';
import { Prompt, Comment, PromptFeedback } from '../lib/types';
import { canSaveMore, canForkMore, getForksThisMonth } from '../lib/limits';
import { prompts } from '../lib/api';
import {
  ArrowLeft, BookmarkPlus, GitFork, Share,
  MessageCircle, Copy, Eye, Calendar, Edit,
  CheckCircle, AlertCircle, Heart, ThumbsUp, ThumbsDown, TrendingUp, BarChart3,
  Image as ImageIcon, FileText, Crown
} from 'lucide-react';

interface PromptDetailPageProps {
  promptId: string;
  onBack: () => void;
  onEdit: (prompt: Prompt) => void;
  onFork: (prompt: Prompt) => void;
}

export function PromptDetailPage({ promptId, onBack, onEdit, onFork }: PromptDetailPageProps) {
  const { state, dispatch } = useApp();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackUseCase, setFeedbackUseCase] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [limitError, setLimitError] = useState<string>('');

  // Load prompt and comments data
  useEffect(() => {
    const loadPromptData = async () => {
      try {
        // Try to load full prompt data from database first
        const { data: fullPromptData, error } = await prompts.getById(promptId);

        if (!error && fullPromptData) {
          // Transform the database data to match our Prompt type
          const fullPrompt: Prompt = {
            id: fullPromptData.id,
            userId: fullPromptData.user_id,
            title: fullPromptData.title,
            slug: fullPromptData.slug,
            description: fullPromptData.description,
            content: fullPromptData.content,
            type: fullPromptData.type,
            modelCompatibility: fullPromptData.model_compatibility,
            tags: fullPromptData.tags,
            visibility: fullPromptData.visibility,
            category: fullPromptData.category,
            language: fullPromptData.language,
            version: fullPromptData.version,
            parentId: fullPromptData.parent_id || undefined,
            viewCount: fullPromptData.view_count,
            hearts: fullPromptData.hearts,
            saveCount: fullPromptData.save_count,
            forkCount: fullPromptData.fork_count,
            commentCount: fullPromptData.comment_count,
            createdAt: fullPromptData.created_at,
            updatedAt: fullPromptData.updated_at,
            attachments: [],
            author: fullPromptData.profiles ? {
              id: fullPromptData.profiles.id,
              username: fullPromptData.profiles.username,
              email: fullPromptData.profiles.email || '',
              name: fullPromptData.profiles.name,
              bio: fullPromptData.profiles.bio || undefined,
              website: fullPromptData.profiles.website || undefined,
              github: fullPromptData.profiles.github || undefined,
              twitter: fullPromptData.profiles.twitter || undefined,
              reputation: 0,
              createdAt: fullPromptData.profiles.created_at || fullPromptData.created_at,
              lastLogin: fullPromptData.profiles.created_at || fullPromptData.created_at,
              badges: [],
              skills: [],
              subscriptionPlan: fullPromptData.profiles.subscription_plan || 'free',
              saveCount: 0,
              invitesRemaining: fullPromptData.profiles.invites_remaining || 0
            } : {
              id: fullPromptData.user_id,
              username: 'user',
              email: '',
              name: 'User',
              reputation: 0,
              createdAt: fullPromptData.created_at,
              lastLogin: fullPromptData.created_at,
              badges: [],
              skills: [],
              subscriptionPlan: 'free',
              saveCount: 0,
              invitesRemaining: 0
            },
            images: fullPromptData.prompt_images?.map((img: any) => ({
              id: img.id,
              url: img.url,
              altText: img.alt_text,
              isPrimary: img.is_primary,
              size: img.size,
              mimeType: img.mime_type,
              width: img.width || undefined,
              height: img.height || undefined,
              caption: img.caption || undefined
            })) || [],
            isHearted: false, // Will be set by component logic
            isSaved: false,   // Will be set by component logic
            isForked: false,
            template: fullPromptData.template || undefined
          };

          setPrompt(fullPrompt);
        } else {
          // Fallback to local state data
          const foundPrompt = state.prompts.find(p => p.id === promptId);
          if (foundPrompt) {
            setPrompt(foundPrompt);
          }
        }
      } catch (err) {
        console.error('Error loading prompt data:', err);
        // Fallback to local state data
        const foundPrompt = state.prompts.find(p => p.id === promptId);
        if (foundPrompt) {
          setPrompt(foundPrompt);
        }
      }
    };

    loadPromptData();

    const promptComments = state.comments.filter(c => c.promptId === promptId);
    setComments(promptComments);
  }, [promptId, state.prompts, state.comments]);

  // Check if user has already submitted feedback - separate effect to avoid dependency issues
  useEffect(() => {
    if (state.user?.id && state.promptFeedbacks) {
      const existingFeedback = state.promptFeedbacks.find(f =>
        f.promptId === promptId && f.userId === state.user!.id
      );
      if (existingFeedback) {
        setFeedbackSubmitted(true);
        setFeedbackRating(existingFeedback.rating);
        setFeedbackNote(existingFeedback.note || '');
        setFeedbackUseCase(existingFeedback.useCase || '');
      } else {
        // Reset feedback form if no existing feedback
        setFeedbackSubmitted(false);
        setFeedbackRating(null);
        setFeedbackNote('');
        setFeedbackUseCase('');
      }
    } else {
      // Reset feedback form if no user
      setFeedbackSubmitted(false);
      setFeedbackRating(null);
      setFeedbackNote('');
      setFeedbackUseCase('');
    }
  }, [promptId, state.user?.id, state.promptFeedbacks]);

  // Increment view count only once when component mounts
  useEffect(() => {
    const foundPrompt = state.prompts.find(p => p.id === promptId);
    if (foundPrompt) {
      // Only increment if we haven't already incremented for this prompt
      const currentViewCount = foundPrompt.viewCount;
      dispatch({ 
        type: 'UPDATE_PROMPT', 
        payload: { 
          id: promptId, 
          updates: { viewCount: currentViewCount + 1 } 
        } 
      });
    }
  }, [promptId]); // Only run when promptId changes

  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Prompt not found</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  const handleHeart = () => {
    if (!state.user) return;

    const isHearted = state.hearts.some(h => 
      h.userId === state.user!.id && h.promptId === promptId
    );

    if (isHearted) {
      dispatch({ type: 'UNHEART_PROMPT', payload: { promptId } });
    } else {
      dispatch({ type: 'HEART_PROMPT', payload: { promptId } });
    }
  };

  const handleSave = () => {
    if (!state.user) return;
    setLimitError('');

    const isSaved = state.saves.some(s =>
      s.userId === state.user!.id && s.promptId === promptId
    );

    if (isSaved) {
      dispatch({ type: 'UNSAVE_PROMPT', payload: promptId });
    } else {
      // Check save limit
      const userSaves = state.saves.filter(s => s.userId === state.user!.id);
      const { allowed, message } = canSaveMore(state.user, userSaves.length);
      
      if (!allowed) {
        setLimitError(message || 'Save limit reached');
        return;
      }
      
      dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
    }
  };

  const handleFork = () => {
    if (!state.user) return;
    setLimitError('');
    
    // Check fork limit
    const forksThisMonth = getForksThisMonth(state.prompts, state.user.id);
    const { allowed, message } = canForkMore(state.user, forksThisMonth);
    
    if (!allowed) {
      setLimitError(message || 'Fork limit reached');
      return;
    }
    
    onFork(prompt);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/prompts/${prompt.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.description,
          url: url
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(url);
        // Could show a toast here
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  const addComment = () => {
    if (!state.user || !newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      promptId,
      userId: state.user.id,
      parentId: replyTo || undefined,
      content: newComment.trim(),
      hearts: 0,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: state.user,
      replies: []
    };

    dispatch({ type: 'ADD_COMMENT', payload: comment });
    setNewComment('');
    setReplyTo(null);
  };

  const isHearted = state.hearts.some(h => 
    h.userId === state.user?.id && h.promptId === promptId
  );

  const isSaved = state.saves.some(s => 
    s.userId === state.user?.id && s.promptId === promptId
  );

  const isOwner = state.user?.id === prompt.userId;
  const canEdit = isOwner;
  const canFork = state.user && !isOwner;

  // Get feedback data for this prompt
  const promptFeedbacks = state.promptFeedbacks?.filter(f => f.promptId === promptId) || [];
  const positiveFeedbacks = promptFeedbacks.filter(f => f.rating === 'positive');
  const negativeFeedbacks = promptFeedbacks.filter(f => f.rating === 'negative');
  const totalFeedbacks = promptFeedbacks.length;
  const successRate = totalFeedbacks > 0 ? Math.round((positiveFeedbacks.length / totalFeedbacks) * 100) : null;

  const handleSubmitFeedback = () => {
    if (!state.user || !feedbackRating) return;

    try {
      const feedback: PromptFeedback = {
        id: `feedback-${Date.now()}`,
        promptId,
        userId: state.user.id,
        rating: feedbackRating,
        note: feedbackNote.trim() || undefined,
        useCase: feedbackUseCase.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_PROMPT_FEEDBACK', payload: feedback });
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {prompt.parentId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitFork className="h-4 w-4" />
            <span>Forked from original</span>
          </div>
        )}
      </div>

      {/* Limit Error Alert */}
      {limitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {limitError}
            {!state.user?.subscriptionPlan || state.user.subscriptionPlan === 'free' ? (
              <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => window.location.href = '#subscription'}>
                <Crown className="h-3 w-3 mr-1" />
                Upgrade to Pro
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {/* Prompt Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${
                prompt.type === 'text' ? 'bg-blue-100 text-blue-800' :
                prompt.type === 'image' ? 'bg-purple-100 text-purple-800' :
                prompt.type === 'code' ? 'bg-green-100 text-green-800' :
                prompt.type === 'agent' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}
              </Badge>
              <Badge variant="outline">{prompt.category}</Badge>
              {prompt.visibility !== 'public' && (
                <Badge variant="secondary">{prompt.visibility}</Badge>
              )}
            </div>
            
            <h1 className="text-3xl mb-2">{prompt.title}</h1>
            <p className="text-muted-foreground text-lg">{prompt.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {canEdit && (
              <Button variant="outline" onClick={() => onEdit(prompt)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {canFork && (
              <Button variant="outline" onClick={handleFork}>
                <GitFork className="h-4 w-4 mr-2" />
                Fork
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={handleSave}
              className={isSaved ? 'bg-primary/10 text-primary' : ''}
            >
              <BookmarkPlus className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>

            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {prompt.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{prompt.author.name}</div>
              <div className="text-sm text-muted-foreground">
                @{prompt.author.username} • {prompt.author.reputation} rep
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(prompt.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {prompt.viewCount} views
            </div>
            <div className="flex items-center gap-1">
              <span>v{prompt.version}</span>
            </div>
          </div>
        </div>
{/* Stats and Actions */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-6">
    <Button
      variant={isHearted ? 'default' : 'outline'}
      size="sm"
      onClick={handleHeart}
      disabled={!state.user}
      className={isHearted ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
    >
      <Heart className={`h-4 w-4 mr-1 ${isHearted ? 'fill-current' : ''}`} />
      {prompt.hearts}
    </Button>

    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>{prompt.saveCount} saves</span>
      <span>{prompt.forkCount} forks</span>
      <span>{prompt.commentCount} comments</span>
      {successRate !== null && (
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {successRate}% success rate
        </span>
      )}
    </div>
  </div>

  {/* Model Compatibility */}
  <div className="flex items-center gap-1">
    {prompt.modelCompatibility.map((model) => (
      <Badge key={model} variant="outline" className="text-xs">
        {model}
      </Badge>
    ))}
  </div>
</div>
      </div>

      {/* Images Section */}
      {prompt.images && prompt.images.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images ({prompt.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompt.images.map((image) => (
                  <div key={image.id} className="space-y-2">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                      <ImageWithFallback
                        src={image.url}
                        alt={image.altText}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="space-y-1">
                      {image.isPrimary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                      <p className="text-sm text-muted-foreground">{image.altText}</p>
                      {image.caption && (
                        <p className="text-xs text-muted-foreground italic">{image.caption}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {image.width && image.height && (
                          <span>{image.width} × {image.height}</span>
                        )}
                        <span>{(image.size / 1024).toFixed(1)} KB</span>
                        <span>{image.mimeType}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
          <TabsTrigger value="discussion">
            Discussion ({totalFeedbacks + comments.length})
            {successRate !== null && ` • ${successRate}% success`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Prompt Content</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                  {prompt.content}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          {prompt.template ? (
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
                <p className="text-sm text-muted-foreground">
                  You can copy and customize this template as a starting point for your own prompt.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {prompt.template}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No template provided for this prompt.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="space-y-6">
          {/* Feedback Statistics */}
          {totalFeedbacks > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">
                      {successRate !== null ? `${successRate}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{positiveFeedbacks.length}</div>
                    <div className="text-sm text-muted-foreground">Positive</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold">{negativeFeedbacks.length}</div>
                    <div className="text-sm text-muted-foreground">Negative</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submit Feedback (for users who haven't submitted yet) */}
          {state.user && !feedbackSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Share Your Experience
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help others by sharing how well this prompt worked for you
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How well did this prompt work for you?</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={feedbackRating === 'positive' ? 'default' : 'outline'}
                      onClick={() => setFeedbackRating('positive')}
                      className={feedbackRating === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Worked Well
                    </Button>
                    <Button
                      variant={feedbackRating === 'negative' ? 'default' : 'outline'}
                      onClick={() => setFeedbackRating('negative')}
                      className={feedbackRating === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Didn't Work
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="useCase">What did you use this prompt for? (Optional)</Label>
                  <Input
                    id="useCase"
                    value={feedbackUseCase}
                    onChange={(e) => setFeedbackUseCase(e.target.value)}
                    placeholder="e.g., Writing blog posts, code documentation, customer support..."
                  />
                </div>

                <div>
                  <Label htmlFor="feedbackNote">Additional details (Optional)</Label>
                  <Textarea
                    id="feedbackNote"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Share what worked well or didn't work, any modifications you made, etc."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackRating}
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          ) : feedbackSubmitted ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Thank you for your feedback! You rated this prompt as{' '}
                <strong>{feedbackRating === 'positive' ? 'working well' : 'not working well'}</strong>.
              </AlertDescription>
            </Alert>
          ) : !state.user ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to provide feedback on this prompt.
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Add Comment */}
          {state.user ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Add a Comment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or provide feedback..."
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {replyTo ? 'Replying to comment' : 'Adding a new comment'}
                    </span>
                    <div className="flex gap-2">
                      {replyTo && (
                        <Button variant="outline" onClick={() => setReplyTo(null)}>
                          Cancel Reply
                        </Button>
                      )}
                      <Button onClick={addComment} disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to leave a comment.
              </AlertDescription>
            </Alert>
          )}

          {/* Feedback Details (for prompt owners) */}
          {isOwner && totalFeedbacks > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Feedback Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promptFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {feedback.rating === 'positive' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Positive
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Negative
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {feedback.useCase && (
                      <div className="mb-2">
                        <span className="font-medium text-sm">Use case: </span>
                        <span className="text-sm">{feedback.useCase}</span>
                      </div>
                    )}

                    {feedback.note && (
                      <div className="text-sm text-muted-foreground">
                        {feedback.note}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.isEdited && (
                          <Badge variant="outline" className="text-xs">Edited</Badge>
                        )}
                      </div>

                      <p className="text-sm mb-2">{comment.content}</p>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-3 w-3 mr-1" />
                          {comment.hearts}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(comment.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {comments.length === 0 && totalFeedbacks === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No discussion yet. Be the first to share your thoughts or feedback!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}