import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SubscriptionBadge } from "./ui/SubscriptionBadge";
import { PromptCard } from "./PromptCard";
import { useApp } from "../contexts/AppContext";
import { ArrowRight, Sparkles, GitFork, Star, User, Package, Lock, Crown } from "lucide-react"; // cleaned imports
import { hearts as heartsApi, saves as savesApi } from "../lib/api";
import { getSaveLimit, canSaveMore } from "../lib/limits";

interface HomePageProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onPromptClick: (promptId: string) => void;
}

const categories = [
  { id: 'writing', name: 'Writing' },
  { id: 'coding', name: 'Coding' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'business', name: 'Business' },
  { id: 'data', name: 'Data Analysis' },
  { id: 'education', name: 'Education' },
  { id: 'creative', name: 'Creative' },
  { id: 'technical', name: 'Technical' }
];

export function HomePage({ onGetStarted, onExplore, onPromptClick }: HomePageProps) {
  const { state, dispatch } = useApp();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get trending prompts (sorted by hearts), filtered by local category selection
  const trendingPrompts = state.prompts
    .slice()
    .filter(prompt => {
      // Only filter by category if categories are selected
      if (selectedCategories.length > 0 && !selectedCategories.includes(prompt.category)) return false;
      return true;
    })
    .sort((a, b) => b.hearts - a.hearts)
    .slice(0, 8);

  const handleHeartPrompt = async (promptId: string) => {
    if (!state.user) {
      console.log('User not authenticated');
      return;
    }

    console.log('Toggling heart for prompt:', promptId, 'Current isHearted:', state.prompts.find(p => p.id === promptId)?.isHearted);
    try {
      const result = await heartsApi.toggle(promptId);
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

  const handleSavePrompt = async (promptId: string) => {
    if (!state.user) {
      console.log('User not authenticated');
      return;
    }

    // Check role-based save limits
    const userSaves = state.saves.length;
    const canSave = canSaveMore(state.user, userSaves);
    if (!canSave.allowed) {
      alert(canSave.message || 'You have reached your save limit. Upgrade to Pro for unlimited saves!');
      return;
    }

    console.log('Toggling save for prompt:', promptId, 'Current isSaved:', state.prompts.find(p => p.id === promptId)?.isSaved);
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              New: Client-Ready Portfolio System
            </Badge>
          </div>
          
          <h1 className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Share, Discover, and Showcase the Best AI Prompts
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            PromptsGo is the professional home for prompt engineers, freelancers, and AI enthusiasts. 
            Organize your prompts, collaborate with the community, and showcase your expertise in client-ready portfolios.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" onClick={onExplore} className="text-lg px-8">
              Explore Prompts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onGetStarted} className="text-lg px-8">
              Create Free Account
            </Button>
          </div>

          {/* Role Status */}
          {state.user && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <SubscriptionBadge
                role={state.user.role || 'general'}
                subscriptionStatus={state.user.subscriptionStatus}
              />
              {(state.user.role || 'general') === 'general' && (
                <Badge variant="secondary">
                  Free Plan
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {getSaveLimit(state.user) === 'unlimited'
                  ? 'Unlimited saves'
                  : `${state.user.saveCount}/${getSaveLimit(state.user)} saves used`
                }
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join a growing community of AI professionals sharing their best work.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-12 md:py-16 border-b">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant={selectedCategories.length === 0 ? "default" : "outline"}
            onClick={() => setSelectedCategories([])}
            className="rounded-full"
          >
            All Categories
          </Button>
          {categories.map((category) => (
             <Button
               key={category.id}
               variant={selectedCategories.includes(category.name) ? "default" : "outline"}
               onClick={() => {
                 const newCategories = selectedCategories.includes(category.name)
                   ? selectedCategories.filter(c => c !== category.name)
                   : [...selectedCategories, category.name];
                 setSelectedCategories(newCategories);
               }}
               className="rounded-full"
             >
               {category.name}
             </Button>
           ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">Featured Portfolios</h2>
              <p className="text-muted-foreground">
                Top-performing prompts from professional portfolios
              </p>
            </div>
            <Button variant="outline" onClick={onExplore}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingPrompts.map((prompt) => (
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
                onHeart={() => handleHeartPrompt(prompt.id)}
                onSave={() => handleSavePrompt(prompt.id)}
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
                    }
                  } catch (err) {
                    console.error('Failed to share:', err);
                  }
                }}
              />
            ))}
          </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-muted/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Professional Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to showcase your AI expertise and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fork & Remix */}
            <div className="bg-card p-6 rounded-lg border">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GitFork className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg mb-2">Fork & Remix</h3>
              <p className="text-sm text-muted-foreground">
                Improve prompts with full attribution and version control
              </p>
            </div>

            {/* Save & Share */}
            <div className="bg-card p-6 rounded-lg border relative">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg mb-2">Unlimited Saves & Collections</h3>
              <p className="text-sm text-muted-foreground">
                Keep unlimited personal libraries of favorites and share collections with clients
              </p>
            </div>

            {/* Profiles & Portfolios */}
            <div className="bg-card p-6 rounded-lg border">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg mb-2">Profiles & Portfolios</h3>
              <p className="text-sm text-muted-foreground">
                Build your reputation and showcase your work professionally
              </p>
            </div>

            {/* Curated Packs */}
            <div className="bg-card p-6 rounded-lg border relative">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg mb-2">Prompt Packs</h3>
              <p className="text-sm text-muted-foreground">
                Create and sell curated prompt packs as a Pro user
              </p>
            </div>
          </div>
      </section>

    </div>
  );
}
