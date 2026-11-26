'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  MessageSquare,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SecondaryActionButton,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import {
  EmptyState,
  IconTile,
  TableShell,
  TableToolbar,
  toolbarBtnClass,
} from '@/components/tables/table-kits';
import { cn } from '@/lib/utils';
import { FilesTable } from '@/components/tables/files-table';
import { FileUpload } from '@/components/file-upload/file-upload';
import { ChatInterface } from '@/components/chatbot/chat-interface';
import KnowledgeBaseInitializer from '@/components/chatbot/knowledge-base-initializer';
import { useChatBot } from '@/hooks/api/useChatBots';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'files', label: 'Files' },
  { id: 'knowledge', label: 'Knowledge base' },
  { id: 'chat', label: 'Chat' },
  { id: 'analytics', label: 'Analytics' },
] as const;

type TabId = (typeof TABS)[number]['id'];


export default function ChatbotDetailPage() {
  const { id } = useParams();
  const chatbotId = id as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, isLoading, error } = useChatBot(chatbotId);
  const chatbot = data?.data;

  const tabParam = searchParams.get('tab');
  const activeTab: TabId = TABS.some((t) => t.id === tabParam)
    ? (tabParam as TabId)
    : 'overview';
  const setTab = (tab: TabId) =>
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
          <TableShell className="h-28 p-5">
            <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
          </TableShell>
          <div className="h-10 w-96 max-w-full animate-pulse rounded-xl bg-muted" />
          <TableShell>
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse bg-muted max-lg:[&:nth-child(even)]:border-l max-lg:[&:nth-child(even)]:border-border/60 max-lg:[&:nth-child(n+3)]:border-t max-lg:[&:nth-child(n+3)]:border-border/60 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-border/60"
                />
              ))}
            </dl>
          </TableShell>
        </div>
      </PageContainer>
    );
  }

  /* ---------- Error ---------- */
  if (error || !chatbot) {
    return (
      <PageContainer className="mx-auto max-w-3xl">
        <Alert
          variant="destructive"
          className="rounded-2xl border-destructive/25 bg-destructive/10"
        >
          <AlertCircle className="size-4 shrink-0" />
          <AlertTitle>Couldn&apos;t load this chatbot</AlertTitle>
          <AlertDescription>
            It may have been deleted, or something went wrong. Try again, or go
            back to your chatbots.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <SecondaryActionButton onClick={() => window.location.reload()}>
            Try again
          </SecondaryActionButton>
          <SecondaryActionButton href="/chatbots">
            Back to chatbots
          </SecondaryActionButton>
        </div>
      </PageContainer>
    );
  }

  const ready = chatbot.isKnowledgeInitialized;

  const statItems: StatItem[] = [
    {
      label: 'Knowledge chunks',
      value: chatbot.totalChunks?.toLocaleString() || '0',
      hint: 'Searchable pieces of your documents',
      icon: Database,
      iconClass: 'text-primary',
    },
    {
      label: 'Conversations',
      value: chatbot._count?.chatRooms ?? 0,
      hint: 'Chat rooms with this chatbot',
      icon: MessageSquare,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Files',
      value: chatbot._count?.files ?? 0,
      hint: 'Uploaded documents',
      icon: Upload,
      iconClass: 'text-chart-3',
    },
    {
      label: 'Status',
      value: ready ? 'Ready' : 'Pending',
      hint: ready
        ? 'Answering from your documents'
        : 'Needs a knowledge base',
      icon: ready ? CheckCircle2 : Bot,
      iconClass: 'text-chart-4',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={chatbot.name}
        description={chatbot.description || undefined}
        actions={
          <>
            <SecondaryActionButton href="/chatbots" icon={ArrowLeft}>
              Chatbots
            </SecondaryActionButton>
            <SecondaryActionButton
              href={`/chatbots/${chatbotId}/edit`}
              icon={Settings}
            >
              Settings
            </SecondaryActionButton>
            <PrimaryActionButton
              href={`/chatbots/${chatbotId}/chats`}
              icon={MessageSquare}
            >
              Start chat
            </PrimaryActionButton>
          </>
        }
      />

      <StatsStrip items={statItems} />

      <TableShell>
        <TableToolbar>
          <div
            className="flex w-full items-center gap-1 overflow-x-auto"
            role="tablist"
            aria-label="Chatbot sections"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  className={cn(
                    toolbarBtnClass,
                    'border border-transparent px-3.5',
                    isSelected && 'border-primary/30 bg-primary/5 text-primary'
                  )}
                  onClick={() => setTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </TableToolbar>
      </TableShell>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'overview' && !ready && (
          <TableShell className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <IconTile>
                <FileText className="size-4" />
              </IconTile>
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Finish setting up this chatbot
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload your documents, then build the knowledge base so it
                  can answer questions.
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <SecondaryActionButton onClick={() => setTab('files')}>
                    Upload files
                  </SecondaryActionButton>
                  <PrimaryActionButton onClick={() => setTab('knowledge')}>
                    Build knowledge base
                  </PrimaryActionButton>
                </div>
              </div>
            </div>
          </TableShell>
        )}

        {activeTab === 'files' && (
          <div className="flex flex-col gap-5">
            <FileUpload chatbotId={chatbotId} />
            <FilesTable chatbotId={chatbotId} />
          </div>
        )}

        {activeTab === 'knowledge' && (
          <TableShell className="p-5 sm:p-6">
            <KnowledgeBaseInitializer chatbotId={chatbotId} />
          </TableShell>
        )}

        {activeTab === 'chat' && <ChatInterface chatbotId={chatbotId} />}

        {activeTab === 'analytics' && (
          <TableShell>
            <EmptyState
              icon={<Sparkles className="size-4" />}
              title="Analytics are coming soon"
              description="You'll see how often this chatbot resolves questions, what customers ask, and where your documents have gaps."
            />
          </TableShell>
        )}
      </div>
    </PageContainer>
  );
}
