'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getAuthToken } from '@/lib/axios';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = getAuthToken();
    
    console.log('🔍 Auth layout check:', { hasToken: !!token, isAuthenticated });
    
    // Only redirect if we have both token AND authenticated state
    if (token && isAuthenticated) {
      console.log('🔄 User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}