'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Bot, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Building,
  PlusCircle,
  Zap,
  LogOut,
  User,
  Crown,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Shield,
  Activity,
  ChevronDown,
  Eye,
  Headphones
} from 'lucide-react';
import { useLogout } from '@/hooks/api/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { useDisplayUser } from '@/hooks/useDisplayUser';
import { 
  getUserInitials, 
  formatRole, 
  getPlan, 
  getRoleColor
} from '@/lib/display-utils';

interface SidebarProps {
  className?: string;
}

// Navigation items with role-based access control
const getNavigationItems = (userRole: string) => {
  const allItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview & analytics',
      roles: ['ADMIN', 'AGENT', 'VIEWER']
    },
    {
      name: 'Chatbots',
      href: '/chatbots',
      icon: Bot,
      description: 'Manage AI assistants',
      badge: '4',
      roles: ['ADMIN', 'AGENT']
    },
    // {
    //   name: 'Conversations',
    //   href: '/chats',
    //   icon: MessageSquare,
    //   description: 'Chat history & logs',
    //   badge: '12',
    //   roles: ['ADMIN', 'AGENT', 'VIEWER']
    // },
    // {
    //   name: 'Knowledge Base',
    //   href: '/training',
    //   icon: FileText,
    //   description: 'Training documents',
    //   roles: ['ADMIN', 'AGENT']
    // },
    {
      name: 'Team',
      href: '/users',
      icon: Users,
      description: 'User management',
      roles: ['ADMIN']
    },
    // {
    //   name: 'Organizations',
    //   href: '/organizations',
    //   icon: Building,
    //   description: 'Client management',
    //   roles: ['ADMIN']
    // },
    {
      name: 'Support',
      href: '/tickets',
      icon: HelpCircle,
      description: 'Help & tickets',
      badge: '3',
      roles: ['ADMIN', 'AGENT', 'VIEWER']
    },
  ];

  return allItems.filter(item => item.roles.includes(userRole));
};

const getQuickActions = (userRole: string) => {
  const allActions = [
    {
      name: 'New Chatbot',
      href: '/chatbots/create',
      icon: PlusCircle,
      color: 'text-blue-600',
      roles: ['ADMIN', 'AGENT']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      color: 'text-green-600',
      roles: ['ADMIN', 'AGENT', 'VIEWER']
    },
    {
      name: 'Activity',
      href: '/activity',
      icon: Activity,
      color: 'text-purple-600',
      roles: ['ADMIN', 'AGENT']
    },
  ];

  return allActions.filter(action => action.roles.includes(userRole));
};

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const logout = useLogout();
  
  // Use the new display hook - this won't affect your login logic
  const { displayUser, isAuthenticated, isLoading } = useDisplayUser();
  const { initialize } = useAuthStore();


  // Initialize auth store on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout.mutate();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Implement theme toggle logic
  };

  // Show loading state if not authenticated or no user data
  if (!isAuthenticated || isLoading || !displayUser) {
    return (
      <div className={cn(
        "flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r border-border/50 sidebar-transition shadow-lg",
        collapsed ? "w-20" : "w-72",
        className
      )}>
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const userName = displayUser.name;
  const userInitials = getUserInitials(userName);
  const userRole = formatRole(displayUser.role);
  const userPlan = getPlan(displayUser.role);
  const navigation = getNavigationItems(displayUser.role);
  const quickActions = getQuickActions(displayUser.role);

  // Get role-specific icon
  const getRoleIconComponent = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-3 w-3 mr-1.5" />;
      case 'AGENT':
        return <Headphones className="h-3 w-3 mr-1.5" />;
      case 'VIEWER':
        return <Eye className="h-3 w-3 mr-1.5" />;
      default:
        return <User className="h-3 w-3 mr-1.5" />;
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r border-border/50 sidebar-transition shadow-sm",
      collapsed ? "w-20" : "w-72",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 min-h-[72px]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background"></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                {displayUser.organization?.name || 'ClientSync'}
              </div>
              <div className="text-xs text-muted-foreground">AI Platform</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hover:bg-accent/50 rounded-md transition-all duration-200 flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* User Role Badge */}
          {!collapsed && (
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-3 border border-blue-100/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs font-medium", getRoleColor(displayUser.role))}>
                  {getRoleIconComponent(displayUser.role)}
                  {userRole}
                </Badge>
                <Badge className="h-5 text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none font-medium">
                  {userPlan}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Access Level: {displayUser.role}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Navigation
                </p>
              </div>
            )}
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200 group relative",
                      collapsed ? "justify-center px-2" : "px-3",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50 shadow-sm" 
                        : "hover:bg-accent/50 hover:translate-x-0.5"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 flex-shrink-0",
                      isActive 
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md" 
                        : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {!collapsed && (
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="h-4 text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 ml-2 flex-shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                    {isActive && !collapsed && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-full"></div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="flex items-center gap-2 mb-3 px-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Actions
                  </p>
                </div>
              )}
              {quickActions.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 rounded-lg transition-all duration-200 group",
                        collapsed ? "justify-center px-2" : "px-3",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/50 hover:translate-x-0.5"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 flex-shrink-0",
                        item.color
                      )}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {!collapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Settings Section */}
          <div className="pt-3 border-t border-border/50">
            <Link href="/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-9 rounded-lg transition-all duration-200 group",
                  collapsed ? "justify-center px-2" : "px-3",
                  pathname === '/settings' 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 hover:translate-x-0.5"
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-md text-gray-600 flex-shrink-0">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                {!collapsed && <span className="font-medium text-sm">Settings</span>}
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="p-3 border-t border-border/50 bg-accent/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-lg hover:bg-accent/50 transition-all duration-200 group p-2",
                collapsed && "justify-center px-2"
              )}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background"></div>
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm truncate">
                        {userName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("h-4 text-xs font-medium px-1.5", getRoleColor(displayUser.role))}>
                        {getRoleIconComponent(displayUser.role)}
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 p-2 shadow-xl border-border/50"
            side={collapsed ? "right" : "top"}
          >
            <DropdownMenuLabel className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{userName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userRole} • {userPlan} Plan
                  </div>
                  {displayUser.organization && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {displayUser.organization.name}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {displayUser.email}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuItem className="p-3 rounded-lg cursor-pointer">
              <User className="mr-3 h-4 w-4 text-blue-600" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            
            {displayUser.role === 'ADMIN' && (
              <DropdownMenuItem className="p-3 rounded-lg cursor-pointer">
                <CreditCard className="mr-3 h-4 w-4 text-green-600" />
                <span>Billing & Plan</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem className="p-3 rounded-lg cursor-pointer">
              <Bell className="mr-3 h-4 w-4 text-orange-600" />
              <span>Notifications</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-lg cursor-pointer" onClick={toggleTheme}>
              {isDarkMode ? (
                <Sun className="mr-3 h-4 w-4 text-yellow-600" />
              ) : (
                <Moon className="mr-3 h-4 w-4 text-purple-600" />
              )}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-lg cursor-pointer">
              <Shield className="mr-3 h-4 w-4 text-indigo-600" />
              <span>Privacy & Security</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-2" />
            
            <DropdownMenuItem 
              className="p-3 rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground truncate">
              {displayUser.organization?.name || 'ClientSync'} AI Platform
            </div>
            <div className="text-xs font-medium text-green-600">
              v2.1.0 • All systems operational
            </div>
          </div>
        </div>
      )}
    </div>
  );
}