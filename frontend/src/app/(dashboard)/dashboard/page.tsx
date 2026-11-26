'use client';

import Link from 'next/link';
import {
  Bot,
  MessageSquare,
  Users,
  HelpCircle,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
} from 'lucide-react';

import { useDisplayUser } from '@/hooks/useDisplayUser';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { useChatBots } from '@/hooks/api/useChatBots';
import { useChatRooms } from '@/hooks/api/useChatRooms';
import { useUsers } from '@/hooks/api/useUsers';
import { useSupportTickets } from '@/hooks/api/useSupportTickets';
import type { ChatRoom as ApiChatRoom } from '@/hooks/api/useChatRooms';
import {
  ListPanel,
  ListRow,
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SecondaryActionButton,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import {
  EmptyState,
  IconTile,
  StatusPill,
  TableShell,
  TableToolbar,
} from '@/components/tables/table-kits';

type Ticket = {
  id: string;
  subject: string;
  priority: string;
  status: string;
  createdAt?: string;
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent: 'font-medium text-destructive',
  high: 'font-medium text-destructive',
  medium: 'font-medium text-chart-5',
  low: 'text-muted-foreground',
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'OPEN':
      return <AlertCircle className="size-4 shrink-0 text-chart-4" />;
    case 'IN_PROGRESS':
      return <Clock className="size-4 shrink-0 text-primary" />;
    case 'RESOLVED':
      return <CheckCircle className="size-4 shrink-0 text-chart-1" />;
    default:
      return <HelpCircle className="size-4 shrink-0 text-muted-foreground" />;
  }
}

function statusTone(status: string): 'primary' | 'warning' | 'neutral' {
  switch (status) {
    case 'OPEN':
      return 'warning';
    case 'IN_PROGRESS':
    case 'RESOLVED':
      return 'primary';
    default:
      return 'neutral';
  }
}

