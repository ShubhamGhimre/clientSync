'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  MessageSquare, 
  FileText,
  ArrowUpDown,
  Calendar,
  Eye,
  Play,
  Pause
} from 'lucide-react'
import Link from 'next/link'

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
}

const columnHelper = createColumnHelper<ChatBot>()

export function ChatbotsTable({ 
  data, 
  loading = false,
  onChatbotSelect,
  onChatbotEdit,
  onChatbotDelete,
  onChatbotToggle 
}: ChatbotsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="size-4 shrink-0 ml-2" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            {row.original.description || 'No description'}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('isKnowledgeInitialized', {
      header: 'Status',
      cell: ({ getValue, row }) => {
        const isInitialized = getValue()
        const isActive = row.original.isActive
        
        if (!isInitialized) {
          return <span className="badge badge-warning">Pending</span>
        }
        
        return (
          <span className={isActive !== false ? 'badge badge-success' : 'badge badge-neutral'}>
            {isActive !== false ? 'Active' : 'Inactive'}
          </span>
        )
      },
    }),
    columnHelper.accessor('totalChunks', {
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Chunks
            <ArrowUpDown className="size-4 shrink-0 ml-2" />
          </button>
        )
      },
      cell: ({ getValue }) => (
        <span className="tabular text-sm">
          {getValue()?.toLocaleString() || '0'}
        </span>
      ),
    }),
    columnHelper.accessor('_count.chatRooms', {
      header: 'Chats',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('_count.files', {
      header: 'Files',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="size-4 shrink-0 ml-2" />
          </button>
        )
      },
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="size-4 shrink-0" />
          <span>{new Date(getValue()).toLocaleDateString()}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="btn btn-ghost btn-icon btn-sm">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChatbotSelect?.(row.original)}>
              <Eye className="size-4 shrink-0 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChatbotEdit?.(row.original)}>
              <Edit className="size-4 shrink-0 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/chatbots/${row.original.id}?tab=chat`}>
                <MessageSquare className="size-4 shrink-0 mr-2" />
                Test Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.isActive !== false ? (
              <DropdownMenuItem onClick={() => onChatbotToggle?.(row.original.id, false)}>
                <Pause className="size-4 shrink-0 mr-2" />
                Pause
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onChatbotToggle?.(row.original.id, true)}>
                <Play className="size-4 shrink-0 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onChatbotDelete?.(row.original.id)}
            >
              <Trash2 className="size-4 shrink-0 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (loading) {
    return (
      <div className="surface">
        <div className="surface-header">
          <h3 className="text-lg font-semibold">Chatbots</h3>
        </div>
        <div className="surface-pad flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton p-6" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="surface">
      <div className="surface-header">
        <h3 className="text-lg font-semibold">Chatbots</h3>
      </div>
      <div className="surface-pad">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={() => onChatbotSelect?.(row.original)}
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
                    className="text-center p-6"
                  >
                    No chatbots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
