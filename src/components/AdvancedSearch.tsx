import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Search, Filter, X, Tag, Cpu, Eye, Star } from 'lucide-react';
import { PromptCard } from './PromptCard';
import { Prompt } from '../lib/types';

interface AdvancedSearchProps {
  onPromptClick: (promptId: string) => void;
  initialQuery?: string;
}

export function AdvancedSearch({ onPromptClick, initialQuery }: AdvancedSearchProps) {
  const { state, dispatch } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(typeof initialQuery === 'string' ? initialQuery : '');
  const [filters, setFilters] = useState({
    types: [] as string[],
    models: [] as string[],
    tags: [] as string[],
    categories: [] as string[],
    sortBy: 'relevance' as 'relevance' | 'trending' | 'latest' | 'mostLiked' | 'mostForked',
    dateRange: null as { from: Date; to: Date } | null,
    author: '',
    minHearts: 0,
    maxHearts: 1000,
    hasSampleOutputs: false
  });

  // Get all available options from prompts
  const availableOptions = useMemo(() => {
    const types = [...new Set(state.prompts.map(p => p.type))];
    const models = [...new Set(state.prompts.flatMap(p => p.modelCompatibility))];
    const tags = [...new Set(state.prompts.flatMap(p => p.tags))];
    const categories = [...new Set(state.prompts.map(p => p.category))];

    return { types, models, tags, categories };
  }, [state.prompts]);


  // Fuzzy search implementation
  const fuzzySearch = (query: string | undefined, prompts: Prompt[]) => {
    if (!query || typeof query !== 'string' || !query.trim()) return prompts;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    return prompts.filter(prompt => {
      const searchableText = [
        prompt.title,
        prompt.description,
        prompt.content,
        ...prompt.tags,
        prompt.author.name,
        prompt.author.username,
        prompt.category
      ].join(' ').toLowerCase();

      // Exact phrase match gets highest score
      if (searchableText.includes(queryLower)) return true;

      // Individual word matches
      const matches = queryWords.filter(word =>
        searchableText.includes(word) ||
        // Fuzzy character matching (simple implementation)
        fuzzyMatch(word, searchableText)
      );

      // Require at least 70% of words to match
      return matches.length >= queryWords.length * 0.7;
    });
  };

  // Simple fuzzy matching function
  const fuzzyMatch = (pattern: string, text: string): boolean => {
    if (pattern.length === 0) return true;
    if (text.length === 0) return false;

    // Allow for one character difference per 3 characters
    const maxErrors = Math.max(1, Math.floor(pattern.length / 3));
    let errors = 0;
    let patternIndex = 0;

    for (let textIndex = 0; textIndex < text.length && patternIndex < pattern.length; textIndex++) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      } else {
        errors++;
        if (errors > maxErrors) return false;
      }
    }

    return patternIndex === pattern.length;
  };

  // Apply all filters and search
  const finalResults = useMemo(() => {
    let results = fuzzySearch(searchQuery, state.prompts);

    // Apply additional filters
    if (filters.types.length > 0) {
      results = results.filter(p => filters.types.includes(p.type));
    }

    if (filters.models.length > 0) {
      results = results.filter(p =>
        p.modelCompatibility.some(model => filters.models.includes(model))
      );
    }

    if (filters.tags.length > 0) {
      results = results.filter(p =>
        p.tags.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.categories.length > 0) {
      results = results.filter(p => filters.categories.includes(p.category));
    }

    if (filters.dateRange) {
      results = results.filter(p => {
        const promptDate = new Date(p.createdAt);
        return promptDate >= filters.dateRange!.from && promptDate <= filters.dateRange!.to;
      });
    }

    if (filters.author) {
      results = results.filter(p =>
        p.author.username === filters.author ||
        p.author.name.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    if (filters.minHearts > 0) {
      results = results.filter(p => p.hearts >= filters.minHearts);
    }

    if (filters.maxHearts < 1000) {
      results = results.filter(p => p.hearts <= filters.maxHearts);
    }

    // Sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'trending': {
          const getScore = (p: Prompt) => p.hearts + (p.saveCount * 2) + (p.forkCount * 3);
          const getAgeScore = (p: Prompt) => {
            const ageInDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return getScore(p) / Math.max(ageInDays + 1, 1);
          };
          return getAgeScore(b) - getAgeScore(a);
        }
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'mostLiked':
          return b.hearts - a.hearts;
        case 'mostForked':
          return b.forkCount - a.forkCount;
        case 'relevance':
        default:
          if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
            const getRelevanceScore = (p: Prompt) => {
              let score = 0;
              const query = searchQuery.toLowerCase();
              if (p.title.toLowerCase().includes(query)) score += 10;
              if (p.description.toLowerCase().includes(query)) score += 5;
              if (p.content.toLowerCase().includes(query)) score += 1;
              if (p.tags.some(tag => tag.toLowerCase().includes(query))) score += 3;
              return score;
            };
            return getRelevanceScore(b) - getRelevanceScore(a);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return results;
  }, [searchQuery, filters, state.prompts]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    setFilters({
      types: [],
      models: [],
      tags: [],
      categories: [],
      sortBy: 'relevance',
      dateRange: null,
      author: '',
      minHearts: 0,
      maxHearts: 1000,
      hasSampleOutputs: false
    });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && typeof value === 'object' && key === 'dateRange') return count + 1;
    if (typeof value === 'string' && value.trim() && key === 'author') return count + 1;
    if (typeof value === 'number' && ((key === 'minHearts' && value > 0) || (key === 'maxHearts' && value < 1000))) return count + 1;
    if (typeof value === 'boolean' && value && key === 'hasSampleOutputs') return count + 1;
    return count;
  }, 0) + (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Advanced Search</h2>
            <p className="text-muted-foreground">
              Find prompts with powerful filters and fuzzy search
            </p>
          </div>

          {/* Search Header */}
          <Card className="p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts with fuzzy matching..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {filters.types.map(type => (
                  <Badge key={type} variant="outline" className="flex items-center gap-1">
                    Type: {type}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleArrayFilter('types', type)}
                    />
                  </Badge>
                ))}
                {filters.categories.map(category => (
                  <Badge key={category} variant="outline" className="flex items-center gap-1">
                    Category: {category}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleArrayFilter('categories', category)}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Types */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Prompt Types
              </Label>
              <div className="space-y-2">
                {availableOptions.types.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('types', type)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableOptions.categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayFilter('categories', category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Models */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                AI Models
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableOptions.models.map(model => (
                  <div key={model} className="flex items-center space-x-2">
                    <Checkbox
                      id={`model-${model}`}
                      checked={filters.models.includes(model)}
                      onCheckedChange={() => toggleArrayFilter('models', model)}
                    />
                    <Label htmlFor={`model-${model}`} className="text-sm">
                      {model}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Sort By
              </Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value: string) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="mostLiked">Most Liked</SelectItem>
                  <SelectItem value="mostForked">Most Forked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hearts Range */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Hearts Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minHearts || ''}
                  onChange={(e) => handleFilterChange('minHearts', parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxHearts === 1000 ? '' : filters.maxHearts}
                  onChange={(e) => handleFilterChange('maxHearts', parseInt(e.target.value) || 1000)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Author Search */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Author
              </Label>
              <Input
                placeholder="Search by author..."
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {finalResults.length} prompt{finalResults.length !== 1 ? 's' : ''} found
            </h2>
          </div>

          {finalResults.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalResults.map((prompt) => (
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
                        // Could show a toast notification here
                      }
                    } catch (err) {
                      console.error('Failed to share:', err);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}