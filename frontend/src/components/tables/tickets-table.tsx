'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  LifeBuoy,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from '@/hooks/api/useSupportTickets';
import { cn } from '@/lib/utils';
import {
  ColumnsMenu,
  EmptyState,
  FacetFilter,
  Initials,
  PillTone,
  SkeletonRows,
  SortButton,
  StatusPill,
  TablePagination,
  TableScroll,
  TableShell,
  TableToolbar,
  checkboxClass,
  dialogCancelClass,
  dialogDangerClass,
  formatDate,
  menuContentClass,
  rowActionClass,
  rowClass,
  tdClass,
  thClass,
  timeAgo,
  toolbarBtnClass,
} from './table-kits';

interface TicketsTableProps {
  data?: SupportTicket[];
  loading?: boolean;
  onTicketSelect?: (ticket: SupportTicket) => void;
  onTicketEdit?: (ticket: SupportTicket) => void;
  onTicketDelete?: (ticketId: string) => void;
  onTicketAssign?: (ticketId: string, userId: string) => void;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onPriorityChange?: (ticketId: string, priority: TicketPriority) => void;
  toolbarLeading?: ReactNode;
}

const STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING_CUSTOMER',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
];
const PRIORITIES: TicketPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
  'CRITICAL',
];

const statusMeta: Record<TicketStatus, { label: string; tone: PillTone; pulse?: boolean }> = {
  OPEN: { label: 'Open', tone: 'danger', pulse: true },
  IN_PROGRESS: { label: 'In progress', tone: 'warning' },
  PENDING_CUSTOMER: { label: 'Pending customer', tone: 'warning' },
  RESOLVED: { label: 'Resolved', tone: 'primary' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

const priorityMeta: Record<TicketPriority, { label: string; tone: PillTone }> = {
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'primary' },
  HIGH: { label: 'High', tone: 'warning' },
  URGENT: { label: 'Urgent', tone: 'danger' },
  CRITICAL: { label: 'Critical', tone: 'danger' },
};

const statusOptions = STATUSES.map((s) => ({ value: s, label: statusMeta[s].label }));
const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: priorityMeta[p].label }));

const columnLabels: Record<string, string> = {
  ticketNumber: 'Ticket',
  title: 'Title',
  status: 'Status',
  priority: 'Priority',
  customerName: 'Customer',
  createdBy: 'Created by',
  assignedAgent: 'Assigned to',
  category: 'Category',
  updatedAt: 'Last updated',
  createdAt: 'Created',
};

const fullName = (u: { firstName: string; lastName: string }) =>
  `${u.firstName} ${u.lastName}`.trim();

const arrayFilter = (
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) => value.includes(row.getValue(id) as string);

