'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  Bot,
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
/*  Streaming text (caret comes from .stream-caret in globals.css)             */
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

  // Restart when the text changes
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

  return (
    <span className={count < text.length ? 'stream-caret' : undefined}>
      {text.slice(0, count)}
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
    <div className={`msg group ${isUser ? 'msg-user' : 'msg-bot'}`}>
      {!isUser && (
        <span className="avatar avatar-sm avatar-ai" aria-hidden="true">
          <Bot className="ico-sm" />
        </span>
      )}

      <div className="msg-body">
        <div className={`msg-bubble ${message.isError ? 'is-error' : ''}`}>
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
          <div className="source-list" role="group" aria-label="Sources">
            {visibleSources.map((source, index) => {
              const label = (
                <>
                  <FileText className="ico-xs" />
                  <span className="ellipsis">{source.title}</span>
                  <span className="tabular no-shrink">
                    {Math.round(source.score * 100)}%
                  </span>
                </>
              );
              return source.url ? (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-chip"
                  title={source.content}
                >
                  {label}
                </a>
              ) : (
                <span key={index} className="source-chip" title={source.content}>
                  {label}
                </span>
              );
            })}
            {(hiddenCount > 0 || showAllSources) && sources.length > 2 && (
              <button
                type="button"
                className="source-chip"
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
            className="btn btn-secondary btn-sm"
            onClick={() => onRetry(message.id)}
          >
            <RefreshCw /> Retry
          </button>
        )}

        {/* Time, status, metadata, actions */}
        <div
          className={`msg-meta chat-actions ${
            alwaysShowMeta ? 'chat-actions-visible' : ''
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>

          {isPending && <Loader2 className="ico-xs spin" aria-label="Sending" />}

          {message.isError && (
            <span className="inline-row g-1 t-danger">
              <AlertCircle className="ico-xs" /> Not sent
            </span>
          )}

          {meta?.processingTime && (
            <span className="inline-row g-1 tabular">
              <Zap className="ico-xs" /> {meta.processingTime}ms
            </span>
          )}
          {meta?.tokens && <span className="tabular">{meta.tokens} tokens</span>}
          {meta?.model && <span>{meta.model}</span>}

          {!isPending && !message.isError && (
            <span className="inline-row">
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => onCopy(message.content)}
                aria-label="Copy message"
                title="Copy message"
              >
                <Copy className="ico-xs" />
              </button>

              {!isUser && (
                <>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-icon btn-sm ${
                      reaction === 'like' ? 't-success' : ''
                    }`}
                    onClick={() => handleReact('like')}
                    aria-label="Good response"
                    aria-pressed={reaction === 'like'}
                    title="Good response"
                  >
                    <ThumbsUp className="ico-xs" />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-icon btn-sm ${
                      reaction === 'dislike' ? 't-danger' : ''
                    }`}
                    onClick={() => handleReact('dislike')}
                    aria-label="Poor response"
                    aria-pressed={reaction === 'dislike'}
                    title="Poor response"
                  >
                    <ThumbsDown className="ico-xs" />
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

// Transform API conversation data to Message format
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
      const existingChatRoom = chatRooms.find((room) => room.chatBotId === chatbotId);

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
  }, [chatRooms, chatbotId, onChatRoomReady, isInitializing, createChatRoomMutation]);

  // Simulate progress while the room is being created
  useEffect(() => {
    if (isInitializing && progress < 90) {
      const timer = setTimeout(() => setProgress((prev) => prev + 10), 200);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, progress]);

  if (chatRoomsLoading || isInitializing || createChatRoomMutation.isPending) {
    return (
      <div className="chat-h700">
        <span className="avatar avatar-ai avatar-lg" aria-hidden="true">
          <Bot className="ico-xl" />
        </span>
        <div className="stack-sm center">
          <h3 className="section-title">
            {chatRoomsLoading ? 'Loading chat' : 'Setting up chat'}
          </h3>
          <p className="field-hint">Preparing your conversation with the assistant.</p>
        </div>
        <div
          className="progress chat-max-width"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  if (chatRoomsError) {
    return (
      <div className="empty-state chat-h700">
        <WifiOff className="ico-2xl t-danger" />
        <h3 className="empty-state-title">Can't connect to chat</h3>
        <p className="empty-state-text">
          Check your internet connection, then try again.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => refetchChatRooms()}>
          <RefreshCw /> Try again
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
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
    refetchInterval: isTyping ? 1000 : 3000, // Faster polling while expecting a reply
    staleTime: 1000,
  });

  const { data: chatRoomData, isLoading: chatRoomLoading } = useChatRoom(chatRoomId);

  const sendMessageMutation = useOptimisticSendMessage({
    onSuccess: () => {
      if (soundEnabled && Date.now() - lastPlayedSoundRef.current > 1000) {
        // Play success sound
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
    () => (conversations ? conversations.map(transformConversationToMessage) : []),
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

  // Detect new messages and start streaming the newest AI reply
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

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  // Grow the composer with its content (capped by .chat-input max-height)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
      } catch (error) {
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
      // Implement API call for message reaction
      toast.success(`${reaction === 'like' ? 'Liked' : 'Disliked'} message`);
    },
    []
  );

  const handleRetryMessage = useCallback(async (messageId: string) => {
    setRetryingMessages((prev) => new Set([...prev, messageId]));
    // Implement retry logic
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
      <div className="chat-window" style={{ height: maxHeight }} aria-busy="true">
        {showHeader && (
          <div className="chat-header">
            <div className="skeleton avatar" />
            <div className="stack-sm">
              <div className="skeleton skeleton-line-short" />
              <div className="skeleton skeleton-line" />
            </div>
          </div>
        )}
        <div className="chat-messages">
          <div className="msg msg-bot">
            <div className="skeleton avatar-sm" />
            <div className="skeleton skeleton-bubble chat-round-2xl" />
          </div>
          <div className="msg msg-user">
            <div className="skeleton skeleton-line chat-round-2xl" />
          </div>
          <div className="msg msg-bot">
            <div className="skeleton avatar-sm" />
            <div className="skeleton skeleton-card chat-round-2xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (conversationsError && !conversationsLoading) {
    return (
      <div className="empty-state chat-h700" style={{ height: maxHeight }}>
        <AlertCircle className="ico-2xl t-danger" />
        <h3 className="empty-state-title">Couldn't load this conversation</h3>
        <p className="empty-state-text">
          Your chat history didn't load. Try again, or refresh the page if it keeps failing.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => refetchConversations()}>
          <RefreshCw /> Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className={isFullscreen ? 'chat-fs-shell' : ''}
      style={{ height: isFullscreen ? '100dvh' : maxHeight }}
    >
      <section
        className={`chat-window ${isFullscreen ? 'chat-fs-inner' : ''}`}
        aria-label="Chat"
      >
        {showHeader && (
          <header className="chat-header">
            <span className="avatar avatar-ai" aria-hidden="true">
              <Bot className="ico" />
            </span>

            <div className="flex-fill">
              <h2 className="chat-header-title">
                {chatRoomData?.title || 'AI Assistant'}
              </h2>
              <p className="chat-header-meta" aria-live="polite">
                {isBusy ? (
                  <>
                    <Loader2 className="ico-xs spin" /> Thinking…
                  </>
                ) : (
                  <>
                    <span className="status-dot is-online" /> Online
                  </>
                )}
              </p>
            </div>

            <div className="cluster g-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setSoundEnabled((v) => !v)}
                    aria-label={soundEnabled ? 'Turn sounds off' : 'Turn sounds on'}
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? <Volume2 /> : <VolumeX />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{soundEnabled ? 'Turn sounds off' : 'Turn sounds on'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setIsFullscreen((v) => !v)}
                    aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                  >
                    {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'Exit full screen' : 'Full screen'}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    aria-label="More options"
                  >
                    <MoreVertical />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleClearChat}
                    disabled={clearConversationsMutation.isPending || displayMessages.length <= 1}
                  >
                    {clearConversationsMutation.isPending ? (
                      <Loader2 className="space-r-2 ico spin" />
                    ) : (
                      <RefreshCw className="space-r-2 ico" />
                    )}
                    Clear chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Not wired up yet, so shown disabled */}
                  <DropdownMenuItem disabled>
                    <Share2 className="space-r-2 ico" />
                    Share conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Download className="space-r-2 ico" />
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
          className="chat-messages"
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
            <div className="msg msg-bot">
              <span className="avatar avatar-sm avatar-ai" aria-hidden="true">
                <Bot className="ico-sm" />
              </span>
              <div className="typing" role="status" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts, only before the first message */}
        {displayMessages.length <= 1 && !isBusy && (
          <div className="quick-replies" role="group" aria-label="Suggested questions">
            {conversationStarters.map(({ text, icon: Icon }) => (
              <button
                key={text}
                type="button"
                className="quick-reply inline-row g-2"
                onClick={() => handleSendMessage(text)}
              >
                <Icon className="ico-sm t-ai" />
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="chat-composer">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message"
            aria-label="Message"
            disabled={isBusy}
            maxLength={2000}
            className="chat-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            type="button"
            className="chat-send"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isBusy}
            aria-label="Send message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="ico spin" />
            ) : (
              <Send className="ico" />
            )}
          </button>
        </div>
        <p className="chat-footnote">
          {inputValue.length > 1500
            ? `${inputValue.length} / 2000 characters`
            : 'Enter to send, Shift + Enter for a new line'}
        </p>
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

  // Error boundary simulation
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
      <div className="empty-state chat-h700">
        <AlertCircle className="ico-2xl t-danger" />
        <h3 className="empty-state-title">Something went wrong</h3>
        <p className="empty-state-text">
          The chat hit an unexpected error. Refresh the page to start again.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          <RefreshCw /> Refresh page
        </button>
      </div>
    );
  }

  if (!chatRoomId) {
    return <ChatRoomInitializer chatbotId={chatbotId} onChatRoomReady={handleChatRoomReady} />;
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
