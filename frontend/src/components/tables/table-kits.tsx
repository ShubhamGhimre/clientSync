'use client';

/**
 * Shared building blocks for every data table in ClientSync.
 * Keeps tables minimal, calm, and consistent: one soft surface,
 * hairline dividers, quiet controls, and no nested boxes.
 */
import type { ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandMark } from '@/components/logo';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Class tokens                                                        */
/* ------------------------------------------------------------------ */

export const thClass =
  'h-10 whitespace-nowrap px-4 text-left align-middle text-[11px] font-medium tracking-wide text-muted-foreground/85 first:pl-5 last:pr-5';

export const tdClass = 'px-4 py-3 align-middle first:pl-5 last:pr-5';

export const rowClass =
  'group border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/35 data-[state=selected]:bg-muted/55';

export const toolbarBtnClass =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45';

export const pagerBtnClass =
  'inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-35';

/** The "..." button at the end of a row. Appears quietly on hover on desktop. */
export const rowActionClass =
  'inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground/80 transition-all hover:bg-muted/70 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-40 data-[state=open]:bg-muted/70 data-[state=open]:text-foreground data-[state=open]:opacity-100 md:opacity-0 md:group-hover:opacity-100';

export const menuContentClass =
  'rounded-xl border-border/60 bg-popover text-popover-foreground shadow-soft';

export const checkboxClass =
  'size-4 shrink-0 rounded-[4px] border-border/90 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring/30';

export const dialogCancelClass =
  'inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground';

export const dialogDangerClass =
  'inline-flex h-9 items-center justify-center rounded-lg bg-destructive px-4 text-xs font-semibold text-white transition-colors hover:bg-destructive/90';

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const timeAgo = (value: string) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(value);
};

/* ------------------------------------------------------------------ */
/* Surface                                                             */
/* ------------------------------------------------------------------ */

/** One calm surface that holds toolbar, table and footer. */
export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-2.5">
      {children}
    </div>
  );
}

export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Small atoms                                                         */
/* ------------------------------------------------------------------ */

type SortState = false | 'asc' | 'desc';

export function SortButton({
  label,
  state,
  onClick,
}: {
  label: string;
  state: SortState;
  onClick: () => void;
}) {
  const Icon =
    state === 'asc' ? ArrowUp : state === 'desc' ? ArrowDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-ml-2 inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        state ? 'text-foreground' : 'text-muted-foreground/85'
      )}
    >
      <span>{label}</span>
      <Icon
        className={cn('size-3 shrink-0', state ? 'text-primary' : 'opacity-45')}
      />
    </button>
  );
}

const pillTones = {
  primary: { pill: 'bg-primary/8 text-primary', dot: 'bg-primary' },
  warning: { pill: 'bg-chart-4/12 text-foreground/90', dot: 'bg-chart-4' },
  danger: { pill: 'bg-destructive/8 text-destructive', dot: 'bg-destructive' },
  neutral: {
    pill: 'bg-muted/65 text-muted-foreground',
    dot: 'bg-muted-foreground/45',
  },
} as const;

export type PillTone = keyof typeof pillTones;

export function StatusPill({
  tone = 'neutral',
  pulse = false,
  children,
}: {
  tone?: PillTone;
  pulse?: boolean;
  children: ReactNode;
}) {
  const t = pillTones[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium leading-4',
        t.pill
      )}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          t.dot,
          pulse && 'animate-pulse'
        )}
      />
      {children}
    </span>
  );
}

/** Round avatar carrying the ClientSync brand mark - used wherever a bot appears. */
export function BotAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/8',
        size === 'md' ? 'size-8' : 'size-6'
      )}
    >
      <BrandMark size={size === 'md' ? 18 : 13} />
    </span>
  );
}

export function Initials({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md';
}) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
        size === 'md' ? 'size-8 text-xs' : 'size-7 text-[11px]'
      )}
    >
      {letters || '?'}
    </span>
  );
}

/** Quiet icon holder for file types, chat rooms, and list items. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  tone = 'primary',
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tone?: 'primary' | 'danger';
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center"
      role={tone === 'danger' ? 'alert' : undefined}
    >
      <span
        className={cn(
          'mb-1.5 flex size-9 items-center justify-center rounded-full',
          tone === 'danger'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted/70 text-muted-foreground'
        )}
      >
        {icon}
      </span>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

const skeletonWidths = ['w-36', 'w-24', 'w-16', 'w-20', 'w-28', 'w-12'];

export function SkeletonRows({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border/40 last:border-b-0">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className={tdClass}>
              <div
                className={cn(
                  'h-3 animate-pulse rounded-full bg-muted/70',
                  skeletonWidths[(r + c) % skeletonWidths.length]
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* TanStack helpers                                                    */
/* ------------------------------------------------------------------ */

export function FacetFilter<T>({
  table,
  columnId,
  label,
  options,
}: {
  table: Table<T>;
  columnId: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const column = table.getColumn(columnId);
  const current = (column?.getFilterValue() as string[] | undefined) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            toolbarBtnClass,
            current.length > 0 && 'bg-primary/8 text-primary hover:bg-primary/12'
          )}
        >
          <span>{label}</span>
          {current.length > 0 && (
            <span className="tabular text-[11px] font-semibold text-primary">
              · {current.length}
            </span>
          )}
          <ChevronDown className="size-3.5 shrink-0 opacity-55" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={menuContentClass}>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={current.includes(option.value)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) => {
              const next = checked
                ? [...current, option.value]
                : current.filter((v) => v !== option.value);
              column?.setFilterValue(next.length ? next : undefined);
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {current.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column?.setFilterValue(undefined)}>
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ColumnsMenu<T>({
  table,
  labels,
}: {
  table: Table<T>;
  labels: Record<string, string>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={toolbarBtnClass}>
          <span>Columns</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-55" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuContentClass}>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {labels[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TablePagination<T>({
  table,
  noun,
}: {
  table: Table<T>;
  noun: string;
}) {
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const total = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-5 py-2.5">
      <p className="tabular text-xs text-muted-foreground">
        {selected > 0
          ? `${selected} of ${total} ${noun} selected`
          : `${total} ${noun}`}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Rows</span>
          <select
            className="h-7 rounded-lg bg-transparent px-1.5 text-xs text-foreground outline-none transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring/30"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="tabular text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {pageCount}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(pagerBtnClass, 'hidden lg:inline-flex')}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" />
          </button>
          <button
            type="button"
            className={pagerBtnClass}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            className={pagerBtnClass}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            className={cn(pagerBtnClass, 'hidden lg:inline-flex')}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}