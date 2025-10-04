import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
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
          <FileText className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Please read these terms carefully before using PromptsGo
        </p>
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        <strong>Effective Date:</strong> October 4, 2025
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="mb-4">
            Welcome to PromptsGo — a platform for discovering, sharing, and showcasing AI prompts. By using PromptsGo, you agree to these Terms of Service. Please read them carefully.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You must be at least 13 years old (or the legal age in your country) to use PromptsGo.</li>
              <li>You are responsible for safeguarding your login credentials.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Content You Share</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You retain ownership of the prompts, portfolios, comments, and other content you submit.</li>
              <li>By posting, you grant PromptsGo a non-exclusive, worldwide license to host, display, and distribute your content as part of the platform.</li>
              <li>Do not post content that is illegal, harmful, infringing, or that violates intellectual property rights.</li>
              <li>PromptsGo may remove or restrict content that violates these Terms or our Community Guidelines.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the platform for spamming, scraping, or automated misuse.</li>
              <li>Post harmful, discriminatory, obscene, or malicious content.</li>
              <li>Misrepresent ownership of prompts or plagiarize others' work.</li>
              <li>Attempt to hack, reverse engineer, or disrupt the platform.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>PromptsGo provides no guarantee of accuracy, reliability, or results from using community-contributed prompts.</li>
              <li>All prompts are used at your own risk.</li>
              <li>We do not endorse or verify the claims of any user content.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>PromptsGo is provided "as is", without warranties of any kind.</li>
              <li>To the maximum extent permitted by law, PromptsGo and its team are not liable for any damages resulting from your use of the platform.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">6. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We may suspend or terminate accounts that violate these Terms.</li>
              <li>You may delete your account at any time. Some public content may remain in anonymized form.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">7. Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We may update these Terms from time to time.</li>
              <li>Continued use after changes means you accept the updated Terms.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Questions About These Terms?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms of Service, please contact us:
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