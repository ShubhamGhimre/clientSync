import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Type definitions based on your API schema and responses
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'USER' | 'AGENT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId?: string;
  assignedAgentId?: string;
  organizationId: string;
  createdById: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: TicketCategory;
  assignedAgent?: User;
  createdBy: User;
  comments?: TicketComment[];
  attachments?: any[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  recent: Pick<SupportTicket, 'id' | 'ticketNumber' | 'title' | 'status' | 'priority' | 'customerName' | 'createdAt'>[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// Request payload types
export interface CreateTicketCategoryPayload {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTicketCategoryPayload {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface CreateSupportTicketPayload {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  priority?: TicketPriority;
  categoryId?: string;
  assignedAgentId?: string;
}

export interface UpdateSupportTicketPayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  assignedAgentId?: string;
}

export interface SupportTicketQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
  categoryId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTicketCommentPayload {
  content: string;
  isInternal?: boolean;
}

// --- Ticket Categories Hooks ---
export function useTicketCategories(
  options?: UseQueryOptions<ApiResponse<TicketCategory[]>>
) {
  return useQuery({
    queryKey: ['ticket-categories'],
    queryFn: async (): Promise<ApiResponse<TicketCategory[]>> => {
      const { data } = await axios.get('/api/support-tickets/categories');
      return data;
    },
    ...options,
  });
}

export function useCreateTicketCategory(
  options?: UseMutationOptions<ApiResponse<TicketCategory>, Error, CreateTicketCategoryPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateTicketCategoryPayload): Promise<ApiResponse<TicketCategory>> => {
      const { data } = await axios.post('/api/support-tickets/categories', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
    },
    ...options,
  });
}

export function useUpdateTicketCategory(
  options?: UseMutationOptions<ApiResponse<TicketCategory>, Error, { id: string } & UpdateTicketCategoryPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateTicketCategoryPayload): Promise<ApiResponse<TicketCategory>> => {
      const { data } = await axios.put(`/api/support-tickets/categories/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
    },
    ...options,
  });
}

// --- Ticket Stats Hooks ---
export function useTicketStats(
  options?: UseQueryOptions<ApiResponse<TicketStats>>
) {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async (): Promise<ApiResponse<TicketStats>> => {
      const { data } = await axios.get('/api/support-tickets/stats');
      return data;
    },
    ...options,
  });
}

// --- Support Tickets CRUD Hooks ---
export function useSupportTickets(
  params?: SupportTicketQueryParams,
  options?: UseQueryOptions<PaginatedResponse<SupportTicket>>
) {
  return useQuery({
    queryKey: ['support-tickets', params],
    queryFn: async (): Promise<PaginatedResponse<SupportTicket>> => {
      const { data } = await axios.get('/api/support-tickets', { params });
      return data;
    },
    ...options,
  });
}

export function useCreateSupportTicket(
  options?: UseMutationOptions<ApiResponse<SupportTicket>, Error, CreateSupportTicketPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateSupportTicketPayload): Promise<ApiResponse<SupportTicket>> => {
      const { data } = await axios.post('/api/support-tickets', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
    ...options,
  });
}

export function useSupportTicket(
  id: string,
  options?: UseQueryOptions<ApiResponse<SupportTicket>>
) {
  return useQuery({
    queryKey: ['support-ticket', id],
    queryFn: async (): Promise<ApiResponse<SupportTicket>> => {
      const { data } = await axios.get(`/api/support-tickets/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useUpdateSupportTicket(
  options?: UseMutationOptions<ApiResponse<SupportTicket>, Error, { id: string } & UpdateSupportTicketPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateSupportTicketPayload): Promise<ApiResponse<SupportTicket>> => {
      const { data } = await axios.put(`/api/support-tickets/${id}`, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
    ...options,
  });
}

export function useDeleteSupportTicket(
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      const { data } = await axios.delete(`/api/support-tickets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
    ...options,
  });
}

// --- Add Comment to Support Ticket ---
export function useAddTicketComment(
  options?: UseMutationOptions<ApiResponse<TicketComment>, Error, { id: string } & CreateTicketCommentPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & CreateTicketCommentPayload): Promise<ApiResponse<TicketComment>> => {
      const { data } = await axios.post(`/api/support-tickets/${id}/comments`, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
    },
    ...options,
  });
}

// --- Utility Types for Components ---
export type TicketFormData = Omit<CreateSupportTicketPayload, 'priority'> & {
  priority: TicketPriority;
};

export type CategoryFormData = CreateTicketCategoryPayload;

// --- Helper functions for type guards ---
export function isTicketStatus(value: string): value is TicketStatus {
  return ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'].includes(value);
}

export function isTicketPriority(value: string): value is TicketPriority {
  return ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'].includes(value);
}

// --- Constants for dropdowns ---
export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_CUSTOMER', label: 'Pending Customer' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const TICKET_PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-800' },
];