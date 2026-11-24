'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bot } from 'lucide-react';
import { ChatInterface } from '@/components/chatbot/chat-interface';
import { useChatBot } from '@/hooks/api/useChatBots';

export default function ChatbotChatsPage() {
  const { id } = useParams();
  const chatbotId = id as string;
  const { data, isLoading, error } = useChatBot(chatbotId);
  const chatbot = data?.data;

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="page" aria-busy="true">
        <div className="skeleton mb-6" />
        <div className="flex flex-col gap-2 mb-6">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <div className="skeleton w-full" />
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
            Refresh the page, or go back to your chatbots. Contact support if it keeps happening.
          </p>
          <Link href="/chatbots" className="btn btn-secondary">
            Back to chatbots
          </Link>
        </div>
      </div>
    );
  }

  const ready = chatbot.isKnowledgeInitialized;

  return (
    <div className="page">
      <Link href={`/chatbots/${chatbotId}`} className="btn btn-ghost btn-sm mb-4">
        <ArrowLeft />
        {chatbot.name}
      </Link>

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
      </header>

      {!ready && (
        <div className="callout callout-warning mb-4">
          <span>
            This chatbot has no knowledge base yet, so answers won&apos;t come from your documents.{' '}
            <Link
              href={`/chatbots/${chatbotId}?tab=knowledge`}
              className="font-medium underline underline-offset-2"
            >
              Finish setup
            </Link>
          </span>
        </div>
      )}

      <div className="surface overflow-hidden">
        <ChatInterface chatbotId={chatbotId} />
      </div>
    </div>
  );
}