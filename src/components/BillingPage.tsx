import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useApp } from "../contexts/AppContext";
import { getUserSubscription, cancelSubscription, SubscriptionData } from "../lib/subscription";
import { ArrowLeft, CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface BillingPageProps {
  onBack: () => void;
}

export function BillingPage({ onBack }: BillingPageProps) {
  const { state } = useApp();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const loadSubscription = async () => {
      if (state.user) {
        try {
          const sub = await getUserSubscription(state.user.id);
          setSubscription(sub);
        } catch (err) {
          console.error('Error loading subscription:', err);
          setError('Failed to load subscription details');
        }
      }
    };

    loadSubscription();
  }, [state.user]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await cancelSubscription(subscription.id);
      setSuccess('Subscription cancelled successfully. You will retain Pro access until the end of your billing period.');

      // Reload subscription data
      if (state.user) {
        const updatedSub = await getUserSubscription(state.user.id);
        setSubscription(updatedSub);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'canceled': return 'text-orange-600';
      case 'past_due': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'canceled': return <XCircle className="h-4 w-4" />;
      case 'past_due': return <AlertCircle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view billing information</h1>
            <Button onClick={onBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing information</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Subscription */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(subscription.status)}
                    <span className={`font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)} Subscription
                    </span>
                  </div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.plan_id.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Current period: {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</span>
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Cancels at period end</span>
                    </div>
                  )}
                </div>

                {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      You will retain access until the end of your current billing period.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active subscription found</p>
                <Button className="mt-4" onClick={() => window.location.href = '/subscription'}>
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your payment methods for subscription billing
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    ••••
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Default</Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button variant="outline">
                  Update Billing Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Billing history will be available once you have an active subscription</p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Need help with billing? Contact our support team.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@promptsgo.com">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}