import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isAdmin } from '../../lib/admin';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart3, TrendingUp, Users, FileText, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  promptCreation: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  topCategories: { category: string; count: number }[];
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    totalPrompts: number;
    totalHearts: number;
    totalComments: number;
  };
}

export function AnalyticsDashboard() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access analytics.
          </p>
        </Card>
      </div>
    );
  }

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // This would fetch real analytics data from Supabase
      // For now, using mock data
      const mockData: AnalyticsData = {
        userGrowth: [
          { date: '2024-09-01', count: 10 },
          { date: '2024-09-08', count: 25 },
          { date: '2024-09-15', count: 45 },
          { date: '2024-09-22', count: 78 },
          { date: '2024-09-29', count: 112 },
        ],
        promptCreation: [
          { date: '2024-09-01', count: 5 },
          { date: '2024-09-08', count: 12 },
          { date: '2024-09-15', count: 28 },
          { date: '2024-09-22', count: 45 },
          { date: '2024-09-29', count: 67 },
        ],
        revenue: [
          { date: '2024-09-01', amount: 0 },
          { date: '2024-09-08', amount: 150 },
          { date: '2024-09-15', amount: 320 },
          { date: '2024-09-22', amount: 480 },
          { date: '2024-09-29', amount: 650 },
        ],
        topCategories: [
          { category: 'Business', count: 245 },
          { category: 'Creative', count: 189 },
          { category: 'Development', count: 156 },
          { category: 'Marketing', count: 134 },
          { category: 'Education', count: 98 },
        ],
        userEngagement: {
          totalUsers: 1250,
          activeUsers: 342,
          totalPrompts: 3200,
          totalHearts: 8750,
          totalComments: 2100,
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">Loading analytics...</div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">Failed to load analytics data</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Track your platform's growth, user engagement, and revenue.
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.userEngagement.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.userEngagement.totalPrompts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Prompts</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">${data.revenue[data.revenue.length - 1]?.amount.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{data.userEngagement.activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Latest: {data.userGrowth[data.userGrowth.length - 1]?.count || 0} users
                </p>
              </div>
            </div>
          </Card>

          {/* Prompt Creation Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prompt Creation</h3>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Latest: {data.promptCreation[data.promptCreation.length - 1]?.count || 0} prompts
                </p>
              </div>
            </div>
          </Card>

          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Latest: ${data.revenue[data.revenue.length - 1]?.amount || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-3">
              {data.topCategories.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span>{item.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.userEngagement.totalHearts.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Hearts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.userEngagement.totalComments.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Comments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.userEngagement.totalPrompts > 0
                  ? ((data.userEngagement.totalHearts / data.userEngagement.totalPrompts) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Hearts/Prompt</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {data.userEngagement.totalUsers > 0
                  ? ((data.userEngagement.activeUsers / data.userEngagement.totalUsers) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">User Activity Rate</p>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
}