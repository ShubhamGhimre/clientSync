'use client';

/**
 * Users table - renders ONLY the scrolling table + pager footer.
 * The surface (TableShell) and toolbar (search / filters) are owned by the page,
 * so there is exactly one container and no card-inside-card.
 */
import { useState } from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Power,
  Shield,
  Ticket,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
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
import type { User } from '@/hooks/api/useUsers';
import { cn } from '@/lib/utils';
import {
  EmptyState,
  Initials,
  PillTone,
  SkeletonRows,
  SortButton,
  StatusPill,
  TableScroll,
  menuContentClass,
  pagerBtnClass,
  rowActionClass,
  rowClass,
  tdClass,
  thClass,
  toolbarBtnClass,
} from './table-kits';

type Role = 'ADMIN' | 'AGENT' | 'VIEWER';

interface UsersTableProps {
  data?: User[];
  loading?: boolean;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  onUserInvite?: () => void;
  onRoleChange?: (userId: string, role: Role) => void;
  onStatusToggle?: (userId: string, currentStatus: boolean) => void;
  onResetPassword?: (userId: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
  onPageChange?: (page: number) => void;
  isAdmin?: boolean;
  isMutating?: boolean;
}

const roleTone: Record<Role, PillTone> = {
  ADMIN: 'primary',
  AGENT: 'warning',
  VIEWER: 'neutral',
};

const roleLabel: Record<Role, string> = {
  ADMIN: 'Admin',
  AGENT: 'Agent',
  VIEWER: 'Viewer',
};

const dateOnly = (v: string) =>
  new Date(v).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const timeOnly = (v: string) =>
  new Date(v).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

/** Adjust these keys to match whatever your API puts in `_count`. */
const getCounts = (user: User) => {
  const c =
    (user as unknown as { _count?: Record<string, number> })._count ?? {};
  return {
    tickets: c.assignedTickets ?? c.tickets ?? c.createdTickets ?? 0,
    comments: c.comments ?? 0,
  };
};

export function UsersTable({
  data = [],
  loading = false,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onUserInvite,
  onRoleChange,
  onStatusToggle,
  onResetPassword,
  pagination,
  onPageChange,
  isAdmin = false,
  isMutating = false,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      accessorFn: (u) => `${u.firstName} ${u.lastName}`,
      header: ({ column }) => (
        <SortButton
          label="User"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Initials name={`${u.firstName} ${u.lastName}`} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {u.firstName} {u.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {u.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <SortButton
          label="Role"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const role = row.original.role as Role;
        return (
          <StatusPill tone={roleTone[role] ?? 'neutral'}>
            {roleLabel[role] ?? role}
          </StatusPill>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isActive ? (
          <StatusPill tone="primary">Active</StatusPill>
        ) : (
          <StatusPill tone="neutral">Inactive</StatusPill>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortButton
          label="Joined"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <div className="tabular whitespace-nowrap">
          <p className="text-sm text-foreground">
            {dateOnly(row.original.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            {timeOnly(row.original.createdAt)}
          </p>
        </div>
      ),
    },
    {
      id: 'activity',
      header: 'Activity',
      enableSorting: false,
      cell: ({ row }) => {
        const { tickets, comments } = getCounts(row.original);
        return (
          <div className="tabular flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5" title="Tickets">
              <Ticket className="size-3.5 shrink-0" />
              {tickets}
            </span>
            <span className="inline-flex items-center gap-1.5" title="Comments">
              <MessageSquare className="size-3.5 shrink-0" />
              {comments}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={rowActionClass}
                  disabled={isMutating}
                  aria-label={`Actions for ${u.firstName} ${u.lastName}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(menuContentClass, 'w-52')}
              >
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Manage user
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onUserEdit?.(u)}>
                  <Pencil className="mr-2 size-4 shrink-0" />
                  Edit details
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Shield className="mr-2 size-4 shrink-0" />
                        Change role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className={menuContentClass}>
                        {(['ADMIN', 'AGENT', 'VIEWER'] as const).map((r) => (
                          <DropdownMenuItem
                            key={r}
                            disabled={u.role === r}
                            onClick={() => onRoleChange?.(u.id, r)}
                          >
                            {roleLabel[r]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem onClick={() => onResetPassword?.(u.id)}>
                      <KeyRound className="mr-2 size-4 shrink-0" />
                      Reset password
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusToggle?.(u.id, u.isActive)}
                    >
                      <Power className="mr-2 size-4 shrink-0" />
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onUserDelete?.(u.id)}
                    >
                      <Trash2 className="mr-2 size-4 shrink-0" />
                      Delete user
                    </DropdownMenuItem>
                  </>
                )}
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const page = pagination?.page ?? 1;
  const totalPages =
    pagination?.totalPages ??
    Math.max(1, Math.ceil((pagination?.total ?? data.length) / (pagination?.limit ?? 10)));
  const total = pagination?.total ?? data.length;

  return (
    <>
      <TableScroll>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border/60">
                {hg.headers.map((h) => (
                  <th key={h.id} className={thClass}>
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
              <SkeletonRows columns={columns.length} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(rowClass, 'cursor-pointer')}
                  onClick={() => onUserSelect?.(row.original)}
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
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={<Users className="size-5" />}
                    title="No users found"
                    description="Try a different search or filter, or invite someone to your organization."
                  />
                  {isAdmin && onUserInvite && (
                    <div className="flex justify-center pb-10">
                      <button
                        type="button"
                        onClick={onUserInvite}
                        className={toolbarBtnClass}
                      >
                        <UserPlus className="size-3.5 shrink-0" />
                        Invite user
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScroll>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
        <p className="tabular text-xs text-muted-foreground">
          {total} {total === 1 ? 'user' : 'users'}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <span className="tabular text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={pagerBtnClass}
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className={pagerBtnClass}
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}