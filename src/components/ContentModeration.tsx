import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import { AlertTriangle, CheckCircle, XCircle, Edit, Trash2, UserX, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { Prompt } from '../lib/types';

interface FlaggedPrompt extends Prompt {
  flaggedReason?: string;
  flaggedAt?: string;
}

export function ContentModeration() {
  const { state } = useApp();
  const user = state.user;
  const [flaggedPrompts, setFlaggedPrompts] = useState<FlaggedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; prompt: FlaggedPrompt | null }>({ open: false, prompt: null });
  const [editForm, setEditForm] = useState({ title: '', description: '', content: '' });

  useEffect(() => {
    if (!isAdmin(user)) return;

    loadFlaggedPrompts();
  }, [user]);

  const loadFlaggedPrompts = async () => {
    setLoading(true);
    try {
      // Get prompts with 'unlisted' visibility (flagged for moderation)
      const { data, error } = await adminAPI.getFlaggedPrompts();
      if (error) throw error;
      setFlaggedPrompts(data || []);
    } catch (error) {
      console.error('Error loading flagged prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (promptId: string) => {
    setActionLoading(promptId);
    try {
      const { error } = await adminAPI.approvePrompt(promptId);
      if (error) throw error;
      await loadFlaggedPrompts();
      setSelectedPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    } catch (error) {
      console.error('Error approving prompt:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (promptId: string) => {
    setActionLoading(promptId);
    try {
      const { error } = await adminAPI.removePrompt(promptId);
      if (error) throw error;
      await loadFlaggedPrompts();
      setSelectedPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    } catch (error) {
      console.error('Error removing prompt:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string, reason?: string) => {
    setActionLoading(userId);
    try {
      const { error } = await adminAPI.banUser(userId, reason);
      if (error) throw error;
      await loadFlaggedPrompts();
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (prompt: FlaggedPrompt) => {
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content
    });
    setEditDialog({ open: true, prompt });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.prompt) return;

    setActionLoading(editDialog.prompt.id);
    try {
      const { error } = await adminAPI.updatePrompt(editDialog.prompt.id, editForm);
      if (error) throw error;
      setEditDialog({ open: false, prompt: null });
      await loadFlaggedPrompts();
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    setActionLoading('bulk-approve');
    try {
      const { error } = await adminAPI.bulkApprovePrompts(Array.from(selectedPrompts));
      if (error) throw error;
      setSelectedPrompts(new Set());
      await loadFlaggedPrompts();
    } catch (error) {
      console.error('Error bulk approving prompts:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRemove = async () => {
    setActionLoading('bulk-remove');
    try {
      const { error } = await adminAPI.bulkRemovePrompts(Array.from(selectedPrompts));
      if (error) throw error;
      setSelectedPrompts(new Set());
      await loadFlaggedPrompts();
    } catch (error) {
      console.error('Error bulk removing prompts:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelectPrompt = (promptId: string) => {
    setSelectedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPrompts.size === flaggedPrompts.length) {
      setSelectedPrompts(new Set());
    } else {
      setSelectedPrompts(new Set(flaggedPrompts.map(p => p.id)));
    }
  };

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground">Review and moderate flagged prompts</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {flaggedPrompts.length} flagged prompts
          </Badge>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPrompts.size > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">{selectedPrompts.size} prompts selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={actionLoading === 'bulk-approve'}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Selected
                </Button>
                <Button
                  onClick={handleBulkRemove}
                  disabled={actionLoading === 'bulk-remove'}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Remove Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts List */}
      <div className="space-y-4">
        {flaggedPrompts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No flagged prompts require moderation at this time.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header with select all */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Checkbox
                checked={selectedPrompts.size === flaggedPrompts.length && flaggedPrompts.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="font-medium">Select All</span>
            </div>

            {flaggedPrompts.map((prompt) => (
              <Card key={prompt.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedPrompts.has(prompt.id)}
                      onCheckedChange={() => toggleSelectPrompt(prompt.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg truncate">{prompt.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {prompt.author.username} • {new Date(prompt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Unlisted
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {prompt.description}
                      </p>

                      <div className="bg-muted p-3 rounded text-sm font-mono mb-4 max-h-32 overflow-y-auto">
                        {prompt.content.substring(0, 200)}{prompt.content.length > 200 ? '...' : ''}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Badge variant="secondary">{prompt.type}</Badge>
                        <Badge variant="secondary">{prompt.category}</Badge>
                        {prompt.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(prompt.id)}
                        disabled={actionLoading === prompt.id}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prompt)}
                        disabled={actionLoading === prompt.id}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(prompt.id)}
                        disabled={actionLoading === prompt.id}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBanUser(prompt.userId, 'Inappropriate content')}
                      disabled={actionLoading === prompt.userId}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4" />
                      Ban User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, prompt: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Make changes to the prompt content before approving it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, prompt: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={actionLoading === editDialog.prompt?.id}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}