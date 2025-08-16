import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { ApiResponse, CreateChatBotRequest, ChatBot } from '@/types/api';

// ChatBot queries
export const useChatBots = () => {
  return useQuery({
    queryKey: ['chatbots'],
    queryFn: async (): Promise<ChatBot[]> => {
      const response = await api.get<ApiResponse<ChatBot[]>>('/api/chatbots');
      return response.data.data!;
    },
  });
};

export const useChatBot = (id: string) => {
  return useQuery({
    queryKey: ['chatbots', id],
    queryFn: async (): Promise<ChatBot> => {
      const response = await api.get<ApiResponse<ChatBot>>(`/api/chatbots/${id}`);
      return response.data.data!;
    },
    enabled: !!id,
  });
};

// ChatBot mutations
export const useCreateChatBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChatBotRequest): Promise<ChatBot> => {
      const response = await api.post<ApiResponse<ChatBot>>('/api/chatbots', data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to create chatbot:', error);
    },
  });
};

export const useUpdateChatBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateChatBotRequest> }): Promise<ChatBot> => {
      const response = await api.put<ApiResponse<ChatBot>>(`/api/chatbots/${id}`, data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.setQueryData(['chatbots', data.id], data);
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update chatbot:', error);
    },
  });
};

export const useDeleteChatBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/chatbots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to delete chatbot:', error);
    },
  });
};