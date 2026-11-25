'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Plus,
  Search,
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
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatbotsTable } from '@/components/tables/chatbots-table';
import { useChatBots } from '@/hooks/api/useChatBots';

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export default function ChatBotsPage() {
  const router = useRouter();
  const { data, isLoading } = useChatBots();
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

  // Handlers for the table view
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
    // TODO: implement toggle
    console.log('Toggle chatbot:', chatbotId, isActive);
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="page" aria-busy="true">
        <div className="page-header">
          <div className="flex flex-col gap-2">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
          <div className="skeleton" />
        </div>
        <div className="flex flex-col gap-8">
          <div className="grid-stats">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
          <div className="grid-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const readyCount = chatbots.filter((c) => c.isKnowledgeInitialized).length;
  const totalChats = chatbots.reduce((sum, c) => sum + (c._count?.chatRooms || 0), 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Chatbots</h1>
          <p className="page-subtitle">Manage the AI assistants that answer your customers.</p>
        </div>
        <Link href="/chatbots/create" className="btn btn-brand">
          <Plus />
          Create chatbot
        </Link>
      </header>

      <div className="flex flex-col gap-8">
        {/* Stats */}
        {chatbots.length > 0 && (
          <section className="grid-stats">
            <Stat label="Total chatbots" value={chatbots.length} icon={Bot} />
            <Stat label="Ready" value={readyCount} icon={CheckCircle2} />
            <Stat label="Pending setup" value={chatbots.length - readyCount} icon={Clock} />
            <Stat label="Total chats" value={totalChats} icon={MessageSquare} />
          </section>
        )}

        {/* Toolbar */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="input-wrap w-full sm:max-w-sm">
            <Search className="input-icon" />
            <input
              type="search"
              className="input"
              placeholder="Search chatbots"
              aria-label="Search chatbots"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tabs" role="tablist" aria-label="View">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              className="tab inline-flex items-center gap-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4 shrink-0" />
              Grid
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              className="tab inline-flex items-center gap-2"
              onClick={() => setViewMode('table')}
            >
              <List className="size-4 shrink-0" />
              Table
            </button>
          </div>
        </section>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="surface overflow-hidden">
            <ChatbotsTable
              data={filteredChatbots}
              loading={isLoading}
              onChatbotSelect={handleChatbotSelect}
              onChatbotEdit={handleChatbotEdit}
              onChatbotDelete={handleChatbotDelete}
              onChatbotToggle={handleChatbotToggle}
            />
          </div>
        ) : filteredChatbots.length > 0 ? (
          <section className="grid-auto">
            {filteredChatbots.map((chatbot) => (
              <article key={chatbot.id} className="surface surface-interactive group relative flex flex-col">
                <div className="flex items-start gap-3 p-5">
                  <span className="doc-icon">
                    <Bot className="size-5 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Stretched link: the whole card is clickable and keyboard-focusable */}
                    <Link
                      href={`/chatbots/${chatbot.id}`}
                      className="block truncate text-sm font-medium leading-tight"
                    >
                      {chatbot.name}
                    </Link>
                    <span
                      className={`badge mt-1 ${
                        chatbot.isKnowledgeInitialized ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      <span
                        className={`status-dot ${chatbot.isKnowledgeInitialized ? 'is-online' : 'is-busy'}`}
                      />
                      {chatbot.isKnowledgeInitialized ? 'Ready' : 'Pending'}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm relative z-10"
                        aria-label={`Actions for ${chatbot.name}`}
                      >
                        <MoreVertical />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/chatbots/${chatbot.id}`)}>
                        <ExternalLink /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/chatbots/${chatbot.id}/edit`)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(chatbot.id)}>
                        <Copy /> Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDeleteChatbot(chatbot.id, chatbot.name)}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="px-5 text-sm text-muted-foreground">
                  {chatbot.description || 'No description'}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-5 py-3 text-xs items-center text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5 shrink-0" />
                    {chatbot.totalChunks || 0} chunks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 shrink-0" />
                    {chatbot._count?.chatRooms || 0} chats
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    {chatbot.lastKnowledgeUpdate
                      ? `Updated ${new Date(chatbot.lastKnowledgeUpdate).toLocaleDateString()}`
                      : `Created ${new Date(chatbot.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-state">
            <span className="doc-icon">
              <Bot className="size-6 shrink-0" />
            </span>
            <h2 className="text-base font-semibold">
              {query ? 'No chatbots match your search' : 'No chatbots yet'}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {query
                ? 'Try a different name or clear the search to see everything.'
                : 'Create your first assistant, add documents, and put it on your website.'}
            </p>
            {query ? (
              <button type="button" className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                Clear search
              </button>
            ) : (
              <Link href="/chatbots/create" className="btn btn-brand">
                <Plus />
                Create your first chatbot
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}