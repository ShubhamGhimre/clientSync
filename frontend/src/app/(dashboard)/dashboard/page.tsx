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

import { BrandMark } from '@/components/logo';
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
  open: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pending: 'border-border/80 bg-muted/50 text-muted-foreground',
  in_progress: 'border-brand-strong/25 bg-brand/10 text-brand-strong',
  resolved:
    'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent: 'font-medium text-destructive',
  high: 'font-medium text-destructive',
  medium: 'font-medium text-amber-600 dark:text-amber-400',
  low: 'text-muted-foreground',
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'OPEN':
      return <AlertCircle className="size-4 shrink-0 text-amber-500" />;
    case 'IN_PROGRESS':
      return <Clock className="size-4 shrink-0 text-brand-strong" />;
    case 'RESOLVED':
      return <CheckCircle className="size-4 shrink-0 text-emerald-500" />;
    default:
      return <HelpCircle className="size-4 shrink-0 text-muted-foreground" />;
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
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xs transition-all hover:border-foreground/15 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {loading ? (
            <div className="skeleton h-8 w-16 rounded-lg" />
          ) : (
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
          )}
        </div>

        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground transition-colors group-hover:border-brand-strong/25 group-hover:text-brand-strong">
          <Icon className="size-4" />
        </span>
      </div>

      {note && (
        <p className="mt-3 border-t border-border/50 pt-2.5 text-[11px] font-medium text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {text}
      </p>
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
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-border hover:bg-background hover:shadow-2xs"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background text-foreground/85 shadow-2xs transition-colors group-hover:border-brand-strong/30 group-hover:text-brand-strong">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {text}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

export default function DashboardPage() {
  const { displayUser } = useDisplayUser();

  const { data: chatBots, isLoading: chatBotsLoading } = useChatBots();
  const { data: chatRoomsRaw, isLoading: chatRoomsLoading } = useChatRooms();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 10 });
  const { data: ticketsDataRaw, isLoading: ticketsLoading } = useSupportTickets({
    limit: 10,
  });

  // Defensive: ensure arrays and types
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

  // Metrics
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

  return (
    <div className="mx-auto flex w-full  flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-background via-background to-muted/35 p-6 shadow-2xs">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 85% 50%, color-mix(in oklab, var(--brand-strong, currentColor) 10%, transparent), transparent)',
          }}
          aria-hidden="true"
        />
        <BrandMark
          size={180}
          className="pointer-events-none absolute -bottom-12 right-6 text-foreground opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <BrandMark size={11} className="text-brand-strong" />
              Workspace overview
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Welcome back
              {displayUser?.firstName ? `, ${displayUser.firstName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening across your support platform.
            </p>
          </div>

          {canManageBots && (
            <Link
              href="/chatbots/create"
              className="btn btn-brand inline-flex w-fit items-center gap-2 rounded-xl text-sm font-semibold shadow-2xs"
            >
              <Plus className="size-4" />
              <span>New chatbot</span>
            </Link>
          )}
        </div>
      </header>

      {/* Metrics Grid */}
      <section
        className={`grid gap-4 sm:grid-cols-2 ${
          isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
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
          <Stat
            label="Team members"
            value={teamMembers}
            note="Active workspace seats"
            icon={Users}
            loading={usersLoading}
          />
        )}
        <Stat
          label="Open tickets"
          value={openTickets}
          note={`${pendingTickets} pending`}
          icon={HelpCircle}
          loading={ticketsLoading}
        />
      </section>

      {/* Analytics + Recent Conversations */}
      <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/25 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Conversations
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Chat volume and response metrics over time
              </p>
            </div>
            <Link
              href="/analytics"
              className="group inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:text-foreground"
            >
              Analytics
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="flex-1 p-5">
            <AnalyticsChart type="conversations" />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/25 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Recent conversations
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest customer chat sessions
              </p>
            </div>
            <span className="rounded-full border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
              {recentChatRooms.length}
            </span>
          </div>

          <div className="flex-1">
            {chatRoomsLoading ? (
              <div className="flex flex-col gap-2.5 p-5">
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
              </div>
            ) : recentChatRooms.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {recentChatRooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/25"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-brand-strong">
                      <MessageSquare className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {room.id ? `Chat #${room.id.slice(-6)}` : 'Chat'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {room.createdAt
                          ? new Date(room.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : 'Active session'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Session
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow
                icon={MessageSquare}
                text="No conversations yet. They'll show up here once customers start chatting."
              />
            )}
          </div>
        </div>
      </section>

      {/* Tickets + Shortcuts */}
      <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/25 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Recent tickets
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Escalations and support requests
              </p>
            </div>
            <Link
              href="/tickets"
              className="group inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="flex-1">
            {ticketsLoading ? (
              <div className="flex flex-col gap-2.5 p-5">
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
              </div>
            ) : recentTickets.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {recentTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/25"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40">
                      <StatusIcon status={ticket.status} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        STATUS_BADGE[ticket.status.toLowerCase()] ??
                        'border-border/80 bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow icon={HelpCircle} text="No tickets right now." />
            )}
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xs">
          <BrandMark
            size={180}
            className="pointer-events-none absolute -bottom-12 -right-10 text-foreground opacity-[0.03]"
            aria-hidden="true"
          />

          <div className="border-b border-border/70 bg-muted/25 px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Quick shortcuts
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Jump straight into common workflows
            </p>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center gap-2.5 p-4">
            {canManageBots && (
              <ShortcutRow
                href="/chatbots/create"
                icon={Plus}
                title="Create a chatbot"
                text="Set up a new AI assistant"
              />
            )}
            <ShortcutRow
              href="/training"
              icon={FileText}
              title="Upload documents"
              text="Add to the knowledge base"
            />
            <ShortcutRow
              href="/analytics"
              icon={BarChart3}
              title="View analytics"
              text="Resolution rate and satisfaction"
            />
            {isAdmin && (
              <ShortcutRow
                href="/users"
                icon={Users}
                title="Manage team"
                text="Invite people and set roles"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}