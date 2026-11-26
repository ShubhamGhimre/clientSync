'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Plus,
  FileText,
  MessageSquare,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatbotsTable } from '@/components/tables/chatbots-table';
import {
  EmptyState,
  IconTile,
  StatusPill,
  TableShell,
  TableToolbar,
  menuContentClass,
  toolbarBtnClass,
} from '@/components/tables/table-kits';
import {
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  RefreshButton,
  SearchField,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import { useChatBots } from '@/hooks/api/useChatBots';
import { cn } from '@/lib/utils';

export default function ChatBotsPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useChatBots();
  const chatbots = data?.data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const query = searchTerm.trim().toLowerCase();
  const filteredChatbots = chatbots.filter(
    (chatbot) =>
      chatbot.name.toLowerCase().includes(query) ||
      chatbot.description?.toLowerCase().includes(query)
  );

  const handleDeleteChatbot = async (chatbotId: string, chatbotName: string) => {
    // if (confirm(`Delete "${chatbotName}"? This can't be undone.`)) {
    //   try {
    //     await deleteMutation.mutateAsync(chatbotId);
    //   } catch (error) {
    //     console.error('Failed to delete chatbot:', error);
    //   }
    // }
  };

  const handleChatbotSelect = (chatbot: { id: string }) => {
    router.push(`/chatbots/${chatbot.id}`);
  };

  const handleChatbotEdit = (chatbot: { id: string }) => {
    router.push(`/chatbots/${chatbot.id}/edit`);
  };

  const handleChatbotDelete = (chatbotId: string) => {
    const chatbot = chatbots.find((c) => c.id === chatbotId);
    if (chatbot) {
      handleDeleteChatbot(chatbotId, chatbot.name);
    }
  };

  const handleChatbotToggle = (chatbotId: string, isActive: boolean) => {
    console.log('Toggle chatbot:', chatbotId, isActive);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div
          className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4"
          aria-busy="true"
        >
          <div className="h-5 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="h-3.5 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const readyCount = chatbots.filter((c) => c.isKnowledgeInitialized).length;
  const totalChats = chatbots.reduce(
    (sum, c) => sum + (c._count?.chatRooms || 0),
    0
  );

  const statItems: StatItem[] = [
    {
      label: 'Total chatbots',
      value: chatbots.length,
      hint: 'Configured bots',
      icon: Bot,
      iconClass: 'text-primary',
    },
    {
      label: 'Ready',
      value: readyCount,
      hint: 'Knowledge initialized',
      icon: CheckCircle2,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Pending setup',
      value: chatbots.length - readyCount,
      hint: 'Needs training data',
      icon: Clock,
      iconClass: 'text-chart-4',
    },
    {
      label: 'Total chats',
      value: totalChats,
      hint: 'Across all bots',
      icon: MessageSquare,
      iconClass: 'text-chart-3',
    },
  ];

  const viewToggle = (
    <div
      className="inline-flex items-center gap-0.5"
      role="tablist"
      aria-label="View"
    >
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'grid'}
        onClick={() => setViewMode('grid')}
        className={cn(
          toolbarBtnClass,
          viewMode === 'grid' &&
            'border-primary/30 bg-primary/5 text-primary'
        )}
      >
        <LayoutGrid className="size-3.5 shrink-0" />
        Grid
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'table'}
        onClick={() => setViewMode('table')}
        className={cn(
          toolbarBtnClass,
          viewMode === 'table' &&
            'border-primary/30 bg-primary/5 text-primary'
        )}
      >
        <List className="size-3.5 shrink-0" />
        Table
      </button>
    </div>
  );

  const toolbarContent = (
    <>
      <SearchField
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search chatbots"
      />
      <div className="flex items-center gap-2">
        {chatbots.length > 0 && (
          <span className="tabular hidden text-[11px] text-muted-foreground md:inline">
            Showing {filteredChatbots.length} of {chatbots.length}
          </span>
        )}
        {viewToggle}
      </div>
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Chatbots"
        description="Manage the AI assistants that answer your customers."
        actions={
          <>
            <RefreshButton onClick={() => refetch()} />
            <PrimaryActionButton icon={Plus} href="/chatbots/create">
              Create chatbot
            </PrimaryActionButton>
          </>
        }
      />

      {chatbots.length > 0 && <StatsStrip items={statItems} />}

      {viewMode === 'table' ? (
        <ChatbotsTable
          data={filteredChatbots}
          loading={isLoading}
          onChatbotSelect={handleChatbotSelect}
          onChatbotEdit={handleChatbotEdit}
          onChatbotDelete={handleChatbotDelete}
          onChatbotToggle={handleChatbotToggle}
          toolbar={toolbarContent}
        />
      ) : filteredChatbots.length > 0 ? (
        <>
          <TableShell>
            <TableToolbar>{toolbarContent}</TableToolbar>
          </TableShell>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChatbots.map((chatbot) => {
              const ready = Boolean(chatbot.isKnowledgeInitialized);
              return (
                <article
                  key={chatbot.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-soft transition-all hover:border-primary/30"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <IconTile>
                          <Bot className="size-4 shrink-0" />
                        </IconTile>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/chatbots/${chatbot.id}`}
                            className="block truncate text-sm font-semibold leading-tight text-foreground after:absolute after:inset-0 group-hover:text-primary"
                          >
                            {chatbot.name}
                          </Link>

                          <span className="mt-1.5 inline-block">
                            <StatusPill tone={ready ? 'primary' : 'warning'}>
                              {ready ? 'Ready' : 'Pending'}
                            </StatusPill>
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label={`Actions for ${chatbot.name}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={menuContentClass}
                        >
                          <DropdownMenuItem
                            onClick={() => router.push(`/chatbots/${chatbot.id}`)}
                          >
                            <ExternalLink /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/chatbots/${chatbot.id}/edit`)
                            }
                          >
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(chatbot.id)
                            }
                          >
                            <Copy /> Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              handleDeleteChatbot(chatbot.id, chatbot.name)
                            }
                          >
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {chatbot.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-border/60 bg-secondary/35 px-4 py-2.5 text-[11px] text-muted-foreground">
                    <span className="tabular inline-flex items-center gap-1">
                      <FileText className="size-3 shrink-0 text-muted-foreground" />
                      {chatbot.totalChunks || 0} chunks
                    </span>
                    <span className="tabular inline-flex items-center gap-1">
                      <MessageSquare className="size-3 shrink-0 text-muted-foreground" />
                      {chatbot._count?.chatRooms || 0} chats
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1">
                      <Calendar className="size-3 shrink-0 text-muted-foreground" />
                      {chatbot.lastKnowledgeUpdate
                        ? `Updated ${new Date(
                            chatbot.lastKnowledgeUpdate
                          ).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}`
                        : `Created ${new Date(
                            chatbot.createdAt
                          ).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}`}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      ) : (
        <TableShell>
          <EmptyState
            icon={<Bot className="size-5" />}
            title={query ? 'No chatbots match your search' : 'No chatbots yet'}
            description={
              query
                ? 'Try a different name or clear the search to see everything.'
                : 'Create your first assistant, add documents, and put it on your website.'
            }
          />
          <div className="flex justify-center pb-6">
            {query ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border/70 bg-background px-3 text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary"
              >
                Clear search
              </button>
            ) : (
              <PrimaryActionButton icon={Plus} href="/chatbots/create">
                Create your first chatbot
              </PrimaryActionButton>
            )}
          </div>
        </TableShell>
      )}
    </PageContainer>
  );
}
