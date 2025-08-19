'use client'
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send,
  MoreHorizontal,
  ArrowLeft,
  MessageCircle,
  Search,
  Settings,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Mic,
  Circle,
  CheckCheck
} from 'lucide-react';
import { useChatBots } from '@/hooks/api/useChatBots';

// Types
interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Chatbot {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'busy';
  conversations: number;
  accuracy: number;
  avatar?: string;
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
}

// Mock data
const mockChatbots: Chatbot[] = [
  { 
    id: 1, 
    name: 'General Support', 
    status: 'online', 
    conversations: 45, 
    accuracy: 94,
    lastMessage: 'How can I help you today?',
    lastSeen: '2 min ago',
    unreadCount: 3
  },
  { 
    id: 2, 
    name: 'Technical Help', 
    status: 'online', 
    conversations: 32, 
    accuracy: 89,
    lastMessage: 'Let me check your system status...',
    lastSeen: '5 min ago',
    unreadCount: 0
  },
  { 
    id: 3, 
    name: 'Billing Assistant', 
    status: 'busy', 
    conversations: 18, 
    accuracy: 96,
    lastMessage: 'Your payment has been processed',
    lastSeen: '1 hour ago',
    unreadCount: 1
  },
  { 
    id: 4, 
    name: 'Product Expert', 
    status: 'offline', 
    conversations: 28, 
    accuracy: 92,
    lastMessage: 'Here are the product features you requested',
    lastSeen: '3 hours ago',
    unreadCount: 0
  }
];

const mockChats: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: 'user', message: 'Hi, I need help with my account', timestamp: '10:30 AM', status: 'read' },
    { id: 2, sender: 'bot', message: 'Hello! 👋 I\'d be happy to help you with your account. What specific issue are you experiencing?', timestamp: '10:30 AM', status: 'delivered' },
    { id: 3, sender: 'user', message: 'I can\'t log in to my dashboard', timestamp: '10:31 AM', status: 'read' },
    { id: 4, sender: 'bot', message: 'I understand you\'re having trouble logging in. Let me help you troubleshoot this step by step. Have you tried resetting your password recently?', timestamp: '10:31 AM', status: 'delivered' },
    { id: 5, sender: 'user', message: 'No, I haven\'t tried that yet', timestamp: '10:32 AM', status: 'sent' },
    { id: 6, sender: 'bot', message: 'Perfect! Let me guide you through the password reset process. I\'ll send you a secure link to reset your password. Please check your email in a few moments.', timestamp: '10:33 AM', status: 'delivered' }
  ]
};

const Chats = () => {
  const [activeChatbot, setActiveChatbot] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>(mockChats);
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {data} = useChatBots();
  console.log('Chatbots data:', data);  

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeChatbot]);

  // Focus input when chat is selected
  useEffect(() => {
    if (activeChatbot && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChatbot]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatbot) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };
    
    setChatMessages(prev => ({
      ...prev,
      [activeChatbot]: [...(prev[activeChatbot] || []), userMessage]
    }));
    
    setNewMessage('');
    
    // Update status to sent
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [activeChatbot]: prev[activeChatbot].map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      }));
    }, 500);

    // Show typing indicator
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponses = [
        "Thank you for your message! I'm here to help you with that. 😊",
        "I understand your concern. Let me provide you with the best solution.",
        "Great question! Here's what I recommend based on your needs.",
        "I'm processing your request. This should resolve your issue quickly.",
        "Thanks for reaching out! I'll make sure to get this sorted for you."
      ];
      
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };
      
      setChatMessages(prev => ({
        ...prev,
        [activeChatbot]: [...(prev[activeChatbot] || []), botMessage]
      }));
    }, 1500 + Math.random() * 1000);
  };

  const selectChatbot = (botId: number) => {
    setActiveChatbot(botId);
    setShowChatList(false);
  };

  const goBackToList = () => {
    setShowChatList(true);
    setActiveChatbot(null);
  };

  const filteredChatbots = mockChatbots.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending': return <Circle size={12} className="text-gray-400" />;
      case 'sent': return <CheckCheck size={12} className="text-gray-400" />;
      case 'delivered': return <CheckCheck size={12} className="text-blue-500" />;
      case 'read': return <CheckCheck size={12} className="text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mockChatbots.filter(bot => bot.status === 'online').length} bots online
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chatbots Sidebar */}
        <div className={`${
          showChatList ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200`}>
          
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Chatbots List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatbots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => selectChatbot(bot.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors duration-150 ${
                  activeChatbot === bot.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(bot.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {bot.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {bot.lastSeen}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {bot.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">
                          {bot.status}
                        </span>
                      </div>
                      {bot.unreadCount && bot.unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {bot.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`${
          !showChatList ? 'flex' : 'hidden'
        } lg:flex flex-col flex-1 bg-white`}>
          
          {activeChatbot ? (
            <>
              {/* Chat Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {/* Back button for mobile */}
                    <button 
                      onClick={goBackToList}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    
                    {/* Bot Avatar and Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(mockChatbots.find(bot => bot.id === activeChatbot)?.status || 'offline')} rounded-full border-2 border-white`}></div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {mockChatbots.find(bot => bot.id === activeChatbot)?.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {isTyping ? (
                            <span className="flex items-center">
                              <span className="typing-indicator">typing</span>
                              <span className="ml-1 flex space-x-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                              </span>
                            </span>
                          ) : (
                            `${mockChatbots.find(bot => bot.id === activeChatbot)?.status} • AI Assistant`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Phone size={18} className="text-gray-600" />
                    </button>
                    <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Video size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Info size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {(chatMessages[activeChatbot] || []).map((message: ChatMessage, index: number) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* Message Bubble */}
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}>
                        <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      
                      {/* Timestamp and Status */}
                      <div className={`flex items-center mt-1 px-1 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-gray-500 mr-1">
                          {message.timestamp}
                        </span>
                        {message.sender === 'user' && (
                          <div className="ml-1">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Avatar for bot messages */}
                    {message.sender === 'bot' && (
                      <div className="order-1 mr-3 mt-auto">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3">
                  {/* Attachment Button */}
                  <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200">
                    <Paperclip size={20} />
                  </button>
                  
                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <Smile size={18} />
                    </button>
                  </div>
                  
                  {/* Send/Mic Button */}
                  {newMessage.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send size={18} />
                    </button>
                  ) : (
                    <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200">
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected State */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Welcome to ClientSync Chat
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Select a chatbot from the sidebar to start viewing conversations and managing customer interactions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
