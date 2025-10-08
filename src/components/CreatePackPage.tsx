import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { PromptPack } from '../lib/types';
import { ArrowLeft, Plus, X, Package } from 'lucide-react';

interface CreatePackPageProps {
  onBack: () => void;
  onPackCreated?: (packId: string) => void;
}

const packCategories = [
  'marketing', 'coding', 'creative', 'business', 'data', 'education', 'technical'
];

export function CreatePackPage({ onBack, onPackCreated }: CreatePackPageProps) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter user's own prompts
  const userPrompts = state.prompts.filter(p => p.userId === state.user?.id && p.visibility === 'public');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Pack name is required';
    else if (name.length < 3) newErrors.name = 'Pack name must be at least 3 characters';
    else if (name.length > 60) newErrors.name = 'Pack name must be less than 60 characters';

    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    else if (description.length > 300) newErrors.description = 'Description must be less than 300 characters';

    if (!category) newErrors.category = 'Category is required';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';
    if (selectedPrompts.length < 3) newErrors.prompts = 'At least 3 prompts are required for a pack';
    if (isPremium && (!price || isNaN(Number(price)) || Number(price) <= 0)) {
      newErrors.price = 'Valid price is required for premium packs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePack = () => {
    if (!validateForm() || !state.user) return;

    const newPack: PromptPack = {
      id: `pack-${Date.now()}`,
      name,
      description,
      category,
      promptIds: selectedPrompts,
      isPremium,
      price: isPremium ? Number(price) : undefined,
      createdBy: state.user.id,
      isOfficial: false, // User-created packs are not official
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_PACK', payload: newPack });

    if (onPackCreated) {
      onPackCreated(newPack.id);
    } else {
      onBack();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const togglePrompt = (promptId: string) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter(id => id !== promptId));
    } else {
      setSelectedPrompts([...selectedPrompts, promptId]);
    }
  };

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Sign in required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to create prompt packs.</p>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl">Create Prompt Pack</h1>
          <p className="text-muted-foreground">
            Bundle your prompts into a curated collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pack Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Marketing Essentials, Developer Toolkit..."
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this pack contains and who it's for..."
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  {errors.description && (
                    <span className="text-destructive">{errors.description}</span>
                  )}
                  <span className={description.length > 270 ? 'text-warning' : ''}>
                    {description.length}/300
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {packCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} disabled={tags.length >= 5}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              {tags.length >= 5 && (
                <p className="text-sm text-muted-foreground">Maximum 5 tags</p>
              )}
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="premium"
                  checked={isPremium}
                  onCheckedChange={(checked: boolean) => setIsPremium(checked)}
                />
                <Label htmlFor="premium">Make this a premium pack</Label>
              </div>
              
              {isPremium && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className={errors.price ? 'border-destructive' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Prompt Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Prompts ({selectedPrompts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userPrompts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You need to create public prompts first before creating a pack.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userPrompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={prompt.id}
                        checked={selectedPrompts.includes(prompt.id)}
                        onCheckedChange={() => togglePrompt(prompt.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={prompt.id} 
                          className="cursor-pointer block text-sm font-medium leading-tight"
                        >
                          {prompt.title}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {prompt.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.prompts && (
                <p className="text-sm text-destructive mt-2">{errors.prompts}</p>
              )}
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="mt-6">
            <Button 
              onClick={handleCreatePack} 
              className="w-full"
              disabled={userPrompts.length === 0}
            >
              Create Pack
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}