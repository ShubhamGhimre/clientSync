// hooks/api/useRag.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useCallback, useEffect, useRef } from 'react';

// Types for better type safety
export interface RagProgress {
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  processedChunks: number;
  currentFile?: string;
  currentStep?: string;
  message: string;
  progress: number;
  timeElapsed?: string;
  estimatedTimeRemaining?: string;
  startTime?: string;
  lastUpdated?: string;
  error?: string;
}

export interface InitializeResponse {
  success: boolean;
  message: string;
  progressUrl: string;
  chatbot: {
    id: string;
    name: string;
  };
  estimatedFiles: number;
}

// Initialize knowledge base for a chatbot
export function useInitializeRag(chatbotId: string) {
  const queryClient = useQueryClient();

  return useMutation<InitializeResponse, Error, void>({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/rag/initialize/${chatbotId}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and start polling progress immediately
      queryClient.invalidateQueries({ 
        queryKey: ['rag-progress', chatbotId] 
      });
    },
    onError: (error) => {
      console.error('RAG initialization failed:', error);
    }
  });
}

// Enhanced progress hook with automatic polling management
export function useRagProgress(chatbotId: string) {
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<number>(2000); // Start with 2 second polling
  const consecutiveErrorsRef = useRef<number>(0);

  const query = useQuery<{ success: boolean; data: RagProgress }, Error>({
    queryKey: ['rag-progress', chatbotId],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/rag/progress/${chatbotId}`);
        consecutiveErrorsRef.current = 0; // Reset error count on success
        return data;
      } catch (error: any) {
        consecutiveErrorsRef.current++;
        
        // If we get 404 (no progress found), don't treat as error for completed bots
        if (error.response?.status === 404) {
          consecutiveErrorsRef.current = 0;
        }
        
        throw error;
      }
    },
    enabled: !!chatbotId,
    refetchInterval: (query) => {
      const data = query.state.data as { success: boolean; data: RagProgress } | undefined;
      const progressData = data?.data;
      const hasErrors = consecutiveErrorsRef.current > 0;

      // Don't poll if there are consecutive errors (except 404)
      if (hasErrors && consecutiveErrorsRef.current > 3) {
        return false;
      }

      // Don't poll if no progress data and no errors (likely not initialized)
      if (!progressData && !hasErrors) {
        return false;
      }

      // Don't poll if completed or failed (unless it just completed)
      if (progressData?.status === 'completed' || progressData?.status === 'failed') {
        return false;
      }

      // Poll actively when processing
      if (progressData?.status === 'processing') {
        // Adjust polling interval based on progress
        if (progressData.progress < 10) {
          pollIntervalRef.current = 1000; // Every 1 second for initial progress
        } else if (progressData.progress < 50) {
          pollIntervalRef.current = 2000; // Every 2 seconds
        } else {
          pollIntervalRef.current = 3000; // Every 3 seconds when nearly done
        }

        return pollIntervalRef.current;
      }

      return false;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000, // Consider data stale after 1 second when processing
    retry: (failureCount, error: any) => {
      // Don't retry 404s more than once
      if (error?.response?.status === 404) {
        return failureCount < 1;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    }
  });

  // Helper to manually trigger progress check
  const refetchProgress = useCallback(() => {
    return query.refetch();
  }, [query]);

  // Helper to check if currently processing
  const isProcessing = query.data?.data?.status === 'processing';
  
  // Helper to check if completed
  const isCompleted = query.data?.data?.status === 'completed';
  
  // Helper to check if failed
  const isFailed = query.data?.data?.status === 'failed';

  return {
    ...query,
    refetchProgress,
    isProcessing,
    isCompleted,
    isFailed,
    progressData: query.data?.data
  };
}

// Process a chat message (RAG chat) - unchanged to maintain compatibility
export function useRagChat() {
  return useMutation<any, Error, { 
    chatRoomId: string; 
    message: string; 
    sender: string;
    userId?: string;
  }>({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/api/rag/chat', payload);
      return data;
    },
  });
}

// Combined hook for complete RAG management
export function useRagManager(chatbotId: string) {
  const initialize = useInitializeRag(chatbotId);
  const progress = useRagProgress(chatbotId);
  const chat = useRagChat();

  // Helper to start initialization and begin progress tracking
  const startInitialization = useCallback(async () => {
    try {
      await initialize.mutateAsync();
      // Progress polling will start automatically via the progress hook
    } catch (error) {
      console.error('Failed to start initialization:', error);
      throw error;
    }
  }, [initialize]);

  return {
    // Initialization
    initialize: startInitialization,
    isInitializing: initialize.isPending,
    initializeError: initialize.error,
    
    // Progress
    progress: progress.progressData,
    isProcessing: progress.isProcessing,
    isCompleted: progress.isCompleted,
    isFailed: progress.isFailed,
    progressLoading: progress.isLoading,
    progressError: progress.error,
    refetchProgress: progress.refetchProgress,
    
    // Chat
    sendMessage: chat.mutateAsync,
    isSending: chat.isPending,
    chatError: chat.error,
    
    // Combined states
    isActive: progress.isProcessing || initialize.isPending,
    hasError: !!(initialize.error || progress.error || chat.error)
  };
}