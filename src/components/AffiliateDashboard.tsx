import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../contexts/AppContext';
import {
  BarChart3, TrendingUp, Users, DollarSign,
  Download, Share2, Mail, Image as ImageIcon,
  Award, Target, Zap, AlertCircle
} from 'lucide-react';

interface AffiliateStats {
  clicks: number;
  conversions: number;
  earnings: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  referrals: number;
  conversionRate: number;
}

interface MarketingMaterial {
  id: string;
  type: 'banner' | 'social' | 'email';
  title: string;
  description: string;
  url: string;
  preview: string;
}

export function AffiliateDashboard() {
  const { state } = useApp();

  // Mock affiliate data - in real app this would come from API
  const [stats] = useState<AffiliateStats>({
    clicks: 1247,
    conversions: 23,
    earnings: 345.67,
    tier: 'Silver',
    referrals: 18,
    conversionRate: 1.84
  });

  // Check if user is an affiliate
  if (!state.user?.isAffiliate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            <strong>Access Restricted</strong><br />
            You need to be an approved affiliate to access this dashboard.
            Please apply for the affiliate program first.
          </AlertDescription>
        </Alert>

        <div className="text-center mt-8">
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const [marketingMaterials] = useState<MarketingMaterial[]>([
    {
      id: '1',
      type: 'banner',
      title: '728x90 Banner',
      description: 'Perfect for websites and blogs',
      url: '#',
      preview: '📊 PromptsGo Banner'
    },
    {
      id: '2',
      type: 'social',
      title: 'Twitter Post Template',
      description: 'Ready-to-use social media content',
      url: '#',
      preview: '🐦 Share PromptsGo on Twitter'
    },
    {
      id: '3',
      type: 'email',
      title: 'Newsletter Template',
      description: 'Professional email marketing template',
      url: '#',
      preview: '📧 Email Newsletter Template'
    },
    {
      id: '4',
      type: 'banner',
      title: '300x250 Banner',
      description: 'Square banner for sidebars',
      url: '#',
      preview: '📱 PromptsGo Square Banner'
    }
  ]);

  const getTierProgress = () => {
    const { tier, referrals } = stats;
    if (tier === 'Bronze') {
      return { current: referrals, target: 10, nextTier: 'Silver' };
    } else if (tier === 'Silver') {
      return { current: referrals, target: 25, nextTier: 'Gold' };
    }
    return { current: referrals, target: 25, nextTier: 'Gold' };
  };

  const progress = getTierProgress();
  const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">
          Track your performance and access marketing materials to boost your earnings.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Marketing Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 z-0 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.clicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversions}</p>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.earnings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New referral signup</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Link clicked (3 times)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Commission earned: $15.00</span>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6 z-0 mt-6">
          {/* Marketing Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketingMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {material.type === 'banner' && <ImageIcon className="h-5 w-5 text-blue-600" />}
                    {material.type === 'social' && <Share2 className="h-5 w-5 text-green-600" />}
                    {material.type === 'email' && <Mail className="h-5 w-5 text-purple-600" />}
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{material.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm">{material.preview}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Affiliate Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Your Affiliate Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">
                    https://promptsgo.com/ref/your-affiliate-id
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          {/* Current Tier & Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Current Tier: {stats.tier}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Progress to {progress.nextTier}: {progress.current}/{progress.target} referrals
                  </span>
                  <Badge className={getTierColor(stats.tier)}>
                    {stats.tier}
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {progress.target - progress.current} more referrals to reach {progress.nextTier} tier
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.referrals}</div>
                  <div className="text-xs text-muted-foreground">Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.conversions}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</div>
                  <div className="text-xs text-muted-foreground">Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">${stats.earnings.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}