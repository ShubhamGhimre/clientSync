'use client';

import { useState, type ReactNode } from 'react';
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
} from '@/components/ui/dropdown-menu';
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
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Download,
  Archive,
  Pin,
  PinOff,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { BrandMark } from '@/components/logo';
 
import { BotAvatar , ColumnsMenu,
  EmptyState,
  FacetFilter,
  IconTile,
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
  toolbarBtnClass,} from './table-kits';

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
  toolbarLeading?: ReactNode;
}

const COLUMN_LABELS: Record<string, string> = {
  title: 'Chat room',
  chatBot: 'Chatbot',
  messages: 'Messages',
  status: 'Status',
  updatedAt: 'Last activity',
  createdAt: 'Created',
};

const getStatus = (chat: ChatRoom) =>
  chat.isArchived ? 'archived' : chat.status || 'active';

export function ChatsTable({
  data,
  loading = false,
  onChatSelect,
  onChatEdit,
  onChatDelete,
  onChatArchive,
  onChatPin,
  toolbarLeading,
}: ChatsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // "Created" is hidden by default - "Last activity" tells the story. Toggle it in Columns.
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<ChatRoom>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          className={checkboxClass}
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox
            className={checkboxClass}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortButton
          label="Chat room"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const chat = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <IconTile>
              <MessageSquare className="size-4 shrink-0" />
            </IconTile>
            <div className="min-w-0 max-w-[22rem]">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {chat.title}
                </p>
                {chat.isPinned && (
                  <Pin
                    className="size-3 shrink-0 fill-chart-4 text-chart-4"
                    aria-label="Pinned"
                  />
                )}
              </div>
              {chat.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {chat.description}
                </p>
              )}
              {chat.lastMessage && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/80">
                  {chat.lastMessage.sender === 'bot' ? (
                    <BrandMark size={12} />
                  ) : (
                    <User className="size-3 shrink-0" />
                  )}
                  <p className="truncate">{chat.lastMessage.content}</p>
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
            <BotAvatar size="sm" />
            <span className="text-sm font-medium text-foreground">
              {chatBot.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No chatbot</span>
        );
      },
    },
    {
      id: 'messages',
      accessorFn: (chat) => chat._count?.conversations ?? 0,
      header: ({ column }) => (
        <SortButton
          label="Messages"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ getValue }) => (
        <span className="tabular text-sm font-medium text-foreground">
          {getValue<number>()}
        </span>
      ),
    },
    {
      id: 'status',
      accessorFn: (chat) => getStatus(chat),
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const tone =
          status === 'active' ? 'primary' : status === 'paused' ? 'warning' : 'neutral';
        return (
          <StatusPill tone={tone}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusPill>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <SortButton
          label="Last activity"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular whitespace-nowrap text-sm text-muted-foreground">
          {timeAgo(row.original.updatedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="tabular whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const chat = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()} className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={rowActionClass}
                  aria-label={`Actions for ${chat.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-48 ${menuContentClass}`}>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(chat.id)}
                >
                  Copy chat ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/chats/${chat.id}`}>
                    <Eye className="mr-2 size-4 shrink-0" />
                    View chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChatSelect?.(chat)}>
                  <ExternalLink className="mr-2 size-4 shrink-0" />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChatEdit?.(chat)}>
                  <Edit className="mr-2 size-4 shrink-0" />
                  Edit chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChatPin?.(chat.id, !chat.isPinned)}>
                  {chat.isPinned ? (
                    <>
                      <PinOff className="mr-2 size-4 shrink-0" />
                      Unpin chat
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 size-4 shrink-0" />
                      Pin chat
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChatArchive?.(chat.id)}>
                  <Archive className="mr-2 size-4 shrink-0" />
                  {chat.isArchived ? 'Unarchive' : 'Archive'} chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 size-4 shrink-0" />
                      Delete chat
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-border bg-card text-card-foreground shadow-soft">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete{' '}
                        <strong>{chat.title}</strong> and all its conversation
                        history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={dialogCancelClass}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className={dialogDangerClass}
                        onClick={() => onChatDelete?.(chat.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const selectedIds = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  const handleBulkDelete = () => {
    const ids = selectedIds();
    if (ids.length === 0) {
      toast.error('No chats selected');
      return;
    }
    ids.forEach((id) => onChatDelete?.(id));
    toast.success(`${ids.length} chats deleted`);
    setRowSelection({});
  };

  const handleBulkArchive = () => {
    const ids = selectedIds();
    if (ids.length === 0) {
      toast.error('No chats selected');
      return;
    }
    ids.forEach((id) => onChatArchive?.(id));
    toast.success(`${ids.length} chats archived`);
    setRowSelection({});
  };

  const exportChats = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const chatsToExport =
      selectedRows.length > 0 ? selectedRows.map((row) => row.original) : data;

    const headers = [
      'Title',
      'Description',
      'Chatbot',
      'Messages',
      'Status',
      'Created',
      'Last Activity',
    ];
    const csvContent = [
      headers.join(','),
      ...chatsToExport.map((chat) =>
        [
          `"${chat.title}"`,
          `"${chat.description || ''}"`,
          `"${chat.chatBot?.name || ''}"`,
          chat._count?.conversations || 0,
          chat.isArchived ? 'Archived' : chat.status || 'Active',
          formatDate(chat.createdAt),
          formatDate(chat.updatedAt),
        ].join(',')
      ),
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

  const selectedCount = Object.keys(rowSelection).length;
  const rows = table.getRowModel().rows;

  return (
    <TableShell>
      <TableToolbar>
        {toolbarLeading}
        <div className="flex flex-wrap items-center gap-2">
          <FacetFilter
            table={table}
            columnId="status"
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <>
              <span className="tabular mr-1 text-xs text-muted-foreground">
                {selectedCount} selected
              </span>
              <button type="button" className={toolbarBtnClass} onClick={handleBulkArchive}>
                <Archive className="size-3.5 shrink-0" />
                Archive
              </button>
              <button
                type="button"
                className={`${toolbarBtnClass} text-destructive hover:bg-destructive/10`}
                onClick={handleBulkDelete}
              >
                <Trash2 className="size-3.5 shrink-0" />
                Delete
              </button>
            </>
          )}
          <button type="button" className={toolbarBtnClass} onClick={exportChats}>
            <Download className="size-3.5 shrink-0" />
            Export
          </button>
          <ColumnsMenu table={table} labels={COLUMN_LABELS} />
        </div>
      </TableToolbar>

      <TableScroll>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/60">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className={thClass}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows columns={table.getVisibleLeafColumns().length} />
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${rowClass} cursor-pointer`}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onChatSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={tdClass}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableScroll>

      {!loading && rows.length === 0 && (
        <EmptyState
          icon={<BrandMark size={22} />}
          title="No chat rooms found"
          description="Conversations with your chatbots will show up here."
        />
      )}

      <TablePagination table={table} noun="chats" />
    </TableShell>
  );
}