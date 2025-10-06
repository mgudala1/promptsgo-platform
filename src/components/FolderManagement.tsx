import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Folder, FolderPlus, Edit, Trash2, Lock, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface Collection {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  prompt_count: number;
  created_at: string;
  updated_at: string;
}

interface FolderManagementProps {
  onFolderSelect?: (folderId: string) => void;
  selectedFolderId?: string;
}

export function FolderManagement({ onFolderSelect, selectedFolderId }: FolderManagementProps) {
  const { state } = useApp();
  const [folders, setFolders] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'public' | 'private' | 'unlisted'
  });

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    if (!state.user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          saves(count)
        `)
        .eq('user_id', state.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to include prompt count
      const foldersWithCount = data?.map(folder => ({
        ...folder,
        prompt_count: folder.saves?.[0]?.count || 0
      })) || [];

      setFolders(foldersWithCount);
    } catch (error) {
      console.error('Failed to load folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!state.user || !formData.name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: state.user.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          visibility: formData.visibility
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [data, ...prev]);
      setFormData({ name: '', description: '', visibility: 'private' });
      setShowCreateDialog(false);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !formData.name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          visibility: formData.visibility
        })
        .eq('id', editingFolder.id)
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => prev.map(folder =>
        folder.id === editingFolder.id ? data : folder
      ));
      setEditingFolder(null);
      setFormData({ name: '', description: '', visibility: 'private' });
      toast.success('Folder updated successfully');
    } catch (error) {
      console.error('Failed to update folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All prompts in this folder will be removed from it, but the prompts themselves will not be deleted.')) {
      return;
    }

    try {
      // First, remove all saves associated with this folder
      await supabase
        .from('saves')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      // Then delete the folder
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const startEdit = (folder: Collection) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description,
      visibility: folder.visibility
    });
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'unlisted':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'unlisted':
        return 'Unlisted';
      default:
        return 'Private';
    }
  };

  if (!state.user) {
    return (
      <Card className="p-8 text-center">
        <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Sign in to manage folders</h3>
        <p className="text-muted-foreground">Create and organize your prompts into folders</p>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">My Folders</h2>
              <p className="text-muted-foreground">
                Organize your prompts into folders for better management
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter folder name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="folder-description">Description</Label>
                    <Textarea
                      id="folder-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this folder contains..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="folder-visibility">Visibility</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value: 'public' | 'private' | 'unlisted') =>
                        setFormData(prev => ({ ...prev, visibility: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Private - Only you can see
                          </div>
                        </SelectItem>
                        <SelectItem value="unlisted">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Unlisted - Anyone with link can see
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Public - Visible to everyone
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateFolder} className="flex-1">
                      Create Folder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setFormData({ name: '', description: '', visibility: 'private' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Dialog */}
          <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-folder-name">Folder Name</Label>
                  <Input
                    id="edit-folder-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter folder name..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-folder-description">Description</Label>
                  <Textarea
                    id="edit-folder-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this folder contains..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-folder-visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: 'public' | 'private' | 'unlisted') =>
                      setFormData(prev => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private - Only you can see
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Unlisted - Anyone with link can see
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public - Visible to everyone
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateFolder} className="flex-1">
                    Update Folder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingFolder(null);
                      setFormData({ name: '', description: '', visibility: 'private' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </Card>
              ))
            ) : folders.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No folders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first folder to start organizing your prompts
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Your First Folder
                  </Button>
                </Card>
              </div>
            ) : (
              folders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedFolderId === folder.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onFolderSelect?.(folder.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Folder className="w-8 h-8 text-blue-500" />
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(folder.visibility)}
                        <Badge variant="outline" className="text-xs">
                          {getVisibilityLabel(folder.visibility)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          startEdit(folder);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">{folder.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {folder.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{folder.prompt_count} prompts</span>
                      <span>{new Date(folder.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}