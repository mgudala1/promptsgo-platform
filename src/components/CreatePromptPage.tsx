import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../contexts/AppContext';
import { Prompt, PromptImage, Draft } from '../lib/types';
import { ImageUpload } from './ImageUpload';
import { categories, models } from '../lib/data';
import { prompts, storage } from '../lib/api';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Eye, FileText, Image, Code, Bot, Link2, Plus, X, Settings, PenTool, Camera, Hash, Cog, Share2 } from 'lucide-react';

interface CreatePromptPageProps {
  onBack: () => void;
  editingPrompt?: Prompt;
  onPublish?: (isNewPrompt: boolean) => void;
}

const promptTypes = [
  { value: 'text', label: 'Text Prompt', icon: FileText, description: 'General text generation and completion' },
  { value: 'image', label: 'Image Prompt', icon: Image, description: 'Image generation and visual content' },
  { value: 'code', label: 'Code Prompt', icon: Code, description: 'Code generation and programming assistance' },
  { value: 'agent', label: 'AI Agent', icon: Bot, description: 'Complex multi-step AI agent workflows' },
  { value: 'chain', label: 'Prompt Chain', icon: Link2, description: 'Sequential prompt workflows' }
];


const visibilityOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can see and use this prompt' },
  { value: 'unlisted', label: 'Unlisted', description: 'Only accessible via direct link' },
  { value: 'private', label: 'Private', description: 'Only you can see this prompt' }
];

