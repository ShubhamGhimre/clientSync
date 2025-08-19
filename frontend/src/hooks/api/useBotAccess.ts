import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

// Types
export interface BotAccess {
  id: string;
  userId: string;
  chatBotId: string;
  isBlocked: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  chatBot: {
    id: string;
    name: string;
  };
}

export interface GrantBotAccessRequest {
  userId: string;
  chatBotId: string;
  isBlocked?: boolean;
}

export interface UpdateBotAccessRequest {
  isBlocked: boolean;
}

// GET /api/bot-access
export const useBotAccessList = (params?: { chatBotId?: string; userId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['bot-access', params],
    queryFn: async (): Promise<BotAccess[]> => {
      const response = await api.get<ApiResponse<BotAccess[]>>('/api/bot-access', { params });
      return response.data.data!;
    },
  });
};

// POST /api/bot-access
export const useGrantBotAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GrantBotAccessRequest): Promise<BotAccess> => {
      const response = await api.post<ApiResponse<BotAccess>>('/api/bot-access', data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to grant bot access:', error);
    },
  });
};

// PUT /api/bot-access/{id}
export const useUpdateBotAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBotAccessRequest }): Promise<BotAccess> => {
      const response = await api.put<ApiResponse<BotAccess>>(`/api/bot-access/${id}`, data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
      queryClient.setQueryData(['bot-access', data.id], data);
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update bot access:', error);
    },
  });
};

// DELETE /api/bot-access/{id}
export const useDeleteBotAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/bot-access/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to delete bot access:', error);
    },
  });
};