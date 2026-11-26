'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  RefreshCw,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Loader2,
  Sparkles,
  Zap,
  Settings,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertCircle,
  WifiOff,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandMark } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  useClearConversations,
  useConversations,
  useOptimisticSendMessage,
  type Conversation,
} from '@/hooks/api/useConversations';
import {
  useChatRooms,
  useChatRoom,
  useCreateChatRoom,
} from '@/hooks/api/useChatRooms';

interface ChatInterfaceProps {
  chatbotId: string;
  theme?: 'light' | 'dark' | 'system';
  enableSounds?: boolean;
  maxHeight?: string;
  showHeader?: boolean;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  retryCount?: number;
  sources?: Array<{
    title: string;
    content: string;
    score: number;
    url?: string;
  }>;
  metadata?: {
    processingTime?: number;
    model?: string;
    tokens?: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Streaming text                                                            */
/* -------------------------------------------------------------------------- */

const StreamingText = ({
  text,
  onComplete,
  speed = 20,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
}) => {
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count < text.length) {
      const timer = setTimeout(() => setCount((c) => c + 1), speed);
      return () => clearTimeout(timer);
    }
    onCompleteRef.current?.();
  }, [count, text, speed]);

  const isTypingText = count < text.length;

  return (
    <span className="inline-flex items-baseline">
      <span>{text.slice(0, count)}</span>
      {isTypingText && (
        <span
          className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle"
          aria-hidden="true"
        />
      )}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*  Message                                                                    */
/* -------------------------------------------------------------------------- */

const MessageComponent = ({
  message,
  isStreaming,
  onStreamingComplete,
  onCopy,
  onReact,
  onRetry,
}: {
  message: Message;
  isStreaming: boolean;
  onStreamingComplete: (id: string) => void;
  onCopy: (content: string) => void;
  onReact: (messageId: string, reaction: 'like' | 'dislike') => void;
  onRetry?: (messageId: string) => void;
}) => {
  const [showAllSources, setShowAllSources] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const isUser = message.role === 'user';
  const isPending = message.id.startsWith('temp-');
  const sources = message.sources ?? [];
  const visibleSources = showAllSources ? sources : sources.slice(0, 2);
  const hiddenCount = sources.length - visibleSources.length;
  const meta = !isUser ? message.metadata : undefined;
  const alwaysShowMeta = isPending || message.isError;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleReact = (value: 'like' | 'dislike') => {
    setReaction(value);
    onReact(message.id, value);
  };

  return (
    <div
      className={`group flex items-start gap-2.5 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {!isUser && (
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <BrandMark size={18} />
        </span>
      )}

      <div
        className={`flex max-w-[82%] flex-col gap-1.5 sm:max-w-[72%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
            message.isError
              ? 'border border-destructive/30 bg-destructive/10 text-destructive'
              : isUser
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-secondary/50 text-foreground'
          }`}
        >
          {!isUser && isStreaming ? (
            <StreamingText
              text={message.content}
              onComplete={() => onStreamingComplete(message.id)}
              speed={15}
            />
          ) : (
            message.content
          )}
        </div>

        {/* Knowledge-base citations */}
        {sources.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-1.5 pt-0.5"
            role="group"
            aria-label="Sources"
          >
            {visibleSources.map((source, index) => {
              const label = (
                <>
                  <FileText className="size-3 shrink-0 text-primary" />
                  <span className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {source.title}
                  </span>
                  <span className="tabular shrink-0 text-muted-foreground">
                    {Math.round(source.score * 100)}%
                  </span>
                </>
              );
              const chipClass =
                'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary';

              return source.url ? (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={chipClass}
                  title={source.content}
                >
                  {label}
                </a>
              ) : (
                <span key={index} className={chipClass} title={source.content}>
                  {label}
                </span>
              );
            })}
            {(hiddenCount > 0 || showAllSources) && sources.length > 2 && (
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowAllSources((v) => !v)}
              >
                {showAllSources ? 'Show fewer' : `+${hiddenCount} more`}
              </button>
            )}
          </div>
        )}

        {/* Failed send */}
        {message.isError && onRetry && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => onRetry(message.id)}
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        )}

        {/* Time, status, metadata, actions */}
        <div
          className={`flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 ${
            alwaysShowMeta ? 'opacity-100' : ''
          }`}
        >
          <span className="tabular">{formatTime(message.timestamp)}</span>

          {isPending && (
            <Loader2
              className="size-3 shrink-0 animate-spin text-primary"
              aria-label="Sending"
            />
          )}

          {message.isError && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertCircle className="size-3 shrink-0" /> Not sent
            </span>
          )}

          {meta?.processingTime && (
            <span className="tabular inline-flex items-center gap-1">
              <Zap className="size-3 shrink-0 text-primary" />{' '}
              {meta.processingTime}ms
            </span>
          )}
          {meta?.tokens && <span className="tabular">{meta.tokens} tokens</span>}
          {meta?.model && <span>{meta.model}</span>}

          {!isPending && !message.isError && (
            <span className="inline-flex items-center gap-0.5">
              <button
                type="button"
                className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                onClick={() => onCopy(message.content)}
                aria-label="Copy message"
                title="Copy message"
              >
                <Copy className="size-3 shrink-0" />
              </button>

              {!isUser && (
                <>
                  <button
                    type="button"
                    className={`inline-flex size-6 items-center justify-center rounded-md transition-colors hover:bg-secondary ${
                      reaction === 'like'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleReact('like')}
                    aria-label="Good response"
                    aria-pressed={reaction === 'like'}
                    title="Good response"
                  >
                    <ThumbsUp className="size-3 shrink-0" />
                  </button>
                  <button
                    type="button"
                    className={`inline-flex size-6 items-center justify-center rounded-md transition-colors hover:bg-secondary ${
                      reaction === 'dislike'
                        ? 'text-destructive'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleReact('dislike')}
                    aria-label="Poor response"
                    aria-pressed={reaction === 'dislike'}
                    title="Poor response"
                  >
                    <ThumbsDown className="size-3 shrink-0" />
                  </button>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const transformConversationToMessage = (conversation: Conversation): Message => ({
  id: conversation.id,
  content: conversation.message,
  role: conversation.sender === 'user' ? 'user' : 'assistant',
  timestamp: new Date(conversation.createdAt),
  sources: (conversation as any).sources,
  metadata: (conversation as any).metadata,
});

/* -------------------------------------------------------------------------- */
/*  Chat room initializer                                                      */
/* -------------------------------------------------------------------------- */

const ChatRoomInitializer = ({
  chatbotId,
  onChatRoomReady,
}: {
  chatbotId: string;
  onChatRoomReady: (chatRoomId: string) => void;
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    data: chatRooms,
    isLoading: chatRoomsLoading,
    error: chatRoomsError,
    refetch: refetchChatRooms,
  } = useChatRooms();

  const createChatRoomMutation = useCreateChatRoom({
    onSuccess: (chatRoom) => {
      setProgress(100);
      setTimeout(() => {
        onChatRoomReady(chatRoom.id);
        setIsInitializing(false);
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to create chat room:', error);
      toast.error('Failed to initialize chat room');
      setIsInitializing(false);
      setProgress(0);
    },
  });

  useEffect(() => {
    if (chatRooms && !isInitializing) {
      const existingChatRoom = chatRooms.find(
        (room) => room.chatBotId === chatbotId
      );

      if (existingChatRoom) {
        setProgress(100);
        setTimeout(() => onChatRoomReady(existingChatRoom.id), 300);
      } else {
        setIsInitializing(true);
        setProgress(30);
        createChatRoomMutation.mutate({
          title: `AI Chat Session`,
          chatBotId: chatbotId,
        });
      }
    }
  }, [
    chatRooms,
    chatbotId,
    onChatRoomReady,
    isInitializing,
    createChatRoomMutation,
  ]);

  useEffect(() => {
    if (isInitializing && progress < 90) {
      const timer = setTimeout(() => setProgress((prev) => prev + 10), 200);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, progress]);

  if (chatRoomsLoading || isInitializing || createChatRoomMutation.isPending) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center gap-5 px-6 text-center">
        <span
          className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs"
          aria-hidden="true"
        >
          <BrandMark size={30} />
        </span>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <h3 className="text-base font-semibold text-foreground">
            {chatRoomsLoading ? 'Loading chat' : 'Setting up chat'}
          </h3>
          <p className="text-xs text-muted-foreground">
            Preparing your conversation with the assistant.
          </p>
        </div>
        <div
          className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span
            className="block h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (chatRoomsError) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <WifiOff className="size-6 shrink-0" />
        </span>
        <h3 className="text-base font-semibold text-foreground">
          Can&apos;t connect to chat
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check your internet connection, then try again.
        </p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          onClick={() => refetchChatRooms()}
        >
          <RefreshCw className="size-4" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/*  Main chat                                                                  */
/* -------------------------------------------------------------------------- */

const ChatInterfaceMain = ({
  chatRoomId,
  enableSounds = false,
  maxHeight = '700px',
  showHeader = true,
}: {
  chatbotId: string;
  chatRoomId: string;
  enableSounds?: boolean;
  maxHeight?: string;
  showHeader?: boolean;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [, setRetryingMessages] = useState<Set<string>>(new Set());

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastPlayedSoundRef = useRef<number>(0);

  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useConversations(chatRoomId, {
    refetchInterval: isTyping ? 1000 : 3000,
    staleTime: 1000,
  });

  const { data: chatRoomData, isLoading: chatRoomLoading } =
    useChatRoom(chatRoomId);

  const sendMessageMutation = useOptimisticSendMessage({
    onSuccess: () => {
      if (soundEnabled && Date.now() - lastPlayedSoundRef.current > 1000) {
        lastPlayedSoundRef.current = Date.now();
      }
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      setIsTyping(false);
    },
  });

  const clearConversationsMutation = useClearConversations({
    onSuccess: () => {
      toast.success('Chat cleared');
      setLastMessageCount(0);
      setStreamingMessageId(null);
    },
    onError: (error) => {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    },
  });

  const messages: Message[] = useMemo(
    () =>
      conversations ? conversations.map(transformConversationToMessage) : [],
    [conversations]
  );

  const displayMessages = useMemo(() => {
    if (messages.length === 0) {
      return [
        {
          id: 'welcome',
          content:
            "👋 Hello! I'm your AI assistant. I'm here to help you with questions, provide information, and have engaging conversations. How can I assist you today?",
          role: 'assistant' as const,
          timestamp: new Date(),
        },
      ];
    }
    return messages;
  }, [messages]);

  const conversationStarters = useMemo(
    () => [
      { text: 'What are your capabilities?', icon: Sparkles },
      { text: 'How can you help me today?', icon: MessageSquare },
      { text: 'Tell me about your features', icon: Settings },
      { text: 'Show me what you can do', icon: Zap },
    ],
    []
  );

  const isBusy = isTyping || sendMessageMutation.isPending;

  const scrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (conversations && conversations.length > lastMessageCount) {
      const newMessages = conversations.slice(lastMessageCount);
      const newAIMessage = newMessages.find((msg) => msg.sender !== 'user');

      if (newAIMessage && !newAIMessage.id.startsWith('temp-')) {
        setStreamingMessageId(newAIMessage.id);
        setIsTyping(false);
      }

      setLastMessageCount(conversations.length);
      scrollToBottom();
    }
  }, [conversations, lastMessageCount, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages.length, isBusy, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [inputValue]);

  const handleSendMessage = useCallback(
    async (content?: string) => {
      const messageContent = content || inputValue.trim();
      if (!messageContent || sendMessageMutation.isPending) return;

      setInputValue('');
      setIsTyping(true);

      try {
        await sendMessageMutation.mutateAsync({
          chatRoomId,
          sender: 'user',
          message: messageContent,
        });
      } catch {
        setIsTyping(false);
      }
    },
    [inputValue, sendMessageMutation, chatRoomId]
  );

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  }, []);

  const handleMessageReaction = useCallback(
    (messageId: string, reaction: 'like' | 'dislike') => {
      toast.success(`${reaction === 'like' ? 'Liked' : 'Disliked'} message`);
    },
    []
  );

  const handleRetryMessage = useCallback(async (messageId: string) => {
    setRetryingMessages((prev) => new Set([...prev, messageId]));
    setTimeout(() => {
      setRetryingMessages((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }, 2000);
  }, []);

  const handleClearChat = useCallback(async () => {
    try {
      await clearConversationsMutation.mutateAsync(chatRoomId);
    } catch (error) {
      console.error('Clear chat error:', error);
    }
  }, [clearConversationsMutation, chatRoomId]);

  const handleStreamingComplete = useCallback(
    (messageId: string) => {
      if (streamingMessageId === messageId) setStreamingMessageId(null);
    },
    [streamingMessageId]
  );

  /* ---------- Loading ---------- */
  if (chatRoomLoading || conversationsLoading) {
    return (
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
        style={{ height: maxHeight }}
        aria-busy="true"
      >
        {showHeader && (
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3">
            <div className="size-9 shrink-0 animate-pulse rounded-xl bg-muted" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-start gap-2.5">
            <div className="size-8 shrink-0 animate-pulse rounded-xl bg-muted" />
            <div className="h-14 w-64 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="flex items-start gap-2.5">
            <div className="size-8 shrink-0 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 w-80 max-w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (conversationsError && !conversationsLoading) {
    return (
      <div
        className="flex h-[700px] flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ height: maxHeight }}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <AlertCircle className="size-6 shrink-0" />
        </span>
        <h3 className="text-base font-semibold text-foreground">
          Couldn&apos;t load this conversation
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your chat history didn&apos;t load. Try again, or refresh the page if
          it keeps failing.
        </p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          onClick={() => refetchConversations()}
        >
          <RefreshCw className="size-4" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={isFullscreen ? 'fixed inset-0 z-50 bg-background sm:p-4' : ''}
      style={{ height: isFullscreen ? '100dvh' : maxHeight }}
    >
      <section
        className={`flex h-full flex-col overflow-hidden bg-card text-card-foreground ${
          isFullscreen
            ? 'mx-auto max-w-4xl rounded-2xl border border-border shadow-soft'
            : ''
        }`}
        aria-label="Chat"
      >
        {showHeader && (
          <header className="relative flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-75"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)',
              }}
              aria-hidden="true"
            />
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <BrandMark size={20} />
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {chatRoomData?.title || 'AI Assistant'}
                </h2>
                <p
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="size-3 shrink-0 animate-spin text-primary" />
                      <span>Thinking…</span>
                    </>
                  ) : (
                    <>
                      <span className="size-2 rounded-full bg-primary" />
                      <span>Online</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={() => setSoundEnabled((v) => !v)}
                    aria-label={
                      soundEnabled ? 'Turn sounds off' : 'Turn sounds on'
                    }
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? (
                      <Volume2 className="size-4" />
                    ) : (
                      <VolumeX className="size-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {soundEnabled ? 'Turn sounds off' : 'Turn sounds on'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={() => setIsFullscreen((v) => !v)}
                    aria-label={
                      isFullscreen ? 'Exit full screen' : 'Full screen'
                    }
                  >
                    {isFullscreen ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit full screen' : 'Full screen'}
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="More options"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl border-border bg-popover text-popover-foreground"
                >
                  <DropdownMenuItem
                    onClick={handleClearChat}
                    disabled={
                      clearConversationsMutation.isPending ||
                      displayMessages.length <= 1
                    }
                  >
                    {clearConversationsMutation.isPending ? (
                      <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 size-4 shrink-0" />
                    )}
                    Clear chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <Share2 className="mr-2 size-4 shrink-0" />
                    Share conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Download className="mr-2 size-4 shrink-0" />
                    Export chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}

        {/* Messages */}
        <div
          ref={scrollAreaRef}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {displayMessages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              isStreaming={streamingMessageId === message.id}
              onStreamingComplete={handleStreamingComplete}
              onCopy={handleCopyMessage}
              onReact={handleMessageReaction}
              onRetry={handleRetryMessage}
            />
          ))}

          {isBusy && (
            <div className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <BrandMark size={18} />
              </span>
              <div
                className="inline-flex items-center gap-1 rounded-2xl border border-border bg-secondary/50 px-3.5 py-2.5"
                role="status"
                aria-label="Assistant is typing"
              >
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts, only before the first message */}
        {displayMessages.length <= 1 && !isBusy && (
          <div
            className="flex flex-wrap gap-2 border-t border-border/70 bg-secondary/20 px-4 py-2.5"
            role="group"
            aria-label="Suggested questions"
          >
            {conversationStarters.map(({ text, icon: Icon }) => (
              <button
                key={text}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => handleSendMessage(text)}
              >
                <Icon className="size-3.5 shrink-0 text-primary" />
                <span>{text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-border bg-secondary/35 px-4 pt-3 pb-2.5">
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-1.5 shadow-xs transition-all focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/25">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message"
              aria-label="Message"
              disabled={isBusy}
              maxLength={2000}
              className="max-h-[140px] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isBusy}
              aria-label="Send message"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <Send className="size-4 shrink-0" />
              )}
            </button>
          </div>
          <p className="tabular mt-1.5 px-1 text-[11px] text-muted-foreground">
            {inputValue.length > 1500
              ? `${inputValue.length} / 2000 characters`
              : 'Enter to send, Shift + Enter for a new line'}
          </p>
        </div>
      </section>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Export                                                                     */
/* -------------------------------------------------------------------------- */

export function ChatInterface({
  chatbotId,
  theme = 'system',
  enableSounds = false,
  maxHeight = '700px',
  showHeader = true,
}: ChatInterfaceProps) {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleChatRoomReady = useCallback((id: string) => {
    setChatRoomId(id);
    setHasError(false);
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Chat interface error:', event.error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <AlertCircle className="size-6 shrink-0" />
        </span>
        <h3 className="text-base font-semibold text-foreground">
          Something went wrong
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          The chat hit an unexpected error. Refresh the page to start again.
        </p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-4" />
          <span>Refresh page</span>
        </button>
      </div>
    );
  }

  if (!chatRoomId) {
    return (
      <ChatRoomInitializer
        chatbotId={chatbotId}
        onChatRoomReady={handleChatRoomReady}
      />
    );
  }

  return (
    <TooltipProvider>
      <ChatInterfaceMain
        chatbotId={chatbotId}
        chatRoomId={chatRoomId}
        enableSounds={enableSounds}
        maxHeight={maxHeight}
        showHeader={showHeader}
      />
    </TooltipProvider>
  );
}