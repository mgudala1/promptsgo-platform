import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PromptCard } from "./PromptCard";
import { ProfessionalHero } from "./ui/ProfessionalHero";
import { useApp } from "../contexts/AppContext";
import { ArrowRight, GitFork, Star, User, Package } from "lucide-react"; // cleaned imports
import { getSubscriptionLimits, getUserSubscription } from "../lib/subscription";
import { hearts as heartsApi, saves as savesApi } from "../lib/api";

interface HomePageProps {
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

export function HomePage({ onExplore, onPromptClick }: HomePageProps) {
  const { state, dispatch } = useApp();
  const [subscriptionLimits, setSubscriptionLimits] = useState(getSubscriptionLimits(null));

  // Load user's subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (state.user) {
        try {
          const subscription = await getUserSubscription(state.user.id);
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

  const handleHeartPrompt = async (promptId: string) => {
    if (!state.user) {
      return;
    }

    try {
      const result = await heartsApi.toggle(promptId);

      if (!result.error) {
        // Update global state immediately for instant visual feedback
        if (result.action === 'added') {
          dispatch({ type: 'HEART_PROMPT', payload: { promptId } });
        } else {
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
      return;
    }

    // Check subscription limits
    const userSaves = state.prompts.filter(p => p.isSaved).length;
    if (subscriptionLimits.saves !== 'unlimited' && userSaves >= subscriptionLimits.saves) {
      alert(`You've reached your save limit (${subscriptionLimits.saves}). Upgrade to Pro for unlimited saves!`);
      return;
    }

    try {
      const result = await savesApi.toggle(promptId);

      if (!result.error) {
        // Update global state immediately for instant visual feedback
        if (result.action === 'added') {
          dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
        } else {
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
    <div className="min-h-screen bg-background">
      {/* Professional Hero Section */}
      <ProfessionalHero />

      {/* Category Filters */}
      <section className="py-12 px-6 border-b bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Explore by Category</h2>
            <p className="text-muted-foreground">Find prompts tailored to your industry and needs</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
            <Button
              variant={state.searchFilters.categories.length === 0 ? "default" : "outline"}
              onClick={() => dispatch({ type: 'SET_SEARCH_FILTERS', payload: { categories: [] } })}
              className="rounded-full px-6 py-2 text-sm font-medium"
              size="lg"
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
                  className="rounded-full px-6 py-2 text-sm font-medium"
                  size="lg"
                >
                  {category.name}
                </Button>
              ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-3">Featured Portfolios</h2>
              <p className="text-muted-foreground text-lg">
                Top-performing prompts from professional portfolios
              </p>
            </div>
            <Button variant="outline" onClick={onExplore} size="lg" className="px-6">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trendingPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.description}
                content={prompt.content}
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
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
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
      <section className="py-20 px-6 bg-muted/50 mb-32">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Professional Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to showcase your AI expertise and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fork & Remix */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <GitFork className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fork & Remix</h3>
              <p className="text-muted-foreground leading-relaxed">
                Improve prompts with full attribution and version control
              </p>
            </div>

            {/* Save & Share */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Unlimited Saves & Collections</h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep unlimited personal libraries of favorites and share collections with clients
              </p>
            </div>

            {/* Profiles & Portfolios */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Profiles & Portfolios</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build your reputation and showcase your work professionally
              </p>
            </div>

            {/* Curated Packs */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Industry Packs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access exclusive, professionally curated prompt packs for your industry
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
