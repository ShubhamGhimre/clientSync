import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  // ...add other fields as needed
}

// GET /api/users
export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const res = await api.get<ApiResponse<User[]>>('/api/users');
      return res.data.data!;
    },
  });

// GET /api/users/{id}
export const useUser = (id: string) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: async (): Promise<User> => {
      const res = await api.get<ApiResponse<User>>(`/api/users/${id}`);
      return res.data.data!;
    },
    enabled: !!id,
  });

// POST /api/users
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await api.post<ApiResponse<User>>('/api/users', data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// PUT /api/users/{id}
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await api.put<ApiResponse<User>>(`/api/users/${id}`, data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// DELETE /api/users/{id}
export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// POST /api/users/{id}/reset-password
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      await api.post(`/api/users/${id}/reset-password`, { password });
    },
  });
};