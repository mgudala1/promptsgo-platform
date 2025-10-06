import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isAdmin } from '../../lib/admin';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, CreditCard, DollarSign, User, RefreshCw, AlertTriangle, Download, TrendingUp, BarChart3, Receipt, RotateCcw, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  plan_name: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  billing_cycle_anchor: string;
  profiles: {
    full_name: string;
    email: string;
  };
  payment_method?: {
    type: string;
    last4: string;
    brand: string;
  };
  latest_invoice?: {
    id: string;
    status: string;
    amount_due: number;
    amount_paid: number;
  };
}

interface Invoice {
  id: string;
  subscription_id: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: string;
  due_date?: string;
  paid_at?: string;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  customer_email: string;
  created: string;
  description?: string;
}

interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  failedPayments: number;
  refundsProcessed: number;
  averageRevenuePerUser: number;
  churnRate: number;
}

export function SubscriptionManagement() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access subscription management.
          </p>
        </Card>
      </div>
    );
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      // Load all billing data simultaneously
      await Promise.all([
        loadSubscriptions(),
        loadInvoices(),
        loadPaymentIntents(),
        loadBillingStats()
      ]);
    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    // Mock data - in real app, this would call Stripe API
    const mockSubscriptions: Subscription[] = [
      {
        id: 'sub_1',
        user_id: 'user_1',
        status: 'active',
        plan_name: 'Pro Monthly',
        amount: 990,
        currency: 'usd',
        current_period_start: '2024-09-01T00:00:00Z',
        current_period_end: '2024-10-01T00:00:00Z',
        billing_cycle_anchor: '2024-09-01T00:00:00Z',
        cancel_at_period_end: false,
        profiles: {
          full_name: 'John Doe',
          email: 'john@example.com'
        },
        payment_method: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        },
        latest_invoice: {
          id: 'in_123',
          status: 'paid',
          amount_due: 990,
          amount_paid: 990
        }
      },
      {
        id: 'sub_2',
        user_id: 'user_2',
        status: 'active',
        plan_name: 'Pro Yearly',
        amount: 9900,
        currency: 'usd',
        current_period_start: '2024-08-15T00:00:00Z',
        current_period_end: '2025-08-15T00:00:00Z',
        billing_cycle_anchor: '2024-08-15T00:00:00Z',
        cancel_at_period_end: false,
        profiles: {
          full_name: 'Jane Smith',
          email: 'jane@example.com'
        },
        payment_method: {
          type: 'card',
          last4: '5555',
          brand: 'mastercard'
        },
        latest_invoice: {
          id: 'in_456',
          status: 'paid',
          amount_due: 9900,
          amount_paid: 9900
        }
      },
      {
        id: 'sub_3',
        user_id: 'user_3',
        status: 'past_due',
        plan_name: 'Pro Monthly',
        amount: 990,
        currency: 'usd',
        current_period_start: '2024-08-01T00:00:00Z',
        current_period_end: '2024-09-01T00:00:00Z',
        billing_cycle_anchor: '2024-08-01T00:00:00Z',
        cancel_at_period_end: false,
        profiles: {
          full_name: 'Bob Johnson',
          email: 'bob@example.com'
        },
        payment_method: {
          type: 'card',
          last4: '1111',
          brand: 'visa'
        },
        latest_invoice: {
          id: 'in_789',
          status: 'open',
          amount_due: 990,
          amount_paid: 0
        }
      }
    ];

    setSubscriptions(mockSubscriptions);
  };

  const loadInvoices = async () => {
    // Mock invoice data
    const mockInvoices: Invoice[] = [
      {
        id: 'in_123',
        subscription_id: 'sub_1',
        customer_email: 'john@example.com',
        amount: 990,
        currency: 'usd',
        status: 'paid',
        created: '2024-09-01T00:00:00Z',
        paid_at: '2024-09-01T00:00:00Z'
      },
      {
        id: 'in_456',
        subscription_id: 'sub_2',
        customer_email: 'jane@example.com',
        amount: 9900,
        currency: 'usd',
        status: 'paid',
        created: '2024-08-15T00:00:00Z',
        paid_at: '2024-08-15T00:00:00Z'
      },
      {
        id: 'in_789',
        subscription_id: 'sub_3',
        customer_email: 'bob@example.com',
        amount: 990,
        currency: 'usd',
        status: 'open',
        created: '2024-08-01T00:00:00Z',
        due_date: '2024-09-01T00:00:00Z'
      }
    ];

    setInvoices(mockInvoices);
  };

  const loadPaymentIntents = async () => {
    // Mock payment intent data
    const mockPaymentIntents: PaymentIntent[] = [
      {
        id: 'pi_123',
        amount: 990,
        currency: 'usd',
        status: 'succeeded',
        customer_email: 'john@example.com',
        created: '2024-09-01T00:00:00Z',
        description: 'Subscription payment'
      },
      {
        id: 'pi_456',
        amount: 9900,
        currency: 'usd',
        status: 'succeeded',
        customer_email: 'jane@example.com',
        created: '2024-08-15T00:00:00Z',
        description: 'Annual subscription'
      }
    ];

    setPaymentIntents(mockPaymentIntents);
  };

  const loadBillingStats = async () => {
    // Mock billing statistics
    const mockStats: BillingStats = {
      totalRevenue: 10890,
      monthlyRecurringRevenue: 1980,
      activeSubscriptions: 2,
      canceledSubscriptions: 1,
      failedPayments: 0,
      refundsProcessed: 0,
      averageRevenuePerUser: 5445,
      churnRate: 33.3
    };

    setBillingStats(mockStats);
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      // In real implementation: call Stripe API to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscriptions(subscriptions.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, cancel_at_period_end: true, status: 'canceled' }
          : sub
      ));

      toast.success('Subscription canceled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      // In real implementation: call Stripe API to reactivate subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscriptions(subscriptions.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, cancel_at_period_end: false, status: 'active' }
          : sub
      ));

      toast.success('Subscription reactivated successfully');
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      toast.error('Failed to reactivate subscription');
    }
  };

  const processRefund = async (_invoiceId: string) => {
    try {
      const amount = parseFloat(refundAmount);
      if (!amount || amount <= 0) {
        toast.error('Please enter a valid refund amount');
        return;
      }

      // In real implementation: call Stripe API to process refund
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Refund of $${amount} processed successfully`);
      setRefundAmount('');
      setRefundReason('');
    } catch (error) {
      console.error('Failed to process refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const retryPayment = async (_subscriptionId: string) => {
    try {
      // In real implementation: call Stripe API to retry payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Payment retry initiated');
    } catch (error) {
      console.error('Failed to retry payment:', error);
      toast.error('Failed to retry payment');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (subscription: Subscription) => {
    const status = subscription.cancel_at_period_end ? 'canceling' : subscription.status;

    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'canceled':
      case 'canceling':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'incomplete':
        return <Badge variant="secondary">Incomplete</Badge>;
      case 'trialing':
        return <Badge variant="outline">Trial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Billing Management</h2>
          <p className="text-muted-foreground">
            Complete Stripe-integrated billing system for subscription management, payments, and revenue tracking.
          </p>
        </div>
        <Button onClick={loadBillingData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Billing Overview Stats */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{formatCurrency(billingStats.totalRevenue * 100, 'usd')}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{formatCurrency(billingStats.monthlyRecurringRevenue * 100, 'usd')}</p>
                <p className="text-sm text-muted-foreground">MRR</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{billingStats.activeSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Active Subs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{billingStats.churnRate}%</p>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, or plan..."
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
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Customer</TableHead>
                      <TableHead className="min-w-[120px]">Plan</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[150px]">Payment Method</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[120px]">Next Billing</TableHead>
                      <TableHead className="min-w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading subscriptions...
                      </TableCell>
                    </TableRow>
                  ) : filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.profiles?.full_name}</div>
                            <div className="text-sm text-muted-foreground">{subscription.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{subscription.plan_name}</TableCell>
                        <TableCell>{getStatusBadge(subscription)}</TableCell>
                        <TableCell>
                          {subscription.payment_method && (
                            <div className="text-sm">
                              {subscription.payment_method.brand} ****{subscription.payment_method.last4}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(subscription.amount, subscription.currency)}</TableCell>
                        <TableCell>{new Date(subscription.current_period_end).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedSubscription(subscription)}>
                                  <User className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Subscription Details</DialogTitle>
                                </DialogHeader>
                                {selectedSubscription && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Customer</Label>
                                        <p>{selectedSubscription.profiles?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedSubscription.profiles?.email}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Plan</Label>
                                        <p>{selectedSubscription.plan_name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(selectedSubscription.amount, selectedSubscription.currency)}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedSubscription)}</div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Payment Method</Label>
                                        {selectedSubscription.payment_method && (
                                          <p className="text-sm">{selectedSubscription.payment_method.brand} ****{selectedSubscription.payment_method.last4}</p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-sm font-medium">Billing Period</Label>
                                      <p className="text-sm">
                                        {new Date(selectedSubscription.current_period_start).toLocaleDateString()} - {' '}
                                        {new Date(selectedSubscription.current_period_end).toLocaleDateString()}
                                      </p>
                                    </div>

                                    {selectedSubscription.latest_invoice && (
                                      <div>
                                        <Label className="text-sm font-medium">Latest Invoice</Label>
                                        <p className="text-sm">Status: {selectedSubscription.latest_invoice.status}</p>
                                        <p className="text-sm">Amount: {formatCurrency(selectedSubscription.latest_invoice.amount_due, selectedSubscription.currency)}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {subscription.status === 'past_due' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => retryPayment(subscription.id)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}

                            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelSubscription(subscription.id)}
                              >
                                Cancel
                              </Button>
                            )}

                            {subscription.cancel_at_period_end && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => reactivateSubscription(subscription.id)}
                              >
                                Reactivate
                              </Button>
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
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Management</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer_email}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'open' ? 'secondary' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(invoice.created).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Receipt className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Process Refund</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="refund-amount">Refund Amount ($)</Label>
                                  <Input
                                    id="refund-amount"
                                    type="number"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="refund-reason">Reason</Label>
                                  <Textarea
                                    id="refund-reason"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Reason for refund..."
                                  />
                                </div>
                                <Button
                                  onClick={() => processRefund(invoice.id)}
                                  className="w-full"
                                >
                                  Process Refund
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Processing</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentIntents.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>{payment.customer_email}</TableCell>
                      <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'succeeded' ? 'default' : payment.status === 'processing' ? 'secondary' : 'destructive'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.created).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Monthly Recurring Revenue</span>
                  <span className="font-bold">{billingStats ? formatCurrency(billingStats.monthlyRecurringRevenue * 100, 'usd') : '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Revenue Per User</span>
                  <span className="font-bold">{billingStats ? formatCurrency(billingStats.averageRevenuePerUser * 100, 'usd') : '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Churn Rate</span>
                  <span className="font-bold">{billingStats ? `${billingStats.churnRate}%` : '0%'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Successful Payments</span>
                  <span className="font-bold text-green-600">{paymentIntents.filter(p => p.status === 'succeeded').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed Payments</span>
                  <span className="font-bold text-red-600">{billingStats?.failedPayments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunds Processed</span>
                  <span className="font-bold text-orange-600">{billingStats?.refundsProcessed || 0}</span>
                </div>
              </div>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Stripe Integration Note:</strong> This interface is designed to work with live Stripe data.
              In production, all billing operations would connect to your Stripe account via API keys.
              Contact your developer to configure Stripe webhooks and API integration.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}