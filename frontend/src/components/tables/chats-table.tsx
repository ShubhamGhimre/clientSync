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
  MessageSquare,
  Bot,
  User,
  Clock,
  Download,
  Archive,
  Pin,
  PinOff,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Types
interface ChatRoom {
  id: string;
  title: string;
  description?: string;
  chatBotId: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
  status?: 'active' | 'paused' | 'archived';
  chatBot?: {
    id: string;
    name: string;
  };
  _count?: {
    conversations: number;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: 'user' | 'bot';
  };
}

interface ChatsTableProps {
  data: ChatRoom[];
  loading?: boolean;
  onChatSelect?: (chat: ChatRoom) => void;
  onChatEdit?: (chat: ChatRoom) => void;
  onChatDelete?: (chatId: string) => void;
  onChatArchive?: (chatId: string) => void;
  onChatPin?: (chatId: string, pinned: boolean) => void;
}

export function ChatsTable({
  data,
  loading = false,
  onChatSelect,
  onChatEdit,
  onChatDelete,
  onChatArchive,
  onChatPin,
}: ChatsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Helper functions
  const getStatusBadge = (chat: ChatRoom) => {
    if (chat.isArchived) {
      return <Badge variant="secondary">Archived</Badge>;
    }
    
    const status = chat.status || 'active';
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      paused: { variant: 'secondary' as const, label: 'Paused', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      archived: { variant: 'outline' as const, label: 'Archived', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
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

  // Column definitions
  const columns: ColumnDef<ChatRoom>[] = [
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
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Chat Room
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const chat = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {chat.isPinned && (
                <Pin className="h-3 w-3 text-orange-500 mr-1" />
              )}
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{chat.title}</p>
                {chat.isPinned && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Pinned
                  </Badge>
                )}
              </div>
              {chat.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {chat.description}
                </p>
              )}
              {chat.lastMessage && (
                <div className="flex items-center gap-2 mt-1">
                  {chat.lastMessage.sender === 'bot' ? (
                    <Bot className="h-3 w-3 text-blue-500" />
                  ) : (
                    <User className="h-3 w-3 text-green-500" />
                  )}
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {chat.lastMessage.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'chatBot',
      header: 'Chatbot',
      cell: ({ row }) => {
        const chatBot = row.original.chatBot;
        return chatBot ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatBot.name}`} />
              <AvatarFallback>
                <Bot className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{chatBot.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No chatbot</span>
        );
      },
    },
    {
      accessorKey: 'conversations',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Messages
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.conversations || 0;
        return (
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{count}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const countA = rowA.original._count?.conversations || 0;
        const countB = rowB.original._count?.conversations || 0;
        return countA - countB;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original),
      filterFn: (row, id, value) => {
        const chat = row.original;
        const status = chat.isArchived ? 'archived' : (chat.status || 'active');
        return value.includes(status);
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
          Last Activity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue('updatedAt') as string;
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
        const chat = row.original;

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
                onClick={() => navigator.clipboard.writeText(chat.id)}
              >
                Copy chat ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/chats/${chat.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatSelect?.(chat)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatEdit?.(chat)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onChatPin?.(chat.id, !chat.isPinned)}
              >
                {chat.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin chat
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin chat
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatArchive?.(chat.id)}>
                <Archive className="mr-2 h-4 w-4" />
                {chat.isArchived ? 'Unarchive' : 'Archive'} chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete chat
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{' '}
                      <strong>{chat.title}</strong> and all its conversation history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onChatDelete?.(chat.id)}
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

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedChatIds = selectedRows.map(row => row.original.id);
    
    if (selectedChatIds.length === 0) {
      toast.error('No chats selected');
      return;
    }

    // Handle bulk delete logic here
    selectedChatIds.forEach(id => onChatDelete?.(id));
    toast.success(`${selectedChatIds.length} chats deleted`);
    setRowSelection({});
  };

  const handleBulkArchive = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedChatIds = selectedRows.map(row => row.original.id);
    
    if (selectedChatIds.length === 0) {
      toast.error('No chats selected');
      return;
    }

    selectedChatIds.forEach(id => onChatArchive?.(id));
    toast.success(`${selectedChatIds.length} chats archived`);
    setRowSelection({});
  };

  const exportChats = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const chatsToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : data;

    // Simple CSV export
    const headers = ['Title', 'Description', 'Chatbot', 'Messages', 'Status', 'Created', 'Last Activity'];
    const csvContent = [
      headers.join(','),
      ...chatsToExport.map(chat => [
        `"${chat.title}"`,
        `"${chat.description || ''}"`,
        `"${chat.chatBot?.name || ''}"`,
        chat._count?.conversations || 0,
        chat.isArchived ? 'Archived' : (chat.status || 'Active'),
        formatDate(chat.createdAt),
        formatDate(chat.updatedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chats.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Chats exported successfully');
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['active', 'paused', 'archived'].map((status) => (
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
                  {status}
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
              <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={exportChats}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
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
                  onClick={() => onChatSelect?.(row.original)}
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
                  No chat rooms found.
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
          {table.getFilteredRowModel().rows.length} chat(s) selected.
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