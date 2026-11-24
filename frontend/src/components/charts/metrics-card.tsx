'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  className,
}: MetricsCardProps) {
  const isPositive = trend === 'up';

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-center justify-between">
        <span className="stat-label">{title}</span>
        <span className="icon-tile">
          <Icon className="size-5 shrink-0" />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="flex items-center gap-2">
        {change && (
          <span className={cn(
            'stat-delta badge',
            isPositive ? 'is-up badge-success' : 'is-down badge-danger'
          )}>
            {isPositive ? (
              <TrendingUp className="size-3 shrink-0" />
            ) : (
              <TrendingDown className="size-3 shrink-0" />
            )}
            <span>{change}</span>
          </span>
        )}
      </div>
      {description && (
        <p className="field-hint">{description}</p>
      )}
    </div>
  );
}
