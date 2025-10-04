import { useState, useEffect, useMemo } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { PromptCard } from "./PromptCard";
import { useApp } from "../contexts/AppContext";
import { categories, models, promptTypes, popularTags } from "../lib/data";

// Memoize data to avoid recreation on every render
const memoizedCategories = categories;
const memoizedModels = models;
const memoizedPromptTypes = promptTypes;
const memoizedPopularTags = popularTags;
import { prompts as promptsApi } from "../lib/api";
import { Prompt, SearchFilters } from "../lib/types";
import { Search, Filter, Grid3X3, List, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ExplorePageProps {
  onBack: () => void;
  onPromptClick: (promptId: string) => void;
  initialSearchQuery?: string;
}





export function ExplorePage({ onBack, onPromptClick, initialSearchQuery }: ExplorePageProps) {
  const { state, dispatch } = useApp();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Use global search filters from context
  const filters = state.searchFilters;

  // Use local prompts immediately for instant loading
  useEffect(() => {
    setPrompts(state.prompts);
    setLoading(false);

    // Optional: Try to sync with Supabase in background (non-blocking)
    const syncWithSupabase = async () => {
      try {
        const { data, error: apiError } = await promptsApi.getAll();

        if (!apiError && data && data.length > 0) {
          // Transform Supabase data to match our Prompt type
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
            attachments: [], // Not in current schema
            author: item.profiles ? {
              id: item.profiles.id,
              username: item.profiles.username,
              email: item.profiles.email,
              name: item.profiles.name,
              bio: item.profiles.bio || undefined,
              website: item.profiles.website || undefined,
              github: item.profiles.github || undefined,
              twitter: item.profiles.twitter || undefined,
              reputation: 0, // Not in profiles table yet
              createdAt: item.profiles.created_at,
              lastLogin: item.profiles.created_at,
              badges: [],
              skills: [],
              subscriptionPlan: item.profiles.subscription_plan,
              saveCount: 0,
              invitesRemaining: item.profiles.invites_remaining
            } : {
              id: item.user_id,
              username: 'unknown',
              email: 'unknown@example.com',
              name: 'Unknown User',
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
            isHearted: false, // Will be set by user interactions
            isSaved: false,   // Will be set by user interactions
            isForked: false
          }));

          // Only update if we got fresh data
          if (transformedPrompts.length > state.prompts.length) {
            setPrompts(transformedPrompts);
          }
        }
      } catch (err) {
        // Silently fail - we already have local data
        console.warn('Background sync with Supabase failed:', err);
      }
    };

    // Start background sync after a short delay to prioritize UI rendering
    const timeoutId = setTimeout(syncWithSupabase, 100);

    return () => clearTimeout(timeoutId);
  }, [state.prompts]);

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

  const resultsCount = filteredPrompts.length;

  const activeFilters = [
    ...filters.types,
    ...filters.models,
    ...filters.tags,
    ...filters.categories
  ];

  const handleCategoryToggle = (categoryId: string) => {
    const categoryName = memoizedCategories.find(c => c.id === categoryId)?.name;
    if (!categoryName) return;

    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];

    updateFilters({ categories: newCategories });
  };

  const handleModelToggle = (modelId: string) => {
    const modelName = memoizedModels.find(m => m.id === modelId)?.name;
    if (!modelName) return;

    const newModels = filters.models.includes(modelName)
      ? filters.models.filter(m => m !== modelName)
      : [...filters.models, modelName];

    updateFilters({ models: newModels });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    updateFilters({ types: newTypes });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="text-center py-8">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className={`${isFilterOpen ? "block" : "hidden"} lg:block`}>
            <Card className="sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Active Filters */}
                {activeFilters.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Filters</span>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={clearFilters}>
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activeFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80" onClick={() => {
                          // Remove this specific filter by checking each filter array
                          if (filters.types.includes(filter as string)) {
                            handleTypeToggle(filter as string);
                          } else if (filters.models.includes(filter as string)) {
                            const model = memoizedModels.find(m => m.name === filter);
                            if (model) handleModelToggle(model.id);
                          } else if (filters.tags.includes(filter as string)) {
                            updateFilters({ tags: filters.tags.filter(t => t !== filter) });
                          } else if (filters.categories.includes(filter as string)) {
                            const category = memoizedCategories.find(c => c.name === filter);
                            if (category) handleCategoryToggle(category.id);
                          }
                        }}>
                          {typeof filter === 'string' ? filter : '[object Object]'}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {activeFilters.length > 0 && <Separator />}

                {/* Types */}
                <div className="space-y-3">
                  <h4>Type</h4>
                  <div className="space-y-2">
                    {memoizedPromptTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={filters.types.includes(type.id)}
                          onCheckedChange={() => handleTypeToggle(type.id)}
                        />
                        <label
                          htmlFor={type.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {type.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-3">
                  <h4>Categories</h4>
                  <div className="space-y-2">
                    {memoizedCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={filters.categories.includes(category.name)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Models */}
                <div className="space-y-3">
                  <h4>Model Compatibility</h4>
                  <div className="space-y-2">
                    {memoizedModels.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={model.id}
                          checked={filters.models.includes(model.name)}
                          onCheckedChange={() => handleModelToggle(model.id)}
                        />
                        <label
                          htmlFor={model.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {model.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                <div className="space-y-3">
                  <h4>Popular Tags</h4>
                  <div className="space-y-2">
                    {memoizedPopularTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag.id}
                          checked={filters.tags.includes(tag.name)}
                          onCheckedChange={() => {
                            const newTags = filters.tags.includes(tag.name)
                              ? filters.tags.filter(t => t !== tag.name)
                              : [...filters.tags, tag.name];
                            updateFilters({ tags: newTags });
                          }}
                        />
                        <label
                          htmlFor={tag.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  ← Back to Home
                </Button>
              </div>
              
              <div>
                <h1 className="text-3xl mb-2">Explore Prompts</h1>
                <p className="text-muted-foreground">
                  Discover production-ready prompts from the community
                </p>
              </div>


              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {resultsCount} prompts found
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort By */}
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: string) => updateFilters({ sortBy: value as 'relevance' | 'trending' | 'latest' | 'mostLiked' | 'mostForked' })}
                  >
                    <SelectTrigger className="w-40">
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
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
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
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className={`grid gap-6 ${
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
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No prompts found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              </div>
            )}
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