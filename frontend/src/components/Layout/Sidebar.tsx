'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Home,
  Bot,
  BarChart3,
  Activity,
  Users,
  HelpCircle,
  Settings,
  PlusCircle,
  Zap,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  CreditCard,
  Bell,
  Moon,
  Sun,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/api/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { useDisplayUser } from '@/hooks/useDisplayUser';
import { getUserInitials, formatRole } from '@/lib/display-utils';

interface SidebarProps {
  className?: string;
}

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
};

const ALL_ROLES = ['ADMIN', 'AGENT', 'VIEWER'];

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ALL_ROLES },
  { name: 'Chatbots', href: '/chatbots', icon: Bot, roles: ['ADMIN', 'AGENT'] },
  // Enable these when the routes are ready (import the icons too):
  // { name: 'Conversations', href: '/chats', icon: MessageSquare, roles: ALL_ROLES },
  // { name: 'Knowledge base', href: '/training', icon: FileText, roles: ['ADMIN', 'AGENT'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ALL_ROLES },
  { name: 'Activity', href: '/activity', icon: Activity, roles: ['ADMIN', 'AGENT'] },
  { name: 'Team', href: '/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Support', href: '/tickets', icon: HelpCircle, roles: ALL_ROLES },
];

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogout();

  const { displayUser, isAuthenticated, isLoading } = useDisplayUser();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const shell = cn(
    'sidebar-shell',
    collapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
    className
  );

  if (!isAuthenticated || isLoading || !displayUser) {
    return (
      <aside className={shell} aria-busy="true" aria-label="Loading navigation">
        <div className="sidebar-loading">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line space-t-4" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      </aside>
    );
  }

  const role = displayUser.role;
  const userName = displayUser.name;
  const orgName = displayUser.organization?.name || 'ClientSync';
  const navigation = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const canCreateBot = role === 'ADMIN' || role === 'AGENT';

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const navClass = (href: string) =>
    cn('nav-item', collapsed && 'center', isActive(href) && 'is-active');

  return (
    <aside className={shell} aria-label="Main navigation">
      {/* Header */}
      <div className={cn('sidebar-head', collapsed && 'center')}>
        {!collapsed && (
          <>
            <span className="sidebar-logo">
              <Zap className="ico" />
            </span>
            <span className="sidebar-org">{orgName}</span>
          </>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm no-shrink"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {canCreateBot && (
          <Link
            href="/chatbots/create"
            className={cn('btn btn-brand btn-sm space-b-3 full-w', collapsed && 'btn-icon')}
            title={collapsed ? 'New chatbot' : undefined}
            aria-label="New chatbot"
          >
            <PlusCircle />
            {!collapsed && 'New chatbot'}
          </Link>
        )}

        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navClass(item.href)}
            title={collapsed ? item.name : undefined}
            aria-label={collapsed ? item.name : undefined}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <item.icon />
            {!collapsed && <span className="ellipsis">{item.name}</span>}
          </Link>
        ))}

        <div className="sidebar-spacer">
          <button
            type="button"
            onClick={toggleTheme}
            className={cn('nav-item full-w', collapsed && 'center')}
            title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted && isDark ? <Sun /> : <Moon />}
            {!collapsed && <span>{mounted && isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <Link
            href="/settings"
            className={navClass('/settings')}
            title={collapsed ? 'Settings' : undefined}
            aria-label={collapsed ? 'Settings' : undefined}
            aria-current={isActive('/settings') ? 'page' : undefined}
          >
            <Settings />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Account */}
      <div className="sidebar-account">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn('sidebar-account-btn', collapsed && 'center')}
              aria-label="Account menu"
            >
              <span className="avatar avatar-sm">{getUserInitials(userName)}</span>
              {!collapsed && (
                <>
                  <span className="flex-fill">
                    <span className="sidebar-account-name">{userName}</span>
                    <span className="sidebar-account-role">{formatRole(role)}</span>
                  </span>
                  <ChevronsUpDown className="sidebar-chevron" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side={collapsed ? 'right' : 'top'} className="sidebar-menu">
            <DropdownMenuLabel>
              <span className="sidebar-account-name">{userName}</span>
              <span className="sidebar-account-role">{displayUser.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User /> Profile settings
            </DropdownMenuItem>
            {role === 'ADMIN' && (
              <DropdownMenuItem>
                <CreditCard /> Billing and plan
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Bell /> Notifications
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
