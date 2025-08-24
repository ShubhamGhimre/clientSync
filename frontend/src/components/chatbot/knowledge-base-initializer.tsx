'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Zap,
  Settings,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Import the API hooks
import { useInitializeRag, useRagProgress } from '@/hooks/api/useRag';
import { useFiles } from '@/hooks/api/useFiles';
import { useChatBot } from '@/hooks/api/useChatBots';

interface KnowledgeBaseInitializerProps {
  chatbotId: string;
}

interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  error?: string;
}

export function KnowledgeBaseInitializer({ chatbotId }: KnowledgeBaseInitializerProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'chunks'>('overview');
  const [isPolling, setIsPolling] = useState(false);

  // API hooks
  const { data: chatbotData, isLoading: chatbotLoading, refetch: refetchChatbot } = useChatBot(chatbotId);
  const initializeRagMutation = useInitializeRag(chatbotId);
  const { data: filesData, isLoading: filesLoading, refetch: refetchFiles } = useFiles(chatbotId);
  const { 
    data: progressDataRaw, 
    isLoading: progressLoading,
    refetch: refetchProgress 
  } = useRagProgress(chatbotId, {
    enabled: !!chatbotId && isPolling,
    refetchInterval: isPolling ? 2000 : false,
  });

  // Safely extract chatbot data
  // If chatbotData has a 'data' property, use it; otherwise, use chatbotData directly
  const chatbot = (chatbotData && 'data' in chatbotData) ? chatbotData.data : chatbotData;
  const isKnowledgeInitialized = chatbot?.isKnowledgeInitialized || false;

  // Safely extract progress data
  const progressData = (progressDataRaw && typeof progressDataRaw === 'object' && 'data' in progressDataRaw)
    ? (progressDataRaw as any).data
    : progressDataRaw || {};

  // Safely extract files data
  const files =
    filesData && typeof filesData === 'object' && 'data' in filesData && Array.isArray((filesData as any).data)
      ? (filesData as any).data
      : Array.isArray(filesData)
        ? filesData
        : [];
  const processedFiles = files.filter((file: any) => file.processed);
  
  // Calculate knowledge stats from real data
  const knowledgeStats = {
    totalChunks: progressData?.totalChunks || 0,
    totalFiles: processedFiles.length,
    lastUpdated: progressData?.lastUpdated || new Date().toISOString(),
    isInitialized: isKnowledgeInitialized,
    sources: files.map((file: any) => ({
      name: file.fileName,
      chunks: file.chunksCount || 0,
      status: file.processed ? 'processed' : 'pending'
    }))
  };

  // Processing status from API
  const processingStatus: ProcessingStatus = {
    status: progressData?.status || (isKnowledgeInitialized ? 'completed' : 'idle'),
    progress: progressData?.progress || (isKnowledgeInitialized ? 100 : 0),
    currentStep: progressData?.currentStep || '',
    totalFiles: files.length,
    processedFiles: processedFiles.length,
    totalChunks: progressData?.totalChunks || 0,
    error: progressData?.error
  };

  // Handle initialization
  const handleInitializeKnowledge = async () => {
    console.log('Attempting to initialize knowledge base for chatbot:', chatbotId);
    
    if (!chatbotId) {
      toast.error('Chatbot ID is required');
      return;
    }

  

    try {
      setIsPolling(true);
      console.log('Starting RAG initialization...');
      
      const result = await initializeRagMutation.mutateAsync();
      console.log('Initialize RAG result:', result);
      
      toast.success('Knowledge base initialization started');
      
      // Refetch data to get updated status
      setTimeout(() => {
        // refetchProgress();
        // refetchChatbot();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error initializing knowledge base:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize knowledge base';
      toast.error(errorMessage);
      setIsPolling(false);
    }
  };

  const handleReinitialize = async () => {
    if (!confirm('Are you sure you want to reinitialize the knowledge base? This will recreate all chunks and embeddings.')) {
      return;
    }
    await handleInitializeKnowledge();
  };

  const handleClearKnowledge = async () => {
    if (!confirm('Are you sure you want to clear the knowledge base? This action cannot be undone.')) {
      return;
    }

    // You might want to add a clear API endpoint
    toast.info('Clear functionality not implemented yet');
  };

  // Stop polling when processing is complete or failed
  useEffect(() => {
    if (processingStatus.status === 'completed') {
      setIsPolling(false);
      toast.success('Knowledge base initialized successfully!');
      // Refetch chatbot data to get updated status
      refetchChatbot();
    } else if (processingStatus.status === 'error') {
      setIsPolling(false);
      toast.error(processingStatus.error || 'Knowledge base initialization failed');
    }
  }, [processingStatus.status, processingStatus.error, refetchChatbot]);

  // Handle mutation state changes
  useEffect(() => {
    if (initializeRagMutation.isSuccess) {
      console.log('RAG initialization mutation succeeded');
    }
    if (initializeRagMutation.isError) {
      console.error('RAG initialization mutation failed:', initializeRagMutation.error);
      setIsPolling(false);
    }
  }, [initializeRagMutation.isSuccess, initializeRagMutation.isError, initializeRagMutation.error]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchProgress(),
        refetchChatbot(),
        refetchFiles()
      ]);
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  if (filesLoading || progressLoading || chatbotLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading knowledge base status...</span>
      </div>
    );
  }

  const canInitialize = processedFiles.length > 0 && !isKnowledgeInitialized;
  const isProcessing = processingStatus.status === 'processing' || initializeRagMutation.isPending;

  return (
    <div className="space-y-6">
      
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.totalChunks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Semantic text chunks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Processed documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {knowledgeStats.isInitialized ? (
                <span className="text-green-600">Ready</span>
              ) : processingStatus.status === 'processing' ? (
                <span className="text-blue-600">Processing</span>
              ) : processingStatus.status === 'error' ? (
                <span className="text-red-600">Error</span>
              ) : (
                <span className="text-orange-600">Pending</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Knowledge base status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {knowledgeStats.lastUpdated ? formatDate(knowledgeStats.lastUpdated) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Knowledge base refresh
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Processing Knowledge Base
            </CardTitle>
            <CardDescription>
              {processingStatus.currentStep || 'Processing your files...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={processingStatus.progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {Math.round(processingStatus.progress)}%</span>
              <span>
                Files: {processingStatus.processedFiles}/{processingStatus.totalFiles}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Status */}
      {processingStatus.status === 'error' && processingStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {processingStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Knowledge Base Management</CardTitle>
                  <CardDescription>
                    Initialize and manage your chatbot's knowledge base
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'overview' ? 'chunks' : 'overview')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {viewMode === 'overview' ? 'View Chunks' : 'Overview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAll}
                    disabled={progressLoading || filesLoading || chatbotLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${(progressLoading || filesLoading || chatbotLoading) ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alert Messages */}
              {!knowledgeStats.isInitialized ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {processedFiles.length === 0 
                      ? 'No processed files found. Upload and process files first.' 
                      : 'Knowledge base is not initialized. Click "Initialize Knowledge Base" to get started.'
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Knowledge base is ready! Your chatbot can now answer questions based on uploaded content.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 flex-wrap">
                {/* Initialize/Reinitialize Button */}
                {!isKnowledgeInitialized ? (
                  <Button
                    onClick={handleInitializeKnowledge}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isProcessing ? 'Initializing...' : 'Initialize Knowledge Base'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleReinitialize}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isProcessing ? 'Reinitializing...' : 'Reinitialize'}
                  </Button>
                )}

                {knowledgeStats.isInitialized && (
                  <>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => toast.info('Export functionality not implemented yet')}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleClearKnowledge}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                  </>
                )}
              </div>

              {/* Show helpful message when initialization is disabled */}
              {processedFiles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Upload and process some files first before initializing the knowledge base.
                </p>
              )}
              {!canInitialize && processedFiles.length > 0 && isKnowledgeInitialized && (
                <p className="text-sm text-muted-foreground">
                  Knowledge base is already initialized. Use "Reinitialize" to refresh it with the latest files.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Source Files */}
          {viewMode === 'overview' && knowledgeStats.sources.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Source Files</CardTitle>
                <CardDescription>
                  Files processed for knowledge base creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledgeStats.sources.map((source: { name: string; chunks: number; status: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {source.chunks > 0 ? `${source.chunks} chunks generated` : 'No chunks yet'}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={
                          source.status === 'processed' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {source.status === 'processed' ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Knowledge Chunks View */}
          {viewMode === 'chunks' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Knowledge Chunks</CardTitle>
                <CardDescription>
                  {knowledgeStats.totalChunks > 0 
                    ? `Showing sample chunks from your knowledge base (${knowledgeStats.totalChunks} total)`
                    : 'No chunks available yet. Initialize the knowledge base first.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeStats.totalChunks > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Chunks will be displayed here once the knowledge base is populated with real data.
                        You can implement a separate API endpoint to fetch sample chunks.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg text-center">
                    <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No chunks available. Initialize the knowledge base to see content here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Vector Database
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleRefreshAll}
                disabled={progressLoading || filesLoading || chatbotLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(progressLoading || filesLoading || chatbotLoading) ? 'animate-spin' : ''}`} />
                Sync Status
              </Button>
            </CardContent>
          </Card>

          {/* Processing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Bot Status:</span>
                  <span>{isKnowledgeInitialized ? 'Initialized' : 'Not Initialized'}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Total Files:</span>
                  <span>{files.length}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Processed Files:</span>
                  <span>{processedFiles.length}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Total Chunks:</span>
                  <span>{knowledgeStats.totalChunks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{processingStatus.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}