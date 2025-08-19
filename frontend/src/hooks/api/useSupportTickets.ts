// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { AxiosError } from 'axios';
// import api from '@/lib/axios';
// import type { 
//   ApiResponse, 
//   PaginatedResponse,
//   SupportTicket, 
//   CreateSupportTicketRequest,
//   UpdateSupportTicketRequest,
//   TicketCategory,
//   CreateTicketCategoryRequest,
//   TicketComment,
//   CreateTicketCommentRequest,
//   TicketStatus,
//   TicketPriority,
// } from '@/types/api';

// // Support Ticket Queries
// export const useSupportTickets = (params?: {
//   page?: number;
//   limit?: number;
//   status?: TicketStatus;
//   priority?: TicketPriority;
//   assignedAgentId?: string;
//   categoryId?: string;
//   search?: string;
// }) => {
//   return useQuery({
//     queryKey: ['support-tickets', params],
//     queryFn: async (): Promise<PaginatedResponse<SupportTicket>> => {
//       const response = await api.get<PaginatedResponse<SupportTicket>>('/api/support-tickets', {
//         params
//       });
//       return response.data;
//     },
//   });
// };

// export const useSupportTicket = (id: string) => {
//   return useQuery({
//     queryKey: ['support-tickets', id],
//     queryFn: async (): Promise<SupportTicket> => {
//       const response = await api.get<ApiResponse<SupportTicket>>(`/api/support-tickets/${id}`);
//       return response.data.data!;
//     },
//     enabled: !!id,
//   });
// };

// export const useTicketCategories = () => {
//   return useQuery({
//     queryKey: ['ticket-categories'],
//     queryFn: async (): Promise<TicketCategory[]> => {
//       const response = await api.get<ApiResponse<TicketCategory[]>>('/api/support-tickets/categories');
//       return response.data.data!;
//     },
//   });
// };

// export const useTicketStats = () => {
//   return useQuery({
//     queryKey: ['ticket-stats'],
//     queryFn: async (): Promise<{
//       total: number;
//       byStatus: Record<string, number>;
//       byPriority: Record<string, number>;
//       recent: Array<Partial<SupportTicket>>;
//     }> => {
//       const response = await api.get<ApiResponse<any>>('/api/support-tickets/stats');
//       return response.data.data!;
//     },
//   });
// };

// // Support Ticket Mutations
// export const useCreateSupportTicket = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: CreateSupportTicketRequest): Promise<SupportTicket> => {
//       const response = await api.post<ApiResponse<SupportTicket>>('/api/support-tickets', data);
//       return response.data.data!;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
//       queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
//     },
//     onError: (error: AxiosError) => {
//       console.error('Failed to create support ticket:', error);
//     },
//   });
// };

// export const useUpdateSupportTicket = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: UpdateSupportTicketRequest }): Promise<SupportTicket> => {
//       const response = await api.put<ApiResponse<SupportTicket>>(`/api/support-tickets/${id}`, data);
//       return response.data.data!;
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
//       queryClient.setQueryData(['support-tickets', data.id], data);
//       queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
//     },
//     onError: (error: AxiosError) => {
//       console.error('Failed to update support ticket:', error);
//     },
//   });
// };

// export const useDeleteSupportTicket = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string): Promise<void> => {
//       await api.delete(`/api/support-tickets/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
//       queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
//     },
//     onError: (error: AxiosError) => {
//       console.error('Failed to delete support ticket:', error);
//     },
//   });
// };

// // Ticket Comments
// export const useAddTicketComment = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ ticketId, data }: { ticketId: string; data: CreateTicketCommentRequest }): Promise<TicketComment> => {
//       const response = await api.post<ApiResponse<TicketComment>>(`/api/support-tickets/${ticketId}/comments`, data);
//       return response.data.data!;
//     },
//     onSuccess: (_, { ticketId }) => {
//       queryClient.invalidateQueries({ queryKey: ['support-tickets', ticketId] });
//     },
//     onError: (error: AxiosError) => {
//       console.error('Failed to add ticket comment:', error);
//     },
//   });
// };

// // Ticket Categories
// export const useCreateTicketCategory = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: CreateTicketCategoryRequest): Promise<TicketCategory> => {
//       const response = await api.post<ApiResponse<TicketCategory>>('/api/support-tickets/categories', data);
//       return response.data.data!;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
//     },
//     onError: (error: AxiosError) => {
//       console.error('Failed to create ticket category:', error);
//     },
//   });
// };