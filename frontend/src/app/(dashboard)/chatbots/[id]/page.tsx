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
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '@/components/file-upload/file-upload'
import { KnowledgeBaseInitializer } from '@/components/chatbot/knowledge-base-initializer'
import { ChatInterface } from '@/components/chatbot/chat-interface'


import { useChatBot } from '@/hooks/api/useChatBots';
import { useParams } from 'next/navigation'

export default function ChatbotDetailPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const {id} = useParams()
  const { data, isLoading, error } = useChatBot(id as string);
  const chatbot = data?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading chatbot...</div>;
  }
  if (error || !chatbot) {
    return <div className="p-8 text-center text-destructive">Failed to load chatbot.</div>;
  }

  return (
    <div className="space-y-6 px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chatbots">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbots
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bot className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">{chatbot.name}</h1>
            <p className="text-muted-foreground">{chatbot.description}</p>
          </div>
          <Badge variant={chatbot.isKnowledgeInitialized ? 'default' : 'secondary'}>
            {chatbot.isKnowledgeInitialized ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbot.totalChunks?.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Rooms</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbot._count?.chatRooms ?? 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbot._count?.files ?? 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatbot.isKnowledgeInitialized ? (
                    <span className="text-green-600">Ready</span>
                  ) : (
                    <span className="text-orange-600">Pending</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Knowledge base updated</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New conversation started</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">File uploaded: technical-docs.pdf</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <div className="space-y-6">
            <FileUpload chatbotId={id as string} />
            <FilesTable chatbotId={id as string} />
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseInitializer chatbotId={id as string} />
        </TabsContent>

        <TabsContent value="chat">
          <ChatInterface chatbotId={id as string} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and performance metrics will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}