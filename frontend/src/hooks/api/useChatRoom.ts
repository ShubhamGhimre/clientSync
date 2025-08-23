import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { ApiResponse, ChatBot } from '@/types/api';

// ChatRoom Types
export interface CreateChatRoomRequest {
  title: string;
  description?: string;
  chatBotId: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  chatBotId: string;
  chatBot?: ChatBot;
  _count?: {
    messages: number;
    participants: number;
  };
}

// ChatRoom queries
export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chatrooms'],
    queryFn: async (): Promise<ChatRoom[]> => {
      const response = await api.get<ApiResponse<ChatRoom[]>>('/api/chatrooms');
      return response.data.data!;
    },
  });
};

export const useChatRoom = (id: string) => {
  return useQuery({
    queryKey: ['chatrooms', id],
    queryFn: async (): Promise<ChatRoom> => {
      const response = await api.get<ApiResponse<ChatRoom>>(`/api/chatrooms/${id}`);
      return response.data.data!;
    },
    enabled: !!id,
  });
};

// ChatRoom mutations
export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChatRoomRequest): Promise<ChatRoom> => {
      const response = await api.post<ApiResponse<ChatRoom>>('/api/chatrooms', data);
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to create chatroom:', error);
    },
  });
};

export const useUpdateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateChatRoomRequest> }): Promise<ChatRoom> => {
      const response = await api.put<ApiResponse<ChatRoom>>(`/api/chatrooms/${id}`, data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      queryClient.setQueryData(['chatrooms', data.id], data);
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update chatroom:', error);
    },
  });
};

export const useDeleteChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/chatrooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to delete chatroom:', error);
    },
  });
};