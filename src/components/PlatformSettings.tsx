import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useApp } from '../contexts/AppContext';
import { admin as adminAPI } from '../lib/api';
import { isAdmin } from '../lib/admin';
import { Mail, Flag, Key, Webhook, Plus, Edit, Trash2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  type: 'welcome' | 'billing' | 'notification' | 'password_reset' | 'verification';
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  rollout_percentage: number;
  conditions: any;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  environment: 'development' | 'staging' | 'production';
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: any;
  is_active: boolean;
  environment: 'development' | 'staging' | 'production';
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export function PlatformSettings() {
  const { state } = useApp();
  const user = state.user;

  // State for data
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  // State for loading
  const [loading, setLoading] = useState(true);

  // State for dialogs
  const [emailTemplateDialog, setEmailTemplateDialog] = useState(false);
  const [featureFlagDialog, setFeatureFlagDialog] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [webhookDialog, setWebhookDialog] = useState(false);

  // State for editing
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [editingFeatureFlag, setEditingFeatureFlag] = useState<FeatureFlag | null>(null);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  // State for form data
  const [emailTemplateForm, setEmailTemplateForm] = useState({
    type: 'welcome' as EmailTemplate['type'],
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    variables: [] as string[]
  });

  const [featureFlagForm, setFeatureFlagForm] = useState({
    name: '',
    description: '',
    enabled: false,
    environment: 'production' as FeatureFlag['environment'],
    rollout_percentage: 100,
    conditions: {}
  });

  const [apiKeyForm, setApiKeyForm] = useState({
    name: '',
    permissions: [] as string[],
    environment: 'production' as ApiKey['environment'],
    expires_at: ''
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [] as string[],
    headers: {},
    environment: 'production' as Webhook['environment'],
    retry_count: 3,
    timeout_seconds: 30
  });

  // Load data on mount
  useEffect(() => {
    if (!isAdmin(user)) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [templatesResult, flagsResult, keysResult, webhooksResult] = await Promise.all([
          adminAPI.getEmailTemplates(),
          adminAPI.getFeatureFlags(),
          adminAPI.getApiKeys(),
          adminAPI.getWebhooks()
        ]);

        if (templatesResult.data) setEmailTemplates(templatesResult.data);
        if (flagsResult.data) setFeatureFlags(flagsResult.data);
        if (keysResult.data) setApiKeys(keysResult.data);
        if (webhooksResult.data) setWebhooks(webhooksResult.data);
      } catch (error) {
        console.error('Error loading platform settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Email Template handlers
  const handleCreateEmailTemplate = async () => {
    try {
      const result = await adminAPI.createEmailTemplate(emailTemplateForm);
      if (result.data) {
        setEmailTemplates([...emailTemplates, result.data]);
        setEmailTemplateDialog(false);
        resetEmailTemplateForm();
      }
    } catch (error) {
      console.error('Error creating email template:', error);
    }
  };

  const handleUpdateEmailTemplate = async () => {
    if (!editingEmailTemplate) return;

    try {
      const result = await adminAPI.updateEmailTemplate(editingEmailTemplate.id, emailTemplateForm);
      if (result.data) {
        setEmailTemplates(emailTemplates.map(t => t.id === editingEmailTemplate.id ? result.data : t));
        setEmailTemplateDialog(false);
        setEditingEmailTemplate(null);
        resetEmailTemplateForm();
      }
    } catch (error) {
      console.error('Error updating email template:', error);
    }
  };

  const handleDeleteEmailTemplate = async (id: string) => {
    try {
      await adminAPI.deleteEmailTemplate(id);
      setEmailTemplates(emailTemplates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting email template:', error);
    }
  };

  // Feature Flag handlers
  const handleCreateFeatureFlag = async () => {
    try {
      const result = await adminAPI.createFeatureFlag(featureFlagForm);
      if (result.data) {
        setFeatureFlags([...featureFlags, result.data]);
        setFeatureFlagDialog(false);
        resetFeatureFlagForm();
      }
    } catch (error) {
      console.error('Error creating feature flag:', error);
    }
  };

  const handleUpdateFeatureFlag = async () => {
    if (!editingFeatureFlag) return;

    try {
      const result = await adminAPI.updateFeatureFlag(editingFeatureFlag.id, featureFlagForm);
      if (result.data) {
        setFeatureFlags(featureFlags.map(f => f.id === editingFeatureFlag.id ? result.data : f));
        setFeatureFlagDialog(false);
        setEditingFeatureFlag(null);
        resetFeatureFlagForm();
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
    }
  };

  const handleDeleteFeatureFlag = async (id: string) => {
    try {
      await adminAPI.deleteFeatureFlag(id);
      setFeatureFlags(featureFlags.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting feature flag:', error);
    }
  };

  // API Key handlers
  const handleCreateApiKey = async () => {
    try {
      const result = await adminAPI.createApiKey(apiKeyForm);
      if (result.data) {
        setApiKeys([...apiKeys, result.data]);
        setApiKeyDialog(false);
        resetApiKeyForm();
        // Show the generated key to the user
        alert(`API Key created! Key: ${result.data.plain_key}\n\nSave this key securely - it will not be shown again.`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!editingApiKey) return;

    try {
      const result = await adminAPI.updateApiKey(editingApiKey.id, apiKeyForm);
      if (result.data) {
        setApiKeys(apiKeys.map(k => k.id === editingApiKey.id ? result.data : k));
        setApiKeyDialog(false);
        setEditingApiKey(null);
        resetApiKeyForm();
      }
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await adminAPI.deleteApiKey(id);
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  // Webhook handlers
  const handleCreateWebhook = async () => {
    try {
      const result = await adminAPI.createWebhook(webhookForm);
      if (result.data) {
        setWebhooks([...webhooks, result.data]);
        setWebhookDialog(false);
        resetWebhookForm();
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleUpdateWebhook = async () => {
    if (!editingWebhook) return;

    try {
      const result = await adminAPI.updateWebhook(editingWebhook.id, webhookForm);
      if (result.data) {
        setWebhooks(webhooks.map(w => w.id === editingWebhook.id ? result.data : w));
        setWebhookDialog(false);
        setEditingWebhook(null);
        resetWebhookForm();
      }
    } catch (error) {
      console.error('Error updating webhook:', error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await adminAPI.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  // Form reset functions
  const resetEmailTemplateForm = () => {
    setEmailTemplateForm({
      type: 'welcome',
      name: '',
      subject: '',
      html_content: '',
      text_content: '',
      variables: []
    });
  };

  const resetFeatureFlagForm = () => {
    setFeatureFlagForm({
      name: '',
      description: '',
      enabled: false,
      environment: 'production',
      rollout_percentage: 100,
      conditions: {}
    });
  };

  const resetApiKeyForm = () => {
    setApiKeyForm({
      name: '',
      permissions: [],
      environment: 'production',
      expires_at: ''
    });
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      name: '',
      url: '',
      events: [],
      headers: {},
      environment: 'production',
      retry_count: 3,
      timeout_seconds: 30
    });
  };

  // Edit handlers
  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setEditingEmailTemplate(template);
    setEmailTemplateForm({
      type: template.type,
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || '',
      variables: template.variables
    });
    setEmailTemplateDialog(true);
  };

  const handleEditFeatureFlag = (flag: FeatureFlag) => {
    setEditingFeatureFlag(flag);
    setFeatureFlagForm({
      name: flag.name,
      description: flag.description || '',
      enabled: flag.enabled,
      environment: flag.environment,
      rollout_percentage: flag.rollout_percentage,
      conditions: flag.conditions
    });
    setFeatureFlagDialog(true);
  };

  const handleEditApiKey = (key: ApiKey) => {
    setEditingApiKey(key);
    setApiKeyForm({
      name: key.name,
      permissions: key.permissions,
      environment: key.environment,
      expires_at: key.expires_at || ''
    });
    setApiKeyDialog(true);
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setWebhookForm({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      headers: webhook.headers || {},
      environment: webhook.environment,
      retry_count: webhook.retry_count,
      timeout_seconds: webhook.timeout_seconds
    });
    setWebhookDialog(true);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Manage email templates, feature flags, API keys, and webhooks</p>
        </div>
      </div>

      <Tabs defaultValue="email-templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="email-templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="feature-flags" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Email Templates Tab */}
        <TabsContent value="email-templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Dialog open={emailTemplateDialog} onOpenChange={setEmailTemplateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingEmailTemplate(null); resetEmailTemplateForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingEmailTemplate ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
                  <DialogDescription>
                    Configure email templates for different types of notifications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select value={emailTemplateForm.type} onValueChange={(value: EmailTemplate['type']) => setEmailTemplateForm({...emailTemplateForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="password_reset">Password Reset</SelectItem>
                          <SelectItem value="verification">Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template-name">Name</Label>
                      <Input
                        id="template-name"
                        value={emailTemplateForm.name}
                        onChange={(e) => setEmailTemplateForm({...emailTemplateForm, name: e.target.value})}
                        placeholder="Template name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={emailTemplateForm.subject}
                      onChange={(e) => setEmailTemplateForm({...emailTemplateForm, subject: e.target.value})}
                      placeholder="Email subject line"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-html">HTML Content</Label>
                    <Textarea
                      id="template-html"
                      value={emailTemplateForm.html_content}
                      onChange={(e) => setEmailTemplateForm({...emailTemplateForm, html_content: e.target.value})}
                      placeholder="HTML email content"
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-text">Text Content (Optional)</Label>
                    <Textarea
                      id="template-text"
                      value={emailTemplateForm.text_content}
                      onChange={(e) => setEmailTemplateForm({...emailTemplateForm, text_content: e.target.value})}
                      placeholder="Plain text version"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailTemplateDialog(false)}>Cancel</Button>
                  <Button onClick={editingEmailTemplate ? handleUpdateEmailTemplate : handleCreateEmailTemplate}>
                    {editingEmailTemplate ? 'Update' : 'Create'} Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Type: {template.type} | Subject: {template.subject}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditEmailTemplate(template)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this email template? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEmailTemplate(template.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Variables: {template.variables.join(', ') || 'None'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Feature Flags</h2>
            <Dialog open={featureFlagDialog} onOpenChange={setFeatureFlagDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingFeatureFlag(null); resetFeatureFlagForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature Flag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFeatureFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</DialogTitle>
                  <DialogDescription>
                    Control feature availability across different environments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="flag-name">Name</Label>
                    <Input
                      id="flag-name"
                      value={featureFlagForm.name}
                      onChange={(e) => setFeatureFlagForm({...featureFlagForm, name: e.target.value})}
                      placeholder="Feature flag name"
                      disabled={!!editingFeatureFlag}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flag-description">Description</Label>
                    <Textarea
                      id="flag-description"
                      value={featureFlagForm.description}
                      onChange={(e) => setFeatureFlagForm({...featureFlagForm, description: e.target.value})}
                      placeholder="Feature description"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flag-environment">Environment</Label>
                      <Select value={featureFlagForm.environment} onValueChange={(value: FeatureFlag['environment']) => setFeatureFlagForm({...featureFlagForm, environment: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="flag-percentage">Rollout Percentage</Label>
                      <Input
                        id="flag-percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={featureFlagForm.rollout_percentage}
                        onChange={(e) => setFeatureFlagForm({...featureFlagForm, rollout_percentage: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="flag-enabled"
                      checked={featureFlagForm.enabled}
                      onCheckedChange={(checked: boolean) => setFeatureFlagForm({...featureFlagForm, enabled: checked})}
                    />
                    <Label htmlFor="flag-enabled">Enabled</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFeatureFlagDialog(false)}>Cancel</Button>
                  <Button onClick={editingFeatureFlag ? handleUpdateFeatureFlag : handleCreateFeatureFlag}>
                    {editingFeatureFlag ? 'Update' : 'Create'} Feature Flag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {featureFlags.map((flag) => (
              <Card key={flag.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {flag.name}
                        <Badge variant={flag.enabled ? "default" : "secondary"}>
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge variant="outline">{flag.environment}</Badge>
                      </CardTitle>
                      <CardDescription>{flag.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditFeatureFlag(flag)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this feature flag? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFeatureFlag(flag.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Rollout: {flag.rollout_percentage}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <Dialog open={apiKeyDialog} onOpenChange={setApiKeyDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingApiKey(null); resetApiKeyForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingApiKey ? 'Edit API Key' : 'Create API Key'}</DialogTitle>
                  <DialogDescription>
                    Generate API keys for programmatic access to the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key-name">Name</Label>
                    <Input
                      id="key-name"
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm({...apiKeyForm, name: e.target.value})}
                      placeholder="API key name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key-environment">Environment</Label>
                    <Select value={apiKeyForm.environment} onValueChange={(value: ApiKey['environment']) => setApiKeyForm({...apiKeyForm, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="key-permissions">Permissions</Label>
                    <Input
                      id="key-permissions"
                      value={apiKeyForm.permissions.join(', ')}
                      onChange={(e) => setApiKeyForm({...apiKeyForm, permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)})}
                      placeholder="Comma-separated permissions (e.g., read:prompts, write:prompts)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key-expires">Expires At (Optional)</Label>
                    <Input
                      id="key-expires"
                      type="datetime-local"
                      value={apiKeyForm.expires_at}
                      onChange={(e) => setApiKeyForm({...apiKeyForm, expires_at: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setApiKeyDialog(false)}>Cancel</Button>
                  <Button onClick={editingApiKey ? handleUpdateApiKey : handleCreateApiKey}>
                    {editingApiKey ? 'Update' : 'Create'} API Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {key.name}
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{key.environment}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && ` | Last used: ${new Date(key.last_used_at).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditApiKey(key)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteApiKey(key.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Permissions: {key.permissions.join(', ') || 'None'}
                    {key.expires_at && ` | Expires: ${new Date(key.expires_at).toLocaleDateString()}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Webhooks</h2>
            <Dialog open={webhookDialog} onOpenChange={setWebhookDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingWebhook(null); resetWebhookForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
                  <DialogDescription>
                    Configure webhooks to receive real-time notifications about platform events.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-name">Name</Label>
                    <Input
                      id="webhook-name"
                      value={webhookForm.name}
                      onChange={(e) => setWebhookForm({...webhookForm, name: e.target.value})}
                      placeholder="Webhook name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">URL</Label>
                    <Input
                      id="webhook-url"
                      value={webhookForm.url}
                      onChange={(e) => setWebhookForm({...webhookForm, url: e.target.value})}
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-environment">Environment</Label>
                    <Select value={webhookForm.environment} onValueChange={(value: Webhook['environment']) => setWebhookForm({...webhookForm, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="webhook-events">Events</Label>
                    <Input
                      id="webhook-events"
                      value={webhookForm.events.join(', ')}
                      onChange={(e) => setWebhookForm({...webhookForm, events: e.target.value.split(',').map(e => e.trim()).filter(e => e)})}
                      placeholder="Comma-separated events (e.g., user_created, prompt_created)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webhook-retries">Retry Count</Label>
                      <Input
                        id="webhook-retries"
                        type="number"
                        min="0"
                        max="10"
                        value={webhookForm.retry_count}
                        onChange={(e) => setWebhookForm({...webhookForm, retry_count: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                      <Input
                        id="webhook-timeout"
                        type="number"
                        min="1"
                        max="300"
                        value={webhookForm.timeout_seconds}
                        onChange={(e) => setWebhookForm({...webhookForm, timeout_seconds: parseInt(e.target.value) || 30})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWebhookDialog(false)}>Cancel</Button>
                  <Button onClick={editingWebhook ? handleUpdateWebhook : handleCreateWebhook}>
                    {editingWebhook ? 'Update' : 'Create'} Webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {webhook.name}
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{webhook.environment}</Badge>
                      </CardTitle>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditWebhook(webhook)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this webhook? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWebhook(webhook.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Events: {webhook.events.join(', ') || 'None'} |
                    Retries: {webhook.retry_count} |
                    Timeout: {webhook.timeout_seconds}s
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}