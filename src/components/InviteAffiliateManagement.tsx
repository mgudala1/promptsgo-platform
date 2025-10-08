import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import {
  Users, Gift, DollarSign, TrendingUp, Settings,
  Plus, Search, Filter, Download, Eye, X,
  CheckCircle, XCircle, AlertCircle, Copy
} from 'lucide-react';

interface InviteCode {
  id: string;
  invite_code: string;
  email: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked' | 'waitlist';
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  profiles?: {
    username: string;
    name: string;
    email: string;
  } | null;
}

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  tier: 'bronze' | 'silver' | 'gold';
  created_at: string;
  last_commission_at: string | null;
  profiles?: {
    username: string;
    name: string;
    email: string;
  } | null;
}

interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  commission: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at: string | null;
  affiliates?: {
    referral_code: string;
    profiles?: {
      username: string;
      name: string;
    } | null;
  } | null;
  profiles?: {
    username: string;
    name: string;
    created_at: string;
  } | null;
}

export function InviteAffiliateManagement() {
  const { state } = useApp();
  const user = state.user;

  // State for invite management
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteFilters, setInviteFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });

  // State for affiliate management
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [affiliateLoading, setAffiliateLoading] = useState(true);
  const [affiliateFilters, setAffiliateFilters] = useState({
    search: '',
    tier: 'all',
    status: ''
  });

  // State for analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // State for payouts
  const [pendingPayouts, setPendingPayouts] = useState<Referral[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(true);

  // State for commission settings
  const [commissionSettings, setCommissionSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Dialog states
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generateOptions, setGenerateOptions] = useState({
    expiresInDays: 30,
    isReusable: false
  });

  useEffect(() => {
    if (!isAdmin(user)) return;

    loadInviteCodes();
    loadAffiliates();
    loadAnalytics();
    loadPendingPayouts();
    loadCommissionSettings();
  }, [user]);

  const loadInviteCodes = async () => {
    setInviteLoading(true);
    try {
      const { data } = await adminAPI.getAllInviteCodes({
        search: inviteFilters.search || undefined,
        status: inviteFilters.status === 'all' ? undefined : inviteFilters.status as any,
        type: inviteFilters.type === 'all' ? undefined : inviteFilters.type as any,
        limit: 50
      });
      setInviteCodes(data || []);
    } catch (error) {
      console.error('Error loading invite codes:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const loadAffiliates = async () => {
    setAffiliateLoading(true);
    try {
      const { data } = await adminAPI.getAllAffiliates({
        search: affiliateFilters.search || undefined,
        tier: affiliateFilters.tier === 'all' ? undefined : affiliateFilters.tier as any,
        status: affiliateFilters.status as any || undefined,
        limit: 50
      });
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error loading affiliates:', error);
    } finally {
      setAffiliateLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await adminAPI.getAffiliateAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadPendingPayouts = async () => {
    setPayoutLoading(true);
    try {
      const { data } = await adminAPI.getPendingPayouts();
      setPendingPayouts(data || []);
    } catch (error) {
      console.error('Error loading pending payouts:', error);
    } finally {
      setPayoutLoading(false);
    }
  };

  const loadCommissionSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data } = await adminAPI.getCommissionSettings();
      setCommissionSettings(data);
    } catch (error) {
      console.error('Error loading commission settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    try {
      const { data } = await adminAPI.generateInviteCodes(generateCount, {
        ...generateOptions,
        invitedBy: user?.id
      });
      if (data) {
        setGenerateDialogOpen(false);
        setGenerateCount(1);
        loadInviteCodes();
        alert(`Successfully generated ${generateCount} invite code(s)`);
      }
    } catch (error) {
      console.error('Error generating codes:', error);
      alert('Failed to generate invite codes');
    }
  };

  const handleRevokeCode = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invite code?')) return;

    try {
      await adminAPI.revokeInviteCode(inviteId);
      loadInviteCodes();
    } catch (error) {
      console.error('Error revoking code:', error);
      alert('Failed to revoke invite code');
    }
  };

  const handleApproveAffiliate = async (userId: string) => {
    try {
      await adminAPI.approveAffiliate(userId);
      loadAffiliates();
      alert('Affiliate approved successfully');
    } catch (error) {
      console.error('Error approving affiliate:', error);
      alert('Failed to approve affiliate');
    }
  };

  const handleUpdateAffiliateTier = async (affiliateId: string, tier: 'bronze' | 'silver' | 'gold') => {
    try {
      await adminAPI.updateAffiliateTier(affiliateId, tier);
      loadAffiliates();
    } catch (error) {
      console.error('Error updating affiliate tier:', error);
      alert('Failed to update affiliate tier');
    }
  };

  const handleProcessPayout = async (referralId: string) => {
    try {
      await adminAPI.processPayout(referralId);
      loadPendingPayouts();
      loadAnalytics();
      alert('Payout processed successfully');
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    }
  };

  const handleUpdateCommissionSettings = async () => {
    try {
      await adminAPI.updateCommissionSettings(commissionSettings);
      alert('Commission settings updated successfully');
    } catch (error) {
      console.error('Error updating commission settings:', error);
      alert('Failed to update commission settings');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invite & Affiliate Management</h1>
          <p className="text-muted-foreground">Manage invite codes, affiliates, and commission settings</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="invites" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
          <TabsTrigger value="invites">Invite Codes</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Invite Codes Tab */}
        <TabsContent value="invites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Invite Code Management
                  </CardTitle>
                  <CardDescription>Generate, view, and manage invite codes</CardDescription>
                </div>
                <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Codes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Invite Codes</DialogTitle>
                      <DialogDescription>
                        Create new invite codes for user registration
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="count">Number of codes</Label>
                        <Input
                          id="count"
                          type="number"
                          min="1"
                          max="100"
                          value={generateCount}
                          onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expires">Expires in (days)</Label>
                        <Input
                          id="expires"
                          type="number"
                          min="1"
                          value={generateOptions.expiresInDays}
                          onChange={(e) => setGenerateOptions(prev => ({
                            ...prev,
                            expiresInDays: parseInt(e.target.value)
                          }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="reusable"
                          checked={generateOptions.isReusable}
                          onChange={(e) => setGenerateOptions(prev => ({
                            ...prev,
                            isReusable: e.target.checked
                          }))}
                        />
                        <Label htmlFor="reusable">Reusable codes</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleGenerateCodes}>
                        Generate {generateCount} Code{generateCount !== 1 ? 's' : ''}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search codes or emails..."
                    value={inviteFilters.search}
                    onChange={(e) => setInviteFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={inviteFilters.status} onValueChange={(value) => setInviteFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={inviteFilters.type} onValueChange={(value) => setInviteFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="single">Single Use</SelectItem>
                    <SelectItem value="reusable">Reusable</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadInviteCodes}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Invite Codes Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inviteLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading invite codes...
                        </TableCell>
                      </TableRow>
                    ) : inviteCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No invite codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      inviteCodes.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell className="font-mono">
                            <div className="flex items-center gap-2">
                              {invite.invite_code}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(invite.invite_code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={invite.email ? "default" : "secondary"}>
                              {invite.email ? "Single Use" : "Reusable"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invite.status === 'accepted' ? 'default' :
                                invite.status === 'pending' ? 'secondary' :
                                invite.status === 'revoked' ? 'destructive' :
                                'outline'
                              }
                            >
                              {invite.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invite.profiles ? invite.profiles.name : 'System'}
                          </TableCell>
                          <TableCell>
                            {new Date(invite.invited_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            {invite.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeCode(invite.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Affiliate Management
              </CardTitle>
              <CardDescription>Manage affiliate applications and tiers</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search affiliates..."
                    value={affiliateFilters.search}
                    onChange={(e) => setAffiliateFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={affiliateFilters.tier} onValueChange={(value) => setAffiliateFilters(prev => ({ ...prev, tier: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadAffiliates}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Affiliates Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliateLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading affiliates...
                        </TableCell>
                      </TableRow>
                    ) : affiliates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No affiliates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            {affiliate.profiles ? affiliate.profiles.name : 'Unknown'}
                          </TableCell>
                          <TableCell className="font-mono">
                            <div className="flex items-center gap-2">
                              {affiliate.referral_code}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(affiliate.referral_code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={affiliate.tier}
                              onValueChange={(value: 'bronze' | 'silver' | 'gold') =>
                                handleUpdateAffiliateTier(affiliate.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bronze">Bronze</SelectItem>
                                <SelectItem value="silver">Silver</SelectItem>
                                <SelectItem value="gold">Gold</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{affiliate.total_referrals}</TableCell>
                          <TableCell>${affiliate.total_earnings.toFixed(2)}</TableCell>
                          <TableCell>${affiliate.pending_earnings.toFixed(2)}</TableCell>
                          <TableCell>
                            {/* Actions would go here */}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalReferrals || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.paidReferrals || 0}</p>
                  <p className="text-xs text-muted-foreground">Paid Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${analytics?.totalEarnings?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Latest affiliate referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsLoading ? (
                  <p className="text-center py-8">Loading analytics...</p>
                ) : analytics?.referrals?.slice(0, 10).map((referral: Referral) => (
                  <div key={referral.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        referral.status === 'paid' ? 'bg-green-500' :
                        referral.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">
                          {referral.profiles?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Referred by {referral.affiliates?.profiles?.username || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${referral.commission.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{referral.status}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center py-8">No referrals found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Payouts
              </CardTitle>
              <CardDescription>Manage affiliate commission payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading payouts...
                        </TableCell>
                      </TableRow>
                    ) : pendingPayouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No pending payouts
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {payout.affiliates?.profiles?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {payout.profiles?.username || 'Unknown User'}
                          </TableCell>
                          <TableCell>${payout.commission.toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(payout.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayout(payout.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Commission Settings
              </CardTitle>
              <CardDescription>Configure affiliate commission rates and payout rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading ? (
                <p>Loading settings...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="bronze-rate">Bronze Tier (%)</Label>
                      <Input
                        id="bronze-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={commissionSettings?.bronze || 30}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          bronze: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="silver-rate">Silver Tier (%)</Label>
                      <Input
                        id="silver-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={commissionSettings?.silver || 35}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          silver: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gold-rate">Gold Tier (%)</Label>
                      <Input
                        id="gold-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={commissionSettings?.gold || 40}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          gold: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="min-payout">Minimum Payout ($)</Label>
                      <Input
                        id="min-payout"
                        type="number"
                        min="0"
                        value={commissionSettings?.minimumPayout || 50}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          minimumPayout: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payout-delay">Payout Delay (days)</Label>
                      <Input
                        id="payout-delay"
                        type="number"
                        min="0"
                        value={commissionSettings?.payoutDelayDays || 60}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          payoutDelayDays: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleUpdateCommissionSettings}>
                    Save Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{inviteCodes.length}</div>
                  <div className="text-xs text-muted-foreground">Total Codes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {inviteCodes.filter(c => c.status === 'accepted').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Accepted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{affiliates.length}</div>
                  <div className="text-xs text-muted-foreground">Affiliates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingPayouts.length}</div>
                  <div className="text-xs text-muted-foreground">Pending Payouts</div>
                </div>
              </div>

              {analytics && (
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold">${analytics.totalEarnings?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-muted-foreground">Total Earnings</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}