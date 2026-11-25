'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/file-upload/file-upload';
import { FilesTable } from '@/components/tables/files-table';
import { Upload, FileText, Brain, Zap, AlertCircle, CheckCircle } from 'lucide-react';

export default function TrainingPage() {
  const [selectedChatbot, setSelectedChatbot] = useState('chatbot-1');

  return (
    <div className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Data</h1>
          <p className="page-subtitle">
            Upload and manage training data for your chatbots
          </p>
        </div>
        <Button>
          <Upload className="size-4 shrink-0 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Chatbot Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Chatbot</CardTitle>
          <CardDescription>Choose which chatbot to train</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'chatbot-1', name: 'Customer Support Bot', status: 'active', files: 15 },
              { id: 'chatbot-2', name: 'Sales Assistant', status: 'training', files: 8 },
              { id: 'chatbot-3', name: 'Technical Help', status: 'inactive', files: 0 },
            ].map((bot) => (
              <Card
                key={bot.id}
                className={`surface surface-interactive ${
                  selectedChatbot === bot.id ? 'surface shadow-soft' : ''
                }`}
                onClick={() => setSelectedChatbot(bot.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{bot.name}</h3>
                    <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bot.files} files uploaded</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="stack">
        <TabsList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="stack">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Training Files</CardTitle>
                <CardDescription>
                  Upload documents to train your chatbot. Supported formats: PDF, TXT, CSV, DOCX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Guidelines</CardTitle>
                <CardDescription>Best practices for training data</CardDescription>
              </CardHeader>
              <CardContent className="stack">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 shrink-0 text-success space-t-0.5" />
                  <div>
                    <p className="font-medium">Quality Content</p>
                    <p className="text-sm text-muted-foreground">
                      Use clear, well-structured documents with relevant information
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 shrink-0 text-success space-t-0.5" />
                  <div>
                    <p className="font-medium">File Size</p>
                    <p className="text-sm text-muted-foreground">
                      Keep files under 10MB for optimal processing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 shrink-0 text-warning space-t-0.5" />
                  <div>
                    <p className="font-medium">Privacy Notice</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure documents don't contain sensitive information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>Manage your training files</CardDescription>
            </CardHeader>
            <CardContent>
              <FilesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
              <CardDescription>Monitor file processing and knowledge base updates</CardDescription>
            </CardHeader>
            <CardContent className="stack">
              <div className="stack">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="size-5 shrink-0 text-brand-strong" />
                    <div>
                      <p className="font-medium">Knowledge Base Processing</p>
                      <p className="text-sm text-muted-foreground">Extracting and indexing content</p>
                    </div>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <Progress value={65} className="w-full" />
                <p className="text-sm text-muted-foreground">Processing 3 of 8 files...</p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Recent Processing Activity</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { file: 'user-manual.pdf', status: 'completed', time: '2 min ago' },
                    { file: 'faq-document.docx', status: 'processing', time: 'Now' },
                    { file: 'product-specs.txt', status: 'queued', time: 'Pending' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between surface p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">{item.file}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="stack">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-5 shrink-0 text-brand-strong" />
                  <span className="font-medium">Total Documents</span>
                </div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-muted-foreground">+3 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="size-5 shrink-0 text-success" />
                  <span className="font-medium">Knowledge Chunks</span>
                </div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground">Processed segments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="size-5 shrink-0 text-ai" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <p className="text-2xl font-bold">2h ago</p>
                <p className="text-xs text-muted-foreground">Knowledge base sync</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Status</CardTitle>
              <CardDescription>Current state of your chatbot's knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="stack">
                <div className="flex items-center justify-between surface p-4">
                  <div>
                    <p className="font-medium">Customer Support Bot</p>
                    <p className="text-sm text-muted-foreground">15 documents, 1,247 chunks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Brain className="size-4 shrink-0 mr-2" />
                      Retrain
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
