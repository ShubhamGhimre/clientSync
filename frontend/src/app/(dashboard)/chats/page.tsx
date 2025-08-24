// /shuv/ClientSync/frontend/src/app/(dashboard)/chats/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Clock,
  User,
  Bot
} from 'lucide-react'
import Link from 'next/link'
import { ChatsTable } from '@/components/tables/chats-table'

const mockChats = [
  {
    id: '1',
    title: 'Product inquiry about pricing',
    description: 'Customer asking about enterprise pricing options',
    chatBotId: '1',
    createdAt: '2024-01-23T10:30:00Z',
    updatedAt: '2024-01-23T11:45:00Z',
    isPinned: true,
    status: 'active' as const,
    chatBot: { id: '1', name: 'Customer Support Bot' },
    _count: { conversations: 12 },
    lastMessage: {
      content: 'Thank you for your inquiry about our enterprise pricing...',
      createdAt: '2024-01-23T11:45:00Z',
      sender: 'bot' as const
    }
  },
  {
    id: '2',
    title: 'Technical support request',
    description: 'API integration questions and troubleshooting',
    chatBotId: '2',
    createdAt: '2024-01-23T09:15:00Z',
    updatedAt: '2024-01-23T10:20:00Z',
    status: 'active' as const,
    chatBot: { id: '2', name: 'Technical Documentation Bot' },
    _count: { conversations: 8 },
    lastMessage: {
      content: 'Could you help me with the API integration?',
      createdAt: '2024-01-23T10:20:00Z',
      sender: 'user' as const
    }
  },
  {
    id: '3',
    title: 'General information request',
    description: 'Questions about company services and offerings',
    chatBotId: '1',
    createdAt: '2024-01-22T16:20:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    status: 'paused' as const,
    chatBot: { id: '1', name: 'Customer Support Bot' },
    _count: { conversations: 5 },
    lastMessage: {
      content: 'What services does your company offer?',
      createdAt: '2024-01-22T16:45:00Z',
      sender: 'user' as const
    }
  }
]

export default function ChatsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [chats, setChats] = useState(mockChats)

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleChatSelect = (chat: any) => {
    console.log('Selected chat:', chat);
    // Handle chat selection (navigate to chat details)
  };

  const handleChatEdit = (chat: any) => {
    console.log('Edit chat:', chat);
    // Handle chat editing
  };

  const handleChatDelete = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    console.log('Delete chat:', chatId);
  };

//   const handleChatArchive = (chatId: string) => {
//     setChats(prev => 
//       prev.map(c => 
//         c.id === chatId ? { ...c, isArchived: !c.isArchived } : c
//       )
//     );
//     console.log('Archive chat:', chatId);
//   };

//   const handleChatPin = (chatId: string, pinned: boolean) => {
//     setChats(prev => 
//       prev.map(c => 
//         c.id === chatId ? { ...c, isPinned: pinned } : c
//       )
//     );
//     console.log('Pin chat:', chatId, pinned);
//   };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Rooms</h1>
          <p className="text-muted-foreground">
            Monitor and manage all chat conversations.
          </p>
        </div>
        <Button asChild>
          <Link href="/chats/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Chat Room
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats.filter(chat => 
                new Date(chat.updatedAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats.reduce((sum, chat) => sum + (chat._count?.conversations || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chats Table */}
      <ChatsTable 
        data={filteredChats}
        onChatSelect={handleChatSelect}
        onChatEdit={handleChatEdit}
        onChatDelete={handleChatDelete}
        // onChatArchive={handleChatArchive}
        // onChatPin={handleChatPin}
      />
    </div>
  )
}