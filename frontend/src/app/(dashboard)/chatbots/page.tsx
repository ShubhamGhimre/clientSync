'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Plus, 
  Search, 
  FileText, 
  MessageSquare, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ChatbotsTable } from '@/components/tables/chatbots-table';

import { useChatBots } from '@/hooks/api/useChatBots';

export default function ChatBotsPage() {
  const router = useRouter();
  const { data, isLoading } = useChatBots();
  const chatbots = data?.data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredChatbots = chatbots.filter(chatbot =>
    chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chatbot.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteChatbot = async (chatbotId: string, chatbotName: string) => {
    // if (confirm(`Are you sure you want to delete "${chatbotName}"? This action cannot be undone.`)) {
    //   try {
    //     await deleteMutation.mutateAsync(chatbotId);
    //   } catch (error) {
    //     console.error('Failed to delete chatbot:', error);
    //   }
    // }
  };

  // Handler functions for the table
  const handleChatbotSelect = (chatbot: any) => {
    router.push(`/chatbots/${chatbot.id}`);
  };

  const handleChatbotEdit = (chatbot: any) => {
    router.push(`/chatbots/${chatbot.id}/edit`);
  };

  const handleChatbotDelete = (chatbotId: string) => {
    const chatbot = chatbots?.find(c => c.id === chatbotId);
    if (chatbot) {
      handleDeleteChatbot(chatbotId, chatbot.name);
    }
  };

  const handleChatbotToggle = (chatbotId: string, isActive: boolean) => {
    // Implement toggle logic here
    console.log('Toggle chatbot:', chatbotId, isActive);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Chatbots</h1>
        </div>
        <Button onClick={() => router.push('/chatbots/create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Chatbot
        </Button>
      </div>

      {/* Stats */}
      {chatbots && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Chatbots</p>
                  <p className="text-2xl font-bold">{chatbots.length}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Initialized</p>
                  <p className="text-2xl font-bold">
                    {chatbots.filter(c => c.isKnowledgeInitialized).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {chatbots.filter(c => !c.isKnowledgeInitialized).length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Chats</p>
                  <p className="text-2xl font-bold">
                    {chatbots.reduce((sum, c) => sum + (c._count?.chatRooms || 0), 0)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chatbots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <ChatbotsTable 
          data={filteredChatbots}
          loading={isLoading}
          onChatbotSelect={handleChatbotSelect}
          onChatbotEdit={handleChatbotEdit}
          onChatbotDelete={handleChatbotDelete}
          onChatbotToggle={handleChatbotToggle}
        />
      ) : (
        /* Grid View */
        filteredChatbots && filteredChatbots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatbots.map((chatbot) => (
              <Card
                key={chatbot.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => router.push(`/chatbots/${chatbot.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chatbot.isKnowledgeInitialized ? 'default' : 'secondary'}>
                        {chatbot.isKnowledgeInitialized ? 'Ready' : 'Pending'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/chatbots/${chatbot.id}`);
                          }}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/chatbots/${chatbot.id}/edit`);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(chatbot.id);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChatbot(chatbot.id, chatbot.name);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {chatbot.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{chatbot.totalChunks || 0} chunks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{chatbot._count?.chatRooms || 0} chats</span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {chatbot.lastKnowledgeUpdate
                          ? `Updated ${new Date(chatbot.lastKnowledgeUpdate).toLocaleDateString()}`
                          : `Created ${new Date(chatbot.createdAt).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chatbots found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? 'No chatbots match your search criteria.' : 'Get started by creating your first chatbot.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/chatbots/create')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Chatbot
                </Button>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}