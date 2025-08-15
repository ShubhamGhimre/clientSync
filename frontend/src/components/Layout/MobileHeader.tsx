'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  MessageSquare,
  Ticket,
  GraduationCap,
  Settings,
  User
} from 'lucide-react';

const MobileHeader = () => {
  const pathname = usePathname();

  // Get current page info
  const getPageInfo = () => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' };
      case '/chats':
        return { title: 'Live Chats', icon: MessageSquare, color: 'text-green-600' };
      case '/tickets':
        return { title: 'Support Tickets', icon: Ticket, color: 'text-amber-600' };
      case '/training':
        return { title: 'AI Training', icon: GraduationCap, color: 'text-purple-600' };
      case '/settings':
        return { title: 'Settings', icon: Settings, color: 'text-gray-600' };
      default:
        return { title: 'ClientSync', icon: LayoutDashboard, color: 'text-blue-600' };
    }
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"></div>
      
      {/* Header content */}
      <div className="relative px-4 py-3 safe-area-pt">
        <div className="flex items-center justify-between">
          {/* Left side - Page title */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              {/* ClientSync Logo */}
              <div className="w-8 h-8 flex-shrink-0">
                <img 
                  src="/logo-small.svg" 
                  alt="ClientSync Logo" 
                  className="w-full h-full"
                />
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <PageIcon size={18} className={`${pageInfo.color} flex-shrink-0`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* Right side - User profile */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;