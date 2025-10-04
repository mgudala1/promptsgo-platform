import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription } from "./alert";
import { useApp } from "../../contexts/AppContext";
import { ArrowLeft, DollarSign, CheckCircle } from "lucide-react";

interface AffiliateProgramPageProps {
  onBack?: () => void;
  onNavigateToDashboard?: () => void;
}

export function AffiliateProgramPage({ onBack, onNavigateToDashboard }: AffiliateProgramPageProps) {
  const { state, dispatch } = useApp();

  const handleBecomeAffiliate = () => {
    if (!state.user) return;

    // In a real app, this would make an API call to apply for affiliate status
    // For now, we'll simulate approval
    dispatch({
      type: 'UPDATE_USER',
      payload: { isAffiliate: true }
    });

    // Show success message (could be a toast notification)
    alert('Congratulations! You have been approved as an affiliate. You can now access your dashboard.');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <DollarSign className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">PromptsGo Affiliate Program</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Turn your network, expertise, and influence into rewards. By joining the PromptsGo Affiliate Program, you earn commissions for every new member who subscribes through your referral.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>30% recurring commission on all subscriptions.</li>
              <li>Tiered rewards:</li>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>0+ referrals → 30% (Bronze)</li>
                <li>10+ referrals → 35% (Silver)</li>
                <li>25+ referrals → 40% (Gold)</li>
              </ul>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Earnings unlock after 60 days (refund window).</li>
              <li>Minimum payout threshold: $50.</li>
              <li>Payouts are made monthly via Stripe Connect or PayPal.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affiliate Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Track clicks, conversions, and earnings.</li>
              <li>Access pre-built marketing materials: banners, social posts, email templates.</li>
              <li>See your progress toward the next tier.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Must be an active PromptsGo user.</li>
              <li>Applications reviewed manually for quality and authenticity.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Join?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Turn your role as a community ambassador into income.</li>
              <li>Earn sustainable, recurring commissions.</li>
              <li>Get recognized with affiliate badges (Silver, Gold).</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center pt-6 space-y-4">
          {state.user?.isAffiliate ? (
            <>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  You are already an approved affiliate! Access your dashboard to track performance.
                </AlertDescription>
              </Alert>
              <Button size="lg" className="px-8 text-lg" onClick={onNavigateToDashboard}>
                📊 Go to Affiliate Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="px-8 text-lg" onClick={handleBecomeAffiliate}>
                👉 Apply to become an Affiliate today and start earning with PromptsGo.
              </Button>
              <p className="text-sm text-muted-foreground">
                Applications are reviewed manually. You'll receive access to your dashboard once approved.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
