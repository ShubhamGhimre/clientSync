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
    <div className="shell-loader">
      <div className="shell-loader-inner" role="status">
        <Loader2 className="ico-xl spin t-brand" />
        <p className="shell-loader-text">{label}</p>
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
      <div className="shell-row">
        {/* Desktop sidebar */}
        <Sidebar className="show-lg-row" />

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="shell-mobile-overlay">
            <button
              type="button"
              className="shell-mobile-scrim"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            />
            <div className="shell-mobile-drawer">
              <Sidebar />
            </div>
          </div>
        )}

        <main className="shell-main">
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
            <span className="shell-logo-tile">
              <Zap className="ico-sm" />
            </span>
            <span className="t-sm t-semibold">ClientSync</span>
          </div>

          {children}
        </main>
      </div>
    );
  }

  return <FullPageLoader label="Loading…" />;
}