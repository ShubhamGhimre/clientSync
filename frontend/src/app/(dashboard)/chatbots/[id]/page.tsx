'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FilesTable } from '@/components/tables/files-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Bot, 
  FileText, 
  MessageSquare, 
  Settings, 
  Upload,
  Play,
  Pause,
  BarChart3,
  Sparkles,
  Activity,
  Database,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '@/components/file-upload/file-upload'
import { ChatInterface } from '@/components/chatbot/chat-interface'

import { useChatBot } from '@/hooks/api/useChatBots';
import { useParams, useRouter } from 'next/navigation'
import KnowledgeBaseInitializer from '@/components/chatbot/knowledge-base-initializer'

export default function ChatbotDetailPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const {id} = useParams()
  const { data, isLoading, error } = useChatBot(id as string);
  const chatbot = data?.data;
  const router = useRouter();

  const handleChatStart = () => {
    router.push(`/chatbots/${id}/chats`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
            <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !chatbot) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load chatbot</h2>
          <p className="text-slate-600">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2">
              <Link href="/chatbots">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chatbots
              </Link>
            </Button>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">{chatbot.name}</h1>
                  <Badge 
                    variant={chatbot.isKnowledgeInitialized ? 'default' : 'secondary'}
                    className={`px-3 py-1 text-sm font-medium ${
                      chatbot.isKnowledgeInitialized 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}
                  >
                    {chatbot.isKnowledgeInitialized ? (
                      <>
                        <Zap className="w-3 h-3 mr-1.5" />
                        Active
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3 mr-1.5" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-slate-600 text-lg max-w-2xl">{chatbot.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="default" className="border-slate-200 hover:bg-slate-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="default" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25" onClick={
                handleChatStart
              }>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Modern Tab Navigation */}
          <TabsList className="h-12 p-1 bg-white border border-slate-200/60 shadow-sm rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              Files
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Chunks</CardTitle>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-slate-900">{chatbot.totalChunks?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-slate-500 mt-1">Knowledge pieces</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Chat Rooms</CardTitle>
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-slate-900">{chatbot._count?.chatRooms ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Active conversations</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Files Uploaded</CardTitle>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-slate-900">{chatbot._count?.files ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Training documents</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Bot className="h-4 w-4 text-slate-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">
                    {chatbot.isKnowledgeInitialized ? (
                      <span className="text-emerald-600">Ready</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">System status</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
                    <CardDescription className="text-slate-500">Latest updates and interactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">Knowledge base updated</p>
                        <span className="text-xs text-slate-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-slate-600">Successfully processed 3 new documents</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">New conversation started</p>
                        <span className="text-xs text-slate-500">5 hours ago</span>
                      </div>
                      <p className="text-sm text-slate-600">User initiated chat session #1247</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">File uploaded: technical-docs.pdf</p>
                        <span className="text-xs text-slate-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-slate-600">Document processing completed successfully</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-8">
              <FileUpload chatbotId={id as string} />
              <div className="bg-white rounded-xl border-0 shadow-sm p-6">
                <FilesTable chatbotId={id as string} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge">
            <div className="bg-white rounded-xl border-0 shadow-sm p-6">
              <KnowledgeBaseInitializer chatbotId={id as string} />
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="bg-white rounded-xl border-0 shadow-sm">
              <ChatInterface chatbotId={id as string} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Analytics</CardTitle>
                    <CardDescription className="text-slate-500">Performance metrics and insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Analytics Coming Soon</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Get detailed insights into your chatbot's performance, user engagement, and knowledge base effectiveness.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}