import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { canAccessListsAndFolders } from '../lib/limits';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Folder, List, Plus, Edit, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface List {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  promptIds: string[];
  createdAt: string;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  listIds: string[];
  createdAt: string;
}

export function ListsAndFoldersPage() {
  const { state } = useApp();
  const user = state.user;

  const accessCheck = canAccessListsAndFolders(user);
  const [lists, setLists] = useState<List[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeTab, setActiveTab] = useState<'lists' | 'folders'>('lists');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<List | Folder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    if (accessCheck.allowed) {
      loadListsAndFolders();
    }
  }, [accessCheck.allowed]);

  const loadListsAndFolders = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, using mock data
      setLists([
        {
          id: '1',
          name: 'My Favorite Prompts',
          description: 'A collection of my most used prompts',
          isPublic: false,
          promptIds: ['1', '2', '3'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Business Templates',
          description: 'Professional business communication prompts',
          isPublic: true,
          promptIds: ['4', '5'],
          createdAt: new Date().toISOString()
        }
      ]);

      setFolders([
        {
          id: '1',
          name: 'Work Projects',
          description: 'All work-related prompt collections',
          listIds: ['1', '2'],
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load lists and folders:', error);
      toast.error('Failed to load your lists and folders');
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const newItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        promptIds: [] as string[],
        listIds: [] as string[],
        createdAt: new Date().toISOString()
      };

      if (activeTab === 'lists') {
        setLists([...lists, newItem as List]);
      } else {
        setFolders([...folders, newItem as Folder]);
      }

      setFormData({ name: '', description: '', isPublic: false });
      setIsCreateDialogOpen(false);
      toast.success(`${activeTab === 'lists' ? 'List' : 'Folder'} created successfully`);
    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleEdit = async () => {
    if (!editingItem || !formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const updatedItem = {
        ...editingItem,
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic
      };

      if (activeTab === 'lists') {
        setLists(lists.map(list => list.id === editingItem.id ? updatedItem as List : list));
      } else {
        setFolders(folders.map(folder => folder.id === editingItem.id ? updatedItem as Folder : folder));
      }

      setEditingItem(null);
      setFormData({ name: '', description: '', isPublic: false });
      toast.success(`${activeTab === 'lists' ? 'List' : 'Folder'} updated successfully`);
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      if (activeTab === 'lists') {
        setLists(lists.filter(list => list.id !== itemId));
      } else {
        setFolders(folders.filter(folder => folder.id !== itemId));
      }
      toast.success(`${activeTab === 'lists' ? 'List' : 'Folder'} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const openEditDialog = (item: List | Folder) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      isPublic: 'isPublic' in item ? item.isPublic : false
    });
  };

  if (!accessCheck.allowed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-bold mb-2">Pro Feature</h2>
          <p className="text-muted-foreground mb-6">
            {accessCheck.message}
          </p>
          <Button>Upgrade to Pro</Button>
        </Card>
      </div>
    );
  }

  const currentItems = activeTab === 'lists' ? lists : folders;
  const itemType = activeTab === 'lists' ? 'list' : 'folder';
  const ItemIcon = activeTab === 'lists' ? List : Folder;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Lists & Folders</h1>
        <p className="text-muted-foreground">
          Organize your saved prompts into custom lists and folders for better management.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'lists' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('lists')}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Lists ({lists.length})
        </Button>
        <Button
          variant={activeTab === 'folders' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('folders')}
          className="flex items-center gap-2"
        >
          <Folder className="w-4 h-4" />
          Folders ({folders.length})
        </Button>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold capitalize">{itemType}s</h2>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'lists'
              ? 'Create custom lists to organize your saved prompts'
              : 'Group your lists into folders for better organization'
            }
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create {itemType}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New {itemType}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${itemType} name`}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={`Describe this ${itemType}`}
                />
              </div>
              {activeTab === 'lists' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <Label htmlFor="isPublic">Make this list public</Label>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate} className="flex-1">
                  Create {itemType}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({ name: '', description: '', isPublic: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ItemIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'lists'
                      ? `${(item as List).promptIds?.length || 0} prompts`
                      : `${(item as Folder).listIds?.length || 0} lists`
                    }
                  </p>
                </div>
              </div>
              {'isPublic' in item && item.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {item.description || `No description provided`}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View {itemType}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {currentItems.length === 0 && (
        <Card className="p-12 text-center">
          <ItemIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No {itemType}s yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first {itemType} to start organizing your prompts.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First {itemType}
          </Button>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open: boolean) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {itemType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Enter ${itemType} name`}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={`Describe this ${itemType}`}
              />
            </div>
            {activeTab === 'lists' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <Label htmlFor="edit-isPublic">Make this list public</Label>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', description: '', isPublic: false });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}