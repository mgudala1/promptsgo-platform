import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import { Users, FileText, TrendingUp, DollarSign, AlertTriangle, Download, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

interface DashboardMetrics {
  totalUsers: number;
  totalPrompts: number;
  avgSuccessRate: number;
  monthlyRevenue: number;
}

interface TrendData {
  userSignups: { date: string; count: number }[];
  promptCreations: { date: string; count: number }[];
  successVotes: { date: string; count: number }[];
}

interface AlertsData {
  moderationQueue: number;
  failedPayments: number;
  systemErrors: number;
}

export function AdminDashboard() {
  const { state } = useApp();
  const user = state.user;
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!isAdmin(user)) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [metricsResult, trendsResult, alertsResult] = await Promise.all([
          adminAPI.getDashboardMetrics(),
          adminAPI.getMetricsTrends(dateRange),
          adminAPI.getAlerts()
        ]);

        if (metricsResult.data) setMetrics(metricsResult.data);
        if (trendsResult.data) setTrends(trendsResult.data);
        if (alertsResult.data) setAlerts(alertsResult.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, dateRange]);

  const exportToCSV = () => {
    if (!metrics || !trends || !alerts) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', metrics.totalUsers],
      ['Total Prompts', metrics.totalPrompts],
      ['Average Success Rate', `${metrics.avgSuccessRate}%`],
      ['Monthly Revenue', `$${metrics.monthlyRevenue}`],
      ['Moderation Queue', alerts.moderationQueue],
      ['Failed Payments', alerts.failedPayments],
      ['System Errors', alerts.systemErrors],
      [],
      ['Date', 'User Signups', 'Prompt Creations', 'Success Votes']
    ];

    // Combine all trend data by date
    const allDates = new Set([
      ...trends.userSignups.map(d => d.date),
      ...trends.promptCreations.map(d => d.date),
      ...trends.successVotes.map(d => d.date)
    ]);

    Array.from(allDates).sort().forEach(date => {
      const userCount = trends.userSignups.find(d => d.date === date)?.count || 0;
      const promptCount = trends.promptCreations.find(d => d.date === date)?.count || 0;
      const successCount = trends.successVotes.find(d => d.date === date)?.count || 0;
      csvData.push([date, userCount, promptCount, successCount]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const chartConfig = {
    users: { label: 'Users', color: 'hsl(var(--chart-1))' },
    prompts: { label: 'Prompts', color: 'hsl(var(--chart-2))' },
    success: { label: 'Success Votes', color: 'hsl(var(--chart-3))' }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPrompts.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Published prompts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgSuccessRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Hearts + saves per view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.monthlyRevenue.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Sign-ups</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trends?.userSignups || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-users)' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Creations</CardTitle>
            <CardDescription>New prompts created over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={trends?.promptCreations || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-prompts)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Success Votes Trend</CardTitle>
            <CardDescription>Hearts and saves over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trends?.successVotes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-success)' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
          </CardTitle>
          <CardDescription>Items requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Moderation Queue</p>
                <p className="text-sm text-muted-foreground">Unlisted prompts</p>
              </div>
              <Badge variant={alerts?.moderationQueue ? "destructive" : "secondary"}>
                {alerts?.moderationQueue || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Failed Payments</p>
                <p className="text-sm text-muted-foreground">Past due subscriptions</p>
              </div>
              <Badge variant={alerts?.failedPayments ? "destructive" : "secondary"}>
                {alerts?.failedPayments || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">System Errors</p>
                <p className="text-sm text-muted-foreground">Recent errors</p>
              </div>
              <Badge variant={alerts?.systemErrors ? "destructive" : "secondary"}>
                {alerts?.systemErrors || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}