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
      <div className="row-between">
        <span className="stat-label">{title}</span>
        <span className="icon-tile">
          <Icon className="ico-lg" />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="row g-2">
        {change && (
          <span className={cn(
            'stat-delta badge',
            isPositive ? 'is-up badge-success' : 'is-down badge-danger'
          )}>
            {isPositive ? (
              <TrendingUp className="ico-xs" />
            ) : (
              <TrendingDown className="ico-xs" />
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
