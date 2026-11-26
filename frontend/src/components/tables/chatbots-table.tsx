'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useState, type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Eye,
  Play,
  Pause,
} from 'lucide-react'
import Link from 'next/link'
import { BrandMark } from '@/components/logo'
import { BotAvatar , ColumnsMenu,
  EmptyState,
  SkeletonRows,
  SortButton,
  StatusPill,
  TableScroll,
  TableShell,
  TableToolbar,
  menuContentClass,
  rowActionClass,
  rowClass,
  tdClass,
  thClass,
} from './table-kits';
type ChatBot = {
  id: string
  name: string
  description?: string
  isKnowledgeInitialized: boolean
  isActive?: boolean
  totalChunks?: number
  createdAt: string
  updatedAt: string
  _count?: {
    chatRooms: number
    files: number
  }
}

interface ChatbotsTableProps {
  data: ChatBot[]
  loading?: boolean
  onChatbotSelect?: (chatbot: ChatBot) => void
  onChatbotEdit?: (chatbot: ChatBot) => void
  onChatbotDelete?: (chatbotId: string) => void
  onChatbotToggle?: (chatbotId: string, isActive: boolean) => void
  toolbar?: ReactNode
}

const columnHelper = createColumnHelper<ChatBot>()

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export function ChatbotsTable({
  data,
  loading = false,
  onChatbotSelect,
  onChatbotEdit,
  onChatbotDelete,
  onChatbotToggle,
  toolbar,
}: ChatbotsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <SortButton
          label="Name"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <BotAvatar />
          <div className="min-w-0 max-w-[16rem]">
            <p className="truncate text-sm font-semibold text-foreground">
              {row.original.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {row.original.description || 'No description'}
            </p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('isKnowledgeInitialized', {
      header: 'Status',
      cell: ({ getValue, row }) => {
        if (!getValue()) {
          return (
            <StatusPill tone="warning" pulse>
              Pending
            </StatusPill>
          )
        }
        const active = row.original.isActive !== false
        return (
          <StatusPill tone={active ? 'primary' : 'neutral'}>
            {active ? 'Active' : 'Inactive'}
          </StatusPill>
        )
      },
    }),
    columnHelper.accessor('totalChunks', {
      header: ({ column }) => (
        <SortButton
          label="Chunks"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ getValue }) => (
        <span className="tabular text-sm font-medium text-foreground">
          {(getValue() ?? 0).toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor('_count.chatRooms', {
      header: 'Chats',
      cell: ({ getValue }) => (
        <div className="tabular flex items-center gap-1.5 text-sm text-foreground">
          <MessageSquare className="size-3.5 shrink-0 text-primary" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('_count.files', {
      header: 'Files',
      cell: ({ getValue }) => (
        <div className="tabular flex items-center gap-1.5 text-sm text-foreground">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <SortButton
          label="Created"
          state={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ getValue }) => (
        <span className="tabular whitespace-nowrap text-sm text-muted-foreground">
          {shortDate(getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={rowActionClass}
                aria-label={`Actions for ${row.original.name}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-44 ${menuContentClass}`}>
              <DropdownMenuItem onClick={() => onChatbotSelect?.(row.original)}>
                <Eye className="mr-2 size-4 shrink-0" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChatbotEdit?.(row.original)}>
                <Edit className="mr-2 size-4 shrink-0" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/chatbots/${row.original.id}?tab=chat`}>
                  <MessageSquare className="mr-2 size-4 shrink-0" />
                  Test chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.isActive !== false ? (
                <DropdownMenuItem
                  onClick={() => onChatbotToggle?.(row.original.id, false)}
                >
                  <Pause className="mr-2 size-4 shrink-0" />
                  Pause
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onChatbotToggle?.(row.original.id, true)}
                >
                  <Play className="mr-2 size-4 shrink-0" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onChatbotDelete?.(row.original.id)}
              >
                <Trash2 className="mr-2 size-4 shrink-0" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  const rows = table.getRowModel().rows

  return (
    <TableShell>
      {toolbar && <TableToolbar>{toolbar}</TableToolbar>}
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
              <SkeletonRows columns={columns.length} />
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${rowClass} cursor-pointer`}
                  onClick={() => onChatbotSelect?.(row.original)}
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
          title="No chatbots yet"
          description="Create your first chatbot to start answering customer questions."
        />
      )}
    </TableShell>
  )
}