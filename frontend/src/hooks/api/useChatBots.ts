import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// Types based on your schema
export interface ChatBot {
  _count: any;
	id: string;
	name: string;
	description?: string;
	status: 'ONLINE' | 'OFFLINE' | 'BUSY';
	isKnowledgeInitialized: boolean;
	lastKnowledgeUpdate: string;
	totalChunks: number;
	createdAt: string;
	updatedAt: string;
	organizationId: string;
}

export interface CreateChatBotData {
	name: string;
	description?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'BUSY';
}

export interface UpdateChatBotData {
	name?: string;
	description?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'BUSY';
}

export interface ChatBotsResponse {
	success: boolean;
	data: ChatBot[];
}

export interface ChatBotResponse {
	success: boolean;
	data: ChatBot;
}

// API functions
const chatBotsAPI = {
	getChatBots: async (): Promise<ChatBotsResponse> => {
		const response = await api.get('/api/chatbots');
		return response.data;
	},
	getChatBotById: async (id: string): Promise<ChatBotResponse> => {
		const response = await api.get(`/api/chatbots/${id}`);
		return response.data;
	},
	createChatBot: async (data: CreateChatBotData): Promise<ChatBotResponse> => {
		const response = await api.post('/api/chatbots', data);
		return response.data;
	},
	updateChatBot: async (id: string, data: UpdateChatBotData): Promise<ChatBotResponse> => {
		const response = await api.put(`/api/chatbots/${id}`, data);
		return response.data;
	},
};

// React Query hooks
export const useChatBots = () => {
	return useQuery({
		queryKey: ['chatbots'],
		queryFn: chatBotsAPI.getChatBots,
		staleTime: 5 * 60 * 1000,
	});
};

export const useChatBot = (id: string) => {
	return useQuery({
		queryKey: ['chatbot', id],
		queryFn: () => chatBotsAPI.getChatBotById(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateChatBot = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: chatBotsAPI.createChatBot,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['chatbots'] });
		},
	});
};

export const useUpdateChatBot = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateChatBotData }) =>
			chatBotsAPI.updateChatBot(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['chatbots'] });
		},
	});
};
