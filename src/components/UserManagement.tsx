import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import { Search, Filter, Edit, Ban, UserCheck, UserX, Shield, Crown, User, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  role?: 'general' | 'pro' | 'admin';
  reputation: number;
  created_at: string;
  last_login?: string;
  is_banned?: boolean;
  is_disabled?: boolean;
  ban_reason?: string | null;
  disable_reason?: string | null;
  banned_at?: string | null;
  disabled_at?: string | null;
  website?: string;
  github?: string;
  twitter?: string;
  subscriptions?: {
    status: string;
    plan: string;
  }[];
}

export function UserManagement() {
  const { state } = useApp();
  const user = state.user;
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'disable' | 'enable' | 'unban' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const usersPerPage = 20;

  useEffect(() => {
    if (!isAdmin(user)) return;
    loadUsers();
  }, [user, searchQuery, roleFilter, statusFilter, currentPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters: any = {
        limit: usersPerPage,
        offset: (currentPage - 1) * usersPerPage
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const { data, error, count } = await adminAPI.getUsers(filters);

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (data) {
        setUsers(data);
        setTotalUsers(count || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const updates: any = {
        name: selectedUser.name,
        bio: selectedUser.bio,
        website: selectedUser.website,
        github: selectedUser.github,
        twitter: selectedUser.twitter
      };

      const { data, error } = await adminAPI.updateUserProfile(selectedUser.id, updates);

      if (error) {
        console.error('Error updating user:', error);
        return;
      }

      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u));
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'general' | 'pro' | 'admin') => {
    try {
      const { data, error } = await adminAPI.updateUserRole(userId, newRole);

      if (error) {
        console.error('Error updating role:', error);
        return;
      }

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleUserAction = (user: UserProfile, action: 'ban' | 'disable' | 'enable' | 'unban') => {
    setSelectedUser(user);
    setActionType(action);
    setActionReason('');
    setActionDialogOpen(true);
  };

  const executeUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      let result;
      switch (actionType) {
        case 'ban':
          result = await adminAPI.banUser(selectedUser.id, actionReason || undefined);
          break;
        case 'unban':
          result = await adminAPI.unbanUser(selectedUser.id);
          break;
        case 'disable':
          result = await adminAPI.disableUser(selectedUser.id, actionReason || undefined);
          break;
        case 'enable':
          result = await adminAPI.enableUser(selectedUser.id);
          break;
      }

      if (result.error) {
        console.error('Error executing action:', result.error);
        return;
      }

      // Update local state
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          switch (actionType) {
            case 'ban':
              return { ...u, is_banned: true, ban_reason: actionReason, banned_at: new Date().toISOString() };
            case 'unban':
              return { ...u, is_banned: false, ban_reason: null, banned_at: null };
            case 'disable':
              return { ...u, is_disabled: true, disable_reason: actionReason, disabled_at: new Date().toISOString() };
            case 'enable':
              return { ...u, is_disabled: false, disable_reason: null, disabled_at: null };
          }
        }
        return u;
      }));

      setActionDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const getUserStatus = (user: UserProfile) => {
    if (user.is_banned) return { status: 'banned', color: 'destructive' };
    if (user.is_disabled) return { status: 'disabled', color: 'secondary' };
    return { status: 'active', color: 'default' };
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'pro': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalUsers})</CardTitle>
          <CardDescription>
            Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="" />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <Badge variant="outline" className="capitalize">
                              {user.role || 'general'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.color as any} className="capitalize">
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.reputation}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'general' : user.role === 'pro' ? 'admin' : 'pro')}>
                                <Shield className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {!user.is_banned && !user.is_disabled && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUserAction(user, 'ban')}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUserAction(user, 'disable')}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Disable Account
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(user.is_banned || user.is_disabled) && (
                                <DropdownMenuItem onClick={() => handleUserAction(user, user.is_banned ? 'unban' : 'enable')}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  {user.is_banned ? 'Unban User' : 'Enable Account'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information and profile details.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={selectedUser.bio || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={selectedUser.website || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={selectedUser.github || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, github: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={selectedUser.twitter || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, twitter: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'disable' && 'Disable Account'}
              {actionType === 'unban' && 'Unban User'}
              {actionType === 'enable' && 'Enable Account'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban' && 'This will ban the user from accessing the platform.'}
              {actionType === 'disable' && 'This will disable the user account temporarily.'}
              {actionType === 'unban' && 'This will restore access to the user account.'}
              {actionType === 'enable' && 'This will re-enable the user account.'}
            </DialogDescription>
          </DialogHeader>
          {(actionType === 'ban' || actionType === 'disable') && (
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide a reason for this action..."
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'ban' || actionType === 'disable' ? 'destructive' : 'default'}
              onClick={executeUserAction}
            >
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'disable' && 'Disable Account'}
              {actionType === 'unban' && 'Unban User'}
              {actionType === 'enable' && 'Enable Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}