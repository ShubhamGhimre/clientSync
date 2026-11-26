import type { ReactNode } from 'react';
import { TableShell } from '@/components/tables/table-kits';
import { cn } from '@/lib/utils';

export function ListPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableShell className={className}>
      <div className="border-b border-border/60 px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <ul>{children}</ul>
    </TableShell>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  badge,
  meta,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 border-b border-border/50 px-5 py-3 transition-colors last:border-b-0 hover:bg-primary/[0.035]',
        className
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {badge}
      {meta !== undefined && (
        <p className="tabular hidden shrink-0 text-xs text-muted-foreground sm:block">
          {meta}
        </p>
      )}
    </li>
  );
}
