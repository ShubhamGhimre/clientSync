import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Types based on your Prisma schema
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

// API Response types
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
      
      // Optionally update the cache optimistically for better UX
      // queryClient.setQueryData(['conversations', variables.chatRoomId], (old: Conversation[] | undefined) => {
      //   return old ? [...old, data] : [data];
      // });
      
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

// Additional utility hook for optimistic updates
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
      
      // Optimistically update to the new value
      const optimisticMessage: Conversation = {
        id: `temp-${Date.now()}`,
        sender: newMessage.sender,
        message: newMessage.message,
        createdAt: new Date(),
        chatRoomId: newMessage.chatRoomId,
      };
      
      queryClient.setQueryData(
        ['conversations', newMessage.chatRoomId],
        (old: Conversation[] | undefined) => Array.isArray(old) ? [...old, optimisticMessage] : [optimisticMessage]
      );
      
      // Return a context object with the snapshotted value
      return { previousConversations, optimisticMessage };
    },
    // onError: (
    //   err,
    //   newMessage,
    //   context: unknown
    // ) => {
    //   // Safely cast context to the expected type
    //   const ctx = context as { previousConversations?: Conversation[]; optimisticMessage?: Conversation } | undefined;
    //   // If the mutation fails, use the context returned from onMutate to roll back
    //   if (ctx?.previousConversations) {
    //     queryClient.setQueryData(['conversations', newMessage.chatRoomId], ctx.previousConversations);
    //   }
    //   options?.onError?.(err, newMessage, ctx);
    // },
    // onSettled: (data, error, variables) => {
    //   // Always refetch after error or success to sync with server
    //   queryClient.invalidateQueries({ queryKey: ['conversations', variables.chatRoomId] });
    //   options?.onSettled?.(data, error, variables);
    // },
    // ...options,
  });
}