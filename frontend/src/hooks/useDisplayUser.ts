import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { extractDisplayUser } from '@/lib/display-utils';
import { DisplayUser } from '@/types/display';

export function useDisplayUser() {
  const { user, isAuthenticated } = useAuthStore();

  const displayUser: DisplayUser | null = useMemo(() => {
    if (!user || !isAuthenticated) return null;
    
    const extracted = extractDisplayUser(user);
    
    return extracted;
  }, [user, isAuthenticated]);

  return {
    displayUser,
    isAuthenticated,
    isLoading: !displayUser && isAuthenticated
  };
}