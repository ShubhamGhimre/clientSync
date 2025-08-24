
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Initialize knowledge base for a chatbot
export function useInitializeRag(chatbotId: string) {
	return useMutation({
		mutationFn: async () => {
			const { data } = await axios.post(`/api/rag/initialize/${chatbotId}`);
			return data;
		},
	});
}

// Get knowledge base initialization progress
export function useRagProgress(chatbotId: string, options?: any) {
	return useQuery({
		queryKey: ['rag-progress', chatbotId],
		queryFn: async () => {
			const { data } = await axios.get(`/api/rag/progress/${chatbotId}`);
			return data;
		},
		enabled: !!chatbotId,
		...options,
	});
}

// Process a chat message (RAG chat)
export function useRagChat() {
	return useMutation({
		mutationFn: async (payload: { chatbotId: string; message: string }) => {
			const { data } = await axios.post('/api/rag/chat', payload);
			return data;
		},
	});
}
