import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { PromptCard } from './PromptCard';
import { useApp } from '../contexts/AppContext';
import { User, Prompt } from '../lib/types';
import { CreatePortfolioPage } from './CreatePortfolioPage';
import {
  ArrowLeft, User as UserIcon, Calendar, ExternalLink, Github,
  Twitter, Award, Star, GitFork, BookmarkPlus,
  TrendingUp, Crown, Zap, Target,
  Shield, Globe, Trash2, Package,
  Briefcase, Plus, Eye, Lock, Copy, Trash, CreditCard
} from 'lucide-react';

interface UserProfilePageProps {
   userId: string;
   initialTab?: string;
   onBack: () => void;
   onPromptClick: (promptId: string) => void;
   onNavigateToPromptPacks?: () => void;
   onNavigateToPackView?: (packId: string) => void;
   onNavigateToPortfolioView?: (portfolioId: string) => void;
   onNavigateToBilling?: () => void;
   onNavigateToSubscription?: () => void;
 }

export function UserProfilePage({
   userId,
   initialTab,
   onBack,
   onPromptClick,
   onNavigateToPromptPacks,
   onNavigateToPackView,
   onNavigateToPortfolioView,
   onNavigateToBilling,
   onNavigateToSubscription
 }: UserProfilePageProps) {
  const { state, dispatch } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [forkedPrompts, setForkedPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState(initialTab || 'created');
  const [copiedPortfolio, setCopiedPortfolio] = useState<string | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    username: state.user?.username || '',
    email: state.user?.email || '',
    bio: state.user?.bio || '',
    website: state.user?.website || '',
    github: state.user?.github || '',
    twitter: state.user?.twitter || '',
    skills: state.user?.skills?.join(', ') || ''
  });

  useEffect(() => {
    const foundUser = state.prompts.find(p => p.userId === userId)?.author || 
                     (state.user?.id === userId ? state.user : null);
    
    if (foundUser) {
      setUser(foundUser);
    }

    // Get user's created prompts
    const created = state.prompts.filter(p => p.userId === userId);
    setUserPrompts(created);

    // Get user's saved prompts
    if (state.user?.id === userId) {
      const userSaves = state.saves.filter(s => s.userId === userId);
      const saved = state.prompts.filter(p => 
        userSaves.some(s => s.promptId === p.id)
      );
      setSavedPrompts(saved);

      // Get user's forked prompts
      const forked = state.prompts.filter(p => 
        p.userId === userId && p.parentId
      );
      setForkedPrompts(forked);
    }
  }, [userId, state.prompts, state.saves, state.user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">User not found</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = state.user?.id === userId;
  const isFollowing = state.follows.some(f => 
    f.followerId === state.user?.id && f.followingId === userId
  );

  const handleFollow = () => {
    if (!state.user || state.user.id === userId) return;

    if (isFollowing) {
      dispatch({ type: 'UNFOLLOW_USER', payload: userId });
    } else {
      dispatch({ type: 'FOLLOW_USER', payload: userId });
    }
  };

  // Calculate stats
  const totalHearts = userPrompts.reduce((sum, p) => sum + p.hearts, 0);
  const totalSaves = userPrompts.reduce((sum, p) => sum + p.saveCount, 0);
  const totalForks = userPrompts.reduce((sum, p) => sum + p.forkCount, 0);
  const totalViews = userPrompts.reduce((sum, p) => sum + p.viewCount, 0);


  const handleSave = () => {
    if (!state.user) return;
    
    const updatedUser = {
      ...state.user,
      name: formData.name,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      website: formData.website,
      github: formData.github,
      twitter: formData.twitter,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!state.user) return;
    
    setFormData({
      name: state.user.name || '',
      username: state.user.username || '',
      email: state.user.email || '',
      bio: state.user.bio || '',
      website: state.user.website || '',
      github: state.user.github || '',
      twitter: state.user.twitter || '',
      skills: state.user.skills?.join(', ') || ''
    });
    setIsEditing(false);
  };

  const handlePortfolioCreated = () => {
    setIsCreatingPortfolio(false);
    // Switch to portfolios tab to show the newly created portfolio
    setActiveTab('portfolios');
  };

  // Reputation level calculation
  const getReputationLevel = (reputation: number) => {
    if (reputation >= 5000) return { level: 'Expert', icon: Crown, color: 'text-yellow-600' };
    if (reputation >= 2000) return { level: 'Advanced', icon: Star, color: 'text-purple-600' };
    if (reputation >= 500) return { level: 'Intermediate', icon: Zap, color: 'text-blue-600' };
    if (reputation >= 100) return { level: 'Beginner', icon: Target, color: 'text-green-600' };
    return { level: 'Novice', icon: UserIcon, color: 'text-gray-600' };
  };

  const reputationLevel = getReputationLevel(user.reputation);
  const ReputationIcon = reputationLevel.icon;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl">{user.name}</h1>
                    <div className={`flex items-center gap-1 ${reputationLevel.color}`}>
                      <ReputationIcon className="h-5 w-5" />
                      <span className="font-medium">{reputationLevel.level}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-1">@{user.username}</p>

                  {user.bio && (
                    <p className="text-sm mb-4">{user.bio}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 mb-4">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {user.github && (
                      <a
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {user.twitter && (
                      <a
                        href={`https://twitter.com/${user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!isOwnProfile && (
                    <>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollow}
                        disabled={!state.user}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      <Button variant="outline">
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.reputation}</div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userPrompts.length}</div>
                  <div className="text-xs text-muted-foreground">Prompts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalHearts}</div>
                  <div className="text-xs text-muted-foreground">Total Hearts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <div className="text-xs text-muted-foreground">Total Views</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Saves Received</span>
                  <span className="font-medium">{totalSaves}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Forks Created</span>
                  <span className="font-medium">{totalForks}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          {user.badges && user.badges.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="text-center p-2 border rounded-lg">
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {badge.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="created">
            Created ({userPrompts.length})
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger value="saved">
                Saved ({savedPrompts.length})
              </TabsTrigger>
              <TabsTrigger value="forked">
                Forked ({forkedPrompts.length})
              </TabsTrigger>
              <TabsTrigger value="packs">
                My Packs ({state.userPackLibrary?.packs?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="portfolios">
                Portfolios ({state.portfolios.filter(p => p.userId === userId).length})
              </TabsTrigger>
              <TabsTrigger value="settings">
                Settings
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="created" className="space-y-6">
          {userPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  author={{
                    name: prompt.author.name,
                    username: prompt.author.username,
                    role: prompt.author.role,
                    subscriptionStatus: prompt.author.subscriptionStatus
                  }}
                  category={prompt.category}
                  tags={prompt.tags}
                  images={prompt.images}
                  stats={{
                    hearts: prompt.hearts,
                    saves: prompt.saveCount,
                    forks: prompt.forkCount
                  }}
                  isSaved={prompt.isSaved}
                  isHearted={prompt.isHearted}
                  createdAt={prompt.createdAt}
                  onClick={() => onPromptClick(prompt.id)}
                  onHeart={() => {
                    if (!state.user) return;
                    if (prompt.isHearted) {
                      dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
                    } else {
                      dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
                    }
                  }}
                  onSave={() => {
                    if (!state.user) return;
                    if (prompt.isSaved) {
                      dispatch({ type: 'UNSAVE_PROMPT', payload: prompt.id });
                    } else {
                      dispatch({ type: 'SAVE_PROMPT', payload: { promptId: prompt.id } });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <UserIcon className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No prompts yet</h3>
                  <p>This user hasn't created any prompts yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="saved" className="space-y-6">
              {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      id={prompt.id}
                      title={prompt.title}
                      description={prompt.description}
                      author={{
                        name: prompt.author.name,
                        username: prompt.author.username,
                        role: prompt.author.role,
                        subscriptionStatus: prompt.author.subscriptionStatus
                      }}
                      category={prompt.category}
                      tags={prompt.tags}
                      images={prompt.images}
                      stats={{
                        hearts: prompt.hearts,
                        saves: prompt.saveCount,
                        forks: prompt.forkCount
                      }}
                      isSaved={prompt.isSaved}
                      isHearted={prompt.isHearted}
                      createdAt={prompt.createdAt}
                      onClick={() => onPromptClick(prompt.id)}
                      onHeart={() => {
                        if (!state.user) return;
                        if (prompt.isHearted) {
                          dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
                        } else {
                          dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
                        }
                      }}
                      onSave={() => {
                        if (!state.user) return;
                        if (prompt.isSaved) {
                          dispatch({ type: 'UNSAVE_PROMPT', payload: prompt.id });
                        } else {
                          dispatch({ type: 'SAVE_PROMPT', payload: { promptId: prompt.id } });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <BookmarkPlus className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No saved prompts</h3>
                      <p>You haven't saved any prompts yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="forked" className="space-y-6">
              {forkedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forkedPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      id={prompt.id}
                      title={prompt.title}
                      description={prompt.description}
                      author={{
                        name: prompt.author.name,
                        username: prompt.author.username,
                        role: prompt.author.role,
                        subscriptionStatus: prompt.author.subscriptionStatus
                      }}
                      category={prompt.category}
                      tags={prompt.tags}
                      images={prompt.images}
                      stats={{
                        hearts: prompt.hearts,
                        saves: prompt.saveCount,
                        forks: prompt.forkCount
                      }}
                      isSaved={prompt.isSaved}
                      isHearted={prompt.isHearted}
                      createdAt={prompt.createdAt}
                      parentAuthor={prompt.parentId ? 
                        state.prompts.find(p => p.id === prompt.parentId)?.author : undefined
                      }
                      onClick={() => onPromptClick(prompt.id)}
                      onHeart={() => {
                        if (!state.user) return;
                        if (prompt.isHearted) {
                          dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
                        } else {
                          dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
                        }
                      }}
                      onSave={() => {
                        if (!state.user) return;
                        if (prompt.isSaved) {
                          dispatch({ type: 'UNSAVE_PROMPT', payload: prompt.id });
                        } else {
                          dispatch({ type: 'SAVE_PROMPT', payload: { promptId: prompt.id } });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <GitFork className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No forks yet</h3>
                      <p>You haven't forked any prompts yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Packs Tab */}
            <TabsContent value="packs" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3>My Pack Library</h3>
                  <p className="text-muted-foreground text-sm">
                    Prompt packs you've added to your collection
                  </p>
                </div>
              </div>

              {state.userPackLibrary?.packs && state.userPackLibrary.packs.length > 0 ? (
                <div className="space-y-4">
                  {state.userPackLibrary.packs.map(userPack => {
                    const pack = state.promptPacks.find(p => p.id === userPack.packId);
                    if (!pack) return null;

                    return (
                      <Card key={userPack.packId}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4>{pack.name}</h4>
                                {pack.isOfficial && (
                                  <Badge variant="secondary">Official</Badge>
                                )}
                                {pack.isPremium && (
                                  <Badge variant="outline">Premium</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mb-3">
                                {pack.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {pack.promptIds.length} prompts
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Added {new Date(userPack.addedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigateToPackView?.(pack.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Pack
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (state.user) {
                                    dispatch({ type: 'REMOVE_PACK_FROM_LIBRARY', payload: pack.id });
                                  }
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="mb-2">No packs yet</h3>
                      <p className="mb-6">
                        Browse Prompt Packs to build your professional prompt library
                      </p>
                      <Button onClick={() => onNavigateToPromptPacks?.()}>
                        <Package className="w-4 h-4 mr-2" />
                        Browse Prompt Packs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Portfolios Tab */}
            <TabsContent value="portfolios" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3>My Portfolios</h3>
                  <p className="text-muted-foreground text-sm">
                    Professional prompt collections for client presentation
                  </p>
                </div>
                <Button onClick={() => setIsCreatingPortfolio(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Portfolio
                </Button>
              </div>


              {state.portfolios.filter(p => p.userId === userId).length > 0 ? (
                <div className="space-y-4">
                  {state.portfolios.filter(p => p.userId === userId).map(portfolio => (
                    <Card key={portfolio.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{portfolio.name}</h4>
                              {portfolio.isPasswordProtected && (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Protected
                                </Badge>
                              )}
                              {!portfolio.isPublished && (
                                <Badge variant="secondary" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              {portfolio.description}
                            </p>

                            {/* Portfolio URL */}
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-3">
                              <code className="text-sm flex-1">
                                {state.user?.role === 'pro'
                                  ? `${portfolio.subdomain}.promptsgo.com`
                                  : `promptsgo.com/portfolio/${portfolio.subdomain}`
                                }
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  const url = state.user?.role === 'pro'
                                    ? `${portfolio.subdomain}.promptsgo.com`
                                    : `promptsgo.com/portfolio/${portfolio.subdomain}`;
                                  try {
                                    await navigator.clipboard.writeText(`https://${url}`);
                                    setCopiedPortfolio(portfolio.id);
                                    setTimeout(() => setCopiedPortfolio(null), 2000);
                                  } catch (err) {
                                    console.error('Failed to copy link:', err);
                                  }
                                }}
                              >
                                {copiedPortfolio === portfolio.id ? (
                                  <span className="text-xs text-green-600">Copied!</span>
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {portfolio.viewCount} views
                              </div>
                              <div>
                                {portfolio.promptIds.length} prompts
                              </div>
                              <div>
                                {portfolio.clientAccessCount} client accesses
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigateToPortfolioView?.(portfolio.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          
                          {portfolio.isPublished && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const url = (state.user?.role || 'general') === 'pro'
                                  ? `${portfolio.subdomain}.promptsgo.com`
                                  : `promptsgo.com/portfolio/${portfolio.subdomain}`;
                                try {
                                  await navigator.clipboard.writeText(`https://${url}`);
                                  setCopiedPortfolio(portfolio.id);
                                  setTimeout(() => setCopiedPortfolio(null), 2000);
                                } catch (err) {
                                  console.error('Failed to copy link:', err);
                                }
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              dispatch({
                                type: 'UPDATE_PORTFOLIO',
                                payload: {
                                  id: portfolio.id,
                                  updates: { isPublished: !portfolio.isPublished }
                                }
                              });
                            }}
                          >
                            {portfolio.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this portfolio?')) {
                                dispatch({ type: 'DELETE_PORTFOLIO', payload: portfolio.id });
                              }
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="mb-2">No portfolios yet</h3>
                      <p className="mb-6">
                        Create professional portfolios to showcase your prompts to clients
                      </p>
                      <Button onClick={() => setIsCreatingPortfolio(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Portfolio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscription
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy
                  </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Profile Information</CardTitle>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                              <Button onClick={handleSave}>Save Changes</Button>
                            </>
                          ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Social Links</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="https://your-website.com"
                              value={formData.website}
                              onChange={(e) => setFormData({...formData, website: e.target.value})}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="github-username"
                              value={formData.github}
                              onChange={(e) => setFormData({...formData, github: e.target.value})}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="twitter-handle"
                              value={formData.twitter}
                              onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData({...formData, skills: e.target.value})}
                          placeholder="AI, Machine Learning, Writing..."
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subscription Settings */}
                <TabsContent value="subscription" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Current Plan
                        {state.user?.role === 'pro' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Pro
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">
                              {state.user?.role === 'pro' ? 'Pro Plan' : 'Free Plan'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {state.user?.role === 'pro'
                                ? '$7.99/month - Advanced features included'
                                : 'Basic features only'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {state.user?.role === 'pro' ? '$7.99' : 'Free'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {state.user?.role === 'pro' ? 'per month' : ''}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Saves per month</span>
                            <span>{state.user?.role === 'pro' ? 'Unlimited' : '10'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Forks per month</span>
                            <span>{state.user?.role === 'pro' ? 'Unlimited' : '5'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Export collections</span>
                            <span>{state.user?.role === 'pro' ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>API Access</span>
                            <span>{state.user?.role === 'pro' ? 'Yes' : 'No'}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {state.user?.role === 'general' ? (
                            <Button className="w-full" onClick={() => {/* TODO: Navigate to subscription page */}}>
                              Upgrade to Pro
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => onNavigateToBilling?.()}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Manage Billing & Subscription
                              </Button>
                              {state.user?.isAdmin && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <p className="text-xs text-blue-800 dark:text-blue-200">
                                    👑 <strong>Admin Note:</strong> You have Pro features automatically. Billing page shows UI demo.
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => onNavigateToSubscription?.()}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View all plans & pricing
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy & Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Data & Privacy</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Profile Visibility</div>
                              <div className="text-sm text-muted-foreground">
                                Make your profile visible to other users
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Activity Tracking</div>
                              <div className="text-sm text-muted-foreground">
                                Help improve the platform with usage analytics
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-destructive">Danger Zone</h4>
                        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-destructive">Delete Account</h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                Permanently delete your account and all associated data
                              </p>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Portfolio Creation Modal/Overlay */}
      {isCreatingPortfolio && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-0 overflow-y-auto">
            <CreatePortfolioPage
              onBack={() => setIsCreatingPortfolio(false)}
              onPortfolioCreated={handlePortfolioCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}