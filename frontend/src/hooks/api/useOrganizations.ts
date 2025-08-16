import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { Organization } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

interface UpdateOrganizationRequest {
  companyName?: string;
  contactEmail?: string;
}

// Organization queries
export const useOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async (): Promise<Organization> => {
      const response = await api.get<ApiResponse<Organization>>('/api/organizations');
      return response.data.data!;
    },
  });
};

export const useCheckSubdomain = (subdomain: string) => {
  return useQuery({
    queryKey: ['subdomain', subdomain],
    queryFn: async (): Promise<{ available: boolean; subdomain: string }> => {
      const response = await api.get<ApiResponse<{ available: boolean; subdomain: string }>>(
        `/api/organizations/check-subdomain/${subdomain}`
      );
      return response.data.data!;
    },
    enabled: !!subdomain && subdomain.length >= 3,
  });
};

// Organization mutations
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrganizationRequest): Promise<Organization> => {
      const response = await api.put<ApiResponse<Organization>>('/api/organizations', data);
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['organization'], data);
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update organization:', error);
    },
  });
};