export function CreatePromptPage({ onBack, editingPrompt, onPublish }: CreatePromptPageProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('editor');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Form state
  const [title, setTitle] = useState(editingPrompt?.title || '');
  const [description, setDescription] = useState(editingPrompt?.description || '');
  const [content, setContent] = useState(editingPrompt?.content || '');
  const [type, setType] = useState<'text' | 'image' | 'code' | 'agent' | 'chain'>(editingPrompt?.type || 'text');
  const [category, setCategory] = useState(editingPrompt?.category || '');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(editingPrompt?.visibility || 'public');
  const [selectedModels, setSelectedModels] = useState<string[]>(editingPrompt?.modelCompatibility || []);
  const [tags, setTags] = useState<string[]>(editingPrompt?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<PromptImage[]>(editingPrompt?.images || []);

  // Template state
  const [template, setTemplate] = useState(editingPrompt?.template || '');

  // Meta description state
  const [metaDescription, setMetaDescription] = useState('');

  // Custom model state
  const [customModel, setCustomModel] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track changes for auto-save status
  useEffect(() => {
    if (lastSaved) {
      setSaveStatus('unsaved');
    }
  }, [title, description, content, type, category, visibility, selectedModels, tags, images, template]);

  // Auto-save functionality
  useEffect(() => {
    if (!state.user || (!title && !content) || saveStatus === 'saved') return;

    const saveTimer = setTimeout(() => {
      saveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(saveTimer);
  }, [title, description, content, type, category, visibility, selectedModels, tags, images, template, saveStatus]);



  const saveDraft = async () => {
    if (!state.user) return;

    try {
      setSaveStatus('saving');

      const draft: Draft = {
        id: editingPrompt?.id || `draft-${Date.now()}`,
        userId: state.user.id,
        title,
        description,
        content,
        type,
        metadata: {
          category,
          visibility,
          selectedModels,
          tags,
          images,
          template,
          metaDescription
        },
        lastSaved: new Date().toISOString()
      };

      dispatch({ type: 'SAVE_DRAFT', payload: draft });
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('unsaved');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    else if (title.length > 100) newErrors.title = 'Title must be less than 100 characters';

    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    else if (description.length > 500) newErrors.description = 'Description must be less than 500 characters';

    if (!content.trim()) newErrors.content = 'Prompt content is required';
    else if (content.length > 10000) newErrors.content = 'Content must be less than 10,000 characters';

    if (!category) newErrors.category = 'Category is required';
    if (selectedModels.length === 0) newErrors.models = 'At least one model must be selected';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';

    // Images are now optional
    // if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm() || !state.user) return;

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const promptData = {
        user_id: state.user.id,
        title,
        slug,
        description,
        content,
        type,
        model_compatibility: selectedModels,
        tags,
        visibility,
        category,
        version: editingPrompt ? editingPrompt.version : '1.0.0',
        parent_id: editingPrompt?.parentId || null,
        view_count: editingPrompt?.viewCount || 0,
        hearts: editingPrompt?.hearts || 0,
        save_count: editingPrompt?.saveCount || 0,
        fork_count: editingPrompt?.forkCount || 0,
        comment_count: editingPrompt?.commentCount || 0,
        created_at: editingPrompt?.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        template: template || null
      };

      const isNewPrompt = !editingPrompt;

      // Try Supabase first, fallback to local state if it fails
      let success = false;
      let promptId = editingPrompt?.id;

      try {
        if (editingPrompt) {
          // Update existing prompt
          const { data: updatedPrompt, error } = await prompts.update(editingPrompt.id, promptData);

          if (!error && updatedPrompt) {
            promptId = updatedPrompt.id;
            success = true;
          } else {
            console.error('❌ Prompt update failed:', error);
          }
        } else {
          // Create new prompt
          const { data: newPrompt, error } = await prompts.create(promptData);

          if (!error && newPrompt) {
            promptId = newPrompt.id;
            success = true;
          } else {
            console.error('❌ Prompt creation failed:', error);
          }
        }

        // Handle images if we have a prompt ID and Supabase worked
        if (success && promptId) {
          await handleImageUpdates(promptId);
        }
      } catch (apiError) {
        console.warn('Supabase API not available, using local state:', apiError);
      }

      // Fallback to local state management if Supabase fails
      if (!success) {
        const newPrompt: Prompt = {
          id: editingPrompt?.id || `prompt-${Date.now()}`,
          userId: state.user.id,
          title,
          slug,
          description,
          content,
          type,
          modelCompatibility: selectedModels,
          tags,
          visibility,
          attachments: [],
          images,
          category,
          version: editingPrompt ? editingPrompt.version : '1.0.0',
          parentId: editingPrompt?.parentId,
          viewCount: editingPrompt?.viewCount || 0,
          hearts: editingPrompt?.hearts || 0,
          saveCount: editingPrompt?.saveCount || 0,
          forkCount: editingPrompt?.forkCount || 0,
          commentCount: editingPrompt?.commentCount || 0,
          createdAt: editingPrompt?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: state.user,
          isHearted: false,
          isSaved: false,
          isForked: false,
          template: template || undefined
        };

        if (editingPrompt) {
          dispatch({ type: 'UPDATE_PROMPT', payload: { id: editingPrompt.id, updates: newPrompt } });
        } else {
          dispatch({ type: 'ADD_PROMPT', payload: newPrompt });
        }
      }

      // Delete draft if it exists
      const draftId = editingPrompt?.id || `draft-${Date.now()}`;
      dispatch({ type: 'DELETE_DRAFT', payload: draftId });

      if (onPublish) {
        onPublish(isNewPrompt);
      } else {
        onBack();
      }
    } catch (err) {
      console.error('Error publishing prompt:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  // Handle image updates for Supabase
  const handleImageUpdates = async (promptId: string) => {
    try {
      // Get existing images for this prompt
      const { data: existingImages, error: fetchError } = await supabase
        .from('prompt_images')
        .select('*')
        .eq('prompt_id', promptId);

      if (fetchError) {
        console.error('❌ Error fetching existing images:', fetchError);
        return;
      }

      const existingImageUrls = new Set(existingImages?.map((img: any) => img.url) || []);

      // Images to add (new images not in existing)
      const imagesToAdd = images.filter(img => !existingImageUrls.has(img.url));

      // Images to update (existing images with changes) - match by URL
      const imagesToUpdate = images.filter(img => existingImageUrls.has(img.url));

      // Images to remove (existing images not in current images)
      const imagesToRemove = existingImages?.filter((img: any) => !images.some(currImg => currImg.url === img.url)) || [];

      // Add new images
      for (const image of imagesToAdd) {
        const { error } = await supabase
          .from('prompt_images')
          .insert({
            prompt_id: promptId,
            url: image.url,
            alt_text: image.altText,
            is_primary: image.isPrimary,
            size: image.size,
            mime_type: image.mimeType,
            width: image.width,
            height: image.height,
            caption: image.caption
          })
          .select();

        if (error) {
          console.error('❌ Error adding image:', error);
        }
      }

      // Update existing images
      for (const image of imagesToUpdate) {
        const { error } = await supabase
          .from('prompt_images')
          .update({
            alt_text: image.altText,
            is_primary: image.isPrimary,
            caption: image.caption
          })
          .eq('url', image.url)
          .eq('prompt_id', promptId); // Ensure we only update images for this prompt

        if (error) {
          console.error('❌ Error updating image:', error);
        }
      }

      // Remove deleted images
      for (const image of imagesToRemove) {
        // Delete from database
        const { error: dbError } = await supabase
          .from('prompt_images')
          .delete()
          .eq('id', image.id);

        if (dbError) {
          console.error('Error removing image from database:', dbError);
        }

        // Try to delete from storage (optional, as storage cleanup can be done separately)
        try {
          const path = image.url.split('/').pop();
          if (path) {
            await storage.deleteImage('prompt-images', [path]);
          }
        } catch (storageError) {
          console.warn('Could not delete image from storage:', storageError);
        }
      }
    } catch (error) {
      console.error('❌ Error handling image updates:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addModel = () => {
    if (customModel.trim() && !selectedModels.includes(customModel.trim()) && selectedModels.length < 10) {
      setSelectedModels([...selectedModels, customModel.trim()]);
      setCustomModel('');
    }
  };

  const removeModel = (modelToRemove: string) => {
    setSelectedModels(selectedModels.filter(model => model !== modelToRemove));
  };




  const wordCount = content.trim().split(/\s+/).length;
  const charCount = content.length;

  const getSaveStatusText = () => {
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'unsaved') return 'Unsaved changes';
    if (lastSaved) {
      const secondsAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (secondsAgo < 60) return `Saved ${secondsAgo}s ago`;
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `Saved ${minutesAgo}m ago`;
      const hoursAgo = Math.floor(minutesAgo / 60);
      return `Saved ${hoursAgo}h ago`;
    }
    return '';
  };

  const handleShare = async () => {
    const draftId = editingPrompt?.id || `draft-${Date.now()}`;
    const shareUrl = `${window.location.origin}/drafts/${draftId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Draft Prompt',
          text: description || 'Check out this prompt draft',
          url: shareUrl
        });
      } catch (err) {
        // User cancelled sharing, fallback to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl">
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </h1>
            <p className="text-muted-foreground">
              {editingPrompt ? 'Update your existing prompt' : 'Share your expertise with the community'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm ${saveStatus === 'unsaved' ? 'text-orange-600' : saveStatus === 'saving' ? 'text-blue-600' : 'text-muted-foreground'}`}>
            {getSaveStatusText()}
          </span>
          <Button variant="outline" onClick={saveDraft} disabled={saveStatus === 'saving'}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handlePublish}>
            {editingPrompt ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title..."
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this prompt does and how to use it..."
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      {errors.description && (
                        <span className="text-destructive">{errors.description}</span>
                      )}
                      <span className={description.length > 450 ? 'text-warning' : ''}>
                        {description.length}/500
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Prompt Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Prompt Content *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your prompt here. Use {{variable}} syntax for dynamic content..."
                      rows={12}
                      className={`font-mono ${errors.content ? 'border-destructive' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex gap-4">
                        <span>{wordCount} words</span>
                        <span>{charCount}/10,000 characters</span>
                      </div>
                      {errors.content && (
                        <span className="text-destructive">{errors.content}</span>
                      )}
                    </div>
                  </div>


                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Images
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add images to showcase your prompt. Recommended size: 1200x630px (for social sharing).
                  </p>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={5}
                    allowPrimarySelection={true}
                  />
                </CardContent>
              </Card>

              {/* Template Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Template Placeholder (Optional)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add a template or pattern for this prompt to help yourself or others generate new versions quickly.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template Text</Label>
                    <Textarea
                      id="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      placeholder="e.g., A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format."
                      rows={6}
                    />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl mb-2">{title || 'Untitled Prompt'}</h3>
                      <p className="text-muted-foreground">{description || 'No description provided'}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {content || 'No content provided'}
                      </pre>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Type & Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Type & Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prompt Type *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {promptTypes.map((promptType) => {
                    const Icon = promptType.icon;
                    return (
                      <div
                        key={promptType.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          type === promptType.value 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-muted-foreground'
                        }`}
                        onClick={() => setType(promptType.value as any)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">{promptType.label}</div>
                            <div className="text-xs text-muted-foreground">{promptType.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </div>
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

          {/* Model Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Model Compatibility
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select AI models that work well with this prompt. Start typing to see suggestions.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Type model name (e.g., GPT-4o, Claude-3.5-Sonnet)..."
                  onKeyPress={(e) => e.key === 'Enter' && addModel()}
                  className="text-sm"
                />
                <Button type="button" onClick={addModel} disabled={selectedModels.length >= 10}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Model Suggestions */}
              {customModel.trim() && (
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  <div className="text-xs text-muted-foreground mb-1">Suggestions:</div>
                  {models
                    .filter(model =>
                      model.name.toLowerCase().includes(customModel.toLowerCase()) &&
                      !selectedModels.includes(model.name)
                    )
                    .slice(0, 5)
                    .map((model) => (
                      <div
                        key={model.id}
                        className="px-2 py-1 text-sm hover:bg-muted cursor-pointer rounded"
                        onClick={() => {
                          setSelectedModels([...selectedModels, model.name]);
                          setCustomModel('');
                        }}
                      >
                        {model.name}
                      </div>
                    ))}
                  {models.filter(model =>
                    model.name.toLowerCase().includes(customModel.toLowerCase()) &&
                    !selectedModels.includes(model.name)
                  ).length === 0 && (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No suggestions found. Press Enter to add custom model.
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {selectedModels.map((model) => (
                  <Badge key={model} variant="secondary" className="flex items-center gap-1">
                    {model}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeModel(model)}
                    />
                  </Badge>
                ))}
              </div>

              {selectedModels.length >= 10 && (
                <p className="text-sm text-muted-foreground">Maximum 10 models</p>
              )}

              {errors.models && (
                <p className="text-sm text-destructive">{errors.models}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} disabled={tags.length >= 10}>
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
              {tags.length >= 10 && (
                <p className="text-sm text-muted-foreground">Maximum 10 tags</p>
              )}
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5 text-primary" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description (Optional)</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Write a short description to help this prompt appear in search engines and within PromptsGo search."
                  rows={2}
                  className="text-sm"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Helps with discoverability</span>
                  <span className={metaDescription.length > 160 ? 'text-orange-600' : ''}>
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Visibility</Label>
                {visibilityOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      visibility === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setVisibility(option.value as any)}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}