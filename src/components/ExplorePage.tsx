import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { PromptCard } from "./PromptCard";
import { AdvancedSearchFilters } from "./AdvancedSearchFilters";
import { useApp } from "../contexts/AppContext";
import { prompts as promptsApi, hearts as heartsApi, saves as savesApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Prompt, SearchFilters } from "../lib/types";
import { getSubscriptionLimits, getUserSubscription } from "../lib/subscription";
import { Filter, Grid3X3, List, X } from "lucide-react";

interface ExplorePageProps {
  onBack: () => void;
  onPromptClick: (promptId: string) => void;
  initialSearchQuery?: string;
}





export function ExplorePage({ onBack, onPromptClick, initialSearchQuery }: ExplorePageProps) {
  const { state, dispatch } = useApp();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [subscriptionLimits, setSubscriptionLimits] = useState(getSubscriptionLimits(null));

  // Use global search filters from context
  const filters = state.searchFilters;

  // Load database prompts with user hearts/saves
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const { data, error } = await promptsApi.getAll();
        if (!error && data) {
          // Load user's hearts and saves
          let userHearts: string[] = [];
          let userSaves: string[] = [];

          if (state.user) {
            try {
              // Load database hearts/saves for UUID prompts
              const { data: heartsData } = await supabase
                .from('hearts')
                .select('prompt_id')
                .eq('user_id', state.user.id);
              userHearts = heartsData?.map((h: any) => h.prompt_id) || [];

              const { data: savesData } = await supabase
                .from('saves')
                .select('prompt_id')
                .eq('user_id', state.user.id);
              userSaves = savesData?.map((s: any) => s.prompt_id) || [];
            } catch (err) {
              console.warn('Failed to load user hearts/saves:', err);
            }
          }

          const transformedPrompts: Prompt[] = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            slug: item.slug,
            description: item.description,
            content: item.content,
            type: item.type,
            modelCompatibility: item.model_compatibility,
            tags: item.tags,
            visibility: item.visibility,
            category: item.category,
            language: item.language,
            version: item.version,
            parentId: item.parent_id || undefined,
            viewCount: item.view_count,
            hearts: item.hearts,
            saveCount: item.save_count,
            forkCount: item.fork_count,
            commentCount: item.comment_count,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            attachments: [],
            author: item.profiles ? {
              id: item.profiles.id,
              username: item.profiles.username,
              email: item.profiles.email || '',
              name: item.profiles.name,
              bio: item.profiles.bio || undefined,
              website: item.profiles.website || undefined,
              github: item.profiles.github || undefined,
              twitter: item.profiles.twitter || undefined,
              reputation: 0,
              createdAt: item.profiles.created_at || item.created_at,
              lastLogin: item.profiles.created_at || item.created_at,
              badges: [],
              skills: [],
              subscriptionPlan: item.profiles.subscription_plan || 'free',
              saveCount: 0,
              invitesRemaining: item.profiles.invites_remaining || 0
            } : {
              id: item.user_id,
              username: 'user',
              email: '',
              name: 'User',
              reputation: 0,
              createdAt: item.created_at,
              lastLogin: item.created_at,
              badges: [],
              skills: [],
              subscriptionPlan: 'free',
              saveCount: 0,
              invitesRemaining: 0
            },
            images: item.prompt_images?.map((img: any) => ({
              id: img.id,
              url: img.url,
              altText: img.alt_text,
              isPrimary: img.is_primary,
              size: img.size,
              mimeType: img.mime_type,
              width: img.width || undefined,
              height: img.height || undefined
            })) || [],
            isHearted: userHearts.includes(item.id),
            isSaved: userSaves.includes(item.id),
            isForked: false
          }));

          setPrompts(transformedPrompts);
          dispatch({ type: 'SET_PROMPTS', payload: transformedPrompts });
        }
        setLoading(false); // Set loading to false after successful load
      } catch (err) {
        console.error('Error loading prompts:', err);
        setPrompts(state.prompts);
        setLoading(false); // Set loading to false even on error
      }
    };

    loadPrompts();
  }, [state.user]); // Re-run when user changes (login/logout)

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

  // Initialize search query from prop
  useEffect(() => {
    if (initialSearchQuery) {
      dispatch({ type: 'SET_SEARCH_FILTERS', payload: { query: initialSearchQuery } });
    }
  }, [initialSearchQuery, dispatch]);

  // Filter and sort prompts (client-side filtering)
  const filteredPrompts = useMemo(() => {
    // Use prompts from state if local prompts is empty (fallback)
    const promptsToFilter = prompts.length > 0 ? prompts : state.prompts;
    let filtered = [...promptsToFilter];

    // Text search
    if (filters.query && typeof filters.query === 'string' && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query)) ||
        prompt.author.name.toLowerCase().includes(query) ||
        prompt.author.username.toLowerCase().includes(query)
      );
    }

    // Type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(prompt =>
        filters.types.includes(prompt.type)
      );
    }

    // Model filters
    if (filters.models.length > 0) {
      filtered = filtered.filter(prompt =>
        prompt.modelCompatibility.some(model =>
          filters.models.includes(model)
        )
      );
    }

    // Tag filters
    if (filters.tags.length > 0) {
      filtered = filtered.filter(prompt =>
        prompt.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(prompt =>
        filters.categories.includes(prompt.category)
      );
    }


    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'trending': {
          // Simple trending algorithm: (hearts + saves*2 + forks*3) / age_in_days
          const getScore = (prompt: Prompt) => {
            const score = prompt.hearts + (prompt.saveCount * 2) + (prompt.forkCount * 3);
            const ageInDays = (Date.now() - new Date(prompt.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return score / Math.max(ageInDays + 1, 1);
          };
          return getScore(b) - getScore(a);
        }
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'mostLiked':
          return b.hearts - a.hearts;
        case 'mostForked':
          return b.forkCount - a.forkCount;
        case 'relevance':
        default:
          // For relevance, prioritize exact matches in title, then description, then content
          if (filters.query.trim()) {
            const query = filters.query.toLowerCase();
            const getRelevanceScore = (prompt: Prompt) => {
              let score = 0;
              if (prompt.title.toLowerCase().includes(query)) score += 10;
              if (prompt.description.toLowerCase().includes(query)) score += 5;
              if (prompt.content.toLowerCase().includes(query)) score += 1;
              if (prompt.tags.some(tag => tag.toLowerCase().includes(query))) score += 3;
              return score;
            };
            return getRelevanceScore(b) - getRelevanceScore(a);
          }
          // Default to trending if no query
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [prompts, filters, state.prompts]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: updates });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: {
      query: '',
      types: [],
      models: [],
      tags: [],
      categories: [],
      sortBy: 'trending'
    }});
  };

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

  const resultsCount = filteredPrompts.length;



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading prompts...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex gap-8">
          {/* Advanced Search Filters */}
          <div className="w-80 flex-shrink-0">
            <div className={`${isFilterOpen ? "block" : "hidden"} lg:block`}>
              <AdvancedSearchFilters
                onFiltersChange={(searchFilters) => {
                  // Convert SearchFilters to the existing filter format
                  dispatch({ type: 'SET_SEARCH_FILTERS', payload: {
                    query: searchFilters.query || '',
                    types: [], // Will be handled by the component
                    models: searchFilters.models || [],
                    tags: [],
                    categories: searchFilters.category ? [searchFilters.category] : [],
                    sortBy: searchFilters.sortBy === 'success_rate' ? 'mostLiked' :
                            searchFilters.sortBy === 'hearts_count' ? 'mostLiked' :
                            searchFilters.sortBy === 'saves_count' ? 'mostForked' : 'trending'
                  }});
                }}
                onSearch={() => {
                  // Trigger search - could implement debounced search here
                }}
                isLoading={loading}
                className="sticky top-24"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="space-y-8">
              {/* Page Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={onBack} className="px-3">
                    ← Back to Home
                  </Button>
                </div>

                <div>
                  <h1 className="text-4xl font-bold mb-3">Explore Prompts</h1>
                  <p className="text-muted-foreground text-lg">
                    Discover production-ready prompts from the community
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-muted/30 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {resultsCount} prompts found
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Sort By */}
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: string) => updateFilters({ sortBy: value as 'relevance' | 'trending' | 'latest' | 'mostLiked' | 'mostForked' })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="mostLiked">Most Liked</SelectItem>
                        <SelectItem value="mostForked">Most Forked</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode Toggle */}
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none border-r"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Filter Toggle for Mobile */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="lg:hidden px-4"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}>
                {filteredPrompts.map((prompt) => (
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

              {filteredPrompts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No prompts found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-6 px-6">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-background p-4 overflow-y-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              {/* Filter content would be repeated here for mobile */}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}