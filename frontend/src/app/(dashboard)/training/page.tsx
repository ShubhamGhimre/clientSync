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
          <Upload className="ico space-r-2" />
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
          <div className="grid-3">
            {[
              { id: 'chatbot-1', name: 'Customer Support Bot', status: 'active', files: 15 },
              { id: 'chatbot-2', name: 'Sales Assistant', status: 'training', files: 8 },
              { id: 'chatbot-3', name: 'Technical Help', status: 'inactive', files: 0 },
            ].map((bot) => (
              <Card
                key={bot.id}
                className={`surface surface-interactive ${
                  selectedChatbot === bot.id ? 'surface-raised' : ''
                }`}
                onClick={() => setSelectedChatbot(bot.id)}
              >
                <CardContent className="pad-4">
                  <div className="row-between space-b-2">
                    <h3 className="t-semibold">{bot.name}</h3>
                    <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </div>
                  <p className="t-sm t-muted">{bot.files} files uploaded</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="stack">
        <TabsList className="grid-4 full-w">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="stack">
          <div className="grid-2">
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
                <div className="row-start g-3">
                  <CheckCircle className="ico-lg t-success space-t-0.5" />
                  <div>
                    <p className="t-medium">Quality Content</p>
                    <p className="t-sm t-muted">
                      Use clear, well-structured documents with relevant information
                    </p>
                  </div>
                </div>
                <div className="row-start g-3">
                  <CheckCircle className="ico-lg t-success space-t-0.5" />
                  <div>
                    <p className="t-medium">File Size</p>
                    <p className="t-sm t-muted">
                      Keep files under 10MB for optimal processing
                    </p>
                  </div>
                </div>
                <div className="row-start g-3">
                  <AlertCircle className="ico-lg t-warning space-t-0.5" />
                  <div>
                    <p className="t-medium">Privacy Notice</p>
                    <p className="t-sm t-muted">
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
                <div className="row-between">
                  <div className="row g-3">
                    <Brain className="ico-lg t-brand" />
                    <div>
                      <p className="t-medium">Knowledge Base Processing</p>
                      <p className="t-sm t-muted">Extracting and indexing content</p>
                    </div>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <Progress value={65} className="full-w" />
                <p className="t-sm t-muted">Processing 3 of 8 files...</p>
              </div>

              <div className="stack-sm">
                <h4 className="t-medium">Recent Processing Activity</h4>
                <div className="stack-sm">
                  {[
                    { file: 'user-manual.pdf', status: 'completed', time: '2 min ago' },
                    { file: 'faq-document.docx', status: 'processing', time: 'Now' },
                    { file: 'product-specs.txt', status: 'queued', time: 'Pending' },
                  ].map((item, index) => (
                    <div key={index} className="row-between surface pad-3">
                      <div className="row g-3">
                        <FileText className="ico t-muted" />
                        <span className="t-sm">{item.file}</span>
                      </div>
                      <div className="row g-2">
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <span className="t-xs t-muted">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="stack">
          <div className="grid-3">
            <Card>
              <CardContent className="pad-6">
                <div className="row g-2 space-b-2">
                  <FileText className="ico-lg t-brand" />
                  <span className="t-medium">Total Documents</span>
                </div>
                <p className="t-2xl t-bold">15</p>
                <p className="t-xs t-muted">+3 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pad-6">
                <div className="row g-2 space-b-2">
                  <Brain className="ico-lg t-success" />
                  <span className="t-medium">Knowledge Chunks</span>
                </div>
                <p className="t-2xl t-bold">1,247</p>
                <p className="t-xs t-muted">Processed segments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pad-6">
                <div className="row g-2 space-b-2">
                  <Zap className="ico-lg t-ai" />
                  <span className="t-medium">Last Updated</span>
                </div>
                <p className="t-2xl t-bold">2h ago</p>
                <p className="t-xs t-muted">Knowledge base sync</p>
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
                <div className="row-between surface pad-4">
                  <div>
                    <p className="t-medium">Customer Support Bot</p>
                    <p className="t-sm t-muted">15 documents, 1,247 chunks</p>
                  </div>
                  <div className="row g-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Brain className="ico space-r-2" />
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
