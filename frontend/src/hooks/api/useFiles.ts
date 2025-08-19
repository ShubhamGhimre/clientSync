import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface File {
  id: string;
  chatBotId: string;
  name: string;
  url: string;
  // ...add other fields as needed
}

// GET /api/files
export const useFiles = (params?: { chatBotId?: string }) =>
  useQuery({
    queryKey: ['files', params],
    queryFn: async (): Promise<File[]> => {
      const res = await api.get<ApiResponse<File[]>>('/api/files', { params });
      return res.data.data!;
    },
  });

// POST /api/files/upload
export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post<ApiResponse<File>>('/api/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  });
};

// DELETE /api/files/{id}
export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/files/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  });
};