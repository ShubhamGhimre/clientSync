
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

// --- Ticket Categories ---
export function useTicketCategories(options?: any) {
	return useQuery({
		queryKey: ['ticket-categories'],
		queryFn: async () => {
			const { data } = await axios.get('/api/support-tickets/categories');
			return data;
		},
		...options,
	});
}

export function useCreateTicketCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: { name: string; description?: string; color?: string }) => {
			const { data } = await axios.post('/api/support-tickets/categories', payload);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
		},
	});
}

// --- Ticket Stats ---
export function useTicketStats(options?: any) {
	return useQuery({
		queryKey: ['ticket-stats'],
		queryFn: async () => {
			const { data } = await axios.get('/api/support-tickets/stats');
			return data;
		},
		...options,
	});
}

// --- Support Tickets CRUD ---
export function useSupportTickets(options?: any) {
	return useQuery({
		queryKey: ['support-tickets'],
		queryFn: async () => {
			const { data } = await axios.get('/api/support-tickets');
			return data;
		},
		...options,
	});
}

export function useCreateSupportTicket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: any) => {
			const { data } = await axios.post('/api/support-tickets', payload);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
		},
	});
}

export function useSupportTicket(id: string, options?: any) {
	return useQuery({
		queryKey: ['support-ticket', id],
		queryFn: async () => {
			const { data } = await axios.get(`/api/support-tickets/${id}`);
			return data;
		},
		enabled: !!id,
		...options,
	});
}

export function useUpdateSupportTicket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...payload }: { id: string; [key: string]: any }) => {
			const { data } = await axios.put(`/api/support-tickets/${id}`, payload);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
		},
	});
}

export function useDeleteSupportTicket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await axios.delete(`/api/support-tickets/${id}`);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
		},
	});
}

// --- Add Comment to Support Ticket ---
export function useAddTicketComment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...payload }: { id: string; content: string; isInternal?: boolean }) => {
			const { data } = await axios.post(`/api/support-tickets/${id}/comments`, payload);
			return data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
		},
	});
}
