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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" defaultValue="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex">
                    <Input id="subdomain" defaultValue="acme" className="rounded-r-none" />
                    <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md">
                      <span className="text-sm text-muted-foreground">.clientsync.com</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell us about your organization..."
                  className="resize-none"
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="support@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://acme.com" />
              </div>
              <Button>Update Contact Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all organization members
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Single Sign-On (SSO)</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable SSO with your identity provider
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-[200px]">
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value="sk-1234567890abcdef..." 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div className="space-y-2">
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Control user access and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">
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
              
              <div className="space-y-2">
                <Label>Default User Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Invitation Link Expiry</Label>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-[200px]">
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

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Branding</CardTitle>
              <CardDescription>Customize the appearance of your chatbots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Custom Branding</Label>
                  <p className="text-sm text-muted-foreground">
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="#2563eb" className="w-24" />
                        <div className="w-10 h-10 bg-blue-600 rounded border"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="#64748b" className="w-24" />
                        <div className="w-10 h-10 bg-slate-500 rounded border"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Configure resource limits and quotas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Chatbots per User</Label>
                  <Input 
                    type="number" 
                    value={settings.maxChatbotsPerUser}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, maxChatbotsPerUser: parseInt(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label>Max File Size (MB)</Label>
                <Input 
                  type="number" 
                  value={settings.maxFileSize}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))
                  }
                  className="w-[200px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['PDF', 'TXT', 'CSV', 'DOCX', 'XLSX'].map((type) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
              
              <Button>Save Limits</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your chatbots via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New User Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new users join your organization
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Failed Conversations</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when chatbot can't answer questions
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input defaultValue="admin@acme.com" className="w-[300px]" />
              </div>
              
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}