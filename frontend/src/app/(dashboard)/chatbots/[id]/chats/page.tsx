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
        <div className="skeleton space-b-6" />
        <div className="stack-sm space-b-6">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <div className="skeleton full-w" />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !chatbot) {
    return (
      <div className="page-narrow">
        <div className="empty-state">
          <span className="doc-icon">
            <Bot className="ico-xl" />
          </span>
          <h1 className="empty-state-title">Couldn&apos;t load this chatbot</h1>
          <p className="empty-state-text">
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
      <Link href={`/chatbots/${chatbotId}`} className="btn btn-ghost btn-sm space-b-4">
        <ArrowLeft />
        {chatbot.name}
      </Link>

      <header className="page-header">
        <div className="row-start min-zero g-4">
          <span className="doc-icon">
            <Bot className="ico-xl" />
          </span>
          <div className="min-zero">
            <div className="cluster g-3">
              <h1 className="page-title ellipsis">{chatbot.name}</h1>
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
        <div className="callout callout-warning space-b-4">
          <span>
            This chatbot has no knowledge base yet, so answers won&apos;t come from your documents.{' '}
            <Link
              href={`/chatbots/${chatbotId}?tab=knowledge`}
              className="t-medium t-underline"
            >
              Finish setup
            </Link>
          </span>
        </div>
      )}

      <div className="surface clip">
        <ChatInterface chatbotId={chatbotId} />
      </div>
    </div>
  );
}