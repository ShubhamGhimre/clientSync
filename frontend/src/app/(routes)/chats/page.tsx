'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, ArrowLeft, MessageCircle, Search, Settings,
  Phone, Video, Info, Smile, Paperclip, Mic, Circle, CheckCheck, X
} from 'lucide-react';
import { useChatBots } from '@/hooks/api/useChatBots';
import { useChatRooms, useCreateChatRoom } from '@/hooks/api/useChatRoom';
import { useGrantBotAccess } from '@/hooks/api/useBotAccess';
import { useAuthContext } from '@/context/AuthContext';
import { useConversations, useSendMessage } from '@/hooks/api/useConversations';

const Chats = () => {
  const { data: chatbots } = useChatBots();
  const { data: chatRooms } = useChatRooms();
  const createChatRoom = useCreateChatRoom();
  const grantBotAccess = useGrantBotAccess();
  const sendMessageMutation = useSendMessage();
  const { user } = useAuthContext();

  const [activeChatbotId, setActiveChatbotId] = useState<string | null>(null);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalBotId, setModalBotId] = useState<string | null>(null);
  const [chatRoomForm, setChatRoomForm] = useState({ name: '', description: '' });
  const [modalError, setModalError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations for the active chat room
  const { data: conversations = [] } = useConversations(
    activeChatRoomId ? { chatRoomId: activeChatRoomId } : undefined
  );

  // Filter chatbots by search
  const filteredChatbots = (chatbots || []).filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when conversations change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeChatRoomId]);

  // Focus input when chat is selected
  useEffect(() => {
    if (activeChatbotId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChatbotId]);

  // Handle bot selection: grant access, create/find chat room, set active
  const selectChatbot = async (botId: string) => {
    if (!user) return;
    try {
      await grantBotAccess.mutateAsync({ userId: user.id, chatBotId: botId });

      // Try to find an existing chat room for this bot
      let chatRoom = (chatRooms || []).find(
        room => room.chatBotId === botId
      );

      console.log(chatRoom)

      if (chatRoom) {
        setActiveChatbotId(botId);
        setActiveChatRoomId(chatRoom.id);
        setShowChatList(false);
      } else {
        // Open modal to create chat room
        setModalBotId(botId);
        setChatRoomForm({ name: '', description: '' });
        setModalError(null);
        setShowModal(true);
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Handle chat room creation from modal
  const handleCreateChatRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!chatRoomForm.name.trim()) {
      setModalError('Chat room name is required.');
      return;
    }
    if (!modalBotId) return;
    try {
      const chatRoom = await createChatRoom.mutateAsync({
        title: chatRoomForm.name,
        description: chatRoomForm.description,
        chatBotId: modalBotId,
      });
      setActiveChatbotId(modalBotId);
      setActiveChatRoomId(chatRoom.id);
      setShowChatList(false);
      setShowModal(false);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to create chat room.');
    }
  };

  const goBackToList = () => {
    setShowChatList(true);
    setActiveChatbotId(null);
    setActiveChatRoomId(null);
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatRoomId || !user) return;
    await sendMessageMutation.mutateAsync({
      chatRoomId: activeChatRoomId,
      message: newMessage,
      sender: `${user.firstName} ${user.lastName}` // <-- send user's name
    });
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-400';
      case 'BUSY': return 'bg-yellow-400';
      case 'OFFLINE': return 'bg-gray-400';
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
      {/* Modal for chat room creation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Create Chat Room</h2>
            <form onSubmit={handleCreateChatRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chat Room Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={chatRoomForm.name}
                  onChange={e => setChatRoomForm({ ...chatRoomForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={chatRoomForm.description}
                  onChange={e => setChatRoomForm({ ...chatRoomForm, description: e.target.value })}
                />
              </div>
              {modalError && (
                <div className="text-red-600 text-sm">{modalError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {(chatbots || []).filter(bot => bot.status === 'ONLINE').length} bots online
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
                  activeChatbotId === bot.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
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
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">
                          {bot.status}
                        </span>
                      </div>
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
          {activeChatbotId && activeChatRoomId ? (
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
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                          (chatbots || []).find(bot => bot.id === activeChatbotId)?.status || 'offline'
                        )} rounded-full border-2 border-white`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {(chatbots || []).find(bot => bot.id === activeChatbotId)?.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          AI Assistant
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
                {conversations.map((message, index) => (
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
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Optionally: status icon */}
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
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
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
