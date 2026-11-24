'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Globe, Palette, Users, Bell, Database } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    allowUserRegistration: true,
    maxChatbotsPerUser: 5,
    maxFilesPerChatbot: 50,
    maxFileSize: 10,
    customBranding: false,
    customDomain: '',
  });

  return (
    <div className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your organization settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="stack">
        <TabsList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" defaultValue="Acme Corporation" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="input-group">
                    <Input id="subdomain" className="input" defaultValue="acme" />
                    <div className="input-addon">.clientsync.com</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your organization..."
                  className="textarea"
                  rows={3}
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="support@acme.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://acme.com" />
              </div>
              <Button>Update Contact Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground space-t-0.5">
                    Require 2FA for all organization members
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Single Sign-On (SSO)</Label>
                  <p className="text-sm text-muted-foreground space-t-0.5">
                    Enable SSO with your identity provider
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>Session Timeout</Label>
                <Select defaultValue="24h">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage API keys and webhooks</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="flex flex-col gap-2">
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value="sk-1234567890abcdef..."
                    readOnly
                    className="text-sm"
                  />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  placeholder="https://your-app.com/webhooks/clientsync"
                />
              </div>
              <Button>Save API Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Control user access and permissions</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground space-t-0.5">
                    Let users sign up for your organization
                  </p>
                </div>
                <Switch
                  checked={settings.allowUserRegistration}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, allowUserRegistration: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>Default User Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Invitation Link Expiry</Label>
                <Select defaultValue="7d">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="3d">3 days</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Custom Branding</CardTitle>
              <CardDescription>Customize the appearance of your chatbots</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Custom Branding</Label>
                  <p className="text-sm text-muted-foreground space-t-0.5">
                    Use your own colors and logo
                  </p>
                </div>
                <Switch
                  checked={settings.customBranding}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, customBranding: checked }))
                  }
                />
              </div>

              {settings.customBranding && (
                <>
                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input defaultValue="#2563eb" />
                        <div className="doc-icon bg-brand"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input defaultValue="#64748b" />
                        <div className="doc-icon bg-muted-foreground"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Logo Upload</Label>
                    <div className="dropzone">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <Button variant="outline" className="mt-2">Choose File</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Configure resource limits and quotas</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Max Chatbots per User</Label>
                  <Input
                    type="number"
                    value={settings.maxChatbotsPerUser}
                    onChange={(e) =>
                      setSettings(prev => ({ ...prev, maxChatbotsPerUser: parseInt(e.target.value) }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Max Files per Chatbot</Label>
                  <Input
                    type="number"
                    value={settings.maxFilesPerChatbot}
                    onChange={(e) =>
                      setSettings(prev => ({ ...prev, maxFilesPerChatbot: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Allowed File Types</Label>
                <div className="cluster">
                  {['PDF', 'TXT', 'CSV', 'DOCX', 'XLSX'].map((type) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>

              <Button>Save Limits</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="stack">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground space-t-0.5">
                      Receive updates about your chatbots via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New User Registrations</Label>
                    <p className="text-sm text-muted-foreground space-t-0.5">
                      Get notified when new users join your organization
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Failed Conversations</Label>
                    <p className="text-sm text-muted-foreground space-t-0.5">
                      Alert when chatbot can't answer questions
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground space-t-0.5">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>Notification Email</Label>
                <Input defaultValue="admin@acme.com" />
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
