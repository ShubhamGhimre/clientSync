'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  FileText,
  MessageSquare,
  Settings,
  Upload,
  Database,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
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

function Stat({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <span className="stat-value">{value}</span>
      <span className="field-hint">{note}</span>
    </div>
  );
}

export default function ChatbotDetailPage() {
  const { id } = useParams();
  const chatbotId = id as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, isLoading, error } = useChatBot(chatbotId);
  const chatbot = data?.data;

  // The active tab lives in the URL, so ?tab=knowledge (used after creating a bot) works
  // and tabs can be linked to or reloaded.
  const tabParam = searchParams.get('tab');
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : 'overview';
  const setTab = (tab: TabId) => router.replace(`${pathname}?tab=${tab}`, { scroll: false });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="page" aria-busy="true">
        <div className="skeleton mb-6" />
        <div className="page-header">
          <div className="flex flex-col gap-2">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
          <div className="skeleton" />
        </div>
        <div className="skeleton mb-6" />
        <div className="grid-stats">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !chatbot) {
    return (
      <div className="page-narrow">
        <div className="empty-state">
          <span className="doc-icon">
            <Bot className="size-6 shrink-0" />
          </span>
          <h1 className="text-base font-semibold">Couldn&apos;t load this chatbot</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            It may have been deleted, or something went wrong. Try again, or go back to your chatbots.
          </p>
          <div className="cluster">
            <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
              Try again
            </button>
            <Link href="/chatbots" className="btn btn-ghost">
              Back to chatbots
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ready = chatbot.isKnowledgeInitialized;

  return (
    <div className="page">
      <Link href="/chatbots" className="btn btn-ghost btn-sm mb-4">
        <ArrowLeft />
        Chatbots
      </Link>

      {/* Header */}
      <header className="page-header">
        <div className="flex items-start min-w-0 gap-4">
          <span className="doc-icon">
            <Bot className="size-6 shrink-0" />
          </span>
          <div className="min-w-0">
            <div className="cluster gap-3">
              <h1 className="page-title overflow-hidden text-ellipsis whitespace-nowrap">{chatbot.name}</h1>
              <span className={`badge ${ready ? 'badge-success' : 'badge-warning'}`}>
                <span className={`status-dot ${ready ? 'is-online' : 'is-busy'}`} />
                {ready ? 'Ready' : 'Setup pending'}
              </span>
            </div>
            {chatbot.description && <p className="page-subtitle">{chatbot.description}</p>}
          </div>
        </div>

        <div className="cluster">
          <Link href={`/chatbots/${chatbotId}/edit`} className="btn btn-secondary">
            <Settings />
            Settings
          </Link>
          <Link href={`/chatbots/${chatbotId}/chats`} className="btn btn-brand">
            <MessageSquare />
            Start chat
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="tabs" role="tablist" aria-label="Chatbot sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className="tab overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            <section className="grid-stats">
              <Stat
                label="Knowledge chunks"
                value={chatbot.totalChunks?.toLocaleString() || '0'}
                note="Searchable pieces of your documents"
                icon={Database}
              />
              <Stat
                label="Conversations"
                value={chatbot._count?.chatRooms ?? 0}
                note="Chat rooms with this chatbot"
                icon={MessageSquare}
              />
              <Stat
                label="Files"
                value={chatbot._count?.files ?? 0}
                note="Uploaded documents"
                icon={Upload}
              />
              <Stat
                label="Status"
                value={ready ? 'Ready' : 'Pending'}
                note={ready ? 'Answering from your documents' : 'Needs a knowledge base'}
                icon={ready ? CheckCircle2 : Bot}
              />
            </section>

            {!ready && (
              <div className="callout callout-warning">
                <FileText className="space-t-0.5 size-4 shrink-0 text-warning" />
                <div className="flex flex-col gap-2">
                  <p className="font-medium">Finish setting up this chatbot</p>
                  <p className="text-muted-foreground">
                    Upload your documents, then build the knowledge base so it can answer questions.
                  </p>
                  <div className="cluster mt-1">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTab('files')}>
                      Upload files
                    </button>
                    <button type="button" className="btn btn-brand btn-sm" onClick={() => setTab('knowledge')}>
                      Build knowledge base
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="flex flex-col gap-8">
            <FileUpload chatbotId={chatbotId} />
            <div className="surface surface-pad">
              <FilesTable chatbotId={chatbotId} />
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="surface surface-pad">
            <KnowledgeBaseInitializer chatbotId={chatbotId} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="surface overflow-hidden">
            <ChatInterface chatbotId={chatbotId} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="empty-state">
            <span className="doc-icon">
              <Sparkles className="size-6 shrink-0" />
            </span>
            <h2 className="text-base font-semibold">Analytics are coming soon</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              You&apos;ll see how often this chatbot resolves questions, what customers ask, and where your documents have gaps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}