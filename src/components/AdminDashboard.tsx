import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { isAdmin } from '../lib/admin';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserManagement } from './admin/UserManagement';
import { ContentModeration } from './admin/ContentModeration';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { SystemSettings } from './admin/SystemSettings';
import { SubscriptionManagement } from './admin/SubscriptionManagement';
import { BulkOperations } from './admin/BulkOperations';
import { AdminBulkImport } from './AdminBulkImport';
import { Shield, Users, FileText, BarChart3, CreditCard } from 'lucide-react';

export function AdminDashboard() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your platform, users, content, and settings. No coding required.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="space-y-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subscriptions">Billing</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="bulk">
          <div className="space-y-6">
            <AdminBulkImport />
            <BulkOperations />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrompts: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Load overview stats
    loadOverviewStats();
  }, []);

  const loadOverviewStats = async () => {
    try {
      // This would fetch real stats from Supabase
      // For now, placeholder data
      setStats({
        totalUsers: 1250,
        totalPrompts: 3200,
        totalRevenue: 8750,
        activeSubscriptions: 89,
        activeUsers: 342
      });
    } catch (error) {
      console.error('Failed to load overview stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold">{stats.totalPrompts.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Prompts</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}