'use client';

import { useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SecondaryActionButton,
} from '@/components/page-kits';
import { TableShell } from '@/components/tables/table-kits';

const inputClass =
  'h-8 rounded-full border border-border/70 bg-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/25';
const labelClass = 'mb-1.5 block text-xs font-medium text-foreground';
const textareaClass =
  'min-h-[96px] w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/25';

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/50 last:border-b-0">
      <div className="border-b border-border/60 px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
    </section>
  );
}

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
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your organization settings and preferences"
      />

      <Tabs defaultValue="general" className="flex w-full flex-col gap-4">
        <TabsList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="Organization Details"
              description="Basic information about your organization"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="orgName" className={labelClass}>
                    Organization Name
                  </Label>
                  <Input id="orgName" defaultValue="Acme Corporation" className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subdomain" className={labelClass}>
                    Subdomain
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="subdomain" className={inputClass} defaultValue="acme" />
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      .clientsync.com
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className={labelClass}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your organization..."
                  className={textareaClass}
                  rows={3}
                />
              </div>
              <div>
                <PrimaryActionButton>Save Changes</PrimaryActionButton>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Contact Information"
              description="How customers can reach you"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className={labelClass}>
                    Contact Email
                  </Label>
                  <Input id="email" type="email" defaultValue="support@acme.com" className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" className={inputClass} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="website" className={labelClass}>
                  Website
                </Label>
                <Input id="website" defaultValue="https://acme.com" className={inputClass} />
              </div>
              <div>
                <PrimaryActionButton>Update Contact Info</PrimaryActionButton>
              </div>
            </SettingsSection>
          </TableShell>
        </TabsContent>

        <TabsContent value="security" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="Authentication Settings"
              description="Configure security and access controls"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className={labelClass}>Two-Factor Authentication</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Require 2FA for all organization members
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className={labelClass}>Single Sign-On (SSO)</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Enable SSO with your identity provider
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">Coming Soon</Badge>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label className={labelClass}>Session Timeout</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className={inputClass}>
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
            </SettingsSection>

            <SettingsSection
              title="API Access"
              description="Manage API keys and webhooks"
            >
              <div className="flex flex-col gap-2">
                <Label className={labelClass}>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value="sk-1234567890abcdef..."
                    readOnly
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <SecondaryActionButton>Regenerate</SecondaryActionButton>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook" className={labelClass}>
                  Webhook URL
                </Label>
                <Input
                  id="webhook"
                  placeholder="https://your-app.com/webhooks/clientsync"
                  className={inputClass}
                />
              </div>
              <div>
                <PrimaryActionButton>Save API Settings</PrimaryActionButton>
              </div>
            </SettingsSection>
          </TableShell>
        </TabsContent>

        <TabsContent value="users" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="User Management"
              description="Control user access and permissions"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className={labelClass}>Allow User Registration</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
                <Label className={labelClass}>Default User Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger className={inputClass}>
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
                <Label className={labelClass}>Invitation Link Expiry</Label>
                <Select defaultValue="7d">
                  <SelectTrigger className={inputClass}>
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
            </SettingsSection>
          </TableShell>
        </TabsContent>

        <TabsContent value="branding" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="Custom Branding"
              description="Customize the appearance of your chatbots"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className={labelClass}>Enable Custom Branding</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
                      <Label className={labelClass}>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input defaultValue="#2563eb" className={inputClass} />
                        <span className="size-6 shrink-0 rounded-lg bg-primary" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className={labelClass}>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input defaultValue="#64748b" className={inputClass} />
                        <span className="size-6 shrink-0 rounded-lg bg-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className={labelClass}>Logo Upload</Label>
                    <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border/70 bg-background/50 px-4 py-5">
                      <p className="text-xs text-muted-foreground">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <SecondaryActionButton>Choose File</SecondaryActionButton>
                    </div>
                  </div>
                </>
              )}
            </SettingsSection>
          </TableShell>
        </TabsContent>

        <TabsContent value="limits" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="Usage Limits"
              description="Configure resource limits and quotas"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>Max Chatbots per User</Label>
                  <Input
                    type="number"
                    className={inputClass}
                    value={settings.maxChatbotsPerUser}
                    onChange={(e) =>
                      setSettings(prev => ({ ...prev, maxChatbotsPerUser: parseInt(e.target.value) }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>Max Files per Chatbot</Label>
                  <Input
                    type="number"
                    className={inputClass}
                    value={settings.maxFilesPerChatbot}
                    onChange={(e) =>
                      setSettings(prev => ({ ...prev, maxFilesPerChatbot: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className={labelClass}>Max File Size (MB)</Label>
                <Input
                  type="number"
                  className={inputClass}
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className={labelClass}>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['PDF', 'TXT', 'CSV', 'DOCX', 'XLSX'].map((type) => (
                    <Badge key={type} variant="secondary" className="rounded-full">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <PrimaryActionButton>Save Limits</PrimaryActionButton>
              </div>
            </SettingsSection>
          </TableShell>
        </TabsContent>

        <TabsContent value="notifications" className="flex flex-col gap-4">
          <TableShell>
            <SettingsSection
              title="Notification Preferences"
              description="Choose what notifications you want to receive"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className={labelClass}>Email Notifications</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Receive updates about your chatbots via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className={labelClass}>New User Registrations</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Get notified when new users join your organization
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className={labelClass}>Failed Conversations</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Alert when chatbot can't answer questions
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className={labelClass}>Weekly Reports</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label className={labelClass}>Notification Email</Label>
                <Input defaultValue="admin@acme.com" className={inputClass} />
              </div>

              <div>
                <PrimaryActionButton>Save Preferences</PrimaryActionButton>
              </div>
            </SettingsSection>
          </TableShell>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
