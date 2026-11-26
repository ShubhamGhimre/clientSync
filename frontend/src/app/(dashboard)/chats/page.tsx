// /shuv/ClientSync/frontend/src/app/(dashboard)/chats/page.tsx
'use client'

import { useState } from 'react'
import { Clock, MessageSquare, Plus } from 'lucide-react'
import { ChatsTable } from '@/components/tables/chats-table'
import {
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SearchField,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits'

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

  const activeToday = chats.filter(chat =>
    new Date(chat.updatedAt).toDateString() === new Date().toDateString()
  ).length

  const totalMessages = chats.reduce(
    (sum, chat) => sum + (chat._count?.conversations || 0),
    0
  )

  const statItems: StatItem[] = [
    {
      label: 'Total Chats',
      value: chats.length,
      icon: MessageSquare,
      iconClass: 'text-primary',
    },
    {
      label: 'Active Today',
      value: activeToday,
      icon: Clock,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Total Messages',
      value: totalMessages,
      icon: MessageSquare,
      iconClass: 'text-chart-3',
    },
    {
      label: 'Avg. Response Time',
      value: '2.3s',
      icon: Clock,
      iconClass: 'text-chart-4',
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Chat Rooms"
        description="Monitor and manage all chat conversations."
        actions={
          <PrimaryActionButton href="/chats/create" icon={Plus}>
            Create Chat Room
          </PrimaryActionButton>
        }
      />

      <StatsStrip items={statItems} />

      <ChatsTable
        data={filteredChats}
        onChatSelect={handleChatSelect}
        onChatEdit={handleChatEdit}
        onChatDelete={handleChatDelete}
        toolbarLeading={
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search chats"
          />
        }
      />
    </PageContainer>
  )
}