export default function DashboardPage() {
  const { displayUser } = useDisplayUser();

  const { data: chatBots, isLoading: chatBotsLoading } = useChatBots();
  const { data: chatRoomsRaw, isLoading: chatRoomsLoading } = useChatRooms();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 10 });
  const { data: ticketsDataRaw, isLoading: ticketsLoading } = useSupportTickets({
    limit: 10,
  });

  const chatRooms: ApiChatRoom[] = Array.isArray(chatRoomsRaw)
    ? chatRoomsRaw
    : [];
  const tickets: Ticket[] =
    ticketsDataRaw &&
    typeof ticketsDataRaw === 'object' &&
    'tickets' in ticketsDataRaw &&
    Array.isArray((ticketsDataRaw as { tickets: unknown }).tickets)
      ? (ticketsDataRaw as { tickets: Ticket[] }).tickets
      : [];

  const isAdmin = displayUser?.role === 'ADMIN';
  const canManageBots = isAdmin || displayUser?.role === 'AGENT';

  const activeChatBots = Array.isArray(chatBots)
    ? chatBots.filter(
        (bot: { isKnowledgeInitialized?: boolean }) =>
          bot.isKnowledgeInitialized
      ).length
    : 0;
  const totalConversations = chatRooms.length;
  const teamMembers = Array.isArray(usersData?.data)
    ? usersData.data.length
    : 0;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length;

  const recentTickets = tickets.slice(0, 5);
  const recentChatRooms = chatRooms.slice(0, 5);

  const statItems: StatItem[] = [
    {
      label: 'Active chatbots',
      value: activeChatBots,
      hint: 'Knowledge base ready',
      icon: Bot,
      iconClass: 'text-primary',
    },
    {
      label: 'Conversations',
      value: totalConversations,
      hint: 'Total chat sessions',
      icon: MessageSquare,
      iconClass: 'text-chart-2',
    },
    ...(isAdmin
      ? [
          {
            label: 'Team members',
            value: teamMembers,
            hint: 'Active workspace seats',
            icon: Users,
            iconClass: 'text-chart-3',
          },
        ]
      : []),
    {
      label: 'Open tickets',
      value: openTickets,
      hint: `${pendingTickets} pending`,
      icon: HelpCircle,
      iconClass: 'text-chart-4',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back${displayUser?.firstName ? `, ${displayUser.firstName}` : ''}`}
        description="Here's what's happening across your support platform."
        actions={
          canManageBots ? (
            <PrimaryActionButton href="/chatbots/create" icon={Plus}>
              New chatbot
            </PrimaryActionButton>
          ) : undefined
        }
      />

      <StatsStrip
        items={statItems}
        loading={
          chatBotsLoading ||
          chatRoomsLoading ||
          usersLoading ||
          ticketsLoading
        }
      />

      {/* Analytics + Recent Conversations */}
      <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <TableShell>
          <TableToolbar>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Conversations
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Chat volume and response metrics over time
              </p>
            </div>
            <SecondaryActionButton href="/analytics" icon={ArrowUpRight}>
              Analytics
            </SecondaryActionButton>
          </TableToolbar>
          <div className="p-5">
            <AnalyticsChart type="conversations" />
          </div>
        </TableShell>

        <ListPanel title="Recent conversations">
          {chatRoomsLoading ? (
            [0, 1, 2].map((i) => (
              <li key={i} className="px-5 py-3">
                <div className="h-3 animate-pulse rounded-full bg-muted/70" />
              </li>
            ))
          ) : recentChatRooms.length > 0 ? (
            recentChatRooms.map((room) => (
              <ListRow
                key={room.id}
                icon={
                  <IconTile>
                    <MessageSquare className="size-3.5" />
                  </IconTile>
                }
                title={room.id ? `Chat #${room.id.slice(-6)}` : 'Chat'}
                subtitle={
                  room.createdAt
                    ? new Date(room.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Active session'
                }
                badge={<StatusPill tone="primary">Session</StatusPill>}
              />
            ))
          ) : (
            <li>
              <EmptyState
                icon={<MessageSquare className="size-4" />}
                title="No conversations yet"
                description="They'll show up here once customers start chatting."
              />
            </li>
          )}
        </ListPanel>
      </section>

      {/* Tickets + Shortcuts */}
      <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <ListPanel title="Recent tickets">
          {ticketsLoading ? (
            [0, 1, 2].map((i) => (
              <li key={i} className="px-5 py-3">
                <div className="h-3 animate-pulse rounded-full bg-muted/70" />
              </li>
            ))
          ) : recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <ListRow
                key={ticket.id}
                icon={
                  <IconTile>
                    <StatusIcon status={ticket.status} />
                  </IconTile>
                }
                title={ticket.subject}
                subtitle={
                  <>
                    <span
                      className={`capitalize ${
                        PRIORITY_TEXT[ticket.priority.toLowerCase()] ??
                        'text-muted-foreground'
                      }`}
                    >
                      {ticket.priority.toLowerCase()}
                    </span>
                    {ticket.createdAt && (
                      <>
                        {' '}
                        ·{' '}
                        {new Date(ticket.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </>
                    )}
                  </>
                }
                badge={
                  <StatusPill tone={statusTone(ticket.status)}>
                    <span className="capitalize">
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </StatusPill>
                }
              />
            ))
          ) : (
            <li>
              <EmptyState
                icon={<HelpCircle className="size-4" />}
                title="No tickets right now"
                description="Escalations and support requests will appear here."
              />
            </li>
          )}
          <ListRow
            icon={
              <IconTile>
                <ArrowUpRight className="size-3.5" />
              </IconTile>
            }
            title={
              <Link
                href="/tickets"
                className="transition-colors hover:text-primary"
              >
                View all
              </Link>
            }
            meta={<ChevronRight className="size-4" />}
          />
        </ListPanel>

        <ListPanel title="Quick shortcuts">
          {canManageBots && (
            <ListRow
              icon={
                <IconTile>
                  <Plus className="size-3.5" />
                </IconTile>
              }
              title={
                <Link
                  href="/chatbots/create"
                  className="transition-colors hover:text-primary"
                >
                  Create a chatbot
                </Link>
              }
              subtitle="Set up a new AI assistant"
              meta={<ChevronRight className="size-4" />}
            />
          )}
          <ListRow
            icon={
              <IconTile>
                <FileText className="size-3.5" />
              </IconTile>
            }
            title={
              <Link
                href="/training"
                className="transition-colors hover:text-primary"
              >
                Upload documents
              </Link>
            }
            subtitle="Add to the knowledge base"
            meta={<ChevronRight className="size-4" />}
          />
          <ListRow
            icon={
              <IconTile>
                <BarChart3 className="size-3.5" />
              </IconTile>
            }
            title={
              <Link
                href="/analytics"
                className="transition-colors hover:text-primary"
              >
                View analytics
              </Link>
            }
            subtitle="Resolution rate and satisfaction"
            meta={<ChevronRight className="size-4" />}
          />
          {isAdmin && (
            <ListRow
              icon={
                <IconTile>
                  <Users className="size-3.5" />
                </IconTile>
              }
              title={
                <Link
                  href="/users"
                  className="transition-colors hover:text-primary"
                >
                  Manage team
                </Link>
              }
              subtitle="Invite people and set roles"
              meta={<ChevronRight className="size-4" />}
            />
          )}
        </ListPanel>
      </section>
    </PageContainer>
  );
}
