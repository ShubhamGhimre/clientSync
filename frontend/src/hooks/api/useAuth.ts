import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { setAuthData, clearAuthData, isAuthenticated } from '@/lib/auth';
import type { ApiResponse, LoginRequest, RegisterRequest } from '@/types/api';
import type { AuthData } from '@/lib/auth';

// Auth queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<AuthData> => {
      const response = await api.get<ApiResponse<AuthData>>('/api/auth/me');
      return response.data.data!;
    },
    enabled: isAuthenticated(),
    retry: false,
  });
};

// Auth mutations
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthData> => {
      const response = await api.post<ApiResponse<AuthData>>('/api/auth/login', data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      setAuthData(data);
      queryClient.setQueryData(['auth', 'me'], data);
    },
    onError: (error: AxiosError) => {
      console.error('Login failed:', error);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthData> => {
      const response = await api.post<ApiResponse<AuthData>>('/api/auth/register', data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      setAuthData(data);
      queryClient.setQueryData(['auth', 'me'], data);
    },
    onError: (error: AxiosError) => {
      console.error('Registration failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Optional: Call logout endpoint
      // await api.post('/api/auth/logout');
    },
    onSuccess: () => {
      clearAuthData();
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (): Promise<{ token: string }> => {
      const response = await api.post<ApiResponse<{ token: string }>>('/api/auth/refresh');
      return response.data.data!;
    },
    onSuccess: (data) => {
      setAuthData({ ...data } as AuthData);
    },
  });
};