export function TicketsTable({
  data = [],
  loading = false,
  onTicketSelect,
  onTicketEdit,
  onTicketDelete,
  onTicketAssign,
  onStatusChange,
  onPriorityChange,
  toolbarLeading,
}: TicketsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // Calmer by default - everything stays available in the Columns menu.
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdBy: false,
    category: false,
    createdAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  const columns: ColumnDef<SupportTicket>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          className={checkboxClass}
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className={checkboxClass}
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket',
      cell: ({ row }) => (
        <span className="tabular whitespace-nowrap text-xs font-medium text-muted-foreground">
          {row.original.ticketNumber || row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortButton
          label="Title"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const t = row.original;
        const attachments = t._count?.attachments ?? 0;
        const comments = t._count?.comments ?? 0;
        return (
          <div className="max-w-sm min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
            <div className="mt-0.5 flex items-center gap-3">
              <p className="truncate text-xs text-muted-foreground">{t.description}</p>
              {attachments > 0 && (
                <span className="tabular inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                  <Paperclip className="size-3" />
                  {attachments}
                </span>
              )}
              {comments > 0 && (
                <span className="tabular inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageSquare className="size-3" />
                  {comments}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const m = statusMeta[row.original.status];
        return (
          <StatusPill tone={m.tone} pulse={m.pulse}>
            {m.label}
          </StatusPill>
        );
      },
      filterFn: arrayFilter,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const m = priorityMeta[row.original.priority];
        return <StatusPill tone={m.tone}>{m.label}</StatusPill>;
      },
      filterFn: arrayFilter,
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{row.original.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.customerEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created by',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original.createdBy;
        return u ? (
          <div className="flex items-center gap-2.5">
            <Initials name={fullName(u)} size="sm" />
            <span className="truncate text-sm text-foreground">{fullName(u)}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Unknown</span>
        );
      },
    },
    {
      accessorKey: 'assignedAgent',
      header: 'Assigned to',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original.assignedAgent;
        return u ? (
          <div className="flex items-center gap-2.5">
            <Initials name={fullName(u)} size="sm" />
            <span className="truncate text-sm text-foreground">{fullName(u)}</span>
          </div>
        ) : (
          <StatusPill tone="warning">Unassigned</StatusPill>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original.category;
        return c ? (
          <span className="inline-flex items-center gap-2 text-xs text-foreground">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: c.color || 'var(--chart-2)' }}
            />
            {c.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <SortButton
          label="Updated"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular whitespace-nowrap text-xs text-muted-foreground">
          {timeAgo(row.original.updatedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="tabular whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={rowActionClass} aria-label="Ticket actions">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(menuContentClass, 'w-52')}>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Ticket
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/tickets/${t.id}`}>
                    <Eye className="mr-2 size-4 shrink-0" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/tickets/${t.id}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 size-4 shrink-0" />
                    Open in new tab
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTicketEdit?.(t)}>
                  <Pencil className="mr-2 size-4 shrink-0" />
                  Edit ticket
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(t.ticketNumber || t.id)}
                >
                  Copy ticket ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CheckCircle className="mr-2 size-4 shrink-0" />
                    Change status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className={menuContentClass}>
                    {STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        disabled={t.status === s}
                        onClick={() => onStatusChange?.(t.id, s)}
                      >
                        {statusMeta[s].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <AlertCircle className="mr-2 size-4 shrink-0" />
                    Change priority
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className={menuContentClass}>
                    {PRIORITIES.map((p) => (
                      <DropdownMenuItem
                        key={p}
                        disabled={t.priority === p}
                        onClick={() => onPriorityChange?.(t.id, p)}
                      >
                        {priorityMeta[p].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={() => onTicketAssign?.(t.id, 'current-user')}>
                  <UserCheck className="mr-2 size-4 shrink-0" />
                  Assign to me
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setTicketToDelete(t)}
                >
                  <Trash2 className="mr-2 size-4 shrink-0" />
                  Delete ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkStatusChange = (status: TicketStatus) => {
    if (selectedRows.length === 0) return toast.error('No tickets selected');
    selectedRows.forEach((r) => onStatusChange?.(r.original.id, status));
    toast.success(
      `${selectedRows.length} tickets set to ${statusMeta[status].label.toLowerCase()}`
    );
    setRowSelection({});
  };

  const handleBulkAssign = () => {
    if (selectedRows.length === 0) return toast.error('No tickets selected');
    selectedRows.forEach((r) => onTicketAssign?.(r.original.id, 'current-user'));
    toast.success(`${selectedRows.length} tickets assigned to you`);
    setRowSelection({});
  };

  const exportTickets = () => {
    const list = selectedRows.length > 0 ? selectedRows.map((r) => r.original) : data;
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const headers = [
      'ID',
      'Ticket Number',
      'Title',
      'Status',
      'Priority',
      'Customer Name',
      'Customer Email',
      'Created By',
      'Assigned To',
      'Category',
      'Created',
      'Updated',
    ];
    const csv = [
      headers.join(','),
      ...list.map((t) =>
        [
          t.id,
          t.ticketNumber || '',
          q(t.title),
          t.status,
          t.priority,
          q(t.customerName),
          q(t.customerEmail),
          q(t.createdBy ? fullName(t.createdBy) : ''),
          q(t.assignedAgent ? fullName(t.assignedAgent) : 'Unassigned'),
          q(t.category?.name || ''),
          formatDate(t.createdAt),
          formatDate(t.updatedAt),
        ].join(',')
      ),
    ].join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tickets exported');
  };

  return (
    <TableShell>
      <TableToolbar>
        {toolbarLeading}
        <div className="flex flex-wrap items-center gap-2">
          <FacetFilter table={table} columnId="status" label="Status" options={statusOptions} />
          <FacetFilter table={table} columnId="priority" label="Priority" options={priorityOptions} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <span className="tabular text-xs text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={toolbarBtnClass}>
                    Set status
                    <ChevronDown className="size-3.5 shrink-0 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={menuContentClass}>
                  {STATUSES.map((s) => (
                    <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)}>
                      {statusMeta[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" className={toolbarBtnClass} onClick={handleBulkAssign}>
                <UserCheck className="size-3.5 shrink-0" />
                Assign to me
              </button>
            </>
          )}
          <button type="button" className={toolbarBtnClass} onClick={exportTickets}>
            <Download className="size-3.5 shrink-0" />
            Export
          </button>
          <ColumnsMenu table={table} labels={columnLabels} />
        </div>
      </TableToolbar>

      <TableScroll>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border/60">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={cn(thClass, h.column.id === 'select' && 'w-10')}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows columns={table.getVisibleLeafColumns().length} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(rowClass, 'cursor-pointer')}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={() => onTicketSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={tdClass}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length}>
                  <EmptyState
                    icon={<LifeBuoy className="size-5" />}
                    title="No tickets found"
                    description="Nothing matches your filters yet. New support tickets will show up here."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScroll>

      <TablePagination table={table} noun="tickets" />

      {/* One delete dialog for the whole table, outside the dropdown */}
      <AlertDialog
        open={!!ticketToDelete}
        onOpenChange={(open) => !open && setTicketToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl border-border/70 bg-card text-card-foreground shadow-soft">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <strong>{ticketToDelete?.ticketNumber || ticketToDelete?.id}</strong> and all
              of its comments and attachments. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={dialogCancelClass}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={dialogDangerClass}
              onClick={() => {
                if (ticketToDelete) onTicketDelete?.(ticketToDelete.id);
                setTicketToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TableShell>
  );
}