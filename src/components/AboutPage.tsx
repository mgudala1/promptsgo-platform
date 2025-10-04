import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowLeft, Github, Twitter, Mail, Shield, FileText, Users, Lightbulb, Target, Heart } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

function AboutPage({ onBack }: AboutPageProps) {
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About PromptsGo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Building the future of prompt engineering — where creativity meets collaboration
        </p>
      </div>

      {/* Our Vision */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Our Vision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            Prompts are becoming as important as code. Just as GitHub gave developers a home to share and improve software, we're building a home for the next generation of creators who work with AI.
          </p>
        </CardContent>
      </Card>

      {/* Our Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            PromptsGo exists to make prompts easier to create, discover, and showcase. Whether you're writing, coding, designing, or solving business problems, we believe prompts should be shared, remixed, and celebrated as professional work.
          </p>
        </CardContent>
      </Card>

      {/* Our Community */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Our Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            From hobbyists exploring generative AI to consultants delivering client-ready solutions, PromptsGo is for anyone who relies on prompts every day. Here, you'll find a supportive community where ideas grow, collaboration is encouraged, and contributions are recognized.
          </p>
        </CardContent>
      </Card>

      {/* Why PromptsGo */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Why PromptsGo?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            Right now, prompts are scattered across tweets, blogs, and chat threads. PromptsGo brings everything together in one place — structured, searchable, and community-driven. It's where you can build your profile, connect with others, and be part of shaping the future of prompt engineering.
          </p>
        </CardContent>
      </Card>

      
    </div>
  );
}

export default AboutPage;