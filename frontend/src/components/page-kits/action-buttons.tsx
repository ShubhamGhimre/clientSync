import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toolbarBtnClass } from '@/components/tables/table-kits';
import { cn } from '@/lib/utils';

export function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  label = 'Refresh',
  className,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(toolbarBtnClass, 'h-9 px-3.5', className)}
    >
      <RefreshCw
        className={cn('size-3.5 shrink-0', loading && 'animate-spin')}
      />
      {label}
    </button>
  );
}

export function PrimaryActionButton({
  children,
  icon: Icon,
  onClick,
  href,
  disabled = false,
  className,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    'h-9 rounded-full px-4 text-xs font-semibold',
    className
  );
  const content = (
    <>
      {Icon && <Icon className="mr-1.5 size-4 shrink-0" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Button asChild className={classes}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </Button>
  );
}

export function SecondaryActionButton({
  children,
  icon: Icon,
  onClick,
  href,
  disabled = false,
  className,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    'h-9 rounded-full border-border/70 bg-background px-4 text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary',
    className
  );
  const content = (
    <>
      {Icon && <Icon className="mr-1.5 size-4 shrink-0 text-primary" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Button asChild variant="outline" className={classes}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={classes}
    >
      {content}
    </Button>
  );
}
