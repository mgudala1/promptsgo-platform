import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { PromptCard } from './PromptCard';
import { PromptPack, Prompt } from '../lib/types';
import { ArrowLeft, Lock, Users, Calendar, Package, Heart, Crown } from 'lucide-react';

interface PackViewPageProps {
  packId: string;
  onBack: () => void;
  onPromptClick: (promptId: string) => void;
}

export function PackViewPage({ packId, onBack, onPromptClick }: PackViewPageProps) {
  const { state, dispatch } = useApp();
  const [pack, setPack] = useState<PromptPack | null>(null);
  const [packPrompts, setPackPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Find pack in state (which includes all packs)
    const foundPack = state.promptPacks.find(p => p.id === packId);
    
    if (foundPack) {
      setPack(foundPack);
      // Get prompts that belong to this pack
      const prompts = state.prompts.filter(p => foundPack.promptIds.includes(p.id));
      setPackPrompts(prompts);
    }
  }, [packId, state.promptPacks, state.prompts]);

  const handleAddPackToLibrary = () => {
    if (!state.user || !pack) return;

    // For free users, limit to 2 packs
    if (state.user.subscriptionStatus !== 'active') {
      const userPackCount = state.userPackLibrary?.packs?.length || 0;
      if (userPackCount >= 2) {
        alert('Free users can add up to 2 packs. Upgrade to Pro for unlimited access!');
        return;
      }
    }

    // Add pack to user's library
    dispatch({ 
      type: 'ADD_PACK_TO_LIBRARY', 
      payload: { packId: pack.id, packName: pack.name } 
    });

    // Also add pack prompts to user's saved prompts
    pack.promptIds.forEach(promptId => {
      dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
    });

    alert(`Added "${pack.name}" pack to your collection!`);
  };

  // Removed: Pro users cannot add pack prompts to portfolios to protect content creators' IP

  const handlePurchasePack = () => {
    if (!pack) return;
    alert(`Purchase ${pack.name} for ${pack.price}. Payment integration coming soon!`);
  };

  if (!pack) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Prompt Packs
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="mb-4">Pack not found</h2>
            <p className="text-muted-foreground">
              The requested pack could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const author = state.prompts.find(p => p.userId === pack.createdBy)?.author;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Prompt Packs
          </Button>
        </div>

        {/* Pack Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Package className="h-6 w-6" />
                    {pack.name}
                    {pack.isOfficial && (
                      <Badge variant="secondary">Official</Badge>
                    )}
                    {pack.isPremium && (
                      <Badge variant="secondary">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {pack.description}
                  </CardDescription>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pack.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {pack.promptIds.length} prompts
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(pack.createdAt).toLocaleDateString()}
                    </div>
                    {author && (
                      <div>
                        Created by {author.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 ml-4">
                  <div className="flex gap-2">
                    {pack.isPremium ? (
                      <Button onClick={handlePurchasePack} size="lg">
                        Buy for ${pack.price}
                      </Button>
                    ) : (
                      <Button onClick={handleAddPackToLibrary} size="lg">
                        <Heart className="w-4 h-4 mr-2" />
                        Add Pack
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Prompts in Pack */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2>Prompts in this Pack ({packPrompts.length})</h2>
          </div>

          {packPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  author={prompt.author}
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
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No prompts found in this pack</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}