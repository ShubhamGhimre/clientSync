'use client';

import { ChevronRight, Eye, Shield, UserCheck, UserX } from 'lucide-react';
import { ListPanel, ListRow } from '@/components/page-kits';
import {
  IconTile,
  StatusPill,
  type PillTone,
} from '@/components/tables/table-kits';
import type { UserStatsResponse } from '@/hooks/api/useUsers';

export type AttentionRole = 'ADMIN' | 'AGENT' | 'VIEWER';

export function UserAttentionPanel({
  stats,
  loading = false,
  onRoleFilter,
  onStatusFilter,
}: {
  stats?: UserStatsResponse['data'];
  loading?: boolean;
  onRoleFilter: (role: AttentionRole) => void;
  onStatusFilter: (active: boolean) => void;
}) {
  const inactive = stats?.inactive ?? 0;
  const active = stats?.active ?? 0;
  const admins = stats?.byRole?.ADMIN ?? 0;
  const viewers = stats?.byRole?.VIEWER ?? 0;
  const lowAdminCoverage = admins <= 1;

  const rows: {
    key: string;
    label: string;
    subtitle: string;
    count: number;
    tone: PillTone;
    icon: typeof Shield;
    onSelect: () => void;
  }[] = [
    {
      key: 'inactive',
      label: 'Inactive accounts',
      subtitle: loading
        ? 'Loading…'
        : inactive > 0
          ? `${inactive} cannot sign in until reactivated`
          : 'Everyone can sign in',
      count: inactive,
      tone: inactive > 0 ? 'danger' : 'neutral',
      icon: UserX,
      onSelect: () => onStatusFilter(false),
    },
    {
      key: 'viewers',
      label: 'Viewers',
      subtitle: loading
        ? 'Loading…'
        : 'Read-only members — review their access level',
      count: viewers,
      tone: viewers > 0 ? 'warning' : 'neutral',
      icon: Eye,
      onSelect: () => onRoleFilter('VIEWER'),
    },
    {
      key: 'admins',
      label: 'Administrators',
      subtitle: loading
        ? 'Loading…'
        : lowAdminCoverage
          ? 'Only one admin — consider adding another'
          : 'Full access to workspace settings',
      count: admins,
      tone: lowAdminCoverage ? 'danger' : 'primary',
      icon: Shield,
      onSelect: () => onRoleFilter('ADMIN'),
    },
    {
      key: 'active',
      label: 'Active members',
      subtitle: loading ? 'Loading…' : 'Currently able to sign in',
      count: active,
      tone: 'primary',
      icon: UserCheck,
      onSelect: () => onStatusFilter(true),
    },
  ];

  return (
    <ListPanel title="Needs attention">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <ListRow
            key={row.key}
            className="relative"
            icon={
              <IconTile>
                <Icon className="size-3.5" />
              </IconTile>
            }
            title={
              <button
                type="button"
                onClick={row.onSelect}
                className="text-left transition-colors hover:text-primary after:absolute after:inset-0"
              >
                {row.label}
              </button>
            }
            subtitle={row.subtitle}
            badge={
              <StatusPill tone={row.tone}>
                {loading ? '—' : `${row.count} users`}
              </StatusPill>
            }
            meta={<ChevronRight className="size-4 text-muted-foreground" />}
          />
        );
      })}
    </ListPanel>
  );
}
