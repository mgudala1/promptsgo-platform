import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useApp } from '../contexts/AppContext';
import {
  ArrowLeft, User, CreditCard, Shield,
  Globe, Github, Twitter, Crown, ExternalLink
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  onNavigateToSubscription?: () => void;
  onNavigateToBilling?: () => void;
}

export function SettingsPage({ onBack, onNavigateToSubscription, onNavigateToBilling }: SettingsPageProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    username: state.user?.username || '',
    email: state.user?.email || '',
    bio: state.user?.bio || '',
    website: state.user?.website || '',
    github: state.user?.github || '',
    twitter: state.user?.twitter || '',
    skills: state.user?.skills?.join(', ') || ''
  });


  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please sign in to access settings</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const updatedUser = {
      ...state.user!,
      name: formData.name,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      website: formData.website,
      github: formData.github,
      twitter: formData.twitter,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: state.user?.name || '',
      username: state.user?.username || '',
      email: state.user?.email || '',
      bio: state.user?.bio || '',
      website: state.user?.website || '',
      github: state.user?.github || '',
      twitter: state.user?.twitter || '',
      skills: state.user?.skills?.join(', ') || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Links</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="github-username"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="twitter-handle"
                      value={formData.twitter}
                      onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="AI, Machine Learning, Writing..."
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                {state.user.subscriptionPlan === 'pro' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">
                      {state.user.subscriptionPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {state.user.subscriptionPlan === 'pro' 
                        ? '$7.99/month - Advanced features included'
                        : 'Basic features only'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {state.user.subscriptionPlan === 'pro' ? '$7.99' : 'Free'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {state.user.subscriptionPlan === 'pro' ? 'per month' : ''}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Saves per month</span>
                    <span>{state.user.subscriptionPlan === 'pro' ? 'Unlimited' : '10'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Forks per month</span>
                    <span>{state.user.subscriptionPlan === 'pro' ? 'Unlimited' : '5'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Export collections</span>
                    <span>{state.user.subscriptionPlan === 'pro' ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>API Access</span>
                    <span>{state.user.subscriptionPlan === 'pro' ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {state.user.subscriptionPlan === 'free' ? (
                    <Button className="w-full" onClick={onNavigateToSubscription}>
                      Upgrade to Pro
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={onNavigateToBilling}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing & Subscription
                      </Button>
                      {state.user.isAdmin && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            👑 <strong>Admin Note:</strong> You have Pro features automatically. Billing page shows UI demo.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={onNavigateToSubscription}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View all plans & pricing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Data & Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Profile Visibility</div>
                      <div className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Activity Tracking</div>
                      <div className="text-sm text-muted-foreground">
                        Help improve the platform with usage analytics
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Export Data</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Download a copy of all your data
                      </p>
                      <Button variant="outline" size="sm">
                        Request Export
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="font-medium text-destructive">Delete Account</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Permanently delete your account and all associated data
                      </p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        Feature coming soon 
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}