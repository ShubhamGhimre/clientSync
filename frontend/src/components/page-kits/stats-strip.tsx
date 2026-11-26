import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/logo';
import { TableShell } from '@/components/tables/table-kits';
import { cn } from '@/lib/utils';

export type StatItem = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  iconClass?: string;
};

const defaultGradient =
  'linear-gradient(90deg, transparent, var(--primary), var(--chart-2), transparent)';

export function StatCell({
  item,
  loading = false,
}: {
  item: StatItem;
  loading?: boolean;
}) {
  const Icon = item.icon;
  return (
    <div className="min-w-0 border-border/60 px-4 py-3.5 transition-colors hover:bg-primary/[0.025] sm:px-5 sm:py-4 max-lg:[&:nth-child(even)]:border-l max-lg:[&:nth-child(n+3)]:border-t lg:[&:not(:first-child)]:border-l">
      <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className={cn('size-3.5 shrink-0', item.iconClass)} />
        <span className="truncate">{item.label}</span>
      </dt>
      <dd
        className={cn(
          'tabular mt-1 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl',
          loading && 'animate-pulse text-muted-foreground'
        )}
      >
        {loading ? '—' : item.value}
      </dd>
      <p className="tabular mt-0.5 min-h-4 truncate text-xs text-muted-foreground">
        {loading ? '' : item.hint}
      </p>
    </div>
  );
}

export function StatsStrip({
  items,
  loading = false,
  gradient = defaultGradient,
  showBrandMark = true,
  className,
}: {
  items: StatItem[];
  loading?: boolean;
  gradient?: string;
  showBrandMark?: boolean;
  className?: string;
}) {
  return (
    <TableShell className={cn('relative shrink-0 overflow-hidden', className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-90"
        style={{ background: gradient }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 100% at 92% 10%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 70%)',
        }}
        aria-hidden="true"
      />
      {showBrandMark && (
        <div
          className="pointer-events-none absolute -right-2 -bottom-3"
          aria-hidden="true"
        >
          <BrandMark
            size={92}
            className="scale-75 opacity-[0.09] grayscale sm:scale-100"
          />
        </div>
      )}
      <dl className="relative z-10 grid min-w-0 grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <StatCell key={item.label} item={item} loading={loading} />
        ))}
      </dl>
    </TableShell>
  );
}
