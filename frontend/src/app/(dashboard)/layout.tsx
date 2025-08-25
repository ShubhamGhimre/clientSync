'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useMe } from '@/hooks/api/useAuth';
import { getAuthToken } from '@/lib/axios';
import Sidebar from '@/components/Layout/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuthStore();
  const { data: userData, isLoading: meLoading, error } = useMe();

  useEffect(() => {
    const token = getAuthToken();
 
    
    // If no token, redirect to login
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    
    // If there's a 401 error, logout and redirect
    if (
      error &&
      typeof (error as any).status === 'number' &&
      (error as any).status === 401
    ) {
      logout();
      return;
    }
  }, [error, router, logout, isAuthenticated, user, meLoading]);

  // Show loading while checking authentication or fetching user data
  if (authLoading || meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If we have authentication but still waiting for user data, show dashboard
  if (isAuthenticated && (user || userData)) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}