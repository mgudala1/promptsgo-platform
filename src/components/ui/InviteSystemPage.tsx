import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ArrowLeft, Users } from "lucide-react";

interface InviteSystemPageProps {
  onBack?: () => void;
}

export function InviteSystemPage({ onBack }: InviteSystemPageProps) {
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
          <Users className="h-8 w-8 text-green-500" />
          <h1 className="text-4xl font-bold">Invite Friends to PromptsGo</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          PromptsGo is growing as an invite-only community to ensure quality, exclusivity, and trust. By inviting friends, colleagues, and collaborators, you help shape the future of prompt engineering while building your own network on the platform.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Each user has a limited number of invite codes.</li>
              <li>Invite codes are single-use and expire after 30 days.</li>
              <li>Free users receive 5 invites.</li>
              <li>Pro users receive 10 invites per month.</li>
              <li>Invites are tracked — you'll see who accepted your code and joined.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Invite?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Build the PromptsGo community with trusted peers.</li>
              <li>Help others discover and share prompts professionally.</li>
              <li>Strengthen your own profile with referral activity.</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center pt-6">
          <Button size="lg" className="px-8 text-lg">
            👉 Generate your invite code today and bring a new member to PromptsGo.
          </Button>
        </div>
      </div>
    </div>
  );
}
