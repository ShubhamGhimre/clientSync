'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
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
    <div
      className={cn(
        'group relative flex flex-col justify-between gap-2.5 overflow-hidden rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="size-4 shrink-0" />
        </span>
      </div>

      <div className="tabular text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {value}
      </div>

      {change && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'tabular inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
              isPositive
                ? 'border-primary/25 bg-primary/10 text-primary'
                : 'border-destructive/25 bg-destructive/10 text-destructive'
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3 shrink-0" />
            ) : (
              <TrendingDown className="size-3 shrink-0" />
            )}
            <span>{change}</span>
          </span>
        </div>
      )}

      {description && (
        <p className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}