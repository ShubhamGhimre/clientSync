import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Types based on your Prisma schema
export interface ChatRoom {
  id: string;
  title: string;
  createdAt: Date;
  chatBotId: string;
  chatBot: {
    id: string;
    name: string;
    description?: string;
    status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  };
  conversations?: Conversation[];
}

export interface Conversation {
  id: string;
  sender: string;
  message: string;
  createdAt: Date;
  chatRoomId: string;
  chatRoom?: ChatRoom;
}

export interface CreateChatRoomPayload {
  title: string;
  chatBotId: string;
}

export interface UpdateChatRoomPayload {
  id: string;
  title?: string;
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

export interface ChatRoomsResponse extends ApiResponse<ChatRoom[]> {}
export interface ChatRoomResponse extends ApiResponse<ChatRoom> {}

// Chat Room Hooks
export function useChatRooms(
  options?: Omit<UseQueryOptions<ChatRoom[], Error, ChatRoom[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['chatrooms'],
    queryFn: async (): Promise<ChatRoom[]> => {
      const { data } = await axios.get<ChatRoomsResponse>('/api/chatrooms');
      // Transform dates and return the data array
      return data.data.map(room => ({
        ...room,
        createdAt: new Date(room.createdAt),
        chatBot: {
          ...room.chatBot,
        }
      }));
    },
    ...options,
  });
}

export function useChatRoom(
  id: string,
  options?: Omit<UseQueryOptions<ChatRoom, Error, ChatRoom>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: ['chatroom', id],
    queryFn: async (): Promise<ChatRoom> => {
      const { data } = await axios.get<ChatRoomResponse>(`/api/chatrooms/${id}`);
      // Transform dates and return the data
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        chatBot: {
          ...data.data.chatBot,
        }
      };
    },
    ...options,
  });
}

export function useCreateChatRoom(
  options?: UseMutationOptions<ChatRoom, Error, CreateChatRoomPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateChatRoomPayload): Promise<ChatRoom> => {
      const { data } = await axios.post<ChatRoomResponse>('/api/chatrooms', payload);
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        chatBot: {
          ...data.data.chatBot,
        }
      };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useUpdateChatRoom(
  options?: UseMutationOptions<ChatRoom, Error, UpdateChatRoomPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateChatRoomPayload): Promise<ChatRoom> => {
      const { data } = await axios.put<ChatRoomResponse>(`/api/chatrooms/${id}`, payload);
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        chatBot: {
          ...data.data.chatBot,
        }
      };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatroom', variables.id] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useDeleteChatRoom(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean }> => {
      const { data } = await axios.delete<ApiResponse<{ success: boolean }>>(`/api/chatrooms/${id}`);
      return data.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      queryClient.removeQueries({ queryKey: ['chatroom', variables] });
      queryClient.removeQueries({ queryKey: ['conversations', variables] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}