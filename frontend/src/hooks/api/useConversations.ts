import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface Conversation {
  id: string;
  sender: string;
  message: string;
  createdAt: Date;
  chatRoomId: string;
  chatRoom?: {
    id: string;
    title: string;
    chatBotId: string;
  };
}

export interface SendMessagePayload {
  chatRoomId: string;
  sender: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> {}
export interface ConversationResponse extends ApiResponse<Conversation> {}

// Conversation Hooks
export function useConversations(
  chatRoomId: string,
  options?: Omit<UseQueryOptions<ConversationsResponse, Error, Conversation[]>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: ['conversations', chatRoomId],
    queryFn: async (): Promise<ConversationsResponse> => {
      const { data } = await axios.get<ConversationsResponse>(`/api/conversations/${chatRoomId}`);
      // Return the full API response
      return {
        ...data,
        data: data.data.map(conversation => ({
          ...conversation,
          createdAt: new Date(conversation.createdAt)
        }))
      };
    },
    select: (response: ConversationsResponse) => response.data,
    ...options,
  });
}

export function useSendMessage(
  options?: UseMutationOptions<Conversation, Error, SendMessagePayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: SendMessagePayload): Promise<Conversation> => {
      const { data } = await axios.post<ConversationResponse>('/api/conversations', payload);
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt)
      };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate conversations for this chat room
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.chatRoomId] });
      
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useClearConversations(
  options?: UseMutationOptions<{ success: boolean; deletedCount: number }, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatRoomId: string): Promise<{ success: boolean; deletedCount: number }> => {
      const { data } = await axios.delete<ApiResponse<{ success: boolean; deletedCount: number }>>(
        `/api/conversations/${chatRoomId}/clear`
      );
      return data.data;
    },
    onSuccess: (data, chatRoomId, context) => {
      // Clear the conversations cache for this chat room
      queryClient.setQueryData(['conversations', chatRoomId], []);
      
      // Or invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['conversations', chatRoomId] });
      
      options?.onSuccess?.(data, chatRoomId, context);
    },
    ...options,
  });
}

export function useOptimisticSendMessage(
  options?: UseMutationOptions<Conversation, Error, SendMessagePayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: SendMessagePayload): Promise<Conversation> => {
      const { data } = await axios.post<ConversationResponse>('/api/conversations', payload);
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt)
      };
    },
    onMutate: async (newMessage: SendMessagePayload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations', newMessage.chatRoomId] });
      
      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(['conversations', newMessage.chatRoomId]);
      
      // Create optimistic message
      const optimisticMessage: Conversation = {
        id: `temp-${Date.now()}`,
        sender: newMessage.sender,
        message: newMessage.message,
        createdAt: new Date(),
        chatRoomId: newMessage.chatRoomId,
      };
      
      // Safely update by checking if currentConversations is an array
      queryClient.setQueryData(
        ['conversations', newMessage.chatRoomId],
        (old: Conversation[] | undefined) => {
          // Ensure we have an array to work with
          const currentConversations = Array.isArray(old) ? old : [];
          return [...currentConversations, optimisticMessage];
        }
      );
      
      // Return context for rollback
      return { previousConversations, optimisticMessage };
    },
    onError: (
      err,
      newMessage,
      context
    ) => {
      // Safely cast context and rollback on error
      const ctx = context as { previousConversations?: Conversation[]; optimisticMessage?: Conversation } | undefined;
      
      if (ctx?.previousConversations !== undefined) {
        queryClient.setQueryData(['conversations', newMessage.chatRoomId], ctx.previousConversations);
      }
      
      options?.onError?.(err, newMessage, context);
    },
    onSuccess: (data, variables, context) => {
      // Remove the temporary optimistic message and let the real data from refetch take over
      const currentConversations = queryClient.getQueryData<Conversation[]>(['conversations', variables.chatRoomId]);
      
      if (currentConversations && Array.isArray(currentConversations)) {
        // Filter out temp messages and let the invalidation handle the rest
        const withoutTemp = currentConversations.filter(conv => !conv.id.startsWith('temp-'));
        queryClient.setQueryData(['conversations', variables.chatRoomId], withoutTemp);
      }
      
      // Invalidate to ensure we get the latest data from server
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.chatRoomId] });
      
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}