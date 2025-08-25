'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
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
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  sources: (conversation as any).sources,
});

// Enhanced Message Component with modern animations
const MessageBubble = ({ 
  message, 
  chatbotId, 
  onCopyMessage 
}: { 
  message: Message; 
  chatbotId: string; 
  onCopyMessage: (content: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  return (
    <div
      className={`flex gap-4 group animate-in slide-in-from-bottom-5 duration-500 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-blue-200/50 shadow-lg transition-all duration-300 hover:ring-blue-300 hover:shadow-xl">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
            <Bot className="h-5 w-5 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] ${message.role === 'user' ? 'order-2' : ''}`}>
        <div
          className={`rounded-2xl p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white ml-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
              : 'bg-white/90 border border-gray-200/60 shadow-sm hover:shadow-md hover:border-gray-300/70'
          } ${
            message.id.startsWith('temp-') ? 'opacity-70 animate-pulse' : ''
          }`}
        >
          {message.role === 'user' && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          )}
          
          <div className="whitespace-pre-wrap leading-relaxed relative z-10 text-[15px]">
            {message.content}
          </div>
          
          {message.sources && message.sources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-200/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded-full bg-blue-100">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Sources</p>
              </div>
              <div className="space-y-3">
                {message.sources.map((source, index) => (
                  <div key={index} className="text-xs bg-gray-50/90 rounded-xl p-4 border border-gray-100/80 hover:bg-gray-100/90 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{source.title}</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{source.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-3 mt-3 transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        } ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm">
            {formatTime(message.timestamp)}
          </span>
          
          {message.id.startsWith('temp-') ? (
            <span className="text-xs text-gray-500 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sending...
            </span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-white/90 shadow-sm backdrop-blur-sm">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 backdrop-blur-md bg-white/95 border border-gray-200/60">
                <DropdownMenuItem onClick={() => onCopyMessage(message.content)} className="rounded-md">
                  <Copy className="mr-2 h-3 w-3" />
                  Copy message
                </DropdownMenuItem>
                {message.role === 'assistant' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-md">
                      <ThumbsUp className="mr-2 h-3 w-3" />
                      Good response
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md">
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
        <Avatar className="h-10 w-10 flex-shrink-0 order-3 ring-2 ring-gray-200/50 shadow-lg transition-all duration-300 hover:ring-gray-300 hover:shadow-xl">
          <div className="w-full h-full bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 flex items-center justify-center relative overflow-hidden">
            <User className="h-5 w-5 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
        </Avatar>
      )}
    </div>
  );
};

// Enhanced Typing Indicator with modern animation
const TypingIndicator = ({ chatbotId }: { chatbotId: string }) => (
  <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-5 duration-500">
    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-blue-200/50 shadow-lg">
      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
        <Bot className="h-5 w-5 text-white relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>
    </Avatar>
    <div className="max-w-[75%]">
      <div className="bg-white/95 border border-gray-200/60 rounded-2xl p-4 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-600 font-medium">AI is crafting a response...</span>
        </div>
      </div>
    </div>
  </div>
);

// Chat Room Initializer Component
const ChatRoomInitializer = ({ chatbotId, onChatRoomReady }: { 
  chatbotId: string; 
  onChatRoomReady: (chatRoomId: string) => void;
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { 
    data: chatRooms, 
    isLoading: chatRoomsLoading,
    error: chatRoomsError,
    refetch: refetchChatRooms
  } = useChatRooms();

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
      const existingChatRoom = chatRooms.find(room => room.chatBotId === chatbotId);
      
      if (existingChatRoom) {
        onChatRoomReady(existingChatRoom.id);
      } else {
        setIsInitializing(true);
        createChatRoomMutation.mutate({
          title: `Chat with Bot ${chatbotId}`,
          chatBotId: chatbotId,
        });
      }
    }
  }, [chatRooms, chatbotId, onChatRoomReady, isInitializing, createChatRoomMutation]);

  if (chatRoomsLoading || isInitializing || createChatRoomMutation.isPending) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-purple-200/20"></div>
        <div className="flex flex-col items-center gap-8 p-8 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-20 animate-ping"></div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-4 mb-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {chatRoomsLoading ? 'Loading chat rooms...' : 'Initializing chat...'}
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              Setting up your conversation with the AI assistant
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (chatRoomsError) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <RefreshCw className="h-10 w-10 text-white" />
          </div>
          <p className="text-red-600 mb-2 text-2xl font-bold">Failed to load chat rooms</p>
          <p className="text-gray-600 mb-8 text-lg">
            Please try again or check your connection
          </p>
          <Button onClick={() => refetchChatRooms()} className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded-xl text-lg">
            <RefreshCw className="h-5 w-5 mr-3" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

// Main Chat Interface Component
const ChatInterfaceMain = ({ chatbotId, chatRoomId }: { 
  chatbotId: string; 
  chatRoomId: string;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    data: conversations, 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(chatRoomId, {
    refetchInterval: 2000,
  });

  const { 
    data: chatRoomData, 
    isLoading: chatRoomLoading 
  } = useChatRoom(chatRoomId);

  const sendMessageMutation = useOptimisticSendMessage({
    onSuccess: () => {
      if (soundEnabled) {
        // Play success sound effect
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
        audio.play().catch(() => {});
      }
      toast.success('Message sent', {
        style: {
          background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
          color: 'white',
        },
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.', {
        style: {
          background: 'linear-gradient(to right, #ef4444, #dc2626)',
          color: 'white',
        },
      });
    },
  });

  const clearConversationsMutation = useClearConversations({
    onSuccess: () => {
      toast.success('Chat cleared successfully', {
        style: {
          background: 'linear-gradient(to right, #10b981, #059669)',
          color: 'white',
        },
      });
    },
    onError: (error) => {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    },
  });

  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => {
    return conversations ? conversations.map(transformConversationToMessage) : [];
  }, [conversations]);

  const conversationStarters = useMemo(() => [
    {
      text: "What are your main features?",
      icon: "⚡",
      category: "Features"
    },
    {
      text: "How do I get started?",
      icon: "🚀",
      category: "Getting Started"
    },
    {
      text: "What are your pricing plans?",
      icon: "💰",
      category: "Pricing"
    },
    {
      text: "How can I contact support?",
      icon: "🎧",
      category: "Support"
    },
  ], []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, sendMessageMutation, chatRoomId]);

  const handleClearChat = useCallback(async () => {
    try {
      await clearConversationsMutation.mutateAsync(chatRoomId);
    } catch (error) {
      console.error('Clear chat error:', error);
    }
  }, [clearConversationsMutation, chatRoomId]);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard', {
      style: {
        background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
        color: 'white',
      },
    });
  }, []);

  if (chatRoomLoading || conversationsLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-purple-200/20"></div>
        <div className="flex items-center gap-4 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-xl text-gray-700 font-semibold">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (conversationsError && !conversationsLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8">
          <p className="text-red-600 mb-6 text-xl font-semibold">Failed to load conversations</p>
          <Button onClick={() => refetchConversations()} className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded-xl">
            <RefreshCw className="h-5 w-5 mr-3" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/40 to-purple-50/40 relative overflow-hidden transition-all duration-500 ${
      isExpanded ? 'h-screen' : 'h-[700px]'
    }`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/10 via-transparent to-purple-200/10"></div>
      
      <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/90 backdrop-blur-xl relative z-10 m-2 rounded-3xl overflow-hidden">
        <CardHeader className="flex-shrink-0 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-blue-200/60 shadow-xl transition-all duration-300 hover:ring-blue-300 hover:shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <Bot className="h-7 w-7 text-white relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {chatRoomData?.title || 'AI Assistant'}
                  <div className="p-1 rounded-full bg-blue-100">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Online & Ready to Help</span>
                  </div>
                  {(isTyping || sendMessageMutation.isPending) && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-2 text-blue-600">
                        <Zap className="h-3 w-3 animate-pulse" />
                        Processing your message...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-gray-100/80">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 backdrop-blur-md bg-white/95 border border-gray-200/60 rounded-xl">
                  <DropdownMenuItem onClick={() => setSoundEnabled(!soundEnabled)} className="rounded-lg">
                    {soundEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                    {soundEnabled ? 'Disable Sounds' : 'Enable Sounds'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)} className="rounded-lg">
                    {isExpanded ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                    {isExpanded ? 'Normal View' : 'Full Screen'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearChat}
                disabled={clearConversationsMutation.isPending || messages.length === 0}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors rounded-xl"
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

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea 
            className="flex-1 p-6" 
            ref={scrollAreaRef}
          >
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  chatbotId={chatbotId}
                  onCopyMessage={handleCopyMessage}
                />
              ))}

              {(isTyping || sendMessageMutation.isPending) && (
                <TypingIndicator chatbotId={chatbotId} />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {messages.length === 0 && !isTyping && !sendMessageMutation.isPending && (
            <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-blue-50/60 to-purple-50/60 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 text-gray-800 mb-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-bold text-xl">Start the conversation</span>
                </div>
                <p className="text-gray-600 text-lg">Choose a topic below or ask anything you'd like to know</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {conversationStarters.map((starter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto p-5 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group rounded-xl border-2"
                    onClick={() => handleSendMessage(starter.text)}
                    disabled={sendMessageMutation.isPending || isTyping}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-2xl">{starter.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{starter.category}</span>
                        </div>
                        <span className="font-medium group-hover:text-blue-700 transition-colors text-base">{starter.text}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 border-t border-gray-200/60 bg-white/95 backdrop-blur-xl">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
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
                  className="pr-12 py-4 text-base rounded-2xl border-2 border-gray-300/60 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-400/60 placeholder:text-gray-400"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-full bg-gray-100">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || sendMessageMutation.isPending || isTyping}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 text-base font-semibold"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Export Component with proper memoization
export function ChatInterface({ chatbotId }: ChatInterfaceProps) {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const handleChatRoomReady = useCallback((id: string) => {
    setChatRoomId(id);
  }, []);

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