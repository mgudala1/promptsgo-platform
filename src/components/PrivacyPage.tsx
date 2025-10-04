import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
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
          <Shield className="h-8 w-8 text-green-500" />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your privacy matters to us. Here's how we collect, use, and protect your data.
        </p>
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        <strong>Effective Date:</strong> October 4, 2025
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="mb-4">
            Your privacy matters to us. This Privacy Policy explains how PromptsGo collects, uses, and protects your data.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> email, username, and profile details.</li>
              <li><strong>Content Data:</strong> prompts, portfolios, comments, likes, saves.</li>
              <li><strong>Usage Data:</strong> analytics (e.g., views, clicks, engagement stats).</li>
              <li><strong>Optional:</strong> social links or profile information you choose to add.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To operate and improve PromptsGo.</li>
              <li>To personalize your experience (e.g., show saved prompts).</li>
              <li>To provide community stats and analytics.</li>
              <li>To send you updates, service announcements, or important notices.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Sharing of Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We do not sell your personal data.</li>
              <li>Public content you share (prompts, comments, portfolios) is visible to others.</li>
              <li>We may share limited data with service providers (e.g., Supabase for hosting and cloud storage) strictly to provide platform functionality.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We use Supabase authentication and row-level security to protect your account.</li>
              <li>Passwords are encrypted and never stored in plain text.</li>
              <li>No system is 100% secure — you use PromptsGo at your own risk.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You may update or delete your profile at any time.</li>
              <li>You may delete your account, which removes your personal information (though public content may remain anonymized).</li>
              <li>You may request data access or export by contacting support@promptsgo.com.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">6. Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We use cookies/local storage to maintain sessions and improve your experience.</li>
              <li>We do not use third-party tracking across unrelated websites.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">7. Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We may update this Privacy Policy over time.</li>
              <li>Significant changes will be communicated via the website or email.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Questions About Your Privacy?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <a
            href="mailto:support@promptsgo.com"
            className="text-primary hover:underline"
          >
            support@promptsgo.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
}