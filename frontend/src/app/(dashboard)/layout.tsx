'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Menu, X, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useMe } from '@/hooks/api/useAuth';
import { getAuthToken } from '@/lib/axios';
import Sidebar from '@/components/Layout/Sidebar';

function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div className="flex flex-col items-center gap-3" role="status">
        <Loader2 className="size-6 shrink-0 animate-spin text-brand-strong" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuthStore();
  const { data: userData, isLoading: meLoading, error } = useMe();

  useEffect(() => {
    const token = getAuthToken();
    // No token: send to login
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    // 401 from /me: clear the session
    if (
      error &&
      typeof (error as { status?: number }).status === 'number' &&
      (error as { status?: number }).status === 401
    ) {
      logout();
    }
  }, [error, router, logout]);

  // Close the mobile drawer when the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close the mobile drawer with Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  if (authLoading || meLoading) {
    return <FullPageLoader label="Loading dashboard…" />;
  }

  if (isAuthenticated && (user || userData)) {
    return (
      <div className="flex h-dvh">
        {/* Desktop sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0">
              <Sidebar />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Mobile top bar */}
          <div className="app-topbar">
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X /> : <Menu />}
            </button>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-strong text-on-brand">
              <Zap className="size-3.5 shrink-0" />
            </span>
            <span className="text-sm font-semibold">ClientSync</span>
          </div>

          {children}
        </main>
      </div>
    );
  }

  return <FullPageLoader label="Loading…" />;
}