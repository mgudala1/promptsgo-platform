import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Copy, CheckCircle, Play, Eye, Smartphone, Monitor, Tablet,
  Edit, GitFork, BookmarkPlus, Share, Calendar, Heart, TrendingUp,
  Image as ImageIcon, FileText, ThumbsUp, ThumbsDown
} from 'lucide-react';

export function UIPlayground() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isHearted, setIsHearted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hearts, setHearts] = useState(42);
  const [saves, setSaves] = useState(28);
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleHeart = () => {
    setIsHearted(!isHearted);
    setHearts(prev => isHearted ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setSaves(prev => isSaved ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Professional Email Generator',
          text: 'Check out this amazing prompt!',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleSubmitFeedback = () => {
    if (feedbackRating) {
      setFeedbackSubmitted(true);
    }
  };

  // Sample prompt data with ALL features
  const samplePrompt = {
    id: "demo-prompt-1",
    title: "Professional Email Generator",
    description: "Create compelling professional emails with proper tone, structure, and persuasive elements. Perfect for business communication, sales outreach, and client relations.",
    content: `You are an expert email copywriter specializing in professional communication. Your task is to write a compelling email based on the following requirements:

Subject: [SUBJECT LINE]

Recipient: [RECIPIENT TYPE - e.g., client, colleague, prospect]

Goal: [PRIMARY OBJECTIVE - e.g., request meeting, follow up, introduce service]

Key Points to Include:
• [POINT 1]
• [POINT 2]
• [POINT 3]

Tone: [FORMAL/PROFESSIONAL/CONVERSATIONAL]

Length: [BRIEF/MEDIUM/DETAILED]

Please write a complete email including:
1. Attention-grabbing subject line
2. Professional greeting
3. Engaging introduction
4. Clear body with key points
5. Strong call-to-action
6. Professional sign-off

Make it persuasive, error-free, and optimized for the recipient's perspective.`,
    category: "Business",
    tags: ["email", "communication", "professional", "copywriting", "sales", "business"],
    modelCompatibility: ["GPT-4", "Claude-3.5-Sonnet", "Gemini Pro"],
    type: "text",
    visibility: "public",
    version: "2.1",
    viewCount: 1250,
    hearts: hearts,
    saveCount: saves,
    forkCount: 15,
    commentCount: 8,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    author: {
      id: "user-123",
      name: "Sarah Johnson",
      username: "sarahj",
      email: "sarah@example.com",
      reputation: 1250,
      role: "pro",
      subscriptionStatus: "active",
      createdAt: "2023-06-01T00:00:00Z",
      lastLogin: "2024-01-20T14:45:00Z",
      badges: ["Expert Writer", "Top Contributor"],
      skills: ["Copywriting", "Business Communication"],
      saveCount: 45,
      invitesRemaining: 10
    },
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&h=600&fit=crop",
        altText: "Professional email on laptop screen",
        isPrimary: true,
        size: 245760,
        mimeType: "image/jpeg",
        width: 800,
        height: 600,
        caption: "Example of a well-crafted professional email"
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
        altText: "Business communication concept",
        isPrimary: false,
        size: 122880,
        mimeType: "image/jpeg",
        width: 400,
        height: 300
      }
    ],
    template: `You are a [ROLE] specializing in [SPECIALTY]. Your task is to [TASK DESCRIPTION] based on the following requirements:

Subject: [SUBJECT LINE]
Recipient: [RECIPIENT TYPE]
Goal: [PRIMARY OBJECTIVE]

Key Points to Include:
• [POINT 1]
• [POINT 2]
• [POINT 3]

Tone: [FORMAL/PROFESSIONAL/CONVERSATIONAL]
Length: [BRIEF/MEDIUM/DETAILED]

Please write a complete [CONTENT TYPE] including:
1. [OPENING ELEMENT]
2. [MAIN CONTENT]
3. [CALL TO ACTION]
4. [CLOSING ELEMENT]

Make it [QUALITY STANDARDS] and optimized for the recipient's perspective.`,
    isHearted: isHearted,
    isSaved: isSaved,
    isForked: false
  };

  const sampleComments = [
    {
      id: "comment-1",
      content: "This prompt works amazingly well for sales emails! I've increased my response rate by 40% using it.",
      author: { name: "Mike Chen", username: "mikechen" },
      createdAt: "2024-01-18T09:15:00Z",
      hearts: 5,
      isEdited: false
    },
    {
      id: "comment-2",
      content: "Great template! I modified it slightly to work better with LinkedIn messages. Thanks for sharing!",
      author: { name: "Emma Davis", username: "emmad" },
      createdAt: "2024-01-19T14:22:00Z",
      hearts: 3,
      isEdited: true
    }
  ];

  const feedbackStats = {
    total: 24,
    positive: 18,
    negative: 6,
    successRate: 75
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">UI Playground</h1>
        <p className="text-xl text-muted-foreground">
          Experiment with different UI designs before implementing them in the main platform.
        </p>
      </div>

      <Tabs defaultValue="google-style" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="google-style">Google-Style Showcase</TabsTrigger>
          <TabsTrigger value="interactive-demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="responsive-test">Responsive Test</TabsTrigger>
        </TabsList>

        {/* Complete Prompt System Showcase */}
        <TabsContent value="google-style" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Complete Prompt System Showcase
              </CardTitle>
              <p className="text-muted-foreground">
                Full demonstration of ALL features in our prompt platform - from creation to consumption.
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white">
                {/* Prompt Header - Just like PromptDetailPage */}
                <div className="border-b bg-gray-50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${
                          samplePrompt.type === 'text' ? 'bg-blue-100 text-blue-800' :
                          samplePrompt.type === 'image' ? 'bg-purple-100 text-purple-800' :
                          samplePrompt.type === 'code' ? 'bg-green-100 text-green-800' :
                          samplePrompt.type === 'agent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {samplePrompt.type.charAt(0).toUpperCase() + samplePrompt.type.slice(1)}
                        </Badge>
                        <Badge variant="outline">{samplePrompt.category}</Badge>
                        <Badge variant="secondary">{samplePrompt.visibility}</Badge>
                      </div>

                      <h1 className="text-3xl mb-2">{samplePrompt.title}</h1>
                      <p className="text-muted-foreground text-lg">{samplePrompt.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline">
                        <GitFork className="h-4 w-4 mr-2" />
                        Fork
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSave}
                        className={isSaved ? 'bg-primary/10 text-primary' : ''}
                      >
                        <BookmarkPlus className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                      <Button variant="outline" onClick={handleShare}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {samplePrompt.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{samplePrompt.author.name}</div>
                        <div className="text-sm text-muted-foreground">
                          @{samplePrompt.author.username} • {samplePrompt.author.reputation} rep
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(samplePrompt.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {samplePrompt.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <span>v{samplePrompt.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Button
                        variant={isHearted ? 'default' : 'outline'}
                        size="sm"
                        onClick={handleHeart}
                        className={isHearted ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${isHearted ? 'fill-current' : ''}`} />
                        {hearts}
                      </Button>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{saves} saves</span>
                        <span>{samplePrompt.forkCount} forks</span>
                        <span>{samplePrompt.commentCount} comments</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {feedbackStats.successRate}% success rate
                        </span>
                      </div>
                    </div>

                    {/* Model Compatibility */}
                    <div className="flex items-center gap-1">
                      {samplePrompt.modelCompatibility.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                {samplePrompt.images && samplePrompt.images.length > 0 && (
                  <div className="border-b p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Images ({samplePrompt.images.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {samplePrompt.images.map((image) => (
                        <div key={image.id} className="space-y-2">
                          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">{image.altText}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {image.isPrimary && (
                              <Badge variant="secondary" className="text-xs">Primary</Badge>
                            )}
                            <p className="text-sm text-muted-foreground">{image.altText}</p>
                            {image.caption && (
                              <p className="text-xs text-muted-foreground italic">{image.caption}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {image.width && image.height && (
                                <span>{image.width} × {image.height}</span>
                              )}
                              <span>{(image.size / 1024).toFixed(1)} KB</span>
                              <span>{image.mimeType}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="content" className="w-full">
                  <div className="border-b">
                    <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0 mb-6">
                      <TabsTrigger
                        value="content"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                      >
                        Content
                      </TabsTrigger>
                      <TabsTrigger
                        value="template"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Template
                      </TabsTrigger>
                      <TabsTrigger
                        value="discussion"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                      >
                        Discussion ({feedbackStats.total + sampleComments.length})
                        {feedbackStats.successRate !== null && ` • ${feedbackStats.successRate}% success`}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Content Tab */}
                  <TabsContent value="content" className="p-6">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle>Prompt Content</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(samplePrompt.content, 'content')}>
                            {copiedStates.content ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                              {samplePrompt.content}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tags */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {samplePrompt.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Template Tab */}
                  <TabsContent value="template" className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Template</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          You can copy and customize this template as a starting point for your own prompt.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {samplePrompt.template}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Discussion Tab */}
                  <TabsContent value="discussion" className="p-6">
                    <div className="space-y-6">
                      {/* Feedback Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="flex items-center justify-center py-6">
                            <div className="text-center">
                              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <div className="text-2xl font-bold">
                                {feedbackStats.successRate}%
                              </div>
                              <div className="text-sm text-muted-foreground">Success Rate</div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="flex items-center justify-center py-6">
                            <div className="text-center">
                              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <div className="text-2xl font-bold">{feedbackStats.positive}</div>
                              <div className="text-sm text-muted-foreground">Positive</div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="flex items-center justify-center py-6">
                            <div className="text-center">
                              <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                              <div className="text-2xl font-bold">{feedbackStats.negative}</div>
                              <div className="text-sm text-muted-foreground">Negative</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Submit Feedback */}
                      {!feedbackSubmitted ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ThumbsUp className="h-5 w-5" />
                              Share Your Experience
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Help others by sharing how well this prompt worked for you
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">How well did this prompt work for you?</label>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant={feedbackRating === 'positive' ? 'default' : 'outline'}
                                  onClick={() => setFeedbackRating('positive')}
                                  className={feedbackRating === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Worked Well
                                </Button>
                                <Button
                                  variant={feedbackRating === 'negative' ? 'default' : 'outline'}
                                  onClick={() => setFeedbackRating('negative')}
                                  className={feedbackRating === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  Didn't Work
                                </Button>
                              </div>
                            </div>

                            <Button
                              onClick={handleSubmitFeedback}
                              disabled={!feedbackRating}
                            >
                              Submit Feedback
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">
                              Thank you for your feedback! You rated this prompt as{' '}
                              <strong>{feedbackRating === 'positive' ? 'working well' : 'not working well'}</strong>.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Comments ({sampleComments.length})</h3>
                        {sampleComments.map((comment) => (
                          <Card key={comment.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                  {comment.author.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      @{comment.author.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                    {comment.isEdited && (
                                      <Badge variant="outline" className="text-xs">Edited</Badge>
                                    )}
                                  </div>

                                  <p className="text-sm mb-2">{comment.content}</p>

                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Heart className="h-3 w-3 mr-1" />
                                      {comment.hearts}
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Demo */}
        <TabsContent value="interactive-demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Interactive Demo
              </CardTitle>
              <p className="text-muted-foreground">
                Test interactive components and user interactions.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Interactive demo coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsive Test */}
        <TabsContent value="responsive-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Responsive Test
              </CardTitle>
              <p className="text-muted-foreground">
                Test how components look across different screen sizes.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tablet className="h-4 w-4 mr-2" />
                    Tablet
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-center text-muted-foreground">
                    Resize your browser window to test responsiveness
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}