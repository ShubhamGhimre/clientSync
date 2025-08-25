import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/axios';

interface User {

  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    subdomain: string;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      initialize: () => {
        const token = getAuthToken();
        const state = get();

       

        if (token && state.user) {
          set({
            token,
            isAuthenticated: true,
            isInitialized: true,
          });
        } else if (token) {
          // Have token but no user - partial state, will be completed by useMe
          set({
            token,
            isAuthenticated: true,
            isInitialized: true,
          });
        } else {
          set({
            isInitialized: true,
            isAuthenticated: false,
            token: null,
            user: null,
          });
        }
      },

      setAuth: (user, token, remember = false) => {
     

        // Store token in browser storage
        setAuthToken(token, remember);

        // Update zustand state with complete data
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      logout: () => {

        clearAuthToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({
            user: updatedUser,
          });

        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);