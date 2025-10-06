import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { isAdmin } from '../../lib/admin';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Download, Send, Users, FileText, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function BulkOperations() {
  const { state } = useApp();
  const user = state.user;

  if (!isAdmin(user)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access bulk operations.
          </p>
        </Card>
      </div>
    );
  }

  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  const handleSendBulkEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast.error('Please fill in both subject and content');
      return;
    }

    if (selectedUserTypes.length === 0) {
      toast.error('Please select at least one user type');
      return;
    }

    try {
      setSendingEmail(true);
      // In a real implementation, this would send emails via a service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('Bulk email sent successfully');
      setEmailSubject('');
      setEmailContent('');
      setSelectedUserTypes([]);
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      toast.error('Failed to send bulk email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      setExportingData(true);
      // In a real implementation, this would fetch and export user data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Create mock CSV data
      const csvData = `email,full_name,subscription_plan,created_at,last_sign_in_at
user1@example.com,John Doe,pro,2024-01-01,2024-09-01
user2@example.com,Jane Smith,free,2024-02-01,2024-08-15
user3@example.com,Bob Johnson,pro,2024-03-01,2024-09-01`;

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('User data exported successfully');
    } catch (error) {
      console.error('Failed to export users:', error);
      toast.error('Failed to export user data');
    } finally {
      setExportingData(false);
    }
  };

  const handleExportPrompts = async () => {
    try {
      setExportingData(true);
      // In a real implementation, this would fetch and export prompt data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Create mock CSV data
      const csvData = `title,category,author,hearts,created_at
"Professional Email Generator","Business","John Doe",25,2024-01-01
"Code Review AI","Development","Jane Smith",18,2024-02-01
"Creative Writing Assistant","Creative","Bob Johnson",32,2024-03-01`;

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Prompt data exported successfully');
    } catch (error) {
      console.error('Failed to export prompts:', error);
      toast.error('Failed to export prompt data');
    } finally {
      setExportingData(false);
    }
  };

  const userTypeOptions = [
    { id: 'free', label: 'Free Users' },
    { id: 'pro', label: 'Pro Subscribers' },
    { id: 'inactive', label: 'Inactive Users (30+ days)' },
    { id: 'new', label: 'New Users (7 days)' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Bulk Operations</h2>
        <p className="text-muted-foreground mb-6">
          Perform bulk actions like sending emails, exporting data, and mass updates.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bulk Email */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Send Bulk Email</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <Label htmlFor="email-content">Content</Label>
                <Textarea
                  id="email-content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Enter email content..."
                  rows={6}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Send to:</Label>
                <div className="space-y-2 mt-2">
                  {userTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedUserTypes.includes(option.id)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedUserTypes([...selectedUserTypes, option.id]);
                          } else {
                            setSelectedUserTypes(selectedUserTypes.filter(type => type !== option.id));
                          }
                        }}
                      />
                      <Label htmlFor={option.id} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSendBulkEmail}
                disabled={sendingEmail}
                className="w-full"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Bulk Email
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Data Export */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Export Data</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Export Options:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Download your platform data as CSV files for analysis or backup.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExportUsers}
                  disabled={exportingData}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {exportingData ? 'Exporting...' : 'Export Users'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportPrompts}
                  disabled={exportingData}
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {exportingData ? 'Exporting...' : 'Export Prompts'}
                </Button>

                <Button
                  variant="outline"
                  disabled={exportingData}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Bulk Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2" />
              Bulk User Update
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              Bulk Prompt Update
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Send className="w-6 h-6 mb-2" />
              Send Notifications
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Additional bulk operations can be implemented based on your needs.
          </p>
        </Card>
      </Card>
    </div>
  );
}