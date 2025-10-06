import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, Users, DollarSign, Award, Target, BarChart3, CheckCircle, XCircle, Clock, CreditCard, Download, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  commission_rate: number;
  total_earnings: number;
  pending_payout: number;
  total_referrals: number;
  conversion_rate: number;
  joined_at: string;
  last_payout_at?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Commission {
  id: string;
  affiliate_id: string;
  referral_user_id: string;
  subscription_id: string;
  amount: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Payout {
  id: string;
  affiliate_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'stripe' | 'paypal' | 'bank';
  created_at: string;
  processed_at?: string;
  completed_at?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export function AffiliateManagement() {
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadApplications(),
        loadAffiliates(),
        loadCommissions(),
        loadPayouts()
      ]);
    } catch (error) {
      console.error('Failed to load affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    // Mock affiliate applications
    const mockApplications: AffiliateApplication[] = [
      {
        id: 'app_1',
        user_id: 'user_4',
        full_name: 'Alice Wilson',
        email: 'alice@example.com',
        status: 'pending',
        applied_at: '2024-09-15T00:00:00Z',
        profiles: {
          full_name: 'Alice Wilson',
          email: 'alice@example.com'
        }
      },
      {
        id: 'app_2',
        user_id: 'user_5',
        full_name: 'Charlie Brown',
        email: 'charlie@example.com',
        status: 'approved',
        applied_at: '2024-08-20T00:00:00Z',
        approved_at: '2024-08-21T00:00:00Z',
        profiles: {
          full_name: 'Charlie Brown',
          email: 'charlie@example.com'
        }
      }
    ];

    setApplications(mockApplications);
  };

  const loadAffiliates = async () => {
    // Mock active affiliates
    const mockAffiliates: Affiliate[] = [
      {
        id: 'aff_1',
        user_id: 'user_5',
        affiliate_code: 'CHARLIE2024',
        tier: 'Silver',
        commission_rate: 35,
        total_earnings: 525.50,
        pending_payout: 157.65,
        total_referrals: 15,
        conversion_rate: 2.1,
        joined_at: '2024-08-21T00:00:00Z',
        last_payout_at: '2024-08-31T00:00:00Z',
        profiles: {
          full_name: 'Charlie Brown',
          email: 'charlie@example.com'
        }
      },
      {
        id: 'aff_2',
        user_id: 'user_6',
        affiliate_code: 'DIANA2024',
        tier: 'Bronze',
        commission_rate: 30,
        total_earnings: 89.70,
        pending_payout: 89.70,
        total_referrals: 3,
        conversion_rate: 1.8,
        joined_at: '2024-09-01T00:00:00Z',
        profiles: {
          full_name: 'Diana Prince',
          email: 'diana@example.com'
        }
      }
    ];

    setAffiliates(mockAffiliates);
  };

  const loadCommissions = async () => {
    // Mock commission data
    const mockCommissions: Commission[] = [
      {
        id: 'com_1',
        affiliate_id: 'aff_1',
        referral_user_id: 'user_7',
        subscription_id: 'sub_4',
        amount: 990,
        commission_amount: 346.50,
        status: 'pending',
        created_at: '2024-09-20T00:00:00Z',
        profiles: {
          full_name: 'Eve Garcia',
          email: 'eve@example.com'
        }
      },
      {
        id: 'com_2',
        affiliate_id: 'aff_1',
        referral_user_id: 'user_8',
        subscription_id: 'sub_5',
        amount: 990,
        commission_amount: 346.50,
        status: 'paid',
        created_at: '2024-08-25T00:00:00Z',
        paid_at: '2024-08-31T00:00:00Z',
        profiles: {
          full_name: 'Frank Miller',
          email: 'frank@example.com'
        }
      }
    ];

    setCommissions(mockCommissions);
  };

  const loadPayouts = async () => {
    // Mock payout data
    const mockPayouts: Payout[] = [
      {
        id: 'pay_1',
        affiliate_id: 'aff_1',
        amount: 693.00,
        status: 'completed',
        method: 'stripe',
        created_at: '2024-08-31T00:00:00Z',
        processed_at: '2024-09-01T00:00:00Z',
        completed_at: '2024-09-02T00:00:00Z',
        profiles: {
          full_name: 'Charlie Brown',
          email: 'charlie@example.com'
        }
      },
      {
        id: 'pay_2',
        affiliate_id: 'aff_2',
        amount: 89.70,
        status: 'pending',
        method: 'paypal',
        created_at: '2024-09-15T00:00:00Z',
        profiles: {
          full_name: 'Diana Prince',
          email: 'diana@example.com'
        }
      }
    ];

    setPayouts(mockPayouts);
  };

  const approveApplication = async (applicationId: string) => {
    try {
      // In real implementation: update application status and create affiliate record
      await new Promise(resolve => setTimeout(resolve, 1000));

      setApplications(applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'approved', approved_at: new Date().toISOString() }
          : app
      ));

      toast.success('Affiliate application approved');
    } catch (error) {
      console.error('Failed to approve application:', error);
      toast.error('Failed to approve application');
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }

      // In real implementation: update application status with rejection reason
      await new Promise(resolve => setTimeout(resolve, 1000));

      setApplications(applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: rejectionReason }
          : app
      ));

      setRejectionReason('');
      toast.success('Affiliate application rejected');
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast.error('Failed to reject application');
    }
  };

  const processPayout = async (_affiliateId: string) => {
    try {
      // In real implementation: create payout record and process via Stripe/PayPal
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Payout processed successfully');
    } catch (error) {
      console.error('Failed to process payout:', error);
      toast.error('Failed to process payout');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      Bronze: 'bg-amber-100 text-amber-800',
      Silver: 'bg-gray-100 text-gray-800',
      Gold: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tier}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalAffiliateStats = {
    totalAffiliates: affiliates.length,
    totalEarnings: affiliates.reduce((sum, aff) => sum + aff.total_earnings, 0),
    pendingPayouts: affiliates.reduce((sum, aff) => sum + aff.pending_payout, 0),
    totalReferrals: affiliates.reduce((sum, aff) => sum + aff.total_referrals, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Affiliate Management</h2>
          <p className="text-muted-foreground">
            Complete affiliate program management with commission tracking, payout processing, and performance analytics.
          </p>
        </div>
        <Button onClick={loadAffiliateData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Affiliate Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{totalAffiliateStats.totalAffiliates}</p>
              <p className="text-sm text-muted-foreground">Active Affiliates</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalAffiliateStats.totalEarnings)}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalAffiliateStats.pendingPayouts)}</p>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{totalAffiliateStats.totalReferrals}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </div>
          </div>
        </Card>
      </div>

        <div className="flex w-full bg-muted p-1 rounded-lg mb-6">
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'applications'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'affiliates'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('affiliates')}
          >
            Affiliates
          </button>
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'commissions'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('commissions')}
          >
            Commissions
          </button>
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'payouts'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('payouts')}
          >
            Payouts
          </button>
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="space-y-6">
          <Card className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
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
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Applicant</TableHead>
                      <TableHead className="min-w-[120px]">Applied Date</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading applications...
                        </TableCell>
                      </TableRow>
                    ) : filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.full_name}</div>
                              <div className="text-sm text-muted-foreground">{application.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {application.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => approveApplication(application.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Reject Application</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <p>Are you sure you want to reject this affiliate application?</p>
                                        <div>
                                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                          <Input
                                            id="rejection-reason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Reason for rejection..."
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="destructive"
                                            onClick={() => rejectApplication(application.id)}
                                          >
                                            Reject Application
                                          </Button>
                                          <Button variant="outline" onClick={() => setRejectionReason('')}>
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
          </Card>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Active Affiliates</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Affiliate</TableHead>
                      <TableHead className="min-w-[80px]">Tier</TableHead>
                      <TableHead className="min-w-[120px]">Commission Rate</TableHead>
                      <TableHead className="min-w-[120px]">Total Earnings</TableHead>
                      <TableHead className="min-w-[120px]">Pending Payout</TableHead>
                      <TableHead className="min-w-[80px]">Referrals</TableHead>
                      <TableHead className="min-w-[120px]">Conversion Rate</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{affiliate.profiles.full_name}</div>
                            <div className="text-sm text-muted-foreground">{affiliate.affiliate_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTierBadge(affiliate.tier)}</TableCell>
                        <TableCell>{affiliate.commission_rate}%</TableCell>
                        <TableCell>{formatCurrency(affiliate.total_earnings)}</TableCell>
                        <TableCell>{formatCurrency(affiliate.pending_payout)}</TableCell>
                        <TableCell>{affiliate.total_referrals}</TableCell>
                        <TableCell>{affiliate.conversion_rate}%</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => processPayout(affiliate.id)}
                              disabled={affiliate.pending_payout === 0}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Commission Tracking</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Referral</TableHead>
                    <TableHead>Subscription Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {affiliates.find(a => a.id === commission.affiliate_id)?.profiles.full_name}
                      </TableCell>
                      <TableCell>{commission.profiles.full_name}</TableCell>
                      <TableCell>{formatCurrency(commission.amount)}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>{new Date(commission.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payout Management</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.profiles.full_name}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell className="capitalize">{payout.method}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>{new Date(payout.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payout.status === 'pending' && (
                            <Button size="sm" onClick={() => processPayout(payout.affiliate_id)}>
                              Process
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Affiliate Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Commission Rate</span>
                  <span className="font-bold">
                    {affiliates.length > 0
                      ? `${(affiliates.reduce((sum, aff) => sum + aff.commission_rate, 0) / affiliates.length).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Conversion Rate</span>
                  <span className="font-bold">
                    {affiliates.length > 0
                      ? `${(affiliates.reduce((sum, aff) => sum + aff.conversion_rate, 0) / affiliates.length).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pending Commissions</span>
                  <span className="font-bold">
                    {formatCurrency(commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0))}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
              <div className="space-y-4">
                {['Bronze', 'Silver', 'Gold'].map(tier => {
                  const count = affiliates.filter(a => a.tier === tier).length;
                  const percentage = affiliates.length > 0 ? ((count / affiliates.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{tier}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count} affiliates</span>
                        <span className="font-bold">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Affiliate Program Integration:</strong> This comprehensive system is designed to integrate with Stripe Connect for payouts,
              automated commission calculation, and real-time tracking. Configure webhooks and API keys to enable live affiliate management.
            </AlertDescription>
          </Alert>
          </div>
        )}
    </div>
  );
}