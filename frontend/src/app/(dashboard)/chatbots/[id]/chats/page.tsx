'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  PageContainer,
  PageHeader,
  SecondaryActionButton,
} from '@/components/page-kits';
import { useChatBot } from '@/hooks/api/useChatBots';
import { ChatInterface } from '@/components/chatbot/chat-interface';

export default function ChatbotChatsPage() {
  const { id } = useParams();
  const chatbotId = id as string;
  const { data, isLoading, error } = useChatBot(chatbotId);
  const chatbot = data?.data;

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <PageContainer className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="h-9 w-36 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] w-full animate-pulse rounded-2xl bg-muted" />
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
            Refresh the page, or go back to your chatbots. Contact support if it
            keeps happening.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <SecondaryActionButton href="/chatbots">
            Back to chatbots
          </SecondaryActionButton>
        </div>
      </PageContainer>
    );
  }

  const ready = chatbot.isKnowledgeInitialized;

  return (
    <PageContainer className="mx-auto max-w-5xl">
      <PageHeader
        title={chatbot.name}
        description={chatbot.description || undefined}
        actions={
          <SecondaryActionButton href={`/chatbots/${chatbotId}`} icon={ArrowLeft}>
            {chatbot.name}
          </SecondaryActionButton>
        }
      />

      {!ready && (
        <div className="rounded-xl border border-chart-4/30 bg-chart-4/10 px-4 py-3.5 text-sm text-foreground">
          <span>
            This chatbot has no knowledge base yet, so answers won&apos;t come
            from your documents.{' '}
            <Link
              href={`/chatbots/${chatbotId}?tab=knowledge`}
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Finish setup
            </Link>
          </span>
        </div>
      )}

      <ChatInterface chatbotId={chatbotId} />
    </PageContainer>
  );
}
