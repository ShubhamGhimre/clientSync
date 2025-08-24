
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Get all files for a chatbot
export function useFiles(chatBotId: string, options?: any) {
	return useQuery({
		queryKey: ['files', chatBotId],
		queryFn: async () => {
			const { data } = await axios.get('/api/files', { params: { chatBotId } });
			return data;
		},
		enabled: !!chatBotId,
		...options,
	});
}

// Upload file to chatbot
export function useUploadFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (formData: FormData) => {
			const { data } = await axios.post('/api/files/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['files'] });
		},
	});
}

// Delete file
export function useDeleteFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await axios.delete(`/api/files/${id}`);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['files'] });
		},
	});
}
