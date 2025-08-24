'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  HelpCircle, 
  TrendingUp, 
  Activity,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3
} from 'lucide-react';

import { useDisplayUser } from '@/hooks/useDisplayUser';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { MetricsCard } from '@/components/charts/metrics-card';
import Link from 'next/link';
import { useChatBots } from '@/hooks/api/useChatBots';

import { useChatRooms } from '@/hooks/api/useChatRooms';
import { useUsers } from '@/hooks/api/useUsers';
import { useSupportTickets } from '@/hooks/api/useSupportTickets';


// Use types from API hooks if available
import type { ChatRoom as ApiChatRoom } from '@/hooks/api/useChatRooms';
// Local Ticket type (since not exported from API)
type Ticket = {
  id: string;
  subject: string;
  priority: string;
  status: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const { displayUser } = useDisplayUser();
  
  // Fetch data using hooks
  const { data: chatBots, isLoading: chatBotsLoading } = useChatBots();
  const { data: chatRoomsRaw, isLoading: chatRoomsLoading } = useChatRooms();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 10 });
  const { data: ticketsDataRaw, isLoading: ticketsLoading } = useSupportTickets({ limit: 10 });

  // Defensive: ensure arrays and types
  const chatRooms: ApiChatRoom[] = Array.isArray(chatRoomsRaw) ? chatRoomsRaw : [];
  const ticketsData: { tickets: Ticket[] } =
    ticketsDataRaw && typeof ticketsDataRaw === 'object' &&
    'tickets' in ticketsDataRaw &&
    Array.isArray((ticketsDataRaw as any).tickets)
      ? (ticketsDataRaw as { tickets: Ticket[] })
      : { tickets: [] };

  const isAdmin = displayUser?.role === 'ADMIN';
  const isAgent = displayUser?.role === 'AGENT';

  // Calculate metrics
  const activeChatBots = Array.isArray(chatBots) ? chatBots.filter((bot: any) => bot.isKnowledgeInitialized).length : 0;
  const totalConversations = chatRooms.length;
  const activeUsers = Array.isArray(usersData?.data) ? usersData.data.length : 0;
  const openTickets = ticketsData.tickets.filter((ticket: Ticket) => ticket.status === 'OPEN').length;
  const pendingTickets = ticketsData.tickets.filter((ticket: Ticket) => ticket.status === 'PENDING').length;

  // Recent activity data
  const recentTickets: Ticket[] = ticketsData.tickets.slice(0, 5);
  const recentChatRooms: ApiChatRoom[] = chatRooms.slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayUser?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your AI platform today.
          </p>
        </div>
        <div className="flex gap-2">
          {(isAdmin || isAgent) && (
            <Link href="/chatbots/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Chatbot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Active Chatbots"
          value={String(activeChatBots)}
          description="AI assistants running"
          icon={Bot}
          trend="up" change={''}        />
        <MetricsCard
          title="Conversations"
          value={String(totalConversations)}
          description="Total chat sessions"
          icon={MessageSquare}
          trend="up" change={''}        />
        {isAdmin && (
          <MetricsCard
            title="Team Members"
            value={String(activeUsers)}
            description="Active users"
            icon={Users}
            trend="up" change={''}          />
        )}
        <MetricsCard
          title="Support Tickets"
          value={String(openTickets)}
          description={`${pendingTickets} pending`}
          icon={HelpCircle}
          trend="down" change={''}        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversation Analytics
            </CardTitle>
            <CardDescription>
              Chat volume and response metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart type="conversations" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentChatRooms && recentChatRooms.length > 0 ? (
              recentChatRooms.map((room: ApiChatRoom) => (
                <div key={room.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {room.id ? `Chat Room ${room.id.slice(-6)}` : 'Chat Room'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent conversations
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets and Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Recent Support Tickets
              </span>
              <Link href="/tickets">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTickets && recentTickets.length > 0 ? (
              recentTickets.map((ticket: Ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {ticket.status === 'OPEN' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    {ticket.status === 'IN_PROGRESS' && <Clock className="h-4 w-4 text-blue-500" />}
                    {/* {ticket.status === 'RESOLVED' && <CheckCircle className="h-4 w-4 text-green-500" />} */}
                    <div>
                      <p className="text-sm font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.priority} • {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={ticket.status === 'OPEN' ? 'destructive' : 
                            ticket.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent tickets
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(isAdmin || isAgent) && (
              <Link href="/chatbots/create">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Chatbot
                </Button>
              </Link>
            )}
            
            <Link href="/training">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Upload Training Data
              </Button>
            </Link>
            
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            
            {isAdmin && (
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

