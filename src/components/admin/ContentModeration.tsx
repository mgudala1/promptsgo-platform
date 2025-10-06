import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isAdmin } from '../../lib/admin';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Search, Eye, CheckCircle, XCircle, Flag, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  visibility: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  hearts_count: number;
  comments_count: number;
  is_flagged: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
}

export function ContentModeration() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access content moderation.
          </p>
        </Card>
      </div>
    );
  }

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const moderatePrompt = async (promptId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          moderation_status: status,
          moderation_note: note,
          moderated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      if (error) throw error;

      setPrompts(prompts.map(prompt =>
        prompt.id === promptId
          ? { ...prompt, moderation_status: status }
          : prompt
      ));

      toast.success(`Prompt ${status} successfully`);
      setModerationNote('');
    } catch (error) {
      console.error('Failed to moderate prompt:', error);
      toast.error('Failed to update prompt status');
    }
  };

  const toggleFlag = async (promptId: string, currentlyFlagged: boolean) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_flagged: !currentlyFlagged })
        .eq('id', promptId);

      if (error) throw error;

      setPrompts(prompts.map(prompt =>
        prompt.id === promptId
          ? { ...prompt, is_flagged: !currentlyFlagged }
          : prompt
      ));

      toast.success(`Prompt ${currentlyFlagged ? 'unflagged' : 'flagged'}`);
    } catch (error) {
      console.error('Failed to toggle flag:', error);
      toast.error('Failed to update flag status');
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'pending' && prompt.moderation_status === 'pending') ||
                         (filterStatus === 'approved' && prompt.moderation_status === 'approved') ||
                         (filterStatus === 'rejected' && prompt.moderation_status === 'rejected') ||
                         (filterStatus === 'flagged' && prompt.is_flagged);

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (prompt: Prompt) => {
    if (prompt.is_flagged) {
      return <Badge variant="destructive">Flagged</Badge>;
    }
    switch (prompt.moderation_status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Content Moderation</h2>
        <p className="text-muted-foreground mb-6">
          Review, approve, or reject user-submitted prompts. Flag inappropriate content and maintain quality standards.
        </p>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prompts</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompts Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Prompt</TableHead>
                  <TableHead className="min-w-[150px]">Author</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[80px]">Hearts</TableHead>
                  <TableHead className="min-w-[120px]">Created</TableHead>
                  <TableHead className="min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading prompts...
                  </TableCell>
                </TableRow>
              ) : filteredPrompts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No prompts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{prompt.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {prompt.content.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {prompt.profiles?.full_name || 'Unknown'}
                        <br />
                        <span className="text-muted-foreground">{prompt.profiles?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(prompt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prompt.category}</Badge>
                    </TableCell>
                    <TableCell>{prompt.hearts_count || 0}</TableCell>
                    <TableCell>{new Date(prompt.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setSelectedPrompt(prompt)}
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Prompt Details</DialogTitle>
                            </DialogHeader>
                            {selectedPrompt && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                                  <p className="font-medium">{selectedPrompt.title}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Content</label>
                                  <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap text-sm">{selectedPrompt.content}</pre>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Author</label>
                                    <p className="font-medium">{selectedPrompt.profiles?.full_name}</p>
                                    <p className="text-sm text-muted-foreground break-all">{selectedPrompt.profiles?.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                                    <p className="font-medium">{selectedPrompt.category}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Stats</label>
                                  <p className="text-sm">{selectedPrompt.hearts_count || 0} hearts, {selectedPrompt.comments_count || 0} comments</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant={prompt.is_flagged ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => toggleFlag(prompt.id, prompt.is_flagged)}
                        >
                          <Flag className="w-3 h-3" />
                          <span className="hidden sm:inline">Flag</span>
                        </Button>

                        {prompt.moderation_status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => moderatePrompt(prompt.id, 'approved')}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Approve</span>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => setSelectedPrompt(prompt)}
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span className="hidden sm:inline">Reject</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Reject Prompt</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm">Are you sure you want to reject this prompt? Please provide a reason:</p>
                                  <Textarea
                                    placeholder="Reason for rejection..."
                                    value={moderationNote}
                                    onChange={(e) => setModerationNote(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => moderatePrompt(selectedPrompt!.id, 'rejected', moderationNote)}
                                    >
                                      Reject
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setModerationNote('')}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredPrompts.length} of {prompts.length} prompts
        </div>
      </Card>
    </div>
  );
}