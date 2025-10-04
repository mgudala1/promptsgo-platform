import { useState, useMemo } from 'react';
import { Prompt, SearchFilters } from '../lib/types';

export function useSearch(prompts: Prompt[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    models: [],
    tags: [],
    categories: [],
    sortBy: 'trending'
  });

  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Text search
    if (filters.query.trim()) {
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

    // Date range filters
    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter(prompt => {
        const createdAt = new Date(prompt.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(prompt => 
        prompt.author.username === filters.author ||
        prompt.author.name.toLowerCase().includes(filters.author.toLowerCase())
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
  }, [prompts, filters]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      types: [],
      models: [],
      tags: [],
      categories: [],
      sortBy: 'trending'
    });
  };

  return {
    filters,
    filteredPrompts,
    updateFilters,
    clearFilters,
    resultsCount: filteredPrompts.length
  };
}