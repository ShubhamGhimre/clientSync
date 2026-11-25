'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useMe } from '@/hooks/api/useAuth';
import { getAuthToken } from '@/lib/axios';
import { BrandMark, Logo } from '@/components/logo';
import Sidebar from '@/components/Layout/Sidebar';

function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 50% 0%, color-mix(in oklab, var(--brand-strong, currentColor) 10%, transparent), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center gap-3.5" role="status">
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-background shadow-xs">
          <BrandMark size={22} className="text-brand-strong" />
          <Loader2 className="absolute -bottom-1.5 -right-1.5 size-4 animate-spin rounded-full bg-background text-brand-strong" />
        </div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
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
    return <FullPageLoader label="Loading workspace…" />;
  }

  if (isAuthenticated && (user || userData)) {
    return (
      <div className="relative flex h-dvh overflow-hidden bg-background text-foreground">
        {/* Desktop sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/35 backdrop-blur-xs transition-opacity"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0 shadow-xl">
              <Sidebar />
            </div>
          </div>
        )}

        <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto bg-muted/20">
          {/* Subtle ambient corner BrandMark */}
          <BrandMark
            size={360}
            className="pointer-events-none fixed -bottom-24 -right-20 z-0 text-foreground opacity-[0.025]"
            aria-hidden="true"
          />

          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background text-foreground shadow-2xs transition-colors hover:bg-muted/50"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <Menu className="size-4" />
              </button>
              <Logo />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <BrandMark size={12} className="text-brand-strong" />
              Workspace
            </span>
          </header>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return <FullPageLoader label="Loading…" />;
}