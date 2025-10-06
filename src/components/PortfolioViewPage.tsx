import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { PromptCard } from './PromptCard';
import { useApp } from '../contexts/AppContext';
import { Portfolio, Prompt } from '../lib/types';
import {
  ArrowLeft, Lock, Globe, Copy,
  Plus, Trash2, Edit, Save, X, Settings, Share2
} from 'lucide-react';

interface PortfolioViewPageProps {
  portfolioId: string;
  onBack: () => void;
  onPromptClick: (promptId: string) => void;
}

export function PortfolioViewPage({ portfolioId, onBack, onPromptClick }: PortfolioViewPageProps) {
  const { state, dispatch } = useApp();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioPrompts, setPortfolioPrompts] = useState<Prompt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPasswordProtected: false,
    password: '',
    isPublished: false
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const foundPortfolio = state.portfolios.find(p => p.id === portfolioId);
    if (foundPortfolio) {
      setPortfolio(foundPortfolio);
      setIsOwner(state.user?.id === foundPortfolio.userId);
      setEditForm({
        name: foundPortfolio.name,
        description: foundPortfolio.description,
        isPasswordProtected: foundPortfolio.isPasswordProtected,
        password: foundPortfolio.password || '',
        isPublished: foundPortfolio.isPublished
      });

      // Get prompts in this portfolio
      const prompts = state.prompts.filter(p =>
        foundPortfolio.promptIds.includes(p.id)
      );
      setPortfolioPrompts(prompts);
    }
  }, [portfolioId, state.portfolios, state.prompts, state.user]);

  const handleSave = () => {
    if (!portfolio) return;

    const updatedPortfolio: Portfolio = {
      ...portfolio,
      name: editForm.name,
      description: editForm.description,
      isPasswordProtected: editForm.isPasswordProtected,
      password: editForm.isPasswordProtected ? editForm.password : undefined,
      isPublished: editForm.isPublished,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { id: portfolio.id, updates: updatedPortfolio } });
    setPortfolio(updatedPortfolio);
    setIsEditing(false);
  };

  const handleRemovePrompt = (promptId: string) => {
    if (!portfolio) return;

    const updatedPromptIds = portfolio.promptIds.filter(id => id !== promptId);
    const updatedPortfolio: Portfolio = {
      ...portfolio,
      promptIds: updatedPromptIds,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { id: portfolio.id, updates: updatedPortfolio } });
    setPortfolio(updatedPortfolio);
    setPortfolioPrompts(prev => prev.filter(p => p.id !== promptId));
  };

  const handleCopyLink = async () => {
    if (!portfolio) return;

    const url = state.user?.subscriptionPlan === 'pro'
      ? `${portfolio.subdomain}.promptsgo.com`
      : `promptsgo.com/portfolio/${portfolio.subdomain}`;

    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!portfolio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Portfolio not found</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  const portfolioUrl = state.user?.subscriptionPlan === 'pro'
    ? `${portfolio.subdomain}.promptsgo.com`
    : `promptsgo.com/portfolio/${portfolio.subdomain}`;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl">{portfolio.name}</h1>
            {portfolio.isPasswordProtected && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Protected
              </Badge>
            )}
            {!portfolio.isPublished && (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{portfolio.description}</p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button onClick={handleCopyLink}>
              {copiedLink ? (
                <>✓ Copied</>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Portfolio URL */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <code className="flex-1 text-sm">{portfolioUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && isOwner && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  value={portfolio.subdomain}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Subdomain cannot be changed
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Password Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require a password to view this portfolio
                </p>
              </div>
              <Switch
                checked={editForm.isPasswordProtected}
                onCheckedChange={(checked: boolean) => setEditForm({...editForm, isPasswordProtected: checked})}
              />
            </div>

            {editForm.isPasswordProtected && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Publish Portfolio</Label>
                <p className="text-sm text-muted-foreground">
                  Make this portfolio publicly accessible
                </p>
              </div>
              <Switch
                checked={editForm.isPublished}
                onCheckedChange={(checked: boolean) => setEditForm({...editForm, isPublished: checked})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{portfolio.viewCount}</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{portfolio.clientAccessCount}</div>
            <div className="text-sm text-muted-foreground">Client Accesses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{portfolioPrompts.length}</div>
            <div className="text-sm text-muted-foreground">Prompts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {new Date(portfolio.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">Created</div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Prompts in this Portfolio</h2>
          {isOwner && (
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Prompts
            </Button>
          )}
        </div>

        {portfolioPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioPrompts.map((prompt) => (
              <div key={prompt.id} className="relative">
                <PromptCard
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  author={{
                    name: prompt.author.name,
                    username: prompt.author.username,
                    subscriptionPlan: prompt.author.subscriptionPlan
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
                  onShare={async () => {
                    const url = `${window.location.origin}/prompts/${prompt.slug}`;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: prompt.title,
                          text: prompt.description,
                          url: url
                        });
                      } else {
                        await navigator.clipboard.writeText(url);
                        // Could show a toast notification here
                      }
                    } catch (err) {
                      console.error('Failed to share:', err);
                    }
                  }}
                />
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleRemovePrompt(prompt.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No prompts yet</h3>
                <p>This portfolio doesn't have any prompts yet.</p>
                {isOwner && (
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Prompt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}