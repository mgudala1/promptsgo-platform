import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PromptCard } from './PromptCard';
import { useApp } from '../contexts/AppContext';
import { Prompt } from '../lib/types';
import { ArrowLeft, BookmarkPlus, Heart } from 'lucide-react';

interface SavedPromptsPageProps {
  onBack: () => void;
  onPromptClick: (promptId: string) => void;
}

export function SavedPromptsPage({ onBack, onPromptClick }: SavedPromptsPageProps) {
  const { state, dispatch } = useApp();
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [heartedPrompts, setHeartedPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    if (!state.user) return;

    // Get user's saved prompts
    const userSaves = state.saves.filter(s => s.userId === state.user!.id);
    const saved = state.prompts.filter(p => 
      userSaves.some(s => s.promptId === p.id)
    );
    setSavedPrompts(saved);

    // Get user's hearted prompts
    const userHearts = state.hearts.filter(h => h.userId === state.user!.id);
    const hearted = state.prompts.filter(p => 
      userHearts.some(h => h.promptId === p.id)
    );
    setHeartedPrompts(hearted);
  }, [state.user, state.saves, state.hearts, state.prompts]);

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please sign in to view saved prompts</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  const renderPromptGrid = (prompts: Prompt[]) => (
    prompts.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
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
            parentAuthor={prompt.parentId ? 
              state.prompts.find(p => p.id === prompt.parentId)?.author : undefined
            }
            onClick={() => onPromptClick(prompt.id)}
            onHeart={() => {
              if (prompt.isHearted) {
                dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: prompt.id } });
              } else {
                dispatch({ type: 'HEART_PROMPT', payload: { promptId: prompt.id } });
              }
            }}
            onSave={() => {
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
            {activeTab === 'saved' ? (
              <>
                <BookmarkPlus className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved prompts</h3>
                <p>You haven't saved any prompts yet. Start exploring to find prompts you like!</p>
              </>
            ) : (
              <>
                <Heart className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hearted prompts</h3>
                <p>You haven't hearted any prompts yet. Show some love to creators by hearting their work!</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl">My Saved Content</h1>
          <p className="text-muted-foreground">Manage your saved and hearted prompts</p>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookmarkPlus className="h-4 w-4" />
            Saved ({savedPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="hearted" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Hearted ({heartedPrompts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Saved Prompts</h2>
              <p className="text-sm text-muted-foreground">
                Prompts you've bookmarked for later reference
              </p>
            </div>
          </div>
          {renderPromptGrid(savedPrompts)}
        </TabsContent>

        <TabsContent value="hearted" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Hearted Prompts</h2>
              <p className="text-sm text-muted-foreground">
                Prompts you've shown appreciation for
              </p>
            </div>
          </div>
          {renderPromptGrid(heartedPrompts)}
        </TabsContent>
      </Tabs>
    </div>
  );
}