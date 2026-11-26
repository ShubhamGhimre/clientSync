'use client';

import type { ReactNode } from 'react';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  SmilePlus,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import { IconTile, TableShell } from '@/components/tables/table-kits';

function ChartPanel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <TableShell>
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <IconTile>
          <Icon className="size-3.5" />
        </IconTile>
      </div>
      <div className="p-5">{children}</div>
    </TableShell>
  );
}

export default function AnalyticsPage() {
  const statItems: StatItem[] = [
    {
      label: 'Total Conversations',
      value: '12,543',
      hint: '+12.5%',
      icon: MessageSquare,
      iconClass: 'text-primary',
    },
    {
      label: 'Active Users',
      value: '3,247',
      hint: '+5.2%',
      icon: Users,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Avg Response Time',
      value: '1.2s',
      hint: '-8.1%',
      icon: Clock,
      iconClass: 'text-chart-3',
    },
    {
      label: 'Satisfaction Rate',
      value: '94.8%',
      hint: '+2.3%',
      icon: TrendingUp,
      iconClass: 'text-chart-4',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Monitor AI chatbot resolutions, response speed, and customer satisfaction."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            <Sparkles className="size-3 text-primary" />
            AI &amp; Handoff Insights
          </span>
        }
      />

      <StatsStrip items={statItems} />

      {/* Analytics Tabs & Chart Panels */}
      <Tabs defaultValue="overview" className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <TabsList className="h-9 rounded-xl border border-border bg-secondary p-1">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-3 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="conversations"
              className="rounded-lg px-3 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Conversations
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="rounded-lg px-3 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="satisfaction"
              className="rounded-lg px-3 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Satisfaction
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0 flex flex-col gap-3.5">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartPanel
              title="Conversation Volume"
              description="Daily AI & escalated chat trends"
              icon={MessageSquare}
            >
              <AnalyticsChart type="conversations" />
            </ChartPanel>

            <ChartPanel
              title="User Engagement"
              description="Active visitors interacting with bots"
              icon={Users}
            >
              <AnalyticsChart type="users" />
            </ChartPanel>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="mt-0 flex flex-col gap-3.5">
          <ChartPanel
            title="Conversation Analytics"
            description="Detailed AI thread volume, topics, and handoff patterns"
            icon={Activity}
          >
            <AnalyticsChart type="detailed-conversations" />
          </ChartPanel>
        </TabsContent>

        <TabsContent value="performance" className="mt-0 flex flex-col gap-3.5">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartPanel
              title="Response Times"
              description="AI answer latency and retrieval speed"
              icon={Clock}
            >
              <AnalyticsChart type="response-times" />
            </ChartPanel>

            <ChartPanel
              title="Resolution Rate"
              description="Queries resolved autonomously without handoff"
              icon={CheckCircle2}
            >
              <AnalyticsChart type="resolution" />
            </ChartPanel>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-0 flex flex-col gap-3.5">
          <ChartPanel
            title="Customer Satisfaction"
            description="Post-chat ratings and helpfulness feedback"
            icon={SmilePlus}
          >
            <AnalyticsChart type="satisfaction" />
          </ChartPanel>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
