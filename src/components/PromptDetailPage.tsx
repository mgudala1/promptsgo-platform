import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { useApp } from '../contexts/AppContext';
import { Prompt } from '../lib/types';
import { canSaveMore, canForkMore, getForksThisMonth } from '../lib/limits';
import { prompts, saves as savesApi, comments, hearts } from '../lib/api';
import { PromptSuccessPanel } from './PromptSuccessPanel';
import {
  ArrowLeft, BookmarkPlus, GitFork, Share,
  Copy, Eye, Calendar, Edit,
  AlertCircle, TrendingUp,
  Image as ImageIcon, FileText, Crown, CheckCircle,
  MessageCircle, Heart
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
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
   const [limitError, setLimitError] = useState<string>('');
   const [newComment, setNewComment] = useState('');
   const [postingComment, setPostingComment] = useState(false);
   const [replyingTo, setReplyingTo] = useState<string | null>(null);
   const [replyText, setReplyText] = useState('');
   const [heartAnimating, setHeartAnimating] = useState(false);

  // Load prompt data
  useEffect(() => {
     console.log('PromptDetailPage: Starting to load prompt data for promptId:', promptId);
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
              role: fullPromptData.profiles.role || 'general',
              subscriptionStatus: fullPromptData.profiles.subscription_status || 'active',
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
              role: 'general',
              subscriptionStatus: 'active',
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
            template: fullPromptData.template || undefined,
            successRate: fullPromptData.success_rate || 0,
            successVotesCount: fullPromptData.success_votes_count || 0
          };

          console.log('PromptDetailPage: Setting prompt data for promptId:', promptId);
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
      } finally {
        setLoading(false);
      }
    };

    loadPromptData();
  }, [promptId, state.prompts]);


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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Prompt Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Author Info Skeleton */}
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    console.log('PromptDetailPage: Rendering "Prompt not found" for promptId:', promptId);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Prompt not found</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }


  const handleSave = async () => {
    if (!state.user) {
      console.log('User not authenticated');
      return;
    }
    setLimitError('');

    const isSaved = state.saves.some(s =>
      s.userId === state.user!.id && s.promptId === promptId
    );

    // Check save limit before attempting to save
    if (!isSaved) {
      const userSaves = state.saves.filter(s => s.userId === state.user!.id);
      const { allowed, message } = canSaveMore(state.user, userSaves.length);

      if (!allowed) {
        setLimitError(message || 'Save limit reached');
        return;
      }
    }

    console.log('Toggling save for prompt:', promptId, 'Current isSaved:', isSaved);
    try {
      const result = await savesApi.toggle(promptId);
      console.log('Save result:', result);

      if (!result.error && result.data) {
        // Update global state immediately for instant visual feedback
        if (result.data.action === 'added') {
          console.log('Adding save - updating UI');
          dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
        } else {
          console.log('Removing save - updating UI');
          dispatch({ type: 'UNSAVE_PROMPT', payload: promptId });
        }
      } else {
        console.error('Save error:', result.error);
      }
    } catch (error) {
      console.error('Save exception:', error);
    }
  };

  const handleHeart = async () => {
     if (!state.user) {
       console.log('User not authenticated');
       return;
     }

     // Trigger animation
     setHeartAnimating(true);
     setTimeout(() => setHeartAnimating(false), 400);

     console.log('Toggling heart for prompt:', promptId, 'Current isHearted:', isHearted);
     try {
       const result = await hearts.toggle(promptId);
       console.log('Heart result:', result);

       if (!result.error && result.data) {
         // Update global state immediately for instant visual feedback
         if (result.data.action === 'added') {
           console.log('Adding heart - updating UI');
           dispatch({ type: 'HEART_PROMPT', payload: { promptId } });
         } else {
           console.log('Removing heart - updating UI');
           dispatch({ type: 'UNHEART_PROMPT', payload: { promptId } });
         }
       } else {
         console.error('Heart error:', result.error);
       }
     } catch (error) {
       console.error('Heart exception:', error);
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

  const handlePostComment = async () => {
    if (!state.user || !newComment.trim()) return;

    setPostingComment(true);
    try {
      const result = await comments.create({
        prompt_id: promptId,
        user_id: state.user.id,
        content: newComment.trim()
      });

      if (result.error) {
        console.error('Error posting comment:', result.error);
      } else {
        // Comment will be added via real-time subscription
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleReply = async (parentCommentId: string) => {
    if (!state.user || !replyText.trim()) return;

    try {
      const result = await comments.create({
        prompt_id: promptId,
        user_id: state.user.id,
        parent_id: parentCommentId,
        content: replyText.trim()
      });

      if (result.error) {
        console.error('Error posting reply:', result.error);
      } else {
        // Reply will be added via real-time subscription
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };


  const isSaved = state.saves.some(s =>
    s.userId === state.user?.id && s.promptId === promptId
  );

  const isHearted = state.hearts.some(h =>
    h.userId === state.user?.id && h.promptId === promptId
  );

  const isOwner = state.user?.id === prompt.userId;

  // Check if this prompt is part of any pack
  const isPackPrompt = state.promptPacks.some(pack =>
    pack.promptIds.includes(promptId)
  );

  const canEdit = isOwner;
  // Pro users cannot fork pack prompts to protect content creators' IP
  const canFork = state.user && !isOwner && !isPackPrompt;


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
            {state.user?.role === 'general' ? (
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

        {/* Stats and Model Compatibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={handleHeart} className={`flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ${isHearted ? 'text-red-500' : ''}`}>
                <Heart className={`h-3 w-3 transition-all duration-300 ease-out ${
                  isHearted
                    ? 'fill-current scale-110'
                    : 'scale-100'
                } ${
                  heartAnimating
                    ? 'animate-bounce scale-125'
                    : ''
                }`}
                style={{
                  transform: heartAnimating ? 'scale(1.2) rotate(-5deg)' : undefined,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
                {prompt.hearts || 0}
              </Button>
              <span>{prompt.saveCount} saves</span>
              <span>{prompt.forkCount} forks</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {prompt.successVotesCount || 0} ratings
              </span>
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
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
          <TabsTrigger value="discussion">
            Discussion
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
            {/* Prompt Success Panel - Consolidated Feedback System */}
            <PromptSuccessPanel
              averageRating={prompt.successRate || 0}
              totalVotes={prompt.successVotesCount || 0}
              successRate={prompt.successRate || 0}
              commonUseCases={[
                "Business communication and email writing",
                "Professional correspondence",
                "Client outreach and networking"
              ]}
              improvementSuggestions={[
                "Add more tone customization options",
                "Include industry-specific templates",
                "Support for multiple languages"
              ]}
              promptId={promptId}
            />

           {/* Comments Section */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <MessageCircle className="h-5 w-5" />
                 Comments ({prompt.commentCount || 0})
               </CardTitle>
               <p className="text-sm text-muted-foreground">
                 Join the discussion and share your experience with this prompt
               </p>
             </CardHeader>
             <CardContent>
               {state.comments.filter(comment => comment.promptId === promptId).length > 0 ? (
                 <div className="space-y-4">
                   {state.comments
                     .filter(comment => comment.promptId === promptId)
                     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                     .map((comment) => (
                       <div key={comment.id} className="border rounded-lg p-4">
                         <div className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                             {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                           </div>

                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="font-medium text-sm">
                                 {comment.author?.name || 'Anonymous'}
                               </span>
                               <span className="text-xs text-muted-foreground">
                                 @{comment.author?.username || 'user'}
                               </span>
                               <span className="text-xs text-muted-foreground">
                                 {new Date(comment.createdAt).toLocaleDateString()}
                               </span>
                             </div>

                             <p className="text-sm mb-2">{comment.content}</p>

                             <div className="flex items-center gap-2">
                               <Button variant="ghost" size="sm">
                                 <Heart className="h-3 w-3 mr-1" />
                                 {comment.hearts || 0}
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                   if (replyingTo === comment.id) {
                                     setReplyingTo(null);
                                     setReplyText('');
                                   } else {
                                     setReplyingTo(comment.id);
                                     setReplyText('');
                                   }
                                 }}
                               >
                                 Reply
                               </Button>
                             </div>

                             {/* Reply Form */}
                             {replyingTo === comment.id && state.user && (
                               <div className="mt-3 ml-8">
                                 <div className="flex gap-3">
                                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                     {state.user.name?.charAt(0).toUpperCase() || 'U'}
                                   </div>
                                   <div className="flex-1">
                                     <textarea
                                       value={replyText}
                                       onChange={(e) => setReplyText(e.target.value)}
                                       placeholder={`Reply to ${comment.author?.name || 'Anonymous'}...`}
                                       className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                       rows={2}
                                     />
                                     <div className="flex justify-end gap-2 mt-2">
                                       <Button
                                         size="sm"
                                         variant="ghost"
                                         onClick={() => {
                                           setReplyingTo(null);
                                           setReplyText('');
                                         }}
                                       >
                                         Cancel
                                       </Button>
                                       <Button
                                         size="sm"
                                         onClick={() => handleReply(comment.id)}
                                         disabled={!replyText.trim()}
                                       >
                                         Reply
                                       </Button>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                   <p>No comments yet. Be the first to share your thoughts!</p>
                 </div>
               )}

               {/* Add Comment Form */}
               {state.user && (
                 <div className="mt-6 pt-4 border-t">
                   <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                       {state.user.name?.charAt(0).toUpperCase() || 'U'}
                     </div>
                     <div className="flex-1">
                       <textarea
                         value={newComment}
                         onChange={(e) => setNewComment(e.target.value)}
                         placeholder="Share your experience with this prompt..."
                         className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                         rows={3}
                       />
                       <div className="flex justify-end mt-2">
                         <Button
                           size="sm"
                           onClick={handlePostComment}
                           disabled={!newComment.trim() || postingComment}
                         >
                           {postingComment ? 'Posting...' : 'Post Comment'}
                         </Button>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}