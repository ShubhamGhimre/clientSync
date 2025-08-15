'use client'
import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Ticket, 
  TrendingUp, 
  Plus,
  MoreHorizontal
} from 'lucide-react';

// Mock data
const mockChatbots = [
  { id: 1, name: 'General Support', status: 'active' as const, conversations: 45, accuracy: 94 },
  { id: 2, name: 'Technical Help', status: 'active' as const, conversations: 32, accuracy: 89 },
  { id: 3, name: 'Billing Assistant', status: 'inactive' as const, conversations: 18, accuracy: 96 }
];

const Dashboard = () => {
  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 xs:space-y-6 lg:space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-sm xs:text-base text-gray-600">
            Welcome to your AI-powered customer support platform
          </p>
        </div>
        
        {/* Create Button - Full width on mobile, auto on larger screens */}
        <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 xs:px-6 py-2.5 xs:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 xs:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl text-sm xs:text-base font-medium">
          <Plus size={18} className="xs:w-5 xs:h-5" />
          <span className="truncate">Create New Chatbot</span>
        </button>
      </div>
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 lg:gap-6">
        {/* Total Chatbots Card */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm p-4 xs:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start xs:items-center">
            <div className="p-2 xs:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg xs:rounded-xl shrink-0">
              <Bot className="h-5 w-5 xs:h-6 xs:w-6 lg:h-7 lg:w-7 text-blue-600" />
            </div>
            <div className="ml-3 xs:ml-4 min-w-0 flex-1">
              <p className="text-xs xs:text-sm font-medium text-gray-600 truncate">Total Chatbots</p>
              <p className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900">3</p>
              <p className="text-xs xs:text-sm text-green-600 font-medium truncate">+2 this month</p>
            </div>
          </div>
        </div>
        
        {/* Conversations Card */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm p-4 xs:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start xs:items-center">
            <div className="p-2 xs:p-3 bg-gradient-to-r from-green-100 to-emerald-200 rounded-lg xs:rounded-xl shrink-0">
              <MessageSquare className="h-5 w-5 xs:h-6 xs:w-6 lg:h-7 lg:w-7 text-green-600" />
            </div>
            <div className="ml-3 xs:ml-4 min-w-0 flex-1">
              <p className="text-xs xs:text-sm font-medium text-gray-600 truncate">Conversations</p>
              <p className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900">95</p>
              <p className="text-xs xs:text-sm text-green-600 font-medium truncate">+12% vs last week</p>
            </div>
          </div>
        </div>
        
        {/* Open Tickets Card */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm p-4 xs:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start xs:items-center">
            <div className="p-2 xs:p-3 bg-gradient-to-r from-amber-100 to-yellow-200 rounded-lg xs:rounded-xl shrink-0">
              <Ticket className="h-5 w-5 xs:h-6 xs:w-6 lg:h-7 lg:w-7 text-amber-600" />
            </div>
            <div className="ml-3 xs:ml-4 min-w-0 flex-1">
              <p className="text-xs xs:text-sm font-medium text-gray-600 truncate">Open Tickets</p>
              <p className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900">7</p>
              <p className="text-xs xs:text-sm text-red-600 font-medium truncate">+3 since yesterday</p>
            </div>
          </div>
        </div>
        
        {/* Average Accuracy Card */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-sm p-4 xs:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start xs:items-center">
            <div className="p-2 xs:p-3 bg-gradient-to-r from-purple-100 to-indigo-200 rounded-lg xs:rounded-xl shrink-0">
              <TrendingUp className="h-5 w-5 xs:h-6 xs:w-6 lg:h-7 lg:w-7 text-purple-600" />
            </div>
            <div className="ml-3 xs:ml-4 min-w-0 flex-1">
              <p className="text-xs xs:text-sm font-medium text-gray-600 truncate">Avg. Accuracy</p>
              <p className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900">93%</p>
              <p className="text-xs xs:text-sm text-green-600 font-medium truncate">+2% improvement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbots Overview */}
      <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 xs:p-6 border-b border-gray-100">
          <div className="flex flex-col space-y-2 xs:space-y-0 xs:flex-row xs:items-center xs:justify-between">
            <h2 className="text-lg xs:text-xl lg:text-2xl font-semibold text-gray-900">
              Chatbots Overview
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm xs:text-base self-start xs:self-auto">
              View All
            </button>
          </div>
        </div>
        
        <div className="p-4 xs:p-6">
          <div className="space-y-3 xs:space-y-4">
            {mockChatbots.map((bot) => (
              <div 
                key={bot.id} 
                className="flex flex-col space-y-3 xs:space-y-0 xs:flex-row xs:items-center xs:justify-between p-4 xs:p-5 border border-gray-100 rounded-lg xs:rounded-xl hover:shadow-sm transition-shadow duration-200 bg-gray-50"
              >
                {/* Bot Info Section */}
                <div className="flex items-center space-x-3 xs:space-x-4 min-w-0 flex-1">
                  <div className="p-2 xs:p-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-lg xs:rounded-xl shrink-0">
                    <Bot className="h-5 w-5 xs:h-6 xs:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-base xs:text-lg truncate">
                      {bot.name}
                    </h3>
                    <p className="text-xs xs:text-sm text-gray-500 truncate">
                      {bot.conversations} conversations this month
                    </p>
                  </div>
                </div>
                
                {/* Stats and Actions Section */}
                <div className="flex items-center justify-between xs:justify-end xs:space-x-4 lg:space-x-6">
                  <div className="flex items-center space-x-3 xs:space-x-0 xs:block xs:text-right">
                    <div>
                      <p className="text-sm xs:text-base font-semibold text-gray-900">
                        {bot.accuracy}% accuracy
                      </p>
                    </div>
                    <div className={`inline-flex px-2 xs:px-3 py-1 text-xs font-medium rounded-full mt-0 xs:mt-1 ${
                      bot.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bot.status}
                    </div>
                  </div>
                  
                  {/* More Actions Button */}
                  <button className="p-2 hover:bg-white rounded-lg transition-colors duration-200 shrink-0">
                    <MoreHorizontal size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
