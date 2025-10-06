import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { PromptCard } from './PromptCard';
import { Star, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FavoritesAndRecentsProps {
  onPromptClick: (promptId: string) => void;
}

export function FavoritesAndRecents({ onPromptClick }: FavoritesAndRecentsProps) {
  const { state, dispatch } = useApp();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recents, setRecents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    loadFavoritesAndRecents();
  }, []);

  const loadFavoritesAndRecents = async () => {
    if (!state.user) return;

    try {
      setLoading(true);

      // Load favorites (distinct from saves)
      const favoritesData = state.prompts.filter(_prompt =>
        // In a real implementation, this would check user_favorites table
        Math.random() > 0.7 // Mock: randomly mark some as favorites
      );
      setFavorites(favoritesData);

      // Load recent prompts (distinct from saves/hearts)
      const recentsData = state.prompts
        .filter(_prompt => {
          // In a real implementation, this would check user_recents table
          // ordered by last_accessed
          return Math.random() > 0.5; // Mock: randomly include some prompts
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20); // Limit to 20 most recent

      setRecents(recentsData);
    } catch (error) {
      console.error('Failed to load favorites and recents:', error);
      toast.error('Failed to load your lists');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (promptId: string) => {
    try {
      // In a real implementation, this would delete from user_favorites table
      setFavorites(prev => prev.filter(fav => fav.id !== promptId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const clearRecents = async () => {
    if (!confirm('Are you sure you want to clear your recent prompts history?')) {
      return;
    }

    try {
      // In a real implementation, this would clear user_recents table for this user
      setRecents([]);
      toast.success('Recent prompts cleared');
    } catch (error) {
      console.error('Failed to clear recents:', error);
      toast.error('Failed to clear recent prompts');
    }
  };

  if (!state.user) {
    return (
      <Card className="p-8 text-center">
        <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Sign in to access your lists</h3>
        <p className="text-muted-foreground">View your favorite and recently accessed prompts</p>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">My Lists</h2>
            <p className="text-muted-foreground">
              Access your favorite prompts and recently viewed content
            </p>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="recents" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recents ({recents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold">Favorite Prompts</h3>
                  <p className="text-sm text-muted-foreground">
                    Your starred prompts for quick access
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{favorites.length} prompts</Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No favorite prompts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Star prompts you love to add them to your favorites
                </p>
                <Button onClick={() => setActiveTab('recents')}>
                  Browse Recent Prompts
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((prompt) => (
                  <div key={prompt.id} className="relative">
                    <PromptCard
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
                      isSaved={state.saves.some(s => s.promptId === prompt.id && s.userId === state.user?.id)}
                      isHearted={state.hearts.some(h => h.promptId === prompt.id && h.userId === state.user?.id)}
                      createdAt={prompt.createdAt}
                      parentAuthor={prompt.parentId ?
                        state.prompts.find(p => p.id === prompt.parentId)?.author : undefined
                      }
                      onClick={() => onPromptClick(prompt.id)}
                      onHeart={() => {
                        if (state.hearts.some(h => h.promptId === prompt.id && h.userId === state.user?.id)) {
                          dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
                        } else {
                          dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
                        }
                      }}
                      onSave={() => {
                        if (state.saves.some(s => s.promptId === prompt.id && s.userId === state.user?.id)) {
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
                            toast.success('Link copied to clipboard');
                          }
                        } catch (err) {
                          console.error('Failed to share:', err);
                        }
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        removeFromFavorites(prompt.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="recents" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold">Recent Prompts</h3>
                  <p className="text-sm text-muted-foreground">
                    Prompts you've recently viewed or interacted with
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{recents.length} prompts</Badge>
                {recents.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearRecents}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : recents.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No recent prompts</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring prompts to build your recent activity
                </p>
                <Button onClick={() => window.location.href = '/explore'}>
                  Explore Prompts
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recents.map((prompt) => (
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
                    isSaved={state.saves.some(s => s.promptId === prompt.id && s.userId === state.user?.id)}
                    isHearted={state.hearts.some(h => h.promptId === prompt.id && h.userId === state.user?.id)}
                    createdAt={prompt.createdAt}
                    parentAuthor={prompt.parentId ?
                      state.prompts.find(p => p.id === prompt.parentId)?.author : undefined
                    }
                    onClick={() => onPromptClick(prompt.id)}
                    onHeart={() => {
                      if (state.hearts.some(h => h.promptId === prompt.id && h.userId === state.user?.id)) {
                        dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
                      } else {
                        dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
                      }
                    }}
                    onSave={() => {
                      if (state.saves.some(s => s.promptId === prompt.id && s.userId === state.user?.id)) {
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
                          toast.success('Link copied to clipboard');
                        }
                      } catch (err) {
                        console.error('Failed to share:', err);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </section>
    </div>
  );
}