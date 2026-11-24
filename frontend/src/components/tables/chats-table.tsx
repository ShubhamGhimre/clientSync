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

  const getStatusBadge = (chat: ChatRoom) => {
    if (chat.isArchived) {
      return <span className="badge badge-neutral">Archived</span>;
    }
    
    const status = chat.status || 'active';
    const statusConfig = {
      active: { badgeClass: 'badge badge-success', label: 'Active' },
      paused: { badgeClass: 'badge badge-warning', label: 'Paused' },
      archived: { badgeClass: 'badge badge-outline', label: 'Archived' },
    };

    const config = statusConfig[status];
    return (
      <span className={config.badgeClass}>
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

  const columns: ColumnDef<ChatRoom>[] = [
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
      accessorKey: 'title',
      header: ({ column }) => (
        <button
          type="button"
          className="ui-button ui-button-ghost ui-button-size-sm t-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Chat Room
          <ArrowUpDown className="ico space-l-2" />
        </button>
      ),
      cell: ({ row }) => {
        const chat = row.original;
        return (
          <div className="row g-3">
            <div className="row">
              {chat.isPinned && (
                <Pin className="ico-xs t-warning space-r-1" />
              )}
              <MessageSquare className="ico t-muted" />
            </div>
            <div className="flex-fill">
              <div className="row g-2">
                <p className="t-medium ellipsis">{chat.title}</p>
                {chat.isPinned && (
                  <span className="badge badge-warning">
                    Pinned
                  </span>
                )}
              </div>
              {chat.description && (
                <p className="t-sm t-muted ellipsis">
                  {chat.description}
                </p>
              )}
              {chat.lastMessage && (
                <div className="row g-2 space-t-1">
                  {chat.lastMessage.sender === 'bot' ? (
                    <Bot className="ico-xs t-brand" />
                  ) : (
                    <User className="ico-xs t-success" />
                  )}
                  <p className="t-xs t-muted ellipsis">
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
          <div className="row g-2">
            <Avatar className="avatar avatar-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatBot.name}`} />
              <AvatarFallback>
                <Bot className="ico-xs" />
              </AvatarFallback>
            </Avatar>
            <span className="t-medium">{chatBot.name}</span>
          </div>
        ) : (
          <span className="t-muted">No chatbot</span>
        );
      },
    },
    {
      accessorKey: 'conversations',
      header: ({ column }) => (
        <button
          type="button"
          className="ui-button ui-button-ghost ui-button-size-sm t-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Messages
          <ArrowUpDown className="ico space-l-2" />
        </button>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.conversations || 0;
        return (
          <div className="row g-2">
            <MessageSquare className="ico t-muted" />
            <span className="t-medium tabular">{count}</span>
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
        <button
          type="button"
          className="ui-button ui-button-ghost ui-button-size-sm t-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Activity
          <ArrowUpDown className="ico space-l-2" />
        </button>
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue('updatedAt') as string;
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
        const chat = row.original;

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
                onClick={() => navigator.clipboard.writeText(chat.id)}
              >
                Copy chat ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/chats/${chat.id}`}>
                  <Eye className="ico space-r-2" />
                  View chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatSelect?.(chat)}>
                <ExternalLink className="ico space-r-2" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatEdit?.(chat)}>
                <Edit className="ico space-r-2" />
                Edit chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onChatPin?.(chat.id, !chat.isPinned)}
              >
                {chat.isPinned ? (
                  <>
                    <PinOff className="ico space-r-2" />
                    Unpin chat
                  </>
                ) : (
                  <>
                    <Pin className="ico space-r-2" />
                    Pin chat
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatArchive?.(chat.id)}>
                <Archive className="ico space-r-2" />
                {chat.isArchived ? 'Unarchive' : 'Archive'} chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="t-danger"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="ico space-r-2" />
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
                    <AlertDialogCancel className="btn btn-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="btn btn-danger"
                      onClick={() => onChatDelete?.(chat.id)}
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
    <div className="stack">
      <div className="table-tools">
        <div className="row g-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-secondary push">
                Status
                <ChevronDown className="ico space-l-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['active', 'paused', 'archived'].map((status) => (
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
                  {status}
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
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleBulkArchive}>
                <Archive className="ico space-r-2" />
                Archive
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleBulkDelete}>
                <Trash2 className="ico space-r-2" />
                Delete
              </button>
            </div>
          )}

          <button type="button" className="btn btn-secondary btn-sm" onClick={exportChats}>
            <Download className="ico space-r-2" />
            Export
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="btn btn-secondary push">
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
                  onClick={() => onChatSelect?.(row.original)}
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
                  No chat rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pager">
        <div className="flex-fill t-sm t-muted">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} chat(s) selected.
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
