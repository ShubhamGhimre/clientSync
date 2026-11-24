'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getAuthToken } from '@/lib/axios';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = getAuthToken();
    
    
    // Only redirect if we have both token AND authenticated state
    if (token && isAuthenticated) {
      console.log('🔄 User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="screen-h">
      <ThemeToggle />
      {children}
    </div>
  );
}