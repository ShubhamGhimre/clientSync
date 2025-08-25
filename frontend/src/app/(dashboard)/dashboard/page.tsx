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
  BarChart3,
  Sparkles,
  ChevronRight
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-slate-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="space-y-8  ">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl -m-4"></div>
          <div className="relative flex items-center justify-between p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {displayUser?.firstName}!
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Here's what's happening with your AI platform today.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(isAdmin || isAgent) && (
                <Link href="/chatbots/create">
                  <Button size="lg" className="shadow-lg shadow-blue-600/25 bg-blue-600 hover:bg-blue-700 border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chatbot
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Active Chatbots</CardTitle>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">{activeChatBots}</div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <p className="text-sm text-slate-600">AI assistants running</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Conversations</CardTitle>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">{totalConversations}</div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Growing
                </Badge>
                <p className="text-sm text-slate-600">Total chat sessions</p>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Team Members</CardTitle>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-slate-900">{activeUsers}</div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                  <p className="text-sm text-slate-600">Active users</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Support Tickets</CardTitle>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
                <HelpCircle className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-slate-900">{openTickets}</div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingTickets} pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                Conversation Analytics
              </CardTitle>
              <CardDescription className="text-slate-600">
                Chat volume and response metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart type="conversations" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-600">Latest interactions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentChatRooms && recentChatRooms.length > 0 ? (
                recentChatRooms.map((room: ApiChatRoom) => (
                  <div key={room.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {room.id ? `Chat Room ${room.id.slice(-6)}` : 'Chat Room'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs">
                      Active
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-slate-100 mb-3">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No recent conversations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  Recent Support Tickets
                </CardTitle>
                <Link href="/tickets">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTickets && recentTickets.length > 0 ? (
                recentTickets.map((ticket: Ticket) => (
                  <div key={ticket.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm">
                        {ticket.status === 'OPEN' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        {ticket.status === 'IN_PROGRESS' && <Clock className="h-4 w-4 text-blue-500" />}
                        {ticket.status === 'RESOLVED' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{ticket.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-slate-100 mb-3">
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No recent tickets</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">Quick Actions</CardTitle>
              <CardDescription className="text-slate-600">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(isAdmin || isAgent) && (
                <Link href="/chatbots/create">
                  <Button variant="ghost" className="w-full justify-between h-auto p-4 hover:bg-slate-50 group border border-slate-100 hover:border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Plus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">Create New Chatbot</p>
                        <p className="text-xs text-slate-500">Build an AI assistant</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  </Button>
                </Link>
              )}
              
              <Link href="/training">
                <Button variant="ghost" className="w-full justify-between h-auto p-4 hover:bg-slate-50 group border border-slate-100 hover:border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                      <FileText className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Upload Training Data</p>
                      <p className="text-xs text-slate-500">Improve AI knowledge</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button variant="ghost" className="w-full justify-between h-auto p-4 hover:bg-slate-50 group border border-slate-100 hover:border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <BarChart3 className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">View Analytics</p>
                      <p className="text-xs text-slate-500">Performance insights</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </Button>
              </Link>
              
              {isAdmin && (
                <Link href="/users">
                  <Button variant="ghost" className="w-full justify-between h-auto p-4 hover:bg-slate-50 group border border-slate-100 hover:border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <Users className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">Manage Team</p>
                        <p className="text-xs text-slate-500">User administration</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}