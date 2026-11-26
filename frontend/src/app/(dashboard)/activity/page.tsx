'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bot,
  FileText,
  HelpCircle,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserPlus,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { useDisplayUser } from '@/hooks/useDisplayUser';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ListPanel,
  ListRow,
  PageContainer,
  PageHeader,
  RefreshButton,
  SearchField,
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

type ActivityCategory =
  | 'all'
  | 'chatbots'
  | 'knowledge'
  | 'conversations'
  | 'tickets'
  | 'team';

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  category: Exclude<ActivityCategory, 'all'>;
  actorName: string;
  actorRole?: string;
  targetLabel?: string;
  targetHref?: string;
  timestamp: string;
  meta?: string;
};

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Knowledge base indexed',
    description: 'Processed 14 document chunks for Acme Support Bot.',
    category: 'knowledge',
    actorName: 'System',
    actorRole: 'Indexer',
    targetLabel: 'Acme Support Bot',
    targetHref: '/chatbots',
    timestamp: '12 mins ago',
    meta: '14 chunks',
  },
  {
    id: 'act-2',
    title: 'New customer chat session started',
    description: 'Visitor opened a live support thread with source citations enabled.',
    category: 'conversations',
    actorName: 'Visitor #4092',
    actorRole: 'Customer',
    targetLabel: 'Chat #aj4eh7',
    timestamp: '38 mins ago',
    meta: 'AI active',
  },
  {
    id: 'act-3',
    title: 'Chatbot configuration updated',
    description: 'Updated welcome prompt and fallback handoff threshold.',
    category: 'chatbots',
    actorName: 'Workspace Admin',
    actorRole: 'Admin',
    targetLabel: 'Returns Assistant',
    targetHref: '/chatbots',
    timestamp: '2 hours ago',
    meta: 'Config saved',
  },
  {
    id: 'act-4',
    title: 'Support ticket escalated',
    description: 'Conversation handed off to queue for billing verification.',
    category: 'tickets',
    actorName: 'Escalation Rule',
    actorRole: 'Automated',
    targetLabel: 'Tickets',
    targetHref: '/tickets',
    timestamp: '4 hours ago',
    meta: 'High priority',
  },
  {
    id: 'act-5',
    title: 'Workspace role permissions reviewed',
    description: 'Verified team access roles across workspace members.',
    category: 'team',
    actorName: 'Workspace Admin',
    actorRole: 'Admin',
    targetLabel: 'Team',
    targetHref: '/users',
    timestamp: 'Yesterday',
    meta: 'RBAC active',
  },
];

const CATEGORY_META: Record<
  Exclude<ActivityCategory, 'all'>,
  { label: string; icon: LucideIcon; tone: 'primary' | 'warning' | 'neutral' }
> = {
  chatbots: { label: 'Chatbot', icon: Bot, tone: 'primary' },
  knowledge: { label: 'Knowledge', icon: FileText, tone: 'primary' },
  conversations: { label: 'Conversation', icon: MessageSquare, tone: 'neutral' },
  tickets: { label: 'Ticket', icon: HelpCircle, tone: 'warning' },
  team: { label: 'Team', icon: UserPlus, tone: 'primary' },
};

const FILTER_TABS: { key: ActivityCategory; label: string }[] = [
  { key: 'all', label: 'All activity' },
  { key: 'chatbots', label: 'Chatbots' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'team', label: 'Team' },
];

export default function ActivityPage() {
  const { displayUser } = useDisplayUser();
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const visibleActivities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return activities.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.actorName.toLowerCase().includes(query) ||
        (item.targetLabel?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [activities, selectedCategory, searchTerm]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setActivities((prev) => [...prev]);
      setIsRefreshing(false);
    }, 350);
  };

  const counts = useMemo(() => {
    return {
      total: activities.length,
      knowledge: activities.filter((a) => a.category === 'knowledge').length,
      conversations: activities.filter((a) => a.category === 'conversations')
        .length,
      tickets: activities.filter((a) => a.category === 'tickets').length,
    };
  }, [activities]);

  const statItems: StatItem[] = [
    {
      label: 'Total events',
      value: counts.total,
      icon: Activity,
      iconClass: 'text-primary',
    },
    {
      label: 'Knowledge syncs',
      value: counts.knowledge,
      icon: FileText,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Chat sessions',
      value: counts.conversations,
      icon: MessageSquare,
      iconClass: 'text-chart-3',
    },
    {
      label: 'Escalations',
      value: counts.tickets,
      icon: HelpCircle,
      iconClass: 'text-chart-4',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Activity"
        description="Recent workspace events across chatbots, knowledge base, chats, and support tickets."
        actions={
          <>
            {displayUser?.role && (
              <span className="hidden items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                <ShieldCheck className="size-3 text-primary" />
                {displayUser.role}
              </span>
            )}
            <RefreshButton
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
            />
          </>
        }
      />

      <StatsStrip items={statItems} />

      <TableShell>
        <TableToolbar>
          <Tabs
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as ActivityCategory)}
            className="w-full lg:w-auto"
          >
            <TabsList className="h-auto flex-wrap justify-start rounded-xl border border-border bg-secondary p-1">
              {FILTER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 lg:w-auto">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search events or actors..."
              label="Search activity"
            />
            <span className="tabular hidden shrink-0 text-xs text-muted-foreground sm:block">
              {visibleActivities.length}
            </span>
          </div>
        </TableToolbar>
      </TableShell>

      <ListPanel title="Event log">
        {visibleActivities.length > 0 ? (
          visibleActivities.map((item) => {
            const meta = CATEGORY_META[item.category];
            const Icon = meta.icon;

            return (
              <ListRow
                key={item.id}
                icon={
                  <IconTile>
                    <Icon className="size-3.5" />
                  </IconTile>
                }
                title={item.title}
                subtitle={item.description}
                badge={
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <div className="flex items-center gap-1.5">
                      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                      {item.meta && (
                        <span className="tabular inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {item.meta}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/85">
                        {item.actorName}
                      </span>
                      {item.targetLabel && (
                        <>
                          <span> · </span>
                          {item.targetHref ? (
                            <Link
                              href={item.targetHref}
                              className="font-medium text-primary hover:underline"
                            >
                              {item.targetLabel}
                            </Link>
                          ) : (
                            <span>{item.targetLabel}</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                }
                meta={
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {item.timestamp}
                  </span>
                }
              />
            );
          })
        ) : (
          <li>
            <EmptyState
              icon={<Settings className="size-4" />}
              title="No matching activity found"
              description="Try switching category filters or clearing your search query."
            />
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="flex justify-center pb-6">
                <SecondaryActionButton
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset filters
                </SecondaryActionButton>
              </div>
            )}
          </li>
        )}
      </ListPanel>
    </PageContainer>
  );
}
