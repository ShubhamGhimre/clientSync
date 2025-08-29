'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  MessageSquare, 
  Clock,
  CheckCircle,
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
  WifiOff
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

// Import the updated type-safe API hooks
import { 
  useClearConversations, 
  useConversations, 
  useSendMessage,
  useOptimisticSendMessage,
  type Conversation
} from '@/hooks/api/useConversations';
import { 
  useChatRooms,
  useChatRoom,
  useCreateChatRoom,
  type ChatRoom 
} from '@/hooks/api/useChatRooms';
import { Skeleton } from '../ui/skeleton';

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

// Enhanced Streaming Text Component with better performance
const StreamingText = ({ text, onComplete, speed = 20 }: { 
  text: string; 
  onComplete?: () => void;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      intervalRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else if (currentIndex >= text.length && onComplete) {
      onComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, text, onComplete, speed]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="inline-block">
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-primary">|</span>
      )}
    </span>
  );
};

// Loading Skeleton Component
const MessageSkeleton = () => (
  <div className="flex gap-3 justify-start animate-in slide-in-from-left-1">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Enhanced Message Component
const MessageComponent = ({ 
  message, 
  chatbotId, 
  isStreaming, 
  onStreamingComplete,
  onCopy,
  onReact,
  onRetry
}: {
  message: Message;
  chatbotId: string;
  isStreaming: boolean;
  onStreamingComplete: (id: string) => void;
  onCopy: (content: string) => void;
  onReact: (messageId: string, reaction: 'like' | 'dislike') => void;
  onRetry?: (messageId: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullSources, setShowFullSources] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatusIcon = () => {
    if (message.id.startsWith('temp-')) {
      return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
    }
    if (message.isError) {
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  return (
    <div
      className={`group flex gap-3 animate-in slide-in-from-${message.role === 'user' ? 'right' : 'left'}-1 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/10">
          <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[85%] min-w-0 ${message.role === 'user' ? 'order-2' : ''}`}>
        <div
          className={`relative rounded-2xl p-4 shadow-sm transition-all duration-200 ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto'
              : 'bg-gradient-to-br from-muted to-muted/80 hover:from-muted/90 hover:to-muted/70'
          } ${
            message.id.startsWith('temp-') ? 'opacity-70' : ''
          } ${
            message.isError ? 'border-2 border-red-200 bg-red-50' : ''
          }`}
        >
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message.role === 'assistant' && isStreaming ? (
              <StreamingText 
                text={message.content} 
                onComplete={() => onStreamingComplete(message.id)}
                speed={15}
              />
            ) : (
              <span className={message.isError ? 'text-red-700' : ''}>{message.content}</span>
            )}
          </div>
          
          {/* Error Message */}
          {message.isError && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to send message</span>
                {onRetry && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 ml-auto"
                    onClick={() => onRetry(message.id)}
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Sources ({message.sources.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowFullSources(!showFullSources)}
                >
                  {showFullSources ? 'Show less' : 'Show more'}
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {message.sources.slice(0, showFullSources ? undefined : 2).map((source, index) => (
                  <div key={index} className="text-xs bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate flex-1">{source.title}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{source.content}</p>
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-1 inline-block"
                      >
                        View source →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {message.metadata && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {message.metadata.processingTime && (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {message.metadata.processingTime}ms
                  </span>
                )}
                {message.metadata.tokens && (
                  <span>{message.metadata.tokens} tokens</span>
                )}
                {message.metadata.model && (
                  <span>{message.metadata.model}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Message Actions */}
        <div className={`flex items-center gap-2 mt-2 transition-opacity duration-200 ${
          isHovered || message.isError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getMessageStatusIcon()}
            <span>{formatTime(message.timestamp)}</span>
          </div>
          
          {!message.id.startsWith('temp-') && !message.isError && (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => onCopy(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy message</TooltipContent>
                </Tooltip>
                
                {message.role === 'assistant' && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
                          onClick={() => onReact(message.id, 'like')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Good response</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => onReact(message.id, 'dislike')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Poor response</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {message.role === 'user' && (
        <Avatar className="h-8 w-8 flex-shrink-0 order-3 ring-2 ring-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600">
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
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

// Enhanced Chat Room Initializer
const ChatRoomInitializer = ({ chatbotId, onChatRoomReady }: { 
  chatbotId: string; 
  onChatRoomReady: (chatRoomId: string) => void;
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { 
    data: chatRooms, 
    isLoading: chatRoomsLoading,
    error: chatRoomsError,
    refetch: refetchChatRooms
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
      const existingChatRoom = chatRooms.find(room => room.chatBotId === chatbotId);
      
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

  // Simulate progress
  useEffect(() => {
    if (isInitializing && progress < 90) {
      const timer = setTimeout(() => {
        setProgress(prev => prev + 10);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, progress]);

  if (chatRoomsLoading || isInitializing || createChatRoomMutation.isPending) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Bot className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {chatRoomsLoading ? 'Loading...' : 'Initializing Chat'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Setting up your conversation with the AI assistant
            </p>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (chatRoomsError) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-destructive">Connection Failed</p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Unable to connect to chat services. Please check your internet connection and try again.
          </p>
          <Button onClick={() => refetchChatRooms()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

// Main Chat Interface Component
const ChatInterfaceMain = ({ 
  chatbotId, 
  chatRoomId, 
  enableSounds = false,
  maxHeight = '700px',
  showHeader = true 
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
  const [retryingMessages, setRetryingMessages] = useState<Set<string>>(new Set());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPlayedSoundRef = useRef<number>(0);

  // API Hooks with optimized queries
  const { 
    data: conversations, 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(chatRoomId, {
    refetchInterval: isTyping ? 1000 : 3000, // Faster polling when expecting response
    staleTime: 1000,
  });

  const { 
    data: chatRoomData, 
    isLoading: chatRoomLoading 
  } = useChatRoom(chatRoomId);

  const sendMessageMutation = useOptimisticSendMessage({
    onSuccess: () => {
      if (soundEnabled && Date.now() - lastPlayedSoundRef.current > 1000) {
        // Play success sound
        lastPlayedSoundRef.current = Date.now();
      }
      setIsTyping(false);
      // Focus input after successful send
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

  // Memoized transformations for better performance
  const messages: Message[] = useMemo(() => 
    conversations ? conversations.map(transformConversationToMessage) : [],
    [conversations]
  );

  const displayMessages = useMemo(() => {
    if (messages.length === 0) {
      return [{
        id: 'welcome',
        content: '👋 Hello! I\'m your AI assistant. I\'m here to help you with questions, provide information, and have engaging conversations. How can I assist you today?',
        role: 'assistant' as const,
        timestamp: new Date(),
      }];
    }
    return messages;
  }, [messages]);

  // Enhanced conversation starters
  const conversationStarters = useMemo(() => [
    { text: "What are your capabilities?", icon: Sparkles },
    { text: "How can you help me today?", icon: MessageSquare },
    { text: "Tell me about your features", icon: Settings },
    { text: "Show me what you can do", icon: Zap },
  ], []);

  // Optimized scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Detect new messages and handle streaming
  useEffect(() => {
    if (conversations && conversations.length > lastMessageCount) {
      const newMessages = conversations.slice(lastMessageCount);
      const newAIMessage = newMessages.find(msg => msg.sender !== 'user');
      
      if (newAIMessage && !newAIMessage.id.startsWith('temp-')) {
        setStreamingMessageId(newAIMessage.id);
        setIsTyping(false);
      }
      
      setLastMessageCount(conversations.length);
      scrollToBottom();
    }
  }, [conversations, lastMessageCount, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [displayMessages.length, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(async (content?: string) => {
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
  }, [inputValue, sendMessageMutation, chatRoomId]);

  // Handle message actions
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  }, []);

  const handleMessageReaction = useCallback((messageId: string, reaction: 'like' | 'dislike') => {
    // Implement API call for message reaction
    toast.success(`${reaction === 'like' ? 'Liked' : 'Disliked'} message`);
  }, []);

  const handleRetryMessage = useCallback(async (messageId: string) => {
    setRetryingMessages(prev => new Set([...prev, messageId]));
    // Implement retry logic
    setTimeout(() => {
      setRetryingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
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

  const handleStreamingComplete = useCallback((messageId: string) => {
    if (streamingMessageId === messageId) {
      setStreamingMessageId(null);
    }
  }, [streamingMessageId]);

  // Loading state
  if (chatRoomLoading || conversationsLoading) {
    return (
      <div className="h-[700px] flex flex-col">
        <Card className="flex-1 flex flex-col">
          {showHeader && (
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
          )}
          <CardContent className="flex-1 p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <MessageSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (conversationsError && !conversationsLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-destructive mb-2">Failed to load conversations</p>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading your chat history
          </p>
          <Button onClick={() => refetchConversations()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : maxHeight }}
    >
      <Card className="flex-1 flex flex-col shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
        {showHeader && (
          <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2">
                  <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {chatRoomData?.title || 'AI Assistant'}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online & Ready</span>
                    {(isTyping || sendMessageMutation.isPending) && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          Thinking...
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="h-8 w-8 p-0"
                      >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-8 w-8 p-0"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleClearChat} disabled={clearConversationsMutation.isPending || displayMessages.length <= 1}>
                      {clearConversationsMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Clear Chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea 
            className="flex-1 p-4" 
            ref={scrollAreaRef}
          >
            <div className="space-y-6 max-w-4xl mx-auto">
              {displayMessages.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  chatbotId={chatbotId}
                  isStreaming={streamingMessageId === message.id}
                  onStreamingComplete={handleStreamingComplete}
                  onCopy={handleCopyMessage}
                  onReact={handleMessageReaction}
                  onRetry={handleRetryMessage}
                />
              ))}

              {/* Enhanced Typing Indicator */}
              {(isTyping || sendMessageMutation.isPending) && (
                <div className="flex gap-3 justify-start animate-in slide-in-from-left-1">
                  <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          AI is processing your request...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Enhanced Conversation Starters */}
          {displayMessages.length <= 1 && !isTyping && !sendMessageMutation.isPending && (
            <div className="p-4 border-t bg-gradient-to-br from-muted/30 to-background backdrop-blur-sm">
              <p className="text-sm font-semibold mb-4 text-center text-muted-foreground">
                💡 Get started with these suggestions:
              </p>
              <div className="grid gap-3 md:grid-cols-2 max-w-2xl mx-auto">
                {conversationStarters.map((starter, index) => {
                  const IconComponent = starter.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-4 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group"
                      onClick={() => handleSendMessage(starter.text)}
                      disabled={sendMessageMutation.isPending || isTyping}
                    >
                      <IconComponent className="h-4 w-4 mr-3 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                      <span className="truncate text-sm">{starter.text}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Input Area */}
          <div className="p-4 border-t bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex gap-3">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={sendMessageMutation.isPending || isTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-12 py-3 text-sm rounded-xl border-0 bg-muted/50 backdrop-blur-sm focus:bg-background transition-all duration-200 resize-none"
                    maxLength={2000}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {inputValue.length}/2000
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || sendMessageMutation.isPending || isTyping}
                        size="lg"
                        className="px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message (Enter)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <p>Press Enter to send • Shift + Enter for new line</p>
                <div className="flex items-center gap-2">
                  <span>Powered by AI</span>
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Export Component with Error Boundary
export function ChatInterface({ 
  chatbotId, 
  theme = 'system',
  enableSounds = false,
  maxHeight = '700px',
  showHeader = true 
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
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-6">
            The chat interface encountered an error. Please refresh the page to try again.
          </p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
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