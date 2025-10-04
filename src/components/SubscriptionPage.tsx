import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { useApp } from "../contexts/AppContext";
import { pricingPlans } from "../lib/data";
import { PRICING_PLANS } from "../lib/stripe";
import { createSubscriptionPaymentIntent, getUserSubscription, SubscriptionData } from "../lib/subscription";
import { StripeCheckout } from "./ui/StripeCheckout";
import { ArrowLeft, Check, Star, Zap, Loader2, AlertCircle, CreditCard } from "lucide-react";

interface SubscriptionPageProps {
  onBack: () => void;
  onNavigateToBilling?: () => void;
}

export function SubscriptionPage({ onBack, onNavigateToBilling }: SubscriptionPageProps) {
  const { state, dispatch } = useApp();
  const [isYearly, setIsYearly] = useState(false);
  const [userSubscription, setUserSubscription] = useState<SubscriptionData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load user's current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (state.user) {
        try {
          const subscription = await getUserSubscription(state.user.id);
          setUserSubscription(subscription);
        } catch (err) {
          console.error('Error loading subscription:', err);
        }
      }
    };

    loadSubscription();
  }, [state.user]);

  const handleUpgrade = async (plan: 'free' | 'pro') => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return;
    }

    if (plan === 'free') {
      // Downgrade to free - this would typically cancel the subscription
      setError('Downgrading to free plan requires contacting support. Please email support@promptsgo.com');
      return;
    }

    // Pro plan - initiate Stripe checkout
    setIsLoading(true);
    setError('');
    setSelectedPlan(plan);

    try {
      const priceId = isYearly
        ? PRICING_PLANS.pro.stripePriceId?.yearly
        : PRICING_PLANS.pro.stripePriceId?.monthly;

      if (!priceId) {
        throw new Error('Price ID not configured for selected plan');
      }

      const paymentIntent = await createSubscriptionPaymentIntent(priceId, state.user.id);
      setClientSecret(paymentIntent.client_secret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      setSelectedPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Update local state
    if (state.user) {
      const updatedUser = { ...state.user, subscriptionPlan: 'pro' as const };
      dispatch({
        type: 'SET_USER',
        payload: updatedUser
      });
    }

    // Reset state
    setSelectedPlan(null);
    setClientSecret('');
    setError('');

    // Reload subscription data
    if (state.user) {
      try {
        const subscription = await getUserSubscription(state.user.id);
        setUserSubscription(subscription);
      } catch (err) {
        console.error('Error reloading subscription:', err);
      }
    }

    alert('Successfully upgraded to Pro plan! Welcome to PromptsGo Pro!');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(`Payment failed: ${errorMessage}`);
    setSelectedPlan(null);
    setClientSecret('');
  };

  const getPrice = (plan: 'free' | 'pro') => {
    if (plan === 'free') return 0;

    const planData = PRICING_PLANS[plan];
    const price = isYearly && 'yearly' in planData.price ? planData.price.yearly : planData.price.monthly;
    return price || 0;
  };

  const getCurrentPlan = () => {
    if (userSubscription?.status === 'active') {
      return userSubscription.plan_id === 'pro' ? 'pro' : 'free';
    }
    return state.user?.subscriptionPlan || 'free';
  };

  const getSavings = () => {
    const monthlyTotal = pricingPlans.pro.price.monthly * 12;
    const yearlyPrice = pricingPlans.pro.price.yearly;
    const savings = monthlyTotal - yearlyPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground">Unlock the full potential of PromptsGo</p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label htmlFor="billing-toggle" className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
            Yearly
          </Label>
          {isYearly && (
            <Badge variant="secondary" className="ml-2">
              Save {getSavings()}%
            </Badge>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="max-w-4xl mx-auto border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stripe Checkout Form */}
        {clientSecret && selectedPlan && (
          <div className="max-w-2xl mx-auto mb-8">
            <StripeCheckout
              clientSecret={clientSecret}
              amount={getPrice(selectedPlan) * 100} // Convert to cents
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className={`relative ${getCurrentPlan() === 'free' ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl">Free</CardTitle>
                <Badge variant="secondary">Starter</Badge>
              </div>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Create unlimited prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Save up to 10 prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Fork up to 3 prompts/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Basic search & filters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Access community prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Comment & discuss</span>
                </li>
              </ul>

              <Button
                className="w-full"
                variant={getCurrentPlan() === 'free' ? 'outline' : 'default'}
                onClick={() => handleUpgrade('free')}
                disabled={getCurrentPlan() === 'free' || isLoading}
              >
                {getCurrentPlan() === 'free' ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className={`relative ${getCurrentPlan() === 'pro' ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <Badge className="bg-gradient-to-r from-primary to-primary/80">
                  <Star className="h-3 w-3 mr-1" />
                  Professional
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                ${getPrice('pro')}
                <span className="text-lg text-muted-foreground">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              {isYearly && (
                <p className="text-sm text-muted-foreground">
                  ${(pricingPlans.pro.price.monthly).toFixed(2)}/month billed yearly
                </p>
              )}
              <p className="text-muted-foreground">For serious creators & professionals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Everything in Free, plus:</span>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited saves & collections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited forking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Advanced search & filters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Pro badge on profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Early access to features</span>
                </li>
              </ul>

              <Button
                className="w-full"
                variant={getCurrentPlan() === 'pro' ? 'outline' : 'default'}
                onClick={() => handleUpgrade('pro')}
                disabled={getCurrentPlan() === 'pro' || isLoading}
              >
                {isLoading && selectedPlan === 'pro' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : getCurrentPlan() === 'pro' ? (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Billing Management */}
        {getCurrentPlan() === 'pro' && onNavigateToBilling && (
          <div className="text-center mb-8">
            <Button variant="outline" onClick={onNavigateToBilling}>
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing & Subscription
            </Button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens to my saved prompts if I downgrade?</h3>
              <p className="text-muted-foreground">Your prompts remain saved, but you'll be limited to 10 saves on the free plan. You can delete older saves to make room for new ones.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">We offer a 30-day money-back guarantee for Pro subscriptions. Contact support for assistance.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground">Currently, we don't offer a free trial, but you can explore all features with the free plan first.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}