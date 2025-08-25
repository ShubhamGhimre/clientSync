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
  ExternalLink,
  Grid3X3,
  List,
  Activity,
  Clock
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
      <div className="min-h-screen bg-slate-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
              <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border">
              <Bot className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chatbots</h1>
              <p className="text-slate-600 mt-1">Manage and monitor your AI assistants</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/chatbots/create')} 
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Chatbot
          </Button>
        </div>

        {/* Stats Cards */}
        {chatbots && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Chatbots</p>
                    <p className="text-2xl font-bold text-slate-900">{chatbots.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Ready</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {chatbots.filter(c => c.isKnowledgeInitialized).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {chatbots.filter(c => !c.isKnowledgeInitialized).length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Chats</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {chatbots.reduce((sum, c) => sum + (c._count?.chatRooms || 0), 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search chatbots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white/70 backdrop-blur-sm shadow-sm rounded-xl focus:ring-2 focus:ring-slate-200 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
            <ChatbotsTable 
              data={filteredChatbots}
              loading={isLoading}
              onChatbotSelect={handleChatbotSelect}
              onChatbotEdit={handleChatbotEdit}
              onChatbotDelete={handleChatbotDelete}
              onChatbotToggle={handleChatbotToggle}
            />
          </div>
        ) : (
          /* Grid View */
          filteredChatbots && filteredChatbots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChatbots.map((chatbot) => (
                <Card
                  key={chatbot.id}
                  className="group cursor-pointer border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 rounded-xl overflow-hidden"
                  onClick={() => router.push(`/chatbots/${chatbot.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors duration-200">
                          <Bot className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1">
                            {chatbot.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={chatbot.isKnowledgeInitialized ? 'default' : 'secondary'}
                              className={`text-xs font-medium ${
                                chatbot.isKnowledgeInitialized 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              {chatbot.isKnowledgeInitialized ? 'Ready' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/chatbots/${chatbot.id}`);
                          }} className="rounded-lg">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/chatbots/${chatbot.id}/edit`);
                          }} className="rounded-lg">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(chatbot.id);
                          }} className="rounded-lg">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChatbot(chatbot.id, chatbot.name);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {chatbot.description && (
                      <CardDescription className="text-slate-600 line-clamp-2 text-sm mt-2">
                        {chatbot.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="p-1.5 bg-slate-100 rounded-lg">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{chatbot.totalChunks || 0} chunks</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="p-1.5 bg-slate-100 rounded-lg">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{chatbot._count?.chatRooms || 0} chats</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100"></div>

                      {/* Last Updated */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
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
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-slate-100 rounded-2xl mb-6">
                  <Bot className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No chatbots found</h3>
                <p className="text-slate-600 text-center max-w-md mb-6">
                  {searchTerm 
                    ? 'No chatbots match your search criteria. Try adjusting your search terms.' 
                    : 'Get started by creating your first AI chatbot assistant.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => router.push('/chatbots/create')} 
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Chatbot
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}