import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PromptCard } from "./PromptCard";
import { useApp } from "../contexts/AppContext";
import { ArrowRight, Sparkles, GitFork, Star, User, Package, Lock, Crown } from "lucide-react"; // cleaned imports
import { getSubscriptionLimits, getUserSubscription, SubscriptionData } from "../lib/subscription";

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
  const [userSubscription, setUserSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLimits, setSubscriptionLimits] = useState(getSubscriptionLimits(null));

  // Load user's subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (state.user) {
        try {
          const subscription = await getUserSubscription(state.user.id);
          setUserSubscription(subscription);
          setSubscriptionLimits(getSubscriptionLimits(subscription));
        } catch (err) {
          console.error('Error loading subscription:', err);
        }
      } else {
        setSubscriptionLimits(getSubscriptionLimits(null));
      }
    };

    loadSubscription();
  }, [state.user]);

  // Get trending prompts (sorted by hearts), filtered by category and search if selected
  const trendingPrompts = state.prompts
    .slice()
    .filter(prompt => {
      if (state.searchFilters.categories.length > 0 && !state.searchFilters.categories.includes(prompt.category)) return false;

      if (state.searchFilters.query && typeof state.searchFilters.query === 'string' && state.searchFilters.query.trim()) {
        const query = state.searchFilters.query.toLowerCase();
        return prompt.title.toLowerCase().includes(query) ||
               prompt.description.toLowerCase().includes(query) ||
               prompt.content.toLowerCase().includes(query) ||
               prompt.tags.some(tag => tag.toLowerCase().includes(query)) ||
               prompt.author.name.toLowerCase().includes(query) ||
               prompt.author.username.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => b.hearts - a.hearts)
    .slice(0, 8);

  const handleHeartPrompt = (promptId: string) => {
    if (!state.user) return;
    const prompt = state.prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (prompt.isHearted) {
      dispatch({ type: 'UNHEART_PROMPT', payload: { promptId } });
    } else {
      dispatch({ type: 'HEART_PROMPT', payload: { promptId } });
    }
  };

  const handleSavePrompt = (promptId: string) => {
    if (!state.user) return;
    const prompt = state.prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (prompt.isSaved) {
      dispatch({ type: 'UNSAVE_PROMPT', payload: promptId });
    } else {
      // Check subscription limits
      const userSaves = state.prompts.filter(p => p.isSaved).length;
      if (subscriptionLimits.saves !== 'unlimited' && userSaves >= subscriptionLimits.saves) {
        alert(`You've reached your save limit (${subscriptionLimits.saves}). Upgrade to Pro for unlimited saves!`);
        return;
      }
      dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
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

          {/* Subscription Status */}
          {state.user && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {userSubscription?.status === 'active' ? (
                <Badge className="bg-gradient-to-r from-primary to-primary/80">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Member
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Free Plan
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {subscriptionLimits.saves === 'unlimited'
                  ? 'Unlimited saves'
                  : `${subscriptionLimits.saves} saves remaining`
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
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant={state.searchFilters.categories.length === 0 ? "default" : "outline"}
              onClick={() => dispatch({ type: 'SET_SEARCH_FILTERS', payload: { categories: [] } })}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map((category) => (
               <Button
                 key={category.id}
                 variant={state.searchFilters.categories.includes(category.name) ? "default" : "outline"}
                 onClick={() => {
                   const newCategories = state.searchFilters.categories.includes(category.name)
                     ? state.searchFilters.categories.filter(c => c !== category.name)
                     : [...state.searchFilters.categories, category.name];
                   dispatch({ type: 'SET_SEARCH_FILTERS', payload: { categories: newCategories } });
                 }}
                 className="rounded-full"
               >
                 {category.name}
               </Button>
             ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
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
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-muted/50 mb-32">
        <div className="container mx-auto">
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
                  <Lock className="h-3 w-3 mr-1" />
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
              <h3 className="text-lg mb-2">Premium Industry Packs</h3>
              <p className="text-sm text-muted-foreground">
                Access exclusive, professionally curated prompt packs for your industry
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
