import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';

// Types based on your Prisma schema
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organization?: {
    id: string;
    companyName: string;
    subdomain: string;
  };
  _count?: {
    assignedTickets: number;
    createdTickets: number;
    ticketComments: number;
    botAccess: number;
  };
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      ADMIN: number;
      AGENT: number;
      VIEWER: number;
    };
    recentlyJoined: User[];
  };
}

export interface AgentsResponse {
  success: boolean;
  data: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>[];
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive?: boolean;
}

// API functions using axios instance
const usersAPI = {
  // GET /api/users - Get all users in organization
  getUsers: async (params: GetUsersParams = {}): Promise<UsersResponse> => {
    try {
      const response = await api.get('/api/users', { 
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          role: params.role,
          isActive: params.isActive
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get users error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  // GET /api/users/{id} - Get user by ID
  getUserById: async (id: string): Promise<UserResponse> => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get user by ID error:', error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // POST /api/users - Create new user
  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    try {
      const response = await api.post('/api/users', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  // PUT /api/users/{id} - Update user
  updateUser: async (id: string, data: UpdateUserData): Promise<UserResponse> => {
    try {
      const response = await api.put(`/api/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // DELETE /api/users/{id} - Delete user
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Delete user error:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // POST /api/users/{id}/reset-password - Reset user password
  resetPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/api/users/${id}/reset-password`, { 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  // GET /api/users/agents - Get all agents
  getAgents: async (): Promise<AgentsResponse> => {
    try {
      const response = await api.get('/api/users/agents');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get agents error:', error);
      throw new Error(error.message || 'Failed to fetch agents');
    }
  },

  // GET /api/users/stats - Get user statistics
  getUserStats: async (): Promise<UserStatsResponse> => {
    try {
      const response = await api.get('/api/users/stats');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get user stats error:', error);
      throw new Error(error.message || 'Failed to fetch user statistics');
    }
  },
};

// React Query Hooks

// Get all users with filters
export const useUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersAPI.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Get single user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersAPI.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      
      toast.success('User created successfully');
      
      // Optionally set the new user data in cache
      queryClient.setQueryData(['user', data.data.id], data);
    },
    onError: (error: any) => {
      console.error('Create user mutation error:', error);
      toast.error(error.message || 'Failed to create user');
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersAPI.updateUser(id, data),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(['user', variables.id], data);
      
      // Invalidate users list and stats
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      console.error('Update user mutation error:', error);
      toast.error(error.message || 'Failed to update user');
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: (data, deletedUserId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: ['user', deletedUserId] });
      
      // Invalidate users list and stats
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete user mutation error:', error);
      toast.error(error.message || 'Failed to delete user');
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersAPI.resetPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      console.error('Reset password mutation error:', error);
      toast.error(error.message || 'Failed to reset password');
    },
  });
};

// Get agents
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: usersAPI.getAgents,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: usersAPI.getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Prefetch user data
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', id],
      queryFn: () => usersAPI.getUserById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Custom hook for user mutations with optimistic updates
export const useOptimisticUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersAPI.updateUser(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', id] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user', id]);

      // Optimistically update to new value
      queryClient.setQueryData(['user', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...data, updatedAt: new Date().toISOString() }
        };
      });

      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user', variables.id], context.previousUser);
      }
      console.error('Optimistic update error:', err);
      toast.error('Failed to update user');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onSuccess: () => {
      toast.success('User updated successfully');
    }
  });
};

// Batch operations
export const useBatchUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; data: UpdateUserData }[]) => {
      const promises = updates.map(({ id, data }) => usersAPI.updateUser(id, data));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Users updated successfully');
    },
    onError: (error: any) => {
      console.error('Batch update error:', error);
      toast.error('Failed to update some users');
    },
  });
};

// Helper function to validate user data
export const validateUserData = (data: CreateUserData | UpdateUserData): string[] => {
  const errors: string[] = [];

  if ('firstName' in data && data.firstName && data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if ('lastName' in data && data.lastName && data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if ('email' in data && data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  if ('password' in data && data.password && data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  return errors;
};

// Export the API functions for direct use if needed
export { usersAPI };