// types/file.ts
export interface File {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string; // ISO string from DateTime
  processed: boolean;
  content: string | null;
  fileType: string | null;
  chatBotId: string;
}

// API response types
export interface FilesResponse {
  data: File[];
  count?: number;
}

export interface UploadFileResponse {
  file: File;
  message?: string;
}

export interface DeleteFileResponse {
  message: string;
  deletedFileId: string;
}

// Hook option types
export interface UseFilesOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
}

// Updated hooks with proper typing
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Get all files for a chatbot
export function useFiles(
  chatBotId: string, 
  options?: Omit<UseQueryOptions<FilesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FilesResponse>({
    queryKey: ['files', chatBotId],
    queryFn: async (): Promise<FilesResponse> => {
      const { data } = await axios.get<FilesResponse>('/api/files', { 
        params: { chatBotId } 
      });
      return data;
    },
    enabled: !!chatBotId,
    ...options,
  });
}

// Upload file to chatbot
export function useUploadFile(
  options?: UseMutationOptions<UploadFileResponse, Error, FormData>
) {
  const queryClient = useQueryClient();
  
  return useMutation<UploadFileResponse, Error, FormData>({
    mutationFn: async (formData: FormData): Promise<UploadFileResponse> => {
      const { data } = await axios.post<UploadFileResponse>('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate all files queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['files'] });
      // Optionally call custom onSuccess
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// Delete file
export function useDeleteFile(
  options?: UseMutationOptions<DeleteFileResponse, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteFileResponse, Error, string>({
    mutationFn: async (id: string): Promise<DeleteFileResponse> => {
      const { data } = await axios.delete<DeleteFileResponse>(`/api/files/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      // Invalidate files queries
      queryClient.invalidateQueries({ queryKey: ['files'] });
      // Optionally call custom onSuccess
      options?.onSuccess?.(data, id, undefined);
    },
    ...options,
  });
}

// Additional utility types for file operations
export interface FileUploadData {
  file: globalThis.File;
  chatBotId: string;
  metadata?: Record<string, any>;
}

// Helper type for file status
export type FileStatus = 'uploading' | 'processing' | 'completed' | 'failed';

// Extended file type with computed properties
export interface FileWithStatus extends File {
  status: FileStatus;
  uploadProgress?: number;
}