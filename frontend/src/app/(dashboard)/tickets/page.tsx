'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Download, HelpCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TicketsTable } from '@/components/tables/tickets-table';

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track customer support requests
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Tickets</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Open</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Being resolved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">1,002</div>
              <p className="text-xs text-muted-foreground">80.3% resolution rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <TicketsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets Assigned to You</CardTitle>
              <CardDescription>Support tickets that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'TICK-001',
                    title: 'Chatbot not responding to queries',
                    priority: 'high',
                    status: 'in-progress',
                    customer: 'John Doe',
                    updated: '2 hours ago'
                  },
                  {
                    id: 'TICK-002',
                    title: 'Unable to upload training files',
                    priority: 'medium',
                    status: 'open',
                    customer: 'Jane Smith',
                    updated: '4 hours ago'
                  }
                ].map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{ticket.id}</span>
                          <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{ticket.customer}</p>
                      <p className="text-xs text-muted-foreground">{ticket.updated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Tickets</CardTitle>
              <CardDescription>Support tickets waiting to be assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No unassigned tickets</h3>
                <p className="text-muted-foreground">All tickets have been assigned to team members.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Tickets</CardTitle>
              <CardDescription>High priority tickets requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">System outage affecting all chatbots</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">TICK-003</span>
                        <Badge variant="destructive">urgent</Badge>
                        <Badge variant="outline">open</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Enterprise Customer</p>
                    <p className="text-xs text-muted-foreground">30 minutes ago</p>
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