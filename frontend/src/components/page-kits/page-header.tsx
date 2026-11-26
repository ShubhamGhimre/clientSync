import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  actionsClassName,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  actionsClassName?: string;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className={cn('flex items-center gap-2', actionsClassName)}>
          {actions}
        </div>
      )}
    </header>
  );
}
