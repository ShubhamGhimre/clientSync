import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { extractDisplayUser } from '@/lib/display-utils';
import { DisplayUser } from '@/types/display';

export function useDisplayUser() {
  const { user, isAuthenticated } = useAuthStore();

  const displayUser: DisplayUser | null = useMemo(() => {
    if (!user || !isAuthenticated) return null;
    
    console.log('🎭 Extracting display user from raw data:', user);
    const extracted = extractDisplayUser(user);
    console.log('✨ Extracted display user:', extracted);
    
    return extracted;
  }, [user, isAuthenticated]);

  return {
    displayUser,
    isAuthenticated,
    isLoading: !displayUser && isAuthenticated
  };
}