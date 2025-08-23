'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  GraduationCap,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bot
} from 'lucide-react';
import { useLogout } from '@/hooks/api/useAuth';
import { useAuthContext } from '@/context/AuthContext'; // <-- import context

// ClientSync Logo Component with SVG
const ClientSyncLogo = ({ collapsed = false }) => {
  return (
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
      <div className="relative">
        {/* Modern Logo SVG */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.2)"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>
      {!collapsed && (
        <div className="transition-opacity duration-200">
          <h1 className="text-lg font-bold text-gray-900">ClientSync</h1>
          <p className="text-xs text-gray-500 font-medium">AI Support Platform</p>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const logout = useLogout();
  const { user, organization } = useAuthContext(); // <-- get user/org

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { id: 'chats', icon: MessageSquare, label: 'Live Chats', href: '/chats' },
    { id: 'botlist', icon: Bot, label: 'Chat Bots', href: '/botlist' },
    { id: 'tickets', icon: Ticket, label: 'Support Tickets', href: '/tickets' },
    { id: 'training', icon: GraduationCap, label: 'AI Training', href: '/training' },
    { id: 'user', icon: User, label: 'User Management', href: '/users' },
    { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' }
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white shadow-xl border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out relative`}>
      {/* Header */}
      <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <ClientSyncLogo collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ml-auto"
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-gray-600" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-2 px-2 flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 text-sm rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={`${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {collapsed && isActive && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <User size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
              <p className="text-xs text-blue-500 truncate font-medium">
                {organization?.companyName || ''}
              </p>
            </div>
          )}
        </div>
        {collapsed && (
          <div className="absolute left-full bottom-4 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            <div>{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>
            <div className="text-gray-300">{user?.email || ''}</div>
            <div className="text-blue-400">{organization?.companyName || ''}</div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className={`w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-all duration-200
            ${logout.isPending 
              ? 'bg-red-400 text-white cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          aria-label="Logout"
        >
          {/* Show icon only on mobile, icon+text on md+ */}
          <span className="block md:hidden">
            <LogOut size={20} />
          </span>
          <span className="hidden md:flex items-center gap-2">
            <LogOut size={18} />
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
