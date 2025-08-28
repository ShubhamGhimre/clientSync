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
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  // Helper functions
  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      OPEN: { 
        variant: 'destructive' as const, 
        icon: HelpCircle, 
        label: 'Open',
        className: 'bg-red-100 text-red-800 hover:bg-red-100'
      },
      IN_PROGRESS: { 
        variant: 'default' as const, 
        icon: Clock, 
        label: 'In Progress',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      },
      PENDING_CUSTOMER: { 
        variant: 'default' as const, 
        icon: Clock, 
        label: 'Pending Customer',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      },
      RESOLVED: { 
        variant: 'secondary' as const, 
        icon: CheckCircle, 
        label: 'Resolved',
        className: 'bg-green-100 text-green-800 hover:bg-green-100'
      },
      CLOSED: { 
        variant: 'secondary' as const, 
        icon: CheckCircle, 
        label: 'Closed',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      },
      CANCELLED: { 
        variant: 'secondary' as const, 
        icon: CheckCircle, 
        label: 'Cancelled',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const priorityConfig = {
      LOW: { 
        variant: 'outline' as const, 
        label: 'Low',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      },
      MEDIUM: { 
        variant: 'secondary' as const, 
        label: 'Medium',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      },
      HIGH: { 
        variant: 'default' as const, 
        label: 'High',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      },
      URGENT: { 
        variant: 'destructive' as const, 
        label: 'Urgent',
        className: 'bg-red-100 text-red-800 hover:bg-red-100'
      },
      CRITICAL: { 
        variant: 'destructive' as const, 
        label: 'Critical',
        className: 'bg-red-200 text-red-900 hover:bg-red-200'
      },
    };

    const config = priorityConfig[priority];

    return (
      <Badge variant={config.variant} className={config.className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
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

  // Helper to get full name from user
  const getFullName = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  // Helper to get user initials
  const getUserInitials = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // Column definitions
  const columns: ColumnDef<SupportTicket>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
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
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{ticket.ticketNumber || ticket.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="min-w-0 max-w-[300px]">
            <p className="font-medium truncate">{ticket.title}</p>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {ticket.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {ticket._count?.attachments && ticket._count.attachments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {ticket._count.attachments}
                </div>
              )}
              {ticket._count?.comments && ticket._count.comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
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
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{ticket.customerName}</p>
            <p className="text-xs text-muted-foreground truncate">{ticket.customerEmail}</p>
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
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getFullName(createdBy)}`} />
              <AvatarFallback>
                {getUserInitials(createdBy)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{getFullName(createdBy)}</p>
              <p className="text-xs text-muted-foreground truncate">{createdBy.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        );
      },
    },
    {
      accessorKey: 'assignedAgent',
      header: 'Assigned To',
      cell: ({ row }) => {
        const assignedAgent = row.original.assignedAgent;
        return assignedAgent ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getFullName(assignedAgent)}`} />
              <AvatarFallback>
                {getUserInitials(assignedAgent)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{getFullName(assignedAgent)}</p>
              <p className="text-xs text-muted-foreground truncate">{assignedAgent.email}</p>
            </div>
          </div>
        ) : (
          <Badge variant="outline" className="text-orange-600">
            Unassigned
          </Badge>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <span className="text-sm">{category.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No category</span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{getTimeAgo(updatedAt)}</span>
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTicketSelect?.(ticket)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTicketEdit?.(ticket)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Status Change Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CheckCircle className="mr-2 h-4 w-4" />
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

              {/* Priority Change Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertCircle className="mr-2 h-4 w-4" />
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
                <UserCheck className="mr-2 h-4 w-4" />
                Assign to me
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onTicketDelete?.(ticket.id)}
                      className="bg-red-600 hover:bg-red-700"
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

    // Simple CSV export
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
    <div className="w-full space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
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

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Priority
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'].map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  className="capitalize"
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

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {Object.keys(rowSelection).length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {Object.keys(rowSelection).length} selected
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Status
                  </Button>
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

              <Button variant="outline" size="sm" onClick={() => handleBulkAssign('current-user')}>
                <Users className="mr-2 h-4 w-4" />
                Assign to Me
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={exportTickets}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
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

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTicketSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No support tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} ticket(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              «
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              ‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              ›
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}