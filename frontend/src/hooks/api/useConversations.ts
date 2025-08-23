import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface Conversation {
  id: string;
  chatRoomId: string;
  sender: string;
  userId: string;
  message: string;
  createdAt: string;
}

// GET /api/conversations
export const useConversations = (params?: { chatRoomId?: string }) =>
  useQuery({
    queryKey: ['conversations', params],
    queryFn: async (): Promise<Conversation[]> => {
      const res = await api.get<ApiResponse<Conversation[]>>('/api/conversations', { params });
      return res.data.data!;
    },
    enabled: !!params?.chatRoomId,
  });

// POST /api/conversations
export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { chatRoomId: string; message: string, sender: string }) => {
      const res = await api.post<ApiResponse<Conversation>>('/api/conversations', data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

// DELETE /api/conversations/{id}
export const useDeleteConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/conversations/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
};