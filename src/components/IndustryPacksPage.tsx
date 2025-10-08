import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Lock, Users, Plus, Crown } from 'lucide-react';
import { PromptPack } from '../lib/types';

interface IndustryPacksPageProps {
  onBack: () => void;
  onPackClick: (packId: string) => void;
  onCreatePackClick?: () => void;
}

export function IndustryPacksPage({ onBack, onPackClick, onCreatePackClick }: IndustryPacksPageProps) {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Packs' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'coding', name: 'Coding' },
    { id: 'creative', name: 'Creative' },
    { id: 'business', name: 'Business' },
    { id: 'data', name: 'Data Analysis' },
    { id: 'education', name: 'Education' },
    { id: 'technical', name: 'Technical' }
  ];

  // Use packs from state (which includes official packs)
  // state.promptPacks now contains all packs including official ones
  const allPacks = state.promptPacks;

  const filteredPacks = allPacks.filter(pack => {
    // Filter by category
    if (selectedCategory !== 'all' && pack.category !== selectedCategory) return false;

    // Filter by search query from global search filters
    if (state.searchFilters.query && typeof state.searchFilters.query === 'string' && state.searchFilters.query.trim()) {
      const query = state.searchFilters.query.toLowerCase();
      return pack.name.toLowerCase().includes(query) ||
             pack.description.toLowerCase().includes(query) ||
             pack.tags.some(tag => tag.toLowerCase().includes(query));
    }

    return true;
  });

  const handleAddPack = (pack: PromptPack) => {
    if (!state.user) return;

    // Check if pack already added
    const alreadyAdded = state.userPackLibrary?.packs?.some(p => p.packId === pack.id);
    if (alreadyAdded) {
      alert(`"${pack.name}" is already in your collection!`);
      return;
    }

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

    // Add pack prompts to user's saved prompts
    pack.promptIds.forEach(promptId => {
      dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
    });

    alert(`Added "${pack.name}" pack to your collection!`);
  };

  const handlePurchasePack = (pack: PromptPack) => {
    // This would integrate with payment system
    alert(`Purchase ${pack.name} for $${pack.price}. Payment integration coming soon!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="mb-2">Prompt Packs</h1>
              <p className="text-muted-foreground">
                Curated collections of professional prompts organized by industry, professionals and use case
              </p>
            </div>
          </div>
          
          {/* Create Pack Button for logged-in users */}
          {state.user && onCreatePackClick && (
            <Button onClick={onCreatePackClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Pack
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map(pack => (
            <Card key={pack.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {pack.name}
                      {pack.isOfficial && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                      {pack.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {pack.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {pack.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {pack.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pack.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {pack.promptIds.length} prompts
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPackClick(pack.id)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    
                    {pack.isPremium ? (
                      <Button
                        size="sm"
                        onClick={() => handlePurchasePack(pack)}
                        className="flex-1"
                      >
                        Buy ${pack.price}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddPack(pack)}
                        className="flex-1"
                      >
                        Add Pack
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPacks.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">No packs found</h3>
            <p className="text-muted-foreground">
              No prompt packs available in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}