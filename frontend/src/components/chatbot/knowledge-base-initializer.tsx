"use client";

import { useState, useEffect } from "react";
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
import { useFiles } from "@/hooks/api/useFiles";

interface KnowledgeBaseInitializerProps {
  chatbotId: string;
}

interface File {
  id: string;
  fileName?: string;
  name?: string;
  fileType?: string | null;
  fileSize?: number;
  processed?: boolean;
}

export default function KnowledgeBaseInitializer({
  chatbotId,
}: KnowledgeBaseInitializerProps) {
  const [chatbotPollingInterval, setChatbotPollingInterval] =
    useState<NodeJS.Timeout | null>(null);

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

  const files: File[] =
    filesData?.data && Array.isArray(filesData.data) ? filesData.data : [];

  // RAG manager
  const ragManager = useRagManager(chatbotId);
  const {
    initialize,
    isInitializing,
    initializeError,
    progress: progressData,
    isProcessing,
    isCompleted,
    isFailed,
    progressError,
    refetchProgress,
    isActive,
    hasError,
  } = ragManager;

  const isKnowledgeInitialized = chatbot?.isKnowledgeInitialized || false;
  const totalChunks = chatbot?.totalChunks || 0;
  const lastUpdated = chatbot?.lastKnowledgeUpdate;

  const canInitialize = files.length > 0 && !isKnowledgeInitialized && !isActive;

  // Poll chatbot status every 2 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refetchChatbot();
      } catch (error) {
        console.error("Chatbot polling error:", error);
      }
    }, 2 * 60 * 1000);

    setChatbotPollingInterval(interval);

    return () => {
      clearInterval(interval);
      setChatbotPollingInterval(null);
    };
  }, [chatbotId, refetchChatbot]);

  // Refresh chatbot data shortly after RAG completes
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        refetchChatbot();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, refetchChatbot]);

  const handleInitializeKnowledge = async () => {
    try {
      await initialize();
      // Progress polling starts automatically
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
    if (isKnowledgeInitialized && !isProcessing) return 100;
    if (progressData && isProcessing) return progressData.progress || 0;
    if (isCompleted) return 100;
    if (isFailed && progressData) return progressData.progress || 0;
    return 0;
  };

  const getCurrentStep = () => {
    if (isKnowledgeInitialized && !isProcessing) return "Completed";
    if (progressData && isProcessing) {
      return progressData.currentStep || progressData.message || "Processing...";
    }
    if (isCompleted) return "Finalizing...";
    if (isFailed) return "Failed";
    if (isInitializing) return "Starting initialization...";
    return "Ready to initialize";
  };

  const getOverallStatus = () => {
    if (isKnowledgeInitialized && !isActive) return "Ready";
    if (isActive) return "Processing";
    if (isFailed) return "Failed";
    return "Pending";
  };

  const getStatusDotClass = () => {
    if (isKnowledgeInitialized && !isActive) return "status-dot is-online";
    if (isActive) return "status-dot is-busy";
    if (isFailed) return "status-dot is-error";
    return "status-dot";
  };

  const getErrorMessage = () => {
    if (initializeError) return initializeError.message;
    if (progressError) return "Failed to fetch progress updates";
    if (progressData?.error) return progressData.error;
    return "An unknown error occurred";
  };

  /* ---------- Loading ---------- */
  if (chatbotLoading) {
    return (
      <div className="page" aria-busy="true">
        <div className="flex flex-col gap-8 mx-auto max-w-4xl">
          <div className="skeleton h-10 w-32" />
          <div className="grid-stats">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
          <div className="skeleton h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  const progressValue = getProgress();

  return (
    <div className="page">
      <div className="flex flex-col gap-8 mx-auto max-w-4xl">
        {/* Header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Knowledge base</h1>
            <p className="page-subtitle">
              Process your uploaded files so the chatbot can answer from them.
            </p>
            <div className="cluster mt-3 gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`status-dot ${chatbotPollingInterval ? "is-online" : ""}`}
                />
                Refreshes every 2 minutes
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 text-ai">
                  <Loader2 className="size-3 shrink-0 animate-spin" />
                  Processing
                </span>
              )}
              {progressData?.timeElapsed && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3 shrink-0" />
                  {progressData.timeElapsed} elapsed
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              refetchChatbot();
              refetchFiles();
              refetchProgress();
            }}
            disabled={isActive}
          >
            <RefreshCw className={isActive ? "animate-spin" : ""} />
            Refresh now
          </button>
        </header>

        {/* Stats */}
        <section className="grid-stats" aria-label="Knowledge base overview">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Chunks</span>
              <Database className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <span className="stat-value">{totalChunks.toLocaleString()}</span>
            <span className="field-hint">Searchable text segments</span>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Files</span>
              <FileText className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <span className="stat-value">{files.length}</span>
            <span className="field-hint">Uploaded documents</span>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Status</span>
              <Activity className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <span className="stat-value flex items-center gap-2">
              <span className={getStatusDotClass()} aria-hidden="true" />
              {getOverallStatus()}
            </span>
            <span className="field-hint">Current state</span>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Last updated</span>
              <Clock className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <span className="stat-value !text-lg !leading-9">
              {formatDate(lastUpdated)}
            </span>
            <span className="field-hint">Last knowledge refresh</span>
          </div>
        </section>

        {/* Processing */}
        {isActive && (
          <section className="surface">
            <div className="surface-header">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Loader2 className="size-5 shrink-0 animate-spin text-ai" />
                  Processing knowledge base
                </h2>
                <p className="field-hint mt-1">{getCurrentStep()}</p>
              </div>
              <span className="badge badge-ai tabular">
                {Math.round(progressValue)}%
              </span>
            </div>

            <div className="surface-pad stack">
              <div
                className="progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressValue)}
                aria-label="Processing progress"
              >
                <span style={{ width: `${progressValue}%` }} />
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Files {progressData?.processedFiles || 0} of{" "}
                  {progressData?.totalFiles || files.length}
                </span>
                {progressData && (progressData.processedChunks ?? 0) > 0 && (
                  <span>{progressData.processedChunks!.toLocaleString()} chunks</span>
                )}
              </div>

              {progressData && (
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {progressData.estimatedTimeRemaining && (
                    <div className="flex items-center gap-2">
                      <Activity className="size-4 shrink-0 text-muted-foreground" />
                      <dt className="font-medium">Remaining</dt>
                      <dd className="text-muted-foreground">
                        {progressData.estimatedTimeRemaining}
                      </dd>
                    </div>
                  )}
                  {progressData.totalChunks > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="size-4 shrink-0 text-muted-foreground" />
                      <dt className="font-medium">Total chunks</dt>
                      <dd className="text-muted-foreground tabular">
                        {progressData.totalChunks.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {progressData.currentFile && (
                    <div className="flex items-center min-w-0 gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <dt className="font-medium">Current file</dt>
                      <dd className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                        {progressData.currentFile}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </section>
        )}

        {/* Error */}
        {hasError && (
          <div className="callout callout-danger" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium">Processing failed</p>
              <p className="mt-1 text-muted-foreground">{getErrorMessage()}</p>
              {progressData?.lastUpdated && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last update{" "}
                  {new Date(progressData.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Management */}
        <section className="surface">
          <div className="surface-header">
            <div>
              <h2 className="text-lg font-semibold">Manage knowledge base</h2>
              <p className="field-hint mt-1">
                Build or rebuild the index your chatbot searches.
              </p>
            </div>
          </div>

          <div className="surface-pad stack">
            {!isKnowledgeInitialized && !isActive ? (
              <div className="callout callout-warning">
                <AlertCircle className="space-t-0.5 size-4 shrink-0" />
                <p>
                  {files.length === 0
                    ? "No files yet. Upload files in the Files tab first."
                    : 'The knowledge base isn\'t initialized. Select "Initialize knowledge base" to start.'}
                </p>
              </div>
            ) : isKnowledgeInitialized && !isActive ? (
              <div className="callout callout-success">
                <CheckCircle className="space-t-0.5 size-4 shrink-0 text-success" />
                <div>
                  <p className="font-medium">Knowledge base is ready</p>
                  <p className="mt-1 text-muted-foreground">
                    Your chatbot can answer questions from your uploaded content.
                    {totalChunks > 0 &&
                      ` ${totalChunks.toLocaleString()} chunks are available for search.`}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="cluster gap-3">
              {!isKnowledgeInitialized || isFailed ? (
                <button
                  type="button"
                  className="btn btn-brand"
                  onClick={handleInitializeKnowledge}
                  disabled={!canInitialize || isActive}
                >
                  {isActive ? <Loader2 className="animate-spin" /> : <Zap />}
                  {isActive
                    ? "Initializing..."
                    : isFailed
                    ? "Retry initialization"
                    : "Initialize knowledge base"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReinitialize}
                  disabled={isActive}
                >
                  {isActive ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {isActive ? "Reinitializing..." : "Reinitialize"}
                </button>
              )}

              {isActive && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => refetchProgress()}
                >
                  <RefreshCw /> Refresh progress
                </button>
              )}
            </div>

            {(isActive || isCompleted) && progressData && (
              <dl className="surface-muted grid gap-3 text-sm sm:grid-cols-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-medium">Status</dt>
                  <dd className="text-muted-foreground">{progressData.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-medium">Progress</dt>
                  <dd className="text-muted-foreground tabular">
                    {Math.round(progressData.progress)}%
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-medium">Files</dt>
                  <dd className="text-muted-foreground tabular">
                    {progressData.processedFiles || 0} / {progressData.totalFiles || files.length}
                  </dd>
                </div>
                {progressData.processedChunks > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-medium">Chunks</dt>
                    <dd className="text-muted-foreground tabular">
                      {progressData.processedChunks.toLocaleString()}
                    </dd>
                  </div>
                )}
                {progressData.currentStep && (
                  <div className="flex items-center justify-between gap-3 border-t py-3">
                    <dt className="font-medium">Current step</dt>
                    <dd className="text-muted-foreground">{progressData.currentStep}</dd>
                  </div>
                )}
                {progressData.startTime && (
                  <p className="field-hint">
                    Started {new Date(progressData.startTime).toLocaleString()}
                  </p>
                )}
              </dl>
            )}
          </div>
        </section>

        {/* Source files */}
        {files.length > 0 && (
          <section className="surface">
            <div className="surface-header">
              <div>
                <h2 className="text-lg font-semibold">Source files</h2>
                <p className="field-hint mt-1">
                  {files.length} {files.length === 1 ? "file" : "files"} available for the knowledge base
                </p>
              </div>
            </div>

            <ul className="surface-pad flex flex-col gap-2">
              {files.map((file: File, index: number) => {
                const isCurrentFile =
                  progressData?.currentFile === (file.fileName || file.name);
                const isProcessedFile = file.processed;

                return (
                  <li key={file.id || index} className="doc-flex items-center">
                    <span className="doc-icon">
                      <FileText className="size-5 shrink-0" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                        {file.fileName || file.name}
                      </p>
                      <p className="field-hint">
                        {file.fileType || "Document"},{" "}
                        {file.fileSize
                          ? `${Math.round(file.fileSize / 1024)} KB`
                          : "unknown size"}
                      </p>
                    </div>

                    {isProcessedFile ? (
                      <span className="badge badge-success">Completed</span>
                    ) : isCurrentFile ? (
                      <span className="badge badge-ai">
                        <Loader2 className="size-3 shrink-0 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Waiting</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* No files */}
        {files.length === 0 && !filesLoading && (
          <div className="empty-state">
            <FileText className="size-8 shrink-0 text-muted-foreground" />
            <h3 className="text-base font-semibold">No files yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Upload files in the Files tab, then come back to build the knowledge base.
            </p>

            {process.env.NODE_ENV === "development" && (
              <details className="w-full max-w-md cursor-pointer text-left text-sm mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Debug information
                </summary>
                <pre className="surface-muted mt-2 p-4 text-xs overflow-x-auto">
                  {JSON.stringify(
                    {
                      filesData,
                      filesLoading,
                      ragManagerState: {
                        isInitializing,
                        isProcessing,
                        isCompleted,
                        isFailed,
                        progressData,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
