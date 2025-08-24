import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Get bot access permissions
export function useBotAccess(options?: any) {
  return useQuery({
    queryKey: ['bot-access'],
    queryFn: async () => {
      const { data } = await axios.get('/api/bot-access');
      return data;
    },
    ...options,
  });
}

// Grant bot access to user
export function useGrantBotAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; chatBotId: string }) => {
      const { data } = await axios.post('/api/bot-access', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
    },
  });
}

// Update bot access permission
export function useUpdateBotAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; isBlocked?: boolean }) => {
      const { data } = await axios.put(`/api/bot-access/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
    },
  });
}

// Remove bot access
export function useDeleteBotAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/bot-access/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-access'] });
    },
  });
}
