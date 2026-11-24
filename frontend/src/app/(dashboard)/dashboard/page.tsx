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
  type LucideIcon,
} from 'lucide-react';

import { useDisplayUser } from '@/hooks/useDisplayUser';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { useChatBots } from '@/hooks/api/useChatBots';
import { useChatRooms } from '@/hooks/api/useChatRooms';
import { useUsers } from '@/hooks/api/useUsers';
import { useSupportTickets } from '@/hooks/api/useSupportTickets';
import type { ChatRoom as ApiChatRoom } from '@/hooks/api/useChatRooms';

// Local Ticket type (not exported from the API hook)
type Ticket = {
  id: string;
  subject: string;
  priority: string;
  status: string;
  createdAt?: string;
};

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-warning',
  pending: 'badge-neutral',
  in_progress: 'badge-ai',
  resolved: 'badge-success',
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent: 't-danger',
  high: 't-danger',
  medium: 't-warning',
  low: 't-muted',
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'OPEN':
      return <AlertCircle className="ico t-warning" />;
    case 'IN_PROGRESS':
      return <Clock className="ico t-ai" />;
    case 'RESOLVED':
      return <CheckCircle className="ico t-success" />;
    default:
      return <HelpCircle className="ico t-muted" />;
  }
}

function Stat({
  label,
  value,
  note,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  note?: string;
  icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="row-between">
        <span className="stat-label">{label}</span>
        <Icon className="ico t-muted" />
      </div>
      {loading ? (
        <div className="skeleton space-t-1" />
      ) : (
        <span className="stat-value">{value}</span>
      )}
      {note && <span className="field-hint">{note}</span>}
    </div>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="empty-state border-none">
      <Icon className="ico-lg t-muted" />
      <p className="empty-state-text">{text}</p>
    </div>
  );
}

function ShortcutRow({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="doc-row group">
      <span className="doc-icon">
        <Icon className="ico" />
      </span>
      <span className="flex-fill">
        <span className="list-title">{title}</span>
        <span className="list-meta">{text}</span>
      </span>
      <ChevronRight className="ico t-muted" />
    </Link>
  );
}

