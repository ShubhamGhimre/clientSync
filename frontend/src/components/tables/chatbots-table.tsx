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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
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
          return <Badge variant="secondary">Pending</Badge>
        }
        
        return (
          <Badge variant={isActive !== false ? 'default' : 'outline'}>
            {isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('totalChunks', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium"
          >
            Chunks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">
          {getValue()?.toLocaleString() || '0'}
        </span>
      ),
    }),
    columnHelper.accessor('_count.chatRooms', {
      header: 'Chats',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('_count.files', {
      header: 'Files',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
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
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChatbotSelect?.(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChatbotEdit?.(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/chatbots/${row.original.id}?tab=chat`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Test Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.isActive !== false ? (
              <DropdownMenuItem onClick={() => onChatbotToggle?.(row.original.id, false)}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onChatbotToggle?.(row.original.id, true)}>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onChatbotDelete?.(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
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
      <Card>
        <CardHeader>
          <CardTitle>Chatbots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbots</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onChatbotSelect?.(row.original)}
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
                  No chatbots found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}