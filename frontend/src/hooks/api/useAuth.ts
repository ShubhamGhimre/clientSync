'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api, { setSubdomain, setAuthToken } from '@/lib/axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { setCookie } from 'cookies-next/client';

// Backend response structure
interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    organization: {
      id: string;
      companyName: string;
      subdomain: string;
    };
  };
}

export const useLogin = () => {
  const { setAuth, setLoading } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest & { remember?: boolean }): Promise<BackendAuthResponse> => {
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      return response.data; // This is the full backend response
    },
    onSuccess: async (backendResponse, variables) => {

      try {
        // Extract data from the nested structure
        const { token, user: backendUser, organization } = backendResponse.data;

        // set the authToken to the cookies
        
        // Step 1: Store the token immediately
        setAuthToken(token, variables.remember);

        // Step 2: Transform backend user data to frontend format
        const transformedUser: User = {
          id: backendUser.id,
          name: `${backendUser.firstName} ${backendUser.lastName}`,
          email: backendUser.email,
          role: 'user', // Default role, will be updated by /me endpoint
          organizationId: organization.id,
          organization: {
            id: organization.id,
            name: organization.companyName,
            subdomain: organization.subdomain,
          },
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
        };


        // Step 3: Store complete user data in auth store
        setAuth(transformedUser, token, variables.remember);

        // Step 4: Set subdomain if available
        if (organization?.subdomain) {
          setSubdomain(organization.subdomain);
        }

        // Step 5: Try to fetch more complete user data from /me endpoint
        try {
          setLoading(true);
          const userResponse = await api.get('/api/auth/me');
          const completeUserData = userResponse.data;


          // Update with complete data if available
          setAuth(completeUserData, token, variables.remember);

          // Invalidate and refetch the me query
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } catch (meError) {
          console.warn('⚠️ Failed to fetch complete user data, using login data:', meError);
          // Continue with the data we have from login
        }

        toast.success(backendResponse.message || 'Welcome back!');

        // Step 6: Redirect to dashboard
        router.push('/dashboard');

      } catch (error) {
        console.error('❌ Error processing login data:', error);
        toast.error('Login successful but failed to process user data');
      } finally {
        setLoading(false);
      }
    },
    onError: (error: any) => {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const { setAuth, setLoading } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<BackendAuthResponse> => {
      const response = await api.post('/api/auth/register', data);
      return response.data;
    },
    onSuccess: async (backendResponse) => {

      try {
        // Extract data from the nested structure
        const { token, user: backendUser, organization } = backendResponse.data;

        // Step 1: Store the token immediately
        setAuthToken(token, false);

        // Step 2: Transform backend user data to frontend format
        const transformedUser: User = {
          id: backendUser.id,
          name: `${backendUser.firstName} ${backendUser.lastName}`,
          email: backendUser.email,
          role: 'user', // Default role
          organizationId: organization.id,
          organization: {
            id: organization.id,
            name: organization.companyName,
            subdomain: organization.subdomain,
          },
          firstName: backendResponse.data.user.firstName || '',
          lastName: backendResponse.data.user.lastName ||  ''
        };


        // Step 3: Store complete user data in auth store
        setAuth(transformedUser, token, false);

        // Step 4: Set subdomain if available
        if (organization?.subdomain) {
          setSubdomain(organization.subdomain);
        }

        // Step 5: Try to fetch more complete user data from /me endpoint
        try {
          setLoading(true);
          const userResponse = await api.get('/api/auth/me');
          const completeUserData = userResponse.data;

          setAuth(completeUserData, token, false);
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } catch (meError) {
          console.warn('⚠️ Failed to fetch complete user data, using registration data:', meError);
        }

        toast.success(backendResponse.message || 'Account created successfully!');

        router.push('/auth/login');

      } catch (error) {
        console.error('❌ Error processing registration data:', error);
        toast.error('Registration successful but failed to process user data');
      } finally {
        setLoading(false);
      }
    },
    onError: (error: any) => {
      console.error('❌ Registration error:', error);
      toast.error(error.message || 'Registration failed');
    },
  });
};

export const useMe = () => {
  const { logout, isAuthenticated } = useAuthStore();

  return useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User> => {
      const response = await api.get('/api/auth/me');
      return response.data;
    },
    enabled: isAuthenticated, // Only run if user is authenticated
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    
  });
};



export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Just a placeholder (no API call)
      return new Promise<void>((resolve) => {
        // Clear local/session storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        resolve();
      });
    },
    onSuccess: () => {
      queryClient.clear();
      logout(); // clear auth state from store
      toast.success('Logged out successfully');
    },
  });
};


export const useCheckSubdomain = () => {
  return useMutation({
    mutationFn: async (subdomain: string): Promise<{ available: boolean }> => {
      
      try {
        const { default: axios } = await import('axios');
        const baseApi = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        });

        const response = await baseApi.get('/api/auth/check-subdomain', {
          params: { subdomain },
        });
        
        
        // Handle the nested response structure
        if (response.data.success && response.data.data) {
          return response.data.data; // Return the nested data object
        } else {
          console.error('❌ Unexpected response structure:', response.data);
          throw new Error('Unexpected response structure');
        }
        
      } catch (error) {
        console.error('❌ Subdomain check error:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('❌ useCheckSubdomain error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useCheckSubdomain success - Final data:', data);
    }
  });
};