'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/file-upload/file-upload';
import { FilesTable } from '@/components/tables/files-table';
import { AlertCircle, Brain, CheckCircle, FileText, Upload, Zap } from 'lucide-react';
import {
  ListPanel,
  ListRow,
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SecondaryActionButton,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import {
  BotAvatar,
  IconTile,
  StatusPill,
  TableShell,
} from '@/components/tables/table-kits';

const chatbots = [
  { id: 'chatbot-1', name: 'Customer Support Bot', status: 'active', files: 15 },
  { id: 'chatbot-2', name: 'Sales Assistant', status: 'training', files: 8 },
  { id: 'chatbot-3', name: 'Technical Help', status: 'inactive', files: 0 },
];

export default function TrainingPage() {
  const [selectedChatbot, setSelectedChatbot] = useState('chatbot-1');

  const knowledgeStats: StatItem[] = [
    {
      label: 'Total Documents',
      value: 15,
      hint: '+3 this week',
      icon: FileText,
      iconClass: 'text-primary',
    },
    {
      label: 'Knowledge Chunks',
      value: '1,247',
      hint: 'Processed segments',
      icon: Brain,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Last Updated',
      value: '2h ago',
      hint: 'Knowledge base sync',
      icon: Zap,
      iconClass: 'text-chart-4',
    },
    {
      label: 'Total Files',
      value: chatbots.reduce((sum, bot) => sum + bot.files, 0),
      hint: 'Across all chatbots',
      icon: Upload,
      iconClass: 'text-chart-3',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Training Data"
        description="Upload and manage training data for your chatbots"
        actions={
          <PrimaryActionButton icon={Upload}>
            Upload Files
          </PrimaryActionButton>
        }
      />

      <ListPanel title="Select Chatbot">
        {chatbots.map((bot) => {
          const tone =
            bot.status === 'active'
              ? 'primary'
              : bot.status === 'training'
                ? 'warning'
                : 'neutral';
          return (
            <ListRow
              key={bot.id}
              className={`relative ${selectedChatbot === bot.id ? 'bg-primary/[0.045]' : ''}`}
              icon={<BotAvatar size="sm" />}
              title={
                <button
                  type="button"
                  onClick={() => setSelectedChatbot(bot.id)}
                  className="text-left after:absolute after:inset-0"
                >
                  {bot.name}
                </button>
              }
              subtitle={`${bot.files} files uploaded`}
              badge={<StatusPill tone={tone}>{bot.status}</StatusPill>}
            />
          );
        })}
      </ListPanel>

      <Tabs defaultValue="upload" className="flex w-full flex-col gap-4">
        <TabsList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TableShell>
              <div className="border-b border-border/60 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Upload Training Files
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Upload documents to train your chatbot. Supported formats: PDF, TXT, CSV, DOCX
                </p>
              </div>
              <div className="px-5 py-4">
                <FileUpload />
              </div>
            </TableShell>

            <TableShell>
              <div className="border-b border-border/60 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Upload Guidelines
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Best practices for training data
                </p>
              </div>
              <ul className="px-5">
                <li className="flex items-start gap-3 border-b border-border/50 py-3 last:border-b-0">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Quality Content</p>
                    <p className="text-xs text-muted-foreground">
                      Use clear, well-structured documents with relevant information
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 border-b border-border/50 py-3 last:border-b-0">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">File Size</p>
                    <p className="text-xs text-muted-foreground">
                      Keep files under 10MB for optimal processing
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 border-b border-border/50 py-3 last:border-b-0">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Privacy Notice</p>
                    <p className="text-xs text-muted-foreground">
                      Ensure documents don't contain sensitive information
                    </p>
                  </div>
                </li>
              </ul>
            </TableShell>
          </div>
        </TabsContent>

        <TabsContent value="files" className="flex flex-col gap-4">
          <FilesTable chatbotId={selectedChatbot} />
        </TabsContent>

        <TabsContent value="processing" className="flex flex-col gap-4">
          <TableShell>
            <div className="border-b border-border/60 px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Processing Status
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitor file processing and knowledge base updates
              </p>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Brain className="size-5 shrink-0 text-brand-strong" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Knowledge Base Processing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Extracting and indexing content
                      </p>
                    </div>
                  </div>
                  <StatusPill tone="warning">In Progress</StatusPill>
                </div>
                <Progress value={65} className="w-full" />
                <p className="text-xs text-muted-foreground">Processing 3 of 8 files...</p>
              </div>
            </div>
          </TableShell>

          <ListPanel title="Recent Processing Activity">
            {[
              { file: 'user-manual.pdf', status: 'completed', time: '2 min ago' },
              { file: 'faq-document.docx', status: 'processing', time: 'Now' },
              { file: 'product-specs.txt', status: 'queued', time: 'Pending' },
            ].map((item) => {
              const tone =
                item.status === 'completed'
                  ? 'primary'
                  : item.status === 'processing'
                    ? 'warning'
                    : 'neutral';
              return (
                <ListRow
                  key={item.file}
                  icon={
                    <IconTile>
                      <FileText className="size-4 shrink-0" />
                    </IconTile>
                  }
                  title={item.file}
                  badge={<StatusPill tone={tone}>{item.status}</StatusPill>}
                  meta={item.time}
                />
              );
            })}
          </ListPanel>
        </TabsContent>

        <TabsContent value="knowledge" className="flex flex-col gap-4">
          <StatsStrip items={knowledgeStats} />

          <TableShell>
            <div className="border-b border-border/60 px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Knowledge Base Status
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Current state of your chatbot's knowledge
              </p>
            </div>
            <ul>
              <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Customer Support Bot
                  </p>
                  <p className="text-xs text-muted-foreground">
                    15 documents, 1,247 chunks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone="primary">Active</StatusPill>
                  <SecondaryActionButton icon={Brain}>
                    Retrain
                  </SecondaryActionButton>
                </div>
              </li>
            </ul>
          </TableShell>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
