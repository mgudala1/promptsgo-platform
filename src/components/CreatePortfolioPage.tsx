import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Eye, Lock, Plus, X, Package, User, Heart } from 'lucide-react';
import { Portfolio, Prompt } from '../lib/types';

interface CreatePortfolioPageProps {
  onBack: () => void;
  onPortfolioCreated?: () => void;
}

export function CreatePortfolioPage({ onBack, onPortfolioCreated }: CreatePortfolioPageProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subdomain: '',
    isPasswordProtected: false,
    password: ''
  });
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get user's prompts
  const userPrompts = state.prompts.filter(p => p.userId === state.user?.id);
  
  // Get prompts from user's pack library
  const packPrompts = state.userPackLibrary?.packs.flatMap(pack => 
    pack.packId ? state.prompts.filter(p => 
      state.promptPacks.find(pp => pp.id === pack.packId)?.promptIds.includes(p.id)
    ).map(p => ({ ...p, packSource: pack.packName })) : []
  ) || [];
  
  // Get saved prompts (from other users)
  const savedPromptIds = state.saves.filter(s => s.userId === state.user?.id).map(s => s.promptId);
  const savedPrompts = state.prompts.filter(p => 
    savedPromptIds.includes(p.id) && p.userId !== state.user?.id
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    }

    if (selectedPrompts.length === 0) {
      newErrors.prompts = 'Please select at least one prompt';
    }

    if (formData.isPasswordProtected && !formData.password.trim()) {
      newErrors.password = 'Password is required when protection is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubdomainChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, subdomain: cleaned }));
  };

  const handlePromptToggle = (promptId: string) => {
    setSelectedPrompts(prev => 
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSubmit = () => {
    if (!validateForm() || !state.user) return;

    // Create enhanced prompt tracking
    const portfolioPrompts = selectedPrompts.map((promptId, index) => {
      const userPrompt = userPrompts.find(p => p.id === promptId);
      const packPrompt = packPrompts.find(p => p.id === promptId);
      const savedPrompt = savedPrompts.find(p => p.id === promptId);

      let source: 'original' | 'pack' | 'customized' = 'original';
      let packId: string | undefined;
      let packName: string | undefined;

      if (packPrompt) {
        source = 'pack';
        const pack = state.userPackLibrary?.packs.find(p => 
          state.promptPacks.find(pp => pp.id === p.packId)?.promptIds.includes(promptId)
        );
        packId = pack?.packId;
        packName = pack?.packName;
      } else if (savedPrompt) {
        source = 'customized';
      }

      return {
        promptId,
        source,
        packId,
        packName,
        customized: false,
        addedAt: new Date().toISOString(),
        order: index
      };
    });

    const portfolio: Portfolio = {
      id: `portfolio-${Date.now()}`,
      userId: state.user.id,
      name: formData.name,
      description: formData.description,
      subdomain: formData.subdomain,
      promptIds: selectedPrompts,
      prompts: portfolioPrompts,
      isPasswordProtected: formData.isPasswordProtected,
      password: formData.isPasswordProtected ? formData.password : undefined,
      isPublished: false,
      showPackAttribution: true, // Default to showing attribution
      viewCount: 0,
      clientAccessCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_PORTFOLIO', payload: portfolio });
    
    if (onPortfolioCreated) {
      onPortfolioCreated();
    } else {
      onBack();
    }
  };

  const previewUrl = state.user?.subscriptionPlan === 'pro' 
    ? `${formData.subdomain || 'your-portfolio'}.promptsgo.com`
    : `promptsgo.com/portfolio/${formData.subdomain || 'your-portfolio'}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="mb-2">Create Portfolio</h1>
            <p className="text-muted-foreground">
              Build a professional portfolio to showcase your prompts to clients
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Details</CardTitle>
                <CardDescription>
                  Basic information about your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2">Portfolio Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Marketing Prompt Collection"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your portfolio"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block mb-2">Subdomain</label>
                  <Input
                    value={formData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="your-name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your portfolio will be available at: {previewUrl}
                  </p>
                  {errors.subdomain && <p className="text-destructive text-sm mt-1">{errors.subdomain}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Protect your portfolio with a password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="password-protection"
                    checked={formData.isPasswordProtected}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPasswordProtected: checked as boolean }))
                    }
                  />
                  <label htmlFor="password-protection" className="text-sm">
                    Password protect this portfolio
                  </label>
                </div>

                {formData.isPasswordProtected && (
                  <div>
                    <label className="block mb-2">Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prompt Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select Prompts</CardTitle>
                <CardDescription>
                  Choose which prompts to include in your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userPrompts.length > 0 ? (
                    userPrompts.map(prompt => (
                      <div key={prompt.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={prompt.id}
                          checked={selectedPrompts.includes(prompt.id)}
                          onCheckedChange={() => handlePromptToggle(prompt.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={prompt.id} className="block text-sm font-medium cursor-pointer">
                            {prompt.title}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {prompt.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{prompt.hearts} hearts</span>
                            <span>•</span>
                            <span>{prompt.saveCount} saves</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't created any prompts yet.</p>
                      <p className="text-sm mt-1">Create some prompts first to add them to your portfolio.</p>
                    </div>
                  )}
                </div>
                {errors.prompts && <p className="text-destructive text-sm mt-2">{errors.prompts}</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Portfolio will be created as a draft. You can publish it later.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Portfolio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}