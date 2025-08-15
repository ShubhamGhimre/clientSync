'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  MessageSquare,
  Ticket,
  GraduationCap,
  Settings
} from 'lucide-react';

const MobileNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard',
      color: 'text-blue-600'
    },
    { 
      id: 'chats', 
      icon: MessageSquare, 
      label: 'Chats', 
      href: '/chats',
      color: 'text-green-600'
    },
    { 
      id: 'tickets', 
      icon: Ticket, 
      label: 'Tickets', 
      href: '/tickets',
      color: 'text-amber-600'
    },
    { 
      id: 'training', 
      icon: GraduationCap, 
      label: 'Training', 
      href: '/training',
      color: 'text-purple-600'
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Settings', 
      href: '/settings',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg"></div>
      
      {/* Navigation content */}
      <div className="relative px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 scale-105' 
                    : 'hover:bg-gray-50 active:scale-95'
                }`}
              >
                <div className={`relative ${isActive ? 'transform -translate-y-0.5' : ''} transition-transform duration-200`}>
                  <item.icon 
                    size={20} 
                    className={`${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-500'
                    } transition-colors duration-200`}
                  />
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className={`text-xs font-medium mt-1 truncate max-w-full ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                } transition-colors duration-200`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;