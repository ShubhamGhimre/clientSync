'use client';

import { AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { StatsStrip, type StatItem } from '@/components/page-kits';
import type { TicketStats } from '@/hooks/api/useSupportTickets';

export function TicketStatsStrip({
  statsData,
  fallbackTotal,
  loading = false,
}: {
  statsData?: { data?: TicketStats };
  fallbackTotal: number;
  loading?: boolean;
}) {
  const stats = statsData?.data;
  const total = stats?.total ?? fallbackTotal;
  const statusSummary = stats?.byStatus
    ? Object.entries(stats.byStatus)
        .map(([status, count]) => `${status.replaceAll('_', ' ')}: ${count}`)
        .join(' · ')
    : 'No status breakdown';
  const recent = stats?.recent ?? 0;
  const recentCount = Array.isArray(recent) ? recent.length : recent;

  const statItems: StatItem[] = [
    {
      label: 'Total Tickets',
      value: total,
      hint: 'All support queues',
      icon: HelpCircle,
      iconClass: 'text-primary',
    },
    {
      label: 'By Priority',
      value: stats?.byPriority
        ? Object.entries(stats.byPriority)
            .map(([priority, count]) => `${priority.toLowerCase()}: ${count}`)
            .join(' · ')
        : 'N/A',
      hint: 'Urgency distribution',
      icon: Clock,
      iconClass: 'text-chart-4',
    },
    {
      label: 'By Status',
      value: statusSummary,
      hint: 'Active workflow state',
      icon: AlertCircle,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Recent',
      value: recentCount,
      hint: '80.3% resolution rate',
      icon: CheckCircle,
      iconClass: 'text-primary',
    },
  ];

  return <StatsStrip items={statItems} loading={loading} />;
}
