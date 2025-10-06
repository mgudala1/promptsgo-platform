import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isAdmin } from '../../lib/admin';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Settings, Save, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfig {
  site_name: string;
  site_description: string;
  max_prompts_per_user: number;
  max_saves_per_free_user: number;
  max_forks_per_free_user: number;
  invite_required: boolean;
  auto_approve_affiliates: boolean;
  moderation_enabled: boolean;
  analytics_enabled: boolean;
  email_notifications: boolean;
}

export function SystemSettings() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access system settings.
          </p>
        </Card>
      </div>
    );
  }

  const [config, setConfig] = useState<SystemConfig>({
    site_name: 'PromptsGo',
    site_description: 'Professional AI Prompt Management Platform',
    max_prompts_per_user: 1000,
    max_saves_per_free_user: 10,
    max_forks_per_free_user: 3,
    invite_required: true,
    auto_approve_affiliates: false,
    moderation_enabled: true,
    analytics_enabled: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would load from a settings table
      // For now, using default values
      console.log('Loading system settings...');
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real implementation, this would save to a settings table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-bold">System Settings</h2>
            <p className="text-muted-foreground">
              Configure platform-wide settings, limits, and feature flags.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Site Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Site Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={config.site_name}
                  onChange={(e) => updateConfig('site_name', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={config.site_description}
                  onChange={(e) => updateConfig('site_description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* User Limits */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_prompts">Max Prompts per User</Label>
                <Input
                  id="max_prompts"
                  type="number"
                  value={config.max_prompts_per_user}
                  onChange={(e) => updateConfig('max_prompts_per_user', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_saves">Max Saves (Free Users)</Label>
                <Input
                  id="max_saves"
                  type="number"
                  value={config.max_saves_per_free_user}
                  onChange={(e) => updateConfig('max_saves_per_free_user', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_forks">Max Forks (Free Users)</Label>
                <Input
                  id="max_forks"
                  type="number"
                  value={config.max_forks_per_free_user}
                  onChange={(e) => updateConfig('max_forks_per_free_user', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Feature Flags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="invite_required">Invite Required for Signup</Label>
                  <p className="text-sm text-muted-foreground">
                    Require invite codes for new user registration
                  </p>
                </div>
                <Switch
                  id="invite_required"
                  checked={config.invite_required}
                  onCheckedChange={(checked: boolean) => updateConfig('invite_required', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_approve_affiliates">Auto-Approve Affiliates</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve affiliate applications
                  </p>
                </div>
                <Switch
                  id="auto_approve_affiliates"
                  checked={config.auto_approve_affiliates}
                  onCheckedChange={(checked: boolean) => updateConfig('auto_approve_affiliates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moderation_enabled">Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable prompt review and approval system
                  </p>
                </div>
                <Switch
                  id="moderation_enabled"
                  checked={config.moderation_enabled}
                  onCheckedChange={(checked: boolean) => updateConfig('moderation_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics_enabled">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable user behavior and platform analytics
                  </p>
                </div>
                <Switch
                  id="analytics_enabled"
                  checked={config.analytics_enabled}
                  onCheckedChange={(checked: boolean) => updateConfig('analytics_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automated emails for important events
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={config.email_notifications}
                  onCheckedChange={(checked: boolean) => updateConfig('email_notifications', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Settings Preview</h3>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">
            <strong>Site:</strong> {config.site_name} - {config.site_description}
          </p>
          <p className="text-sm mt-2">
            <strong>Limits:</strong> {config.max_prompts_per_user} prompts/user,
            {config.max_saves_per_free_user} saves for free users,
            {config.max_forks_per_free_user} forks for free users
          </p>
          <p className="text-sm mt-2">
            <strong>Features:</strong>
            {config.invite_required && ' Invites required,'}
            {config.auto_approve_affiliates && ' Auto-approve affiliates,'}
            {config.moderation_enabled && ' Moderation enabled,'}
            {config.analytics_enabled && ' Analytics enabled,'}
            {config.email_notifications && ' Email notifications enabled'}
          </p>
        </div>
      </Card>
    </div>
  );
}