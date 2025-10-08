import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import {
  Users,
  DollarSign,
  CreditCard,
  Tag,
  Search,
  Edit,
  X,
  Check,
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface SubscriptionData {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  stripe_subscription_id?: string;
  current_period_end?: string;
  created_at: string;
  profiles: {
    username: string;
    name: string;
    email: string;
  };
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
}

export function SubscriptionManagement() {
  const { state } = useApp();
  const user = state.user;
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action modals state
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    if (!isAdmin(user)) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load subscriptions
        const subscriptionsResult = await adminAPI.getAllSubscriptions({
          search: searchQuery || undefined,
          plan: planFilter !== 'all' ? planFilter as 'free' | 'pro' : undefined,
          status: statusFilter !== 'all' ? statusFilter as 'active' | 'cancelled' | 'past_due' : undefined,
          limit: 50
        });

        if (subscriptionsResult.data) {
          setSubscriptions(subscriptionsResult.data);
        }

        // Load metrics
        const metricsResult = await adminAPI.getDashboardMetrics();
        if (metricsResult.data) {
          // Calculate subscription-specific metrics
          const totalSubs = subscriptionsResult.count || 0;
          const activeSubs = subscriptionsResult.data?.filter(s => s.status === 'active').length || 0;
          const monthlyRevenue = activeSubs * 7.99; // Assuming $7.99/month for pro plan
          const churnRate = totalSubs > 0 ? ((totalSubs - activeSubs) / totalSubs) * 100 : 0;

          setMetrics({
            totalSubscriptions: totalSubs,
            activeSubscriptions: activeSubs,
            monthlyRevenue,
            churnRate: Math.round(churnRate * 100) / 100
          });
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, searchQuery, planFilter, statusFilter]);

  const handleUpgradeDowngrade = async (newPlan: 'free' | 'pro') => {
    if (!selectedSubscription) return;

    try {
      const result = await adminAPI.updateSubscriptionPlan(selectedSubscription.id, newPlan);
      if (result.data) {
        // Refresh subscriptions
        const subscriptionsResult = await adminAPI.getAllSubscriptions({ limit: 50 });
        if (subscriptionsResult.data) {
          setSubscriptions(subscriptionsResult.data);
        }
        setShowUpgradeModal(false);
        setSelectedSubscription(null);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleCancelSubscription = async (reason?: string) => {
    if (!selectedSubscription) return;

    try {
      const result = await adminAPI.cancelSubscription(selectedSubscription.id, reason);
      if (result.data) {
        // Refresh subscriptions
        const subscriptionsResult = await adminAPI.getAllSubscriptions({ limit: 50 });
        if (subscriptionsResult.data) {
          setSubscriptions(subscriptionsResult.data);
        }
        setShowCancelModal(false);
        setSelectedSubscription(null);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handleExtendTrial = async (days: number) => {
    if (!selectedSubscription) return;

    try {
      const result = await adminAPI.extendTrial(selectedSubscription.id, days);
      if (result.data) {
        // Refresh subscriptions
        const subscriptionsResult = await adminAPI.getAllSubscriptions({ limit: 50 });
        if (subscriptionsResult.data) {
          setSubscriptions(subscriptionsResult.data);
        }
        setShowTrialModal(false);
        setSelectedSubscription(null);
      }
    } catch (error) {
      console.error('Error extending trial:', error);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage user subscriptions, invoices, and billing operations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
         <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
           <TabsTrigger value="overview">Overview</TabsTrigger>
           <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
           <TabsTrigger value="invoices">Invoices</TabsTrigger>
           <TabsTrigger value="actions">Actions</TabsTrigger>
           <TabsTrigger value="coupons">Coupons</TabsTrigger>
         </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.monthlyRevenue.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">MRR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.churnRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Past 30 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest subscription changes and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Activity feed coming soon</p>
                <p className="text-sm">Integration with Stripe webhooks required</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({subscriptions.length})</CardTitle>
              <CardDescription>Manage user subscription plans and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.profiles.name}</div>
                          <div className="text-sm text-muted-foreground">{subscription.profiles.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscription.plan === 'pro' ? 'default' : 'secondary'}>
                          {subscription.plan.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'cancelled' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {subscription.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setShowUpgradeModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {subscription.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowCancelModal(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and manage billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Invoice management coming soon</p>
                <p className="text-sm">Requires Stripe integration and webhook setup</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowUpgradeModal(true)}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Edit className="h-8 w-8 mb-2 text-blue-600" />
                <h3 className="font-medium">Upgrade/Downgrade</h3>
                <p className="text-sm text-muted-foreground text-center">Change user plans</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCancelModal(true)}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <X className="h-8 w-8 mb-2 text-red-600" />
                <h3 className="font-medium">Cancel Subscription</h3>
                <p className="text-sm text-muted-foreground text-center">End user subscriptions</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowRefundModal(true)}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <DollarSign className="h-8 w-8 mb-2 text-green-600" />
                <h3 className="font-medium">Process Refund</h3>
                <p className="text-sm text-muted-foreground text-center">Refund payments</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTrialModal(true)}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calendar className="h-8 w-8 mb-2 text-purple-600" />
                <h3 className="font-medium">Extend Trial</h3>
                <p className="text-sm text-muted-foreground text-center">Give extra trial time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Management</CardTitle>
              <CardDescription>Create and manage discount codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Coupon management coming soon</p>
                <p className="text-sm">Requires Stripe integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade/Downgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              {selectedSubscription && `Change ${selectedSubscription.profiles.name}'s plan`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => handleUpgradeDowngrade('free')}
                variant={selectedSubscription?.plan === 'free' ? 'default' : 'outline'}
                className="flex-1"
              >
                Free Plan
              </Button>
              <Button
                onClick={() => handleUpgradeDowngrade('pro')}
                variant={selectedSubscription?.plan === 'pro' ? 'default' : 'outline'}
                className="flex-1"
              >
                Pro Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              {selectedSubscription && `Cancel ${selectedSubscription.profiles.name}'s subscription`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Warning</p>
                <p className="text-yellow-700">This action cannot be undone. The user will lose access to Pro features.</p>
              </div>
            </div>
            <div>
              <Label htmlFor="cancel-reason">Reason (optional)</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Reason for cancellation..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCancelSubscription()}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for a user payment
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Refund processing coming soon</p>
            <p className="text-sm">Requires Stripe integration</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Extension Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              {selectedSubscription && `Extend ${selectedSubscription.profiles.name}'s trial period`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="trial-days">Additional Days</Label>
              <Select defaultValue="7">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTrialModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleExtendTrial(7)}>
                Extend Trial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}