export default function DashboardPage() {
  const { displayUser } = useDisplayUser();

  const { data: chatBots, isLoading: chatBotsLoading } = useChatBots();
  const { data: chatRoomsRaw, isLoading: chatRoomsLoading } = useChatRooms();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 10 });
  const { data: ticketsDataRaw, isLoading: ticketsLoading } = useSupportTickets({ limit: 10 });

  // Defensive: ensure arrays and types
  const chatRooms: ApiChatRoom[] = Array.isArray(chatRoomsRaw) ? chatRoomsRaw : [];
  const tickets: Ticket[] =
    ticketsDataRaw &&
    typeof ticketsDataRaw === 'object' &&
    'tickets' in ticketsDataRaw &&
    Array.isArray((ticketsDataRaw as { tickets: unknown }).tickets)
      ? (ticketsDataRaw as { tickets: Ticket[] }).tickets
      : [];

  const isAdmin = displayUser?.role === 'ADMIN';
  const canManageBots = isAdmin || displayUser?.role === 'AGENT';

  // Metrics
  const activeChatBots = Array.isArray(chatBots)
    ? chatBots.filter((bot: { isKnowledgeInitialized?: boolean }) => bot.isKnowledgeInitialized).length
    : 0;
  const totalConversations = chatRooms.length;
  const teamMembers = Array.isArray(usersData?.data) ? usersData.data.length : 0;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length;

  const recentTickets = tickets.slice(0, 5);
  const recentChatRooms = chatRooms.slice(0, 5);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back{displayUser?.firstName ? `, ${displayUser.firstName}` : ''}
          </h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening across your support platform.</p>
        </div>
        {canManageBots && (
          <Link href="/chatbots/create" className="btn btn-brand">
            <Plus />
            New chatbot
          </Link>
        )}
      </header>

      <div className="stack-lg">
        {/* Metrics */}
        <section className="grid-stats">
          <Stat
            label="Active chatbots"
            value={activeChatBots}
            note="Knowledge base ready"
            icon={Bot}
            loading={chatBotsLoading}
          />
          <Stat
            label="Conversations"
            value={totalConversations}
            note="Total chat sessions"
            icon={MessageSquare}
            loading={chatRoomsLoading}
          />
          {isAdmin && (
            <Stat label="Team members" value={teamMembers} icon={Users} loading={usersLoading} />
          )}
          <Stat
            label="Open tickets"
            value={openTickets}
            note={`${pendingTickets} pending`}
            icon={HelpCircle}
            loading={ticketsLoading}
          />
        </section>

        {/* Analytics + recent conversations */}
        <section className="grid-box g-4">
          <div className="surface">
            <div className="surface-header">
              <div>
                <h2 className="card-title">Conversations</h2>
                <p className="t-sm t-muted">Chat volume and response metrics over time</p>
              </div>
            </div>
            <div className="surface-pad">
              <AnalyticsChart type="conversations" />
            </div>
          </div>

          <div className="surface">
            <div className="surface-header">
              <h2 className="card-title">Recent conversations</h2>
            </div>
            {chatRoomsLoading ? (
              <div className="stack-sm pad-5">
                <div className="skeleton full-w" />
                <div className="skeleton full-w" />
                <div className="skeleton full-w" />
              </div>
            ) : recentChatRooms.length > 0 ? (
              <ul>
                {recentChatRooms.map((room) => (
                  <li
                    key={room.id}
                    className="row g-3 border-bottom pad-x-5 pad-y-3"
                  >
                    <span className="doc-icon">
                      <MessageSquare className="ico" />
                    </span>
                    <div className="flex-fill">
                      <p className="ellipsis t-sm t-medium">
                        {room.id ? `Chat ${room.id.slice(-6)}` : 'Chat'}
                      </p>
                      <p className="t-xs t-muted">
                        {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow icon={MessageSquare} text="No conversations yet. They'll show up here once customers start chatting." />
            )}
          </div>
        </section>

        {/* Tickets + shortcuts */}
        <section className="grid-box g-4">
          <div className="surface">
            <div className="surface-header">
              <h2 className="card-title">Recent tickets</h2>
              <Link href="/tickets" className="btn btn-ghost btn-sm">
                View all
                <ArrowUpRight />
              </Link>
            </div>
            {ticketsLoading ? (
              <div className="stack-sm pad-5">
                <div className="skeleton full-w" />
                <div className="skeleton full-w" />
                <div className="skeleton full-w" />
              </div>
            ) : recentTickets.length > 0 ? (
              <ul>
                {recentTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="row g-3 border-bottom pad-x-5 pad-y-3"
                  >
                    <span className="doc-icon">
                      <StatusIcon status={ticket.status} />
                    </span>
                    <div className="flex-fill">
                      <p className="ellipsis t-sm t-medium">{ticket.subject}</p>
                      <p className="t-xs t-muted">
                        <span className={PRIORITY_TEXT[ticket.priority.toLowerCase()] ?? 't-muted'}>
                          {ticket.priority}
                        </span>
                        {ticket.createdAt && <> · {new Date(ticket.createdAt).toLocaleDateString()}</>}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[ticket.status.toLowerCase()] ?? 'badge-neutral'}`}>
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow icon={HelpCircle} text="No tickets right now." />
            )}
          </div>

          <div className="surface">
            <div className="surface-header">
              <h2 className="card-title">Shortcuts</h2>
            </div>
            <div className="stack-sm pad-4">
              {canManageBots && (
                <ShortcutRow href="/chatbots/create" icon={Plus} title="Create a chatbot" text="Set up a new AI assistant" />
              )}
              <ShortcutRow href="/training" icon={FileText} title="Upload documents" text="Add to the knowledge base" />
              <ShortcutRow href="/analytics" icon={BarChart3} title="View analytics" text="Resolution rate and satisfaction" />
              {isAdmin && (
                <ShortcutRow href="/users" icon={Users} title="Manage team" text="Invite people and set roles" />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}