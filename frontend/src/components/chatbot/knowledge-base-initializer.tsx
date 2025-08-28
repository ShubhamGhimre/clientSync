"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  Activity,
  Clock,
  Loader2,
} from "lucide-react";
import { useChatBot } from "@/hooks/api/useChatBots";
import { useRagManager } from "@/hooks/api/useRag";
import { FilesResponse, useFiles } from "@/hooks/api/useFiles";

interface KnowledgeBaseInitializerProps {
  chatbotId: string;
}

interface File {
  id: string;
  fileName?: string;
  name?: string;
  fileType?: string;
  fileSize?: number;
  processed?: boolean;
}

export default function KnowledgeBaseInitializer({
  chatbotId,
}: KnowledgeBaseInitializerProps) {
  const [chatbotPollingInterval, setChatbotPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch chatbot data
  const {
    data: chatbotData,
    isLoading: chatbotLoading,
    refetch: refetchChatbot,
  } = useChatBot(chatbotId);
  const chatbot = chatbotData?.data;

  // Fetch files
  const {
    data: filesData,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useFiles(chatbotId);
  
  // Extract files array from the API response
  const files: File[] = filesData?.data && Array.isArray(filesData.data) 
    ? filesData.data 
    : [];

  // Use the comprehensive RAG manager hook
  const ragManager = useRagManager(chatbotId);

  // Destructure all the states and methods from ragManager
  const {
    // Initialization
    initialize,
    isInitializing,
    initializeError,
    
    // Progress tracking
    progress: progressData,
    isProcessing,
    isCompleted,
    isFailed,
    progressLoading,
    progressError,
    refetchProgress,
    
    // Combined states
    isActive,
    hasError,
  } = ragManager;

  console.log("RAG Manager State:", {
    progressData,
    isProcessing,
    isCompleted,
    isFailed,
    isActive,
    hasError
  });

  const isKnowledgeInitialized = chatbot?.isKnowledgeInitialized || false;
  const totalChunks = chatbot?.totalChunks || 0;
  const lastUpdated = chatbot?.lastKnowledgeUpdate;

  // Determine if we can initialize
  const canInitialize = files.length > 0 && !isKnowledgeInitialized && !isActive;

  // Set up 2-minute interval for chatbot status polling
  useEffect(() => {
    const startChatbotPolling = () => {
      const interval = setInterval(async () => {
        try {
          console.log('Polling chatbot status every 2 minutes...');
          await refetchChatbot();
        } catch (error) {
          console.error("Chatbot polling error:", error);
        }
      }, 2 * 60 * 1000); // 2 minutes in milliseconds

      setChatbotPollingInterval(interval);
      return interval;
    };

    const interval = startChatbotPolling();

    return () => {
      if (interval) {
        clearInterval(interval);
        setChatbotPollingInterval(null);
      }
    };
  }, [chatbotId, refetchChatbot]);

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (chatbotPollingInterval) {
        clearInterval(chatbotPollingInterval);
      }
    };
  }, [chatbotPollingInterval]);

  // Refresh chatbot data when RAG process completes
  useEffect(() => {
    if (isCompleted) {
      // Delay the refetch to ensure backend has updated
      const timer = setTimeout(() => {
        console.log('RAG completed, refreshing chatbot data...');
        refetchChatbot();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isCompleted, refetchChatbot]);

  const handleInitializeKnowledge = async () => {
    try {
      await initialize();
      console.log('RAG initialization started successfully');
      // The progress polling will start automatically
    } catch (error) {
      console.error("Initialize error:", error);
    }
  };

  const handleReinitialize = async () => {
    if (
      !confirm(
        "Are you sure you want to reinitialize the knowledge base? This will recreate all chunks and embeddings."
      )
    ) {
      return;
    }
    await handleInitializeKnowledge();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgress = () => {
    // If knowledge is fully initialized, show 100%
    if (isKnowledgeInitialized && !isProcessing) return 100;
    
    // If RAG is processing, show actual progress
    if (progressData && isProcessing) {
      return progressData.progress || 0;
    }
    
    // If just completed but chatbot not yet updated, show 100%
    if (isCompleted) return 100;
    
    // If failed, show last known progress
    if (isFailed && progressData) {
      return progressData.progress || 0;
    }
    
    return 0;
  };

  const getCurrentStep = () => {
    // If knowledge is fully initialized and no processing, show completed
    if (isKnowledgeInitialized && !isProcessing) return "Completed";
    
    // If RAG is processing, show current step
    if (progressData && isProcessing) {
      return progressData.currentStep || progressData.message || "Processing...";
    }
    
    // If just completed
    if (isCompleted) return "Finalizing...";
    
    // If failed
    if (isFailed) return "Failed";
    
    // If initializing but no progress data yet
    if (isInitializing) return "Starting initialization...";
    
    return "Ready to initialize";
  };

  const getOverallStatus = () => {
    if (isKnowledgeInitialized && !isActive) return "Ready";
    if (isActive) return "Processing";
    if (isFailed) return "Failed";
    return "Pending";
  };

  const getStatusColor = () => {
    if (isKnowledgeInitialized && !isActive) return "text-emerald-600";
    if (isActive) return "text-blue-600";
    if (isFailed) return "text-red-600";
    return "text-amber-600";
  };

  const getStatusIcon = () => {
    if (isKnowledgeInitialized && !isActive) return <CheckCircle className="h-4 w-4" />;
    if (isActive) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isFailed) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  // Enhanced error handling
  const getErrorMessage = () => {
    if (initializeError) return initializeError.message;
    if (progressError) return "Failed to fetch progress updates";
    if (progressData?.error) return progressData.error;
    return "An unknown error occurred";
  };

  // Debug logging
  console.log("Debug - Component State:", {
    filesCount: files.length,
    isKnowledgeInitialized,
    isActive,
    canInitialize,
    progressData,
    chatbotPollingActive: !!chatbotPollingInterval
  });

  if (chatbotLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Knowledge Base
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your chatbot's knowledge and content processing
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${chatbotPollingInterval ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                Auto-refresh every 2 minutes
              </div>
              {isActive && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  RAG processing active
                </div>
              )}
              {progressData?.timeElapsed && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {progressData.timeElapsed} elapsed
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              refetchChatbot();
              refetchFiles();
              refetchProgress();
            }}
            className="bg-white shadow-sm border-slate-200 hover:bg-slate-50"
            disabled={isActive}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isActive ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>

        {/* Status Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Total Chunks
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalChunks.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Semantic text chunks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Source Files
              </CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {files.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Uploaded documents</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Status
              </CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor()} flex items-center gap-2`}>
                {getStatusIcon()}
                {getOverallStatus()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Knowledge base status
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Last Updated
              </CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900">
                {formatDate(lastUpdated)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Knowledge base refresh
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Processing Status */}
        {isActive && (
          <Card className="bg-white shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Processing Knowledge Base
              </CardTitle>
              <CardDescription className="text-slate-600">
                {getCurrentStep()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Progress value={getProgress()} className="w-full h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">
                  Progress: {Math.round(getProgress())}%
                </span>
                <span className="text-slate-500">
                  Files: {progressData?.processedFiles || 0}/{progressData?.totalFiles || files.length}
                </span>
              </div>
              {progressData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  {progressData.timeElapsed && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span><span className="font-medium">Elapsed:</span> {progressData.timeElapsed}</span>
                    </div>
                  )}
                  {progressData.estimatedTimeRemaining && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span><span className="font-medium">Remaining:</span> {progressData.estimatedTimeRemaining}</span>
                    </div>
                  )}
                  {progressData.processedChunks > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span><span className="font-medium">Chunks:</span> {progressData.processedChunks.toLocaleString()}</span>
                    </div>
                  )}
                  {progressData.totalChunks > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span><span className="font-medium">Total Chunks:</span> {progressData.totalChunks.toLocaleString()}</span>
                    </div>
                  )}
                  {progressData.currentFile && (
                    <div className="col-span-full flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span><span className="font-medium">Current File:</span> {progressData.currentFile}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Error Status */}
        {hasError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-1">Error Processing Knowledge Base</div>
              <div className="text-sm">{getErrorMessage()}</div>
              {progressData?.lastUpdated && (
                <div className="text-xs mt-2 opacity-75">
                  Last update: {new Date(progressData.lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Management Card */}
        <Card className="bg-white shadow-sm border-slate-200/60">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">
              Knowledge Base Management
            </CardTitle>
            <CardDescription className="text-slate-600">
              Initialize and manage your chatbot's knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Status Alert */}
            {!isKnowledgeInitialized && !isActive ? (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {files.length === 0
                    ? "No files found. Upload files in the Files tab first."
                    : 'Knowledge base is not initialized. Click "Initialize Knowledge Base" to get started.'}
                </AlertDescription>
              </Alert>
            ) : isKnowledgeInitialized && !isActive ? (
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <div className="font-medium">Knowledge base is ready!</div>
                  <div className="text-sm mt-1">
                    Your chatbot can now answer questions based on uploaded content.
                    {totalChunks > 0 && ` ${totalChunks.toLocaleString()} chunks are available for search.`}
                  </div>
                </AlertDescription>
              </Alert>
            ) : hasError ? (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Knowledge base processing encountered an error. Please try again or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {!isKnowledgeInitialized || isFailed ? (
                <Button
                  onClick={handleInitializeKnowledge}
                  disabled={!canInitialize || isActive}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                >
                  {isActive ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {isActive
                    ? "Initializing..."
                    : isFailed 
                    ? "Retry Initialize"
                    : "Initialize Knowledge Base"}
                </Button>
              ) : (
                <Button
                  onClick={handleReinitialize}
                  disabled={isActive}
                  variant="outline"
                  className="bg-white border-slate-200 hover:bg-slate-50"
                >
                  {isActive ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isActive ? "Reinitializing..." : "Reinitialize"}
                </Button>
              )}

              {/* Additional action buttons for better UX */}
              {isActive && (
                <Button
                  onClick={refetchProgress}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Progress
                </Button>
              )}
            </div>

            {/* Enhanced Progress Information */}
            {(isActive || isCompleted) && progressData && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Status:</span>
                    <span className="text-slate-600">{progressData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Progress:</span>
                    <span className="text-slate-600">{Math.round(progressData.progress)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Files:</span>
                    <span className="text-slate-600">
                      {progressData.processedFiles || 0} / {progressData.totalFiles || files.length}
                    </span>
                  </div>
                  {progressData.processedChunks > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Chunks:</span>
                      <span className="text-slate-600">
                        {progressData.processedChunks.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {progressData.currentStep && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Current Step:</span>
                      <span className="text-slate-600">{progressData.currentStep}</span>
                    </div>
                  </div>
                )}
                
                {progressData.startTime && (
                  <div className="text-xs text-slate-500 pt-1">
                    Started: {new Date(progressData.startTime).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Source Files Display */}
        {files.length > 0 && (
          <Card className="bg-white shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-900">Source Files</CardTitle>
              <CardDescription className="text-slate-600">
                Files available for knowledge base creation ({files.length} files)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {files.map((file: File, index: number) => {
                  const isCurrentFile = progressData?.currentFile === (file.fileName || file.name);
                  const isProcessedFile = file.processed;
                  
                  return (
                    <div
                      key={file.id || index}
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-200 ${
                        isCurrentFile 
                          ? 'border-blue-300 bg-blue-50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isCurrentFile ? 'bg-blue-100' : 'bg-slate-50'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            isCurrentFile ? 'text-blue-600' : 'text-slate-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {file.fileName || file.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {file.fileType || "Document"} •{" "}
                            {file.fileSize
                              ? `${Math.round(file.fileSize / 1024)}KB`
                              : "Unknown size"}
                            {isCurrentFile && " • Currently processing"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrentFile && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                        <Badge
                          variant="outline"
                          className={
                            isProcessedFile
                              ? "bg-green-50 text-green-700 border-green-200"
                              : isCurrentFile
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {isProcessedFile 
                            ? "Completed" 
                            : isCurrentFile
                            ? "Processing..."
                            : "Waiting"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Files State */}
        {files.length === 0 && !filesLoading && (
          <Card className="bg-white shadow-sm border-slate-200/60">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Files Found
                </h3>
                <p className="text-slate-600 mb-4">
                  Upload files in the Files tab to get started with knowledge
                  base initialization.
                </p>
                {/* Debug info for development */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                      Debug Information
                    </summary>
                    <div className="mt-2 p-4 bg-gray-100 rounded text-xs text-left">
                      <pre>{JSON.stringify({ 
                        filesData, 
                        filesLoading,
                        ragManagerState: {
                          isInitializing,
                          isProcessing,
                          isCompleted,
                          isFailed,
                          progressData
                        }
                      }, null, 2)}</pre>
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}