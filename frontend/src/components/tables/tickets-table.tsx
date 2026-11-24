'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Download,
  Filter,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SupportTicket, TicketStatus, TicketPriority } from '@/hooks/api/useSupportTickets';

interface TicketsTableProps {
  data?: SupportTicket[];
  loading?: boolean;
  onTicketSelect?: (ticket: SupportTicket) => void;
  onTicketEdit?: (ticket: SupportTicket) => void;
  onTicketDelete?: (ticketId: string) => void;
  onTicketAssign?: (ticketId: string, userId: string) => void;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onPriorityChange?: (ticketId: string, priority: TicketPriority) => void;
}

export function TicketsTable({
  data = [],
  loading = false,
  onTicketSelect,
  onTicketEdit,
  onTicketDelete,
  onTicketAssign,
  onStatusChange,
  onPriorityChange,
}: TicketsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      OPEN: { 
        badgeClass: 'badge badge-danger', 
        icon: HelpCircle, 
        label: 'Open'
      },
      IN_PROGRESS: { 
        badgeClass: 'badge badge-warning', 
        icon: Clock, 
        label: 'In Progress'
      },
      PENDING_CUSTOMER: { 
        badgeClass: 'badge badge-warning', 
        icon: Clock, 
        label: 'Pending Customer'
      },
      RESOLVED: { 
        badgeClass: 'badge badge-success', 
        icon: CheckCircle, 
        label: 'Resolved'
      },
      CLOSED: { 
        badgeClass: 'badge badge-neutral', 
        icon: CheckCircle, 
        label: 'Closed'
      },
      CANCELLED: { 
        badgeClass: 'badge badge-neutral', 
        icon: CheckCircle, 
        label: 'Cancelled'
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={config.badgeClass}>
        <Icon className="ico-xs space-r-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const priorityConfig = {
      LOW: { 
        badgeClass: 'badge badge-outline', 
        label: 'Low'
      },
      MEDIUM: { 
        badgeClass: 'badge badge-brand', 
        label: 'Medium'
      },
      HIGH: { 
        badgeClass: 'badge badge-warning', 
        label: 'High'
      },
      URGENT: { 
        badgeClass: 'badge badge-danger', 
        label: 'Urgent'
      },
      CRITICAL: { 
        badgeClass: 'badge badge-danger', 
        label: 'Critical'
      },
    };

    const config = priorityConfig[priority];

    return (
      <span className={config.badgeClass}>
        <AlertCircle className="ico-xs space-r-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const getFullName = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getUserInitials = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const columns: ColumnDef<SupportTicket>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          className="ui-checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="ui-checkbox"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket ID',
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="row g-2">
            <HelpCircle className="ico t-muted" />
            <span className="tabular t-sm">{ticket.ticketNumber || ticket.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <button
          type="button"
          className="ui-button ui-button-ghost ui-button-size-sm t-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ico space-l-2" />
        </button>
      ),
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="min-zero flex-fill">
            <p className="t-medium ellipsis">{ticket.title}</p>
            <p className="t-sm t-muted ellipsis space-t-1">
              {ticket.description}
            </p>
            <div className="row g-2 space-t-2">
              {ticket._count?.attachments && ticket._count.attachments > 0 && (
                <div className="row g-1 t-xs t-muted">
                  <Paperclip className="ico-xs" />
                  {ticket._count.attachments}
                </div>
              )}
              {ticket._count?.comments && ticket._count.comments > 0 && (
                <div className="row g-1 t-xs t-muted">
                  <MessageSquare className="ico-xs" />
                  {ticket._count.comments}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => getPriorityBadge(row.getValue('priority')),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="min-zero">
            <p className="t-sm t-medium ellipsis">{ticket.customerName}</p>
            <p className="t-xs t-muted ellipsis">{ticket.customerEmail}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        return createdBy ? (
          <div className="row g-2">
            <Avatar className="avatar avatar-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getFullName(createdBy)}`} />
              <AvatarFallback>
                {getUserInitials(createdBy)}
              </AvatarFallback>
            </Avatar>
            <div className="min-zero">
              <p className="t-sm t-medium ellipsis">{getFullName(createdBy)}</p>
              <p className="t-xs t-muted ellipsis">{createdBy.email}</p>
            </div>
          </div>
        ) : (
          <span className="t-muted">Unknown</span>
        );
      },
    },
    {
      accessorKey: 'assignedAgent',
      header: 'Assigned To',
      cell: ({ row }) => {
        const assignedAgent = row.original.assignedAgent;
        return assignedAgent ? (
          <div className="row g-2">
            <Avatar className="avatar avatar-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getFullName(assignedAgent)}`} />
              <AvatarFallback>
                {getUserInitials(assignedAgent)}
              </AvatarFallback>
            </Avatar>
            <div className="min-zero">
              <p className="t-sm t-medium ellipsis">{getFullName(assignedAgent)}</p>
              <p className="t-xs t-muted ellipsis">{assignedAgent.email}</p>
            </div>
          </div>
        ) : (
          <span className="badge badge-warning">Unassigned</span>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <div className="row g-2">
            <span 
              className="color-dot" 
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <span className="t-sm">{category.name}</span>
          </div>
        ) : (
          <span className="t-muted">No category</span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <button
          type="button"
          className="ui-button ui-button-ghost ui-button-size-sm t-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Updated
          <ArrowUpDown className="ico space-l-2" />
        </button>
      ),
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        return (
          <div className="row g-2">
            <Clock className="ico-xs t-muted" />
            <span className="t-sm">{getTimeAgo(updatedAt)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const ticket = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-ghost btn-icon btn-sm">
                <span className="sr">Open menu</span>
                <MoreHorizontal />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ticket.ticketNumber || ticket.id)}
              >
                Copy ticket ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/tickets/${ticket.id}`}>
                  <Eye className="ico space-r-2" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTicketSelect?.(ticket)}>
                <ExternalLink className="ico space-r-2" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTicketEdit?.(ticket)}>
                <Edit className="ico space-r-2" />
                Edit ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CheckCircle className="ico space-r-2" />
                  Change status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'] as const).map((status) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => onStatusChange?.(ticket.id, status)}
                      disabled={ticket.status === status}
                    >
                      {status.replace('_', ' ').toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertCircle className="ico space-r-2" />
                  Change priority
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'] as const).map((priority) => (
                    <DropdownMenuItem 
                      key={priority}
                      onClick={() => onPriorityChange?.(ticket.id, priority)}
                      disabled={ticket.priority === priority}
                    >
                      {priority.toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={() => onTicketAssign?.(ticket.id, 'current-user')}>
                <UserCheck className="ico space-r-2" />
                Assign to me
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="t-danger"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="ico space-r-2" />
                    Delete ticket
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{' '}
                      <strong>{ticket.ticketNumber || ticket.id}</strong> and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="btn btn-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="btn btn-danger"
                      onClick={() => onTicketDelete?.(ticket.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleBulkStatusChange = (status: TicketStatus) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedTicketIds = selectedRows.map(row => row.original.id);
    
    if (selectedTicketIds.length === 0) {
      toast.error('No tickets selected');
      return;
    }

    selectedTicketIds.forEach(id => onStatusChange?.(id, status));
    toast.success(`${selectedTicketIds.length} tickets updated to ${status.toLowerCase().replace('_', ' ')}`);
    setRowSelection({});
  };

  const handleBulkAssign = (userId: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedTicketIds = selectedRows.map(row => row.original.id);
    
    if (selectedTicketIds.length === 0) {
      toast.error('No tickets selected');
      return;
    }

    selectedTicketIds.forEach(id => onTicketAssign?.(id, userId));
    toast.success(`${selectedTicketIds.length} tickets assigned`);
    setRowSelection({});
  };

  const exportTickets = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ticketsToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : data;

    const headers = ['ID', 'Ticket Number', 'Title', 'Status', 'Priority', 'Customer Name', 'Customer Email', 'Created By', 'Assigned To', 'Category', 'Created', 'Updated'];
    const csvContent = [
      headers.join(','),
      ...ticketsToExport.map(ticket => [
        ticket.id,
        ticket.ticketNumber || '',
        `"${ticket.title}"`,
        ticket.status,
        ticket.priority,
        `"${ticket.customerName}"`,
        `"${ticket.customerEmail}"`,
        `"${getFullName(ticket.createdBy)}"`,
        `"${ticket.assignedAgent ? getFullName(ticket.assignedAgent) : 'Unassigned'}"`,
        `"${ticket.category?.name || ''}"`,
        formatDate(ticket.createdAt),
        formatDate(ticket.updatedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Tickets exported successfully');
  };

  return (
    <div className="stack pad-4">
      <div className="table-tools">
        <div className="row g-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-secondary">
                <Filter className="ico space-r-2" />
                Status
                <ChevronDown className="ico space-l-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize-label"
                  checked={(table.getColumn('status')?.getFilterValue() as string[])?.includes(status)}
                  onCheckedChange={(value) => {
                    const currentFilter = (table.getColumn('status')?.getFilterValue() as string[]) || [];
                    const newFilter = value
                      ? [...currentFilter, status]
                      : currentFilter.filter((s) => s !== status);
                    table.getColumn('status')?.setFilterValue(newFilter.length ? newFilter : undefined);
                  }}
                >
                  {status.replace('_', ' ').toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-secondary">
                Priority
                <ChevronDown className="ico space-l-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'].map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  className="capitalize-label"
                  checked={(table.getColumn('priority')?.getFilterValue() as string[])?.includes(priority)}
                  onCheckedChange={(value) => {
                    const currentFilter = (table.getColumn('priority')?.getFilterValue() as string[]) || [];
                    const newFilter = value
                      ? [...currentFilter, priority]
                      : currentFilter.filter((p) => p !== priority);
                    table.getColumn('priority')?.setFilterValue(newFilter.length ? newFilter : undefined);
                  }}
                >
                  {priority.toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="row g-2">
          {Object.keys(rowSelection).length > 0 && (
            <div className="row g-2">
              <span className="t-sm t-muted">
                {Object.keys(rowSelection).length} selected
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="btn btn-secondary btn-sm">
                    <CheckCircle className="ico space-r-2" />
                    Update Status
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'] as const).map((status) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => handleBulkStatusChange(status)}
                    >
                      {status.replace('_', ' ').toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleBulkAssign('current-user')}>
                <Users className="ico space-r-2" />
                Assign to Me
              </button>
            </div>
          )}

          <button type="button" className="btn btn-secondary btn-sm" onClick={exportTickets}>
            <Download className="ico space-r-2" />
            Export
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-secondary">
                Columns <ChevronDown className="ico space-l-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize-label"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {columns.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      <div className="skeleton pad-2" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="ui-table-row pointer"
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onTicketSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="align-center pad-6"
                >
                  No support tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pager">
        <div className="flex-fill t-sm t-muted">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} ticket(s) selected.
        </div>
        <div className="pager-controls">
          <div className="row g-2">
            <p className="t-sm t-medium">Rows per page</p>
            <select
              className="pager-select"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="center t-sm t-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="pager-controls">
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm show-lg-row"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr">Go to first page</span>
              «
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr">Go to previous page</span>
              ‹
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr">Go to next page</span>
              ›
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm show-lg-row"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr">Go to last page</span>
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
