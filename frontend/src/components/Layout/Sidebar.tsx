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
import { BrandMark, Logo } from '@/components/logo';
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
    'relative flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
    collapsed ? 'w-[68px]' : 'w-64',
    className
  );

  if (!isAuthenticated || isLoading || !displayUser) {
    return (
      <aside className={shell} aria-busy="true" aria-label="Loading navigation">
        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </aside>
    );
  }

  const role = displayUser.role;
  const userName = displayUser.name;
  const navigation = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const canCreateBot = role === 'ADMIN' || role === 'AGENT';

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const navClass = (href: string) => {
    const active = isActive(href);
    return cn(
      'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors',
      collapsed && 'justify-center px-0',
      active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-xs ring-1 ring-sidebar-border'
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
    );
  };

  return (
    <aside className={shell} aria-label="Main navigation">
      {/* Subtle top brand tint */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Ambient BrandMark watermark */}
      <BrandMark
        size={210}
        className="pointer-events-none absolute -bottom-16 -left-14 text-foreground opacity-[0.035]"
        aria-hidden="true"
      />

      {/* Header */}
      <div
        className={cn(
          'relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (
          <div className="group relative flex items-center justify-center">
            <span className="flex size-8 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-xs">
              <BrandMark size={16} />
            </span>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-card text-foreground opacity-0 shadow-xs transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-xs">
                <BrandMark size={16} />
              </span>
              <Logo />
            </div>
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
        {canCreateBot && (
          <Link
            href="/chatbots/create"
            className={cn(
              'mb-2.5 flex h-9 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90',
              collapsed ? 'w-full px-0' : 'w-full px-3'
            )}
            title={collapsed ? 'New chatbot' : undefined}
            aria-label="New chatbot"
          >
            <PlusCircle className="size-4 shrink-0" />
            {!collapsed && <span>New chatbot</span>}
          </Link>
        )}

        {!collapsed && (
          <div className="mb-1 flex items-center justify-between px-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </span>
            <BrandMark size={11} className="text-muted-foreground" />
          </div>
        )}

        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navClass(item.href)}
              title={collapsed ? item.name : undefined}
              aria-label={collapsed ? item.name : undefined}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {active && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Bottom Utility Links */}
        <div className="mt-auto space-y-1 border-t border-sidebar-border pt-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted && isDark ? (
              <Sun className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <Moon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            )}
            {!collapsed && (
              <span>{mounted && isDark ? 'Light mode' : 'Dark mode'}</span>
            )}
          </button>

          <Link
            href="/settings"
            className={navClass('/settings')}
            title={collapsed ? 'Settings' : undefined}
            aria-label={collapsed ? 'Settings' : undefined}
            aria-current={isActive('/settings') ? 'page' : undefined}
          >
            <Settings
              className={cn(
                'size-4 shrink-0 transition-colors',
                isActive('/settings')
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
            {!collapsed && <span className="flex-1 truncate">Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Account Footer */}
      <div className="relative z-10 shrink-0 border-t border-sidebar-border bg-muted/30 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-card hover:shadow-xs',
                collapsed && 'justify-center p-1.5'
              )}
              aria-label="Account menu"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-xs font-semibold text-foreground shadow-xs">
                {getUserInitials(userName)}
              </span>

              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
                      {userName}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {formatRole(role)}
                    </span>
                  </span>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side={collapsed ? 'right' : 'top'}
            className="w-60 rounded-xl border-border bg-popover text-popover-foreground shadow-soft"
          >
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-semibold leading-tight">
                {userName}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {displayUser.email}
              </span>
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
            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout.mutate()}
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}