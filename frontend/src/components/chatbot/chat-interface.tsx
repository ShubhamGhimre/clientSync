'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface ChatInterfaceProps {
  chatbotId: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  sources?: Array<{
    title: string;
    content: string;
    score: number;
  }>;
}

// Transform API conversation data to Message format
const transformConversationToMessage = (conversation: Conversation): Message => ({
  id: conversation.id,
  content: conversation.message,
  role: conversation.sender === 'user' ? 'user' : 'assistant',
  timestamp: new Date(conversation.createdAt),
  // Add sources if they exist in the conversation data
  sources: (conversation as any).sources,
});

// Chat Room Initializer Component
function ChatRoomInitializer({ chatbotId, onChatRoomReady }: { 
  chatbotId: string; 
  onChatRoomReady: (chatRoomId: string) => void;
}) {
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Fetch all chat rooms to find one for this chatbot
  const { 
    data: chatRooms, 
    isLoading: chatRoomsLoading,
    error: chatRoomsError,
    refetch: refetchChatRooms
  } = useChatRooms();

  // Create chat room mutation
  const createChatRoomMutation = useCreateChatRoom({
    onSuccess: (chatRoom) => {
      onChatRoomReady(chatRoom.id);
      setIsInitializing(false);
    },
    onError: (error) => {
      console.error('Failed to create chat room:', error);
      toast.error('Failed to initialize chat room');
      setIsInitializing(false);
    },
  });

  useEffect(() => {
    if (chatRooms && !isInitializing) {
      // Look for existing chat room for this chatbot
      const existingChatRoom = chatRooms.find(room => room.chatBotId === chatbotId);
      
      if (existingChatRoom) {
        onChatRoomReady(existingChatRoom.id);
      } else {
        // Create a new chat room for this chatbot
        setIsInitializing(true);
        createChatRoomMutation.mutate({
          title: `Chat with Bot ${chatbotId}`,
          chatBotId: chatbotId,
        });
      }
    }
  }, [chatRooms, chatbotId, onChatRoomReady, isInitializing, createChatRoomMutation]);

  // Loading state
  if (chatRoomsLoading || isInitializing || createChatRoomMutation.isPending) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">
              {chatRoomsLoading ? 'Loading chat rooms...' : 'Initializing chat...'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Setting up your conversation with the AI assistant
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (chatRoomsError) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load chat rooms</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please try again or check your connection
          </p>
          <Button onClick={() => refetchChatRooms()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return null; // This shouldn't render if everything is working
}

// Main Chat Interface Component
function ChatInterfaceMain({ chatbotId, chatRoomId }: { 
  chatbotId: string; 
  chatRoomId: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // API Hooks with proper types
  const { 
    data: conversations, 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(chatRoomId, {
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  const { 
    data: chatRoomData, 
    isLoading: chatRoomLoading 
  } = useChatRoom(chatRoomId);

  // Use optimistic updates for better UX
  const sendMessageMutation = useOptimisticSendMessage({
    onSuccess: () => {
      toast.success('Message sent');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const clearConversationsMutation = useClearConversations({
    onSuccess: () => {
      toast.success('Chat cleared');
    },
    onError: (error) => {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    },
  });

  // Transform API data to messages - now properly typed
  const messages: Message[] = conversations 
    ? conversations.map(transformConversationToMessage)
    : [];

  // Add welcome message if no conversations exist
  const displayMessages = messages.length === 0 ? [
    {
      id: 'welcome',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant' as const,
      timestamp: new Date(),
    }
  ] : messages;

  // Sample conversation starters
  const conversationStarters = [
    "What are your main features?",
    "How do I get started?",
    "What are your pricing plans?",
    "How can I contact support?",
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [displayMessages]);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (content?: string) => {
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
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearConversationsMutation.mutateAsync(chatRoomId);
    } catch (error) {
      console.error('Clear chat error:', error);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Loading state
  if (chatRoomLoading || conversationsLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (conversationsError && !conversationsLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load conversations</p>
          <Button onClick={() => refetchConversations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[700px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {chatRoomData?.title || 'AI Assistant'}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                  {(isTyping || sendMessageMutation.isPending) && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearChat}
                disabled={clearConversationsMutation.isPending || displayMessages.length <= 1}
              >
                {clearConversationsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Clear Chat
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea 
            className="flex-1 p-4" 
            ref={scrollAreaRef}
          >
            <div className="space-y-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      } ${
                        message.id.startsWith('temp-') ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                          <div className="space-y-1">
                            {message.sources.map((source, index) => (
                              <div key={index} className="text-xs bg-background/50 rounded p-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{source.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(source.score * 100)}% match
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">{source.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {message.id.startsWith('temp-') ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                              <Copy className="mr-2 h-3 w-3" />
                              Copy message
                            </DropdownMenuItem>
                            {message.role === 'assistant' && (
                              <>
                                <DropdownMenuItem>
                                  <ThumbsUp className="mr-2 h-3 w-3" />
                                  Good response
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ThumbsDown className="mr-2 h-3 w-3" />
                                  Poor response
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0 order-3">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Show typing indicator when AI is processing */}
              {(isTyping || sendMessageMutation.isPending) && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${chatbotId}`} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%]">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Conversation Starters */}
          {displayMessages.length <= 1 && !isTyping && !sendMessageMutation.isPending && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-sm font-medium mb-3">Try asking:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {conversationStarters.map((starter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3"
                    onClick={() => handleSendMessage(starter)}
                    disabled={sendMessageMutation.isPending || isTyping}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{starter}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={sendMessageMutation.isPending || isTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || sendMessageMutation.isPending || isTyping}
                size="icon"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Export Component
export function ChatInterface({ chatbotId }: ChatInterfaceProps) {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const handleChatRoomReady = (id: string) => {
    setChatRoomId(id);
  };

  if (!chatRoomId) {
    return (
      <ChatRoomInitializer 
        chatbotId={chatbotId} 
        onChatRoomReady={handleChatRoomReady}
      />
    );
  }

  return (
    <ChatInterfaceMain 
      chatbotId={chatbotId} 
      chatRoomId={chatRoomId}
    />
  